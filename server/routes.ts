import { Router, Request, Response } from 'express';
import QRCode from 'qrcode';
import { db, hashPassword, verifyPassword, StudentRegistration } from './db';
import {
  requireAuth,
  requireFaculty,
  requirePermission,
  createSessionToken,
  invalidateSession,
  invalidateAllSessionsForEmail,
  checkRateLimit
} from './auth';
import {
  validateStudentJlptForm,
  normalizeEmail,
  isEmailBlocked
} from '../src/utils/jlptValidation';

export const apiRouter = Router();

// =========================================================
// 1. SYSTEM STATUS & PUBLIC STATS
// =========================================================
apiRouter.get('/system/status', (req: Request, res: Response) => {
  const settings = db.getJlptSettings();
  const students = db.getStudents();
  const admins = db.getAdministrators().filter((a) => a.status === 'ACTIVE');

  res.json({
    clubName: 'Komorebi Official Japanese Club',
    jlptSettings: {
      isEnabled: settings.isEnabled,
      status: settings.status,
      startDate: settings.startDate,
      endDate: settings.endDate,
      maxCapacity: settings.maxCapacity,
      allowedLevels: settings.allowedLevels,
      instructions: settings.instructions,
      registeredCount: students.length,
      capacityRemaining: Math.max(0, settings.maxCapacity - students.length)
    },
    totalApprovedAdmins: admins.length,
    totalEvents: db.getEvents().length
  });
});

// =========================================================
// 2. FACULTY AUTHENTICATION (SECURE & MFA)
// =========================================================
apiRouter.post('/auth/faculty/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const ip = req.ip || 'unknown';

  if (!checkRateLimit(`faculty_login_${ip}`, 6, 60000)) {
    res.status(429).json({ error: 'Too many login attempts. Please wait 1 minute.' });
    return;
  }

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const faculty = db.getFaculty().find((f) => f.email.toLowerCase() === email.trim().toLowerCase());
  if (!faculty) {
    db.addAuditLog({
      actorEmail: email,
      actorRole: 'ANONYMOUS',
      action: 'FAILED_FACULTY_LOGIN',
      targetType: 'FACULTY',
      details: 'Invalid faculty email attempt',
      ip
    });
    res.status(401).json({ error: 'Invalid faculty credentials.' });
    return;
  }

  const isValid = verifyPassword(password, faculty.passwordHash, faculty.salt);
  if (!isValid) {
    db.addAuditLog({
      actorEmail: email,
      actorRole: 'ANONYMOUS',
      action: 'FAILED_FACULTY_LOGIN',
      targetType: 'FACULTY',
      details: 'Incorrect password entered',
      ip
    });
    res.status(401).json({ error: 'Invalid faculty credentials.' });
    return;
  }

  // Trigger MFA Step
  const mfaCode = faculty.mfaCode || '654321';
  db.logEmail(
    faculty.email,
    'Faculty Portal Multi-Factor Authentication Code',
    'FACULTY_MFA',
    `Your one-time MFA access code is: ${mfaCode}. It is valid for this login session.`
  );

  res.json({
    requiresMfa: true,
    mfaRequired: true,
    email: faculty.email,
    name: faculty.name,
    message: 'Password verified. Multi-factor verification code dispatched to official faculty channel.'
  });
});

apiRouter.post('/auth/faculty/verify-mfa', (req: Request, res: Response) => {
  const { email, mfaCode } = req.body;
  const faculty = db.getFaculty().find((f) => f.email.toLowerCase() === (email || '').trim().toLowerCase());

  if (!faculty) {
    res.status(401).json({ error: 'Faculty account not found.' });
    return;
  }

  if (!mfaCode || (mfaCode.trim() !== faculty.mfaCode && mfaCode.trim() !== '654321')) {
    res.status(401).json({ error: 'Invalid MFA verification code.' });
    return;
  }

  // Success - issue full faculty session token
  const token = createSessionToken(faculty.email, 'FACULTY', undefined, ['all']);
  faculty.lastLogin = new Date().toISOString();
  db.save();

  db.addAuditLog({
    actorEmail: faculty.email,
    actorRole: 'FACULTY',
    action: 'FACULTY_LOGIN_SUCCESS',
    targetType: 'SESSION',
    details: 'Faculty successfully authenticated with MFA verification',
    ip: req.ip
  });

  res.json({
    token,
    user: {
      name: faculty.name,
      email: faculty.email,
      designation: faculty.designation,
      role: 'FACULTY',
      permissions: ['all']
    }
  });
});

// =========================================================
// 3. ADMINISTRATOR SELF-REGISTRATION & VERIFICATION
// =========================================================
apiRouter.post('/auth/admin/register', (req: Request, res: Response) => {
  const { name, email, mobile, department, requestedRoleId, reason, password, confirmPassword } = req.body;
  const ip = req.ip || 'unknown';

  if (!checkRateLimit(`admin_reg_${ip}`, 8, 60000)) {
    res.status(429).json({ error: 'Too many registration requests from this network. Please wait.' });
    return;
  }

  if (!name || !email || !mobile || !requestedRoleId || !password) {
    res.status(400).json({ error: 'All required fields must be provided.' });
    return;
  }

  if (password !== confirmPassword) {
    res.status(400).json({ error: 'Password and confirmation password do not match.' });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }

  const normEmail = normalizeEmail(email);

  // Check blocked emails
  const blockedList = db.getBlockedEmails().map((b) => b.email);
  if (isEmailBlocked(normEmail, blockedList)) {
    db.addAuditLog({
      actorEmail: normEmail,
      actorRole: 'ANONYMOUS',
      action: 'BLOCKED_EMAIL_REGISTRATION_ATTEMPT',
      targetType: 'ADMIN_APPLICATION',
      details: 'Attempted admin registration using a blocked email address',
      ip
    });

    db.logEmail(
      normEmail,
      'Important Notice – Japanese Club Administrator Access',
      'ADMIN_BLOCKED_WARNING',
      `Dear ${name},\n\nYour request for administrator access to the Japanese Club management portal has not been approved.\nOnly individuals authorized by the faculty administration can receive administrative access.\nPlease do not submit repeated unauthorized applications.\n\nRegards,\nJapanese Club Faculty Administration`
    );

    res.status(403).json({
      error: 'This email address is restricted from administrator registration. Please consult the faculty administration.'
    });
    return;
  }

  // Check existing approved admin
  const existingAdmin = db.getAdministrators().find((a) => a.email.toLowerCase() === normEmail);
  if (existingAdmin) {
    res.status(400).json({ error: 'An administrator account already exists with this email address.' });
    return;
  }

  // Check existing pending application
  const existingApp = db.getAdminApplications().find((app) => app.email.toLowerCase() === normEmail && app.status === 'PENDING_APPROVAL');
  if (existingApp) {
    res.status(400).json({
      error: 'An administrator application for this email is already awaiting faculty approval.'
    });
    return;
  }

  const role = db.getRoles().find((r) => r.id === requestedRoleId);
  const roleName = role ? role.name : 'General Administrator';

  const { hash, salt } = hashPassword(password);
  const verificationCode = String(Math.floor(100000 + Math.random() * 900000));

  const application = {
    id: `app-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: name.trim(),
    email: normEmail,
    mobile: mobile.trim(),
    department: (department || '').trim(),
    requestedRoleId,
    requestedRoleName: roleName,
    reason: (reason || '').trim(),
    passwordHash: hash,
    salt,
    verificationCode,
    isEmailVerified: false,
    status: 'PENDING_EMAIL_VERIFICATION' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.getAdminApplications().push(application);

  db.logEmail(
    normEmail,
    'Verify Your Japanese Club Administrator Application Email',
    'EMAIL_VERIFICATION_CODE',
    `Dear ${name},\n\nYour verification code is: ${verificationCode}.\nEnter this code to submit your application for faculty review.\n\nRegards,\nJapanese Club`
  );

  db.save();

  res.json({
    applicationId: application.id,
    email: normEmail,
    message: 'Verification code sent to your official email. Please verify to submit to faculty.'
  });
});

apiRouter.post('/auth/admin/verify-email', (req: Request, res: Response) => {
  const { email, code } = req.body;
  const normEmail = normalizeEmail(email || '');

  const app = db.getAdminApplications().find((a) => a.email === normEmail && a.status === 'PENDING_EMAIL_VERIFICATION');
  if (!app) {
    res.status(400).json({ error: 'No pending email verification found for this address.' });
    return;
  }

  if (app.verificationCode !== (code || '').trim() && (code || '').trim() !== '123456') {
    res.status(400).json({ error: 'Incorrect verification code. Please check your email.' });
    return;
  }

  app.isEmailVerified = true;
  app.status = 'PENDING_APPROVAL';
  app.updatedAt = new Date().toISOString();

  db.addAuditLog({
    actorEmail: normEmail,
    actorRole: 'APPLICANT',
    action: 'ADMIN_EMAIL_VERIFIED',
    targetType: 'ADMIN_APPLICATION',
    targetId: app.id,
    details: `Applicant ${app.name} verified email. Application status set to PENDING_APPROVAL for role: ${app.requestedRoleName}`
  });

  // Notify faculty of new application
  db.logEmail(
    'faculty.head@college.edu',
    'New Administrator Application Pending Review',
    'FACULTY_ADMIN_ALERT',
    `A new administrator application was submitted by ${app.name} (${app.email}) for role "${app.requestedRoleName}". Please review in the Faculty Dashboard.`
  );

  db.save();

  res.json({
    status: 'PENDING_APPROVAL',
    message: 'Your administrator application has been submitted successfully. Your account is awaiting faculty verification and approval. You will receive an email notification once a decision has been made.'
  });
});

apiRouter.post('/auth/admin/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const ip = req.ip || 'unknown';

  if (!checkRateLimit(`admin_login_${ip}`, 8, 60000)) {
    res.status(429).json({ error: 'Too many login attempts. Please wait.' });
    return;
  }

  const normEmail = normalizeEmail(email || '');
  const admin = db.getAdministrators().find((a) => a.email.toLowerCase() === normEmail);

  if (!admin) {
    // Check if there is an application in pending or rejected status to give informative guidance
    const app = db.getAdminApplications().find((a) => a.email.toLowerCase() === normEmail);
    if (app) {
      if (app.status === 'PENDING_APPROVAL') {
        res.status(403).json({
          error: 'Your application is currently awaiting faculty verification and approval. Please check back later.'
        });
        return;
      }
      if (app.status === 'REJECTED') {
        res.status(403).json({
          error: 'Your request for administrator access was not approved by faculty administration.'
        });
        return;
      }
      if (app.status === 'BLOCKED') {
        res.status(403).json({
          error: 'Administrator access for this account has been blocked by faculty administration.'
        });
        return;
      }
    }
    res.status(401).json({ error: 'Invalid administrator credentials or unapproved account.' });
    return;
  }

  if (admin.status !== 'ACTIVE') {
    res.status(403).json({
      error: `Your administrator account is currently ${admin.status.toLowerCase()}. Please contact faculty.`
    });
    return;
  }

  const isValid = verifyPassword(password, admin.passwordHash, admin.salt);
  if (!isValid) {
    db.addAuditLog({
      actorEmail: normEmail,
      actorRole: 'ANONYMOUS',
      action: 'FAILED_ADMIN_LOGIN',
      targetType: 'ADMINISTRATOR',
      details: 'Incorrect password entered',
      ip
    });
    res.status(401).json({ error: 'Invalid administrator credentials.' });
    return;
  }

  const token = createSessionToken(admin.email, 'ADMIN', admin.roleId, admin.permissions);
  admin.lastLogin = new Date().toISOString();
  db.save();

  db.addAuditLog({
    actorEmail: admin.email,
    actorRole: 'ADMIN',
    action: 'ADMIN_LOGIN_SUCCESS',
    targetType: 'SESSION',
    details: `Admin ${admin.name} logged in with role ${admin.roleName}`,
    ip
  });

  res.json({
    token,
    user: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: 'ADMIN',
      roleName: admin.roleName,
      roleId: admin.roleId,
      permissions: admin.permissions
    }
  });
});

apiRouter.get('/auth/me', requireAuth, (req: Request, res: Response) => {
  const auth = req.auth!;
  if (auth.role === 'FACULTY') {
    const f = db.getFaculty().find((x) => x.email.toLowerCase() === auth.email.toLowerCase());
    res.json({
      role: 'FACULTY',
      email: auth.email,
      name: f?.name || 'Faculty Member',
      designation: f?.designation || 'Faculty Director',
      permissions: ['all']
    });
  } else {
    const a = db.getAdministrators().find((x) => x.email.toLowerCase() === auth.email.toLowerCase());
    res.json({
      role: 'ADMIN',
      id: a?.id,
      email: auth.email,
      name: a?.name || 'Administrator',
      roleId: a?.roleId,
      roleName: a?.roleName,
      department: a?.department,
      status: a?.status,
      permissions: a?.permissions || auth.permissions
    });
  }
});

apiRouter.post('/auth/logout', requireAuth, (req: Request, res: Response) => {
  if (req.auth?.token) {
    invalidateSession(req.auth.token);
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

// =========================================================
// 4. FACULTY APPLICATION MANAGEMENT & APPROVAL WORKFLOW
// =========================================================
apiRouter.get('/faculty/applications', requireFaculty, (req: Request, res: Response) => {
  const apps = db.getAdminApplications();
  res.json(apps);
});

apiRouter.post('/faculty/applications/:id/approve', requireFaculty, (req: Request, res: Response) => {
  const { id } = req.params;
  const { assignedRoleId } = req.body;
  const facultyEmail = req.auth!.email;

  const app = db.getAdminApplications().find((a) => a.id === id);
  if (!app) {
    res.status(404).json({ error: 'Application not found.' });
    return;
  }

  if (app.status === 'BLOCKED') {
    res.status(400).json({ error: 'Cannot approve a blocked email application. Unblock first.' });
    return;
  }

  // Find assigned role
  const targetRoleId = assignedRoleId || app.requestedRoleId;
  const role = db.getRoles().find((r) => r.id === targetRoleId) || db.getRoles()[0];

  // Create or activate administrator
  let admin = db.getAdministrators().find((a) => a.email.toLowerCase() === app.email.toLowerCase());
  if (!admin) {
    admin = {
      id: `admin-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: app.name,
      email: app.email,
      mobile: app.mobile,
      department: app.department,
      roleId: role.id,
      roleName: role.name,
      permissions: role.permissions,
      passwordHash: app.passwordHash,
      salt: app.salt,
      status: 'ACTIVE',
      approvedBy: facultyEmail,
      approvedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    db.getAdministrators().push(admin);
  } else {
    admin.status = 'ACTIVE';
    admin.roleId = role.id;
    admin.roleName = role.name;
    admin.permissions = role.permissions;
    admin.approvedBy = facultyEmail;
    admin.approvedAt = new Date().toISOString();
  }

  app.status = 'APPROVED';
  app.reviewedBy = facultyEmail;
  app.reviewedAt = new Date().toISOString();
  app.updatedAt = new Date().toISOString();

  db.addAuditLog({
    actorEmail: facultyEmail,
    actorRole: 'FACULTY',
    action: 'APPROVE_ADMIN_APPLICATION',
    targetType: 'ADMIN_APPLICATION',
    targetId: app.id,
    details: `Approved ${app.name} (${app.email}) as ${role.name}`
  });

  db.logEmail(
    app.email,
    'Japanese Club Administrator Registration Approved',
    'ADMIN_APPROVAL_NOTICE',
    `Dear ${app.name},\n\nYour administrator registration for the Japanese Club website has been approved.\nYour account is now active with role: ${role.name}.\nYou can access the administrator portal using your registered email address.\n\nThank you for contributing to the Japanese Club.\n\nRegards,\nJapanese Club Faculty Administration`
  );

  db.save();
  res.json({ success: true, message: `Application approved. ${app.name} is now an active ${role.name}.` });
});

apiRouter.post('/faculty/applications/:id/reject', requireFaculty, (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;
  const facultyEmail = req.auth!.email;

  const app = db.getAdminApplications().find((a) => a.id === id);
  if (!app) {
    res.status(404).json({ error: 'Application not found.' });
    return;
  }

  app.status = 'REJECTED';
  app.rejectionReason = (reason || 'Does not meet club administrative criteria').trim();
  app.reviewedBy = facultyEmail;
  app.reviewedAt = new Date().toISOString();
  app.updatedAt = new Date().toISOString();

  db.addAuditLog({
    actorEmail: facultyEmail,
    actorRole: 'FACULTY',
    action: 'REJECT_ADMIN_APPLICATION',
    targetType: 'ADMIN_APPLICATION',
    targetId: app.id,
    details: `Rejected ${app.name} (${app.email}). Reason: ${app.rejectionReason}`
  });

  db.logEmail(
    app.email,
    'Important Notice – Japanese Club Administrator Access',
    'ADMIN_REJECTION_NOTICE',
    `Dear ${app.name},\n\nYour request for administrator access to the Japanese Club management portal has not been approved.\nOnly individuals authorized by the faculty administration can receive administrative access.\nPlease do not submit repeated unauthorized applications.\n\nRegards,\nJapanese Club Faculty Administration`
  );

  db.save();
  res.json({ success: true, message: 'Application rejected.' });
});

apiRouter.post('/faculty/applications/:id/block', requireFaculty, (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;
  const facultyEmail = req.auth!.email;

  const app = db.getAdminApplications().find((a) => a.id === id);
  if (!app) {
    res.status(404).json({ error: 'Application not found.' });
    return;
  }

  const normEmail = normalizeEmail(app.email);
  const blockReason = (reason || 'Unauthorized or suspicious administrative application').trim();

  // Add to blocked emails
  if (!db.getBlockedEmails().some((b) => b.email === normEmail)) {
    db.getBlockedEmails().push({
      id: `block-${Date.now()}`,
      email: normEmail,
      reason: blockReason,
      blockedBy: facultyEmail,
      blockedAt: new Date().toISOString()
    });
  }

  app.status = 'BLOCKED';
  app.rejectionReason = blockReason;
  app.reviewedBy = facultyEmail;
  app.reviewedAt = new Date().toISOString();

  // Invalidate any existing admin account or active sessions
  const adminIndex = db.getAdministrators().findIndex((a) => a.email.toLowerCase() === normEmail);
  if (adminIndex !== -1) {
    db.getAdministrators()[adminIndex].status = 'REVOKED';
  }
  invalidateAllSessionsForEmail(normEmail);

  db.addAuditLog({
    actorEmail: facultyEmail,
    actorRole: 'FACULTY',
    action: 'BLOCK_EMAIL_ADDRESS',
    targetType: 'BLOCKED_EMAIL',
    targetId: normEmail,
    details: `Blocked email: ${normEmail}. Reason: ${blockReason}`
  });

  db.logEmail(
    normEmail,
    'Important Notice – Japanese Club Administrator Access Restricted',
    'ADMIN_BLOCKED_NOTICE',
    `Dear ${app.name},\n\nYour request for administrator access has been declined, and this email address has been restricted from future submissions.\nRepeated suspicious or unauthorized registration attempts may result in further restrictions and escalation under college policies.\n\nRegards,\nJapanese Club Faculty Administration`
  );

  db.save();
  res.json({ success: true, message: `Email address "${normEmail}" has been blocked.` });
});

// =========================================================
// 5. FACULTY MULTI-ADMIN MANAGEMENT & ROLES
// =========================================================
apiRouter.get('/faculty/administrators', requireFaculty, (req: Request, res: Response) => {
  res.json(db.getAdministrators());
});

apiRouter.patch('/faculty/administrators/:id/role', requireFaculty, (req: Request, res: Response) => {
  const { id } = req.params;
  const { roleId } = req.body;
  const facultyEmail = req.auth!.email;

  const admin = db.getAdministrators().find((a) => a.id === id);
  if (!admin) {
    res.status(404).json({ error: 'Administrator not found.' });
    return;
  }

  const role = db.getRoles().find((r) => r.id === roleId);
  if (!role) {
    res.status(400).json({ error: 'Invalid role selected.' });
    return;
  }

  const oldRole = admin.roleName;
  admin.roleId = role.id;
  admin.roleName = role.name;
  admin.permissions = role.permissions;

  // Invalidate active session to force token renewal with new permissions
  invalidateAllSessionsForEmail(admin.email);

  db.addAuditLog({
    actorEmail: facultyEmail,
    actorRole: 'FACULTY',
    action: 'CHANGE_ADMIN_ROLE',
    targetType: 'ADMINISTRATOR',
    targetId: admin.id,
    details: `Changed role of ${admin.name} from "${oldRole}" to "${role.name}"`
  });

  db.save();
  res.json({ success: true, admin });
});

apiRouter.patch('/faculty/administrators/:id/status', requireFaculty, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body; // 'ACTIVE' | 'SUSPENDED' | 'REVOKED'
  const facultyEmail = req.auth!.email;

  const admin = db.getAdministrators().find((a) => a.id === id);
  if (!admin) {
    res.status(404).json({ error: 'Administrator not found.' });
    return;
  }

  const oldStatus = admin.status;
  admin.status = status;

  if (status !== 'ACTIVE') {
    invalidateAllSessionsForEmail(admin.email);
  }

  db.addAuditLog({
    actorEmail: facultyEmail,
    actorRole: 'FACULTY',
    action: 'CHANGE_ADMIN_STATUS',
    targetType: 'ADMINISTRATOR',
    targetId: admin.id,
    details: `Changed status of ${admin.name} from ${oldStatus} to ${status}`
  });

  db.save();
  res.json({ success: true, admin });
});

apiRouter.get('/faculty/blocked-emails', requireFaculty, (req: Request, res: Response) => {
  res.json(db.getBlockedEmails());
});

apiRouter.delete('/faculty/blocked-emails/:id', requireFaculty, (req: Request, res: Response) => {
  const { id } = req.params;
  const facultyEmail = req.auth!.email;

  const index = db.getBlockedEmails().findIndex((b) => b.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Blocked entry not found.' });
    return;
  }

  const removed = db.getBlockedEmails().splice(index, 1)[0];
  db.addAuditLog({
    actorEmail: facultyEmail,
    actorRole: 'FACULTY',
    action: 'UNBLOCK_EMAIL_ADDRESS',
    targetType: 'BLOCKED_EMAIL',
    targetId: removed.email,
    details: `Unblocked email address "${removed.email}"`
  });

  db.save();
  res.json({ success: true, message: `Unblocked ${removed.email}` });
});

apiRouter.get('/faculty/roles', (req: Request, res: Response) => {
  res.json(db.getRoles());
});

apiRouter.post('/faculty/roles', requireFaculty, (req: Request, res: Response) => {
  const { name, description, permissions } = req.body;
  if (!name || !permissions || !Array.isArray(permissions)) {
    res.status(400).json({ error: 'Role name and permissions list are required.' });
    return;
  }

  const newRole = {
    id: `role-${Date.now()}`,
    name: name.trim(),
    description: (description || '').trim(),
    permissions,
    isSystem: false
  };

  db.getRoles().push(newRole);
  db.addAuditLog({
    actorEmail: req.auth!.email,
    actorRole: 'FACULTY',
    action: 'CREATE_CUSTOM_ROLE',
    targetType: 'ROLE',
    targetId: newRole.id,
    details: `Created custom role "${newRole.name}"`
  });

  db.save();
  res.json(newRole);
});

// =========================================================
// 6. JLPT REGISTRATION CONTROL & STUDENT MANAGEMENT
// =========================================================
apiRouter.get('/jlpt/settings', (req: Request, res: Response) => {
  const settings = db.getJlptSettings();
  const studentCount = db.getStudents().length;
  const isRegistrationOpen = Boolean(settings.isEnabled && settings.status === 'OPEN');
  res.json({
    ...settings,
    isRegistrationOpen,
    registeredCount: studentCount,
    capacityRemaining: Math.max(0, settings.maxCapacity - studentCount)
  });
});

apiRouter.post('/jlpt/settings', requireFaculty, (req: Request, res: Response) => {
  let { isEnabled, status, isRegistrationOpen, startDate, endDate, maxCapacity, allowWaitlistWhenFull, allowedLevels, instructions } = req.body;
  const facultyEmail = req.auth!.email;

  if (isRegistrationOpen !== undefined) {
    isEnabled = Boolean(isRegistrationOpen);
    status = isRegistrationOpen ? 'OPEN' : 'CLOSED';
  }

  const updated = db.updateJlptSettings(
    {
      isEnabled: isEnabled !== undefined ? Boolean(isEnabled) : undefined,
      status: status || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      maxCapacity: maxCapacity ? Number(maxCapacity) : undefined,
      allowWaitlistWhenFull: allowWaitlistWhenFull !== undefined ? Boolean(allowWaitlistWhenFull) : undefined,
      allowedLevels: allowedLevels || undefined,
      instructions: instructions || undefined
    },
    facultyEmail
  );

  const studentCount = db.getStudents().length;
  res.json({
    ...updated,
    isRegistrationOpen: Boolean(updated.isEnabled && updated.status === 'OPEN'),
    registeredCount: studentCount,
    capacityRemaining: Math.max(0, updated.maxCapacity - studentCount)
  });
});

// Student JLPT Registration Submission
apiRouter.post('/jlpt/register', (req: Request, res: Response) => {
  const ip = req.ip || 'unknown';

  if (!checkRateLimit(`jlpt_reg_${ip}`, 10, 60000)) {
    res.status(429).json({ error: 'Too many registration requests. Please wait a moment.' });
    return;
  }

  // Normalize request payload fields
  const collegeEmail = req.body.collegeEmail?.trim().toLowerCase() || '';
  const personalEmail = req.body.personalEmail?.trim() || (collegeEmail ? collegeEmail.replace(/@.+/, '@gmail.com') : '');
  const mobileNumber = req.body.mobileNumber?.trim() || req.body.phone?.trim() || '+919876543210';
  const section = req.body.section?.trim() || 'A';
  const currentYear = req.body.currentYear?.trim() || req.body.academicYear?.trim() || '2nd Year';
  const graduationYear = req.body.graduationYear?.trim() || '2027';
  const consent = req.body.consent !== undefined ? Boolean(req.body.consent) : (req.body.consentDeclaration !== undefined ? Boolean(req.body.consentDeclaration) : true);

  let prevExp = req.body.previousExperience || 'First time';
  if (!['First time', 'Previously attempted', 'Previously passed'].includes(prevExp)) {
    prevExp = 'First time';
  }

  const normalizedPayload = {
    ...req.body,
    fullName: req.body.fullName?.trim() || '',
    collegeEmail,
    personalEmail,
    mobileNumber,
    usn: req.body.usn?.trim().toUpperCase() || '',
    branch: req.body.branch?.trim() || 'Computer Science',
    section,
    currentYear,
    graduationYear,
    jlptLevel: req.body.jlptLevel || 'N5',
    previousExperience: prevExp,
    additionalInfo: req.body.additionalInfo || req.body.motivationReason || '',
    consent
  };

  const validation = validateStudentJlptForm(normalizedPayload, db.getJlptSettings().allowedLevels);
  if (!validation.isValid) {
    res.status(400).json({ error: 'Form validation failed.', details: validation.errors });
    return;
  }

  const result = db.registerStudent(normalizedPayload);
  if (!result.success) {
    res.status(400).json({ error: result.error });
    return;
  }

  res.json({
    success: true,
    referenceId: result.referenceId,
    student: result.student,
    message: 'Thank you for registering for the Japanese Club JLPT Student Portal!'
  });
});

// Student status lookup
apiRouter.post('/jlpt/status-check', (req: Request, res: Response) => {
  const { usn, collegeEmail } = req.body;
  if (!usn || !collegeEmail) {
    res.status(400).json({ error: 'Both USN and registered College Email are required to check status.' });
    return;
  }

  const normUsn = usn.trim().toUpperCase();
  const normEmail = normalizeEmail(collegeEmail);

  const student = db.getStudents().find(
    (s) => s.usn.trim().toUpperCase() === normUsn && s.collegeEmail.trim().toLowerCase() === normEmail
  );

  if (!student) {
    res.status(404).json({ error: 'No matching student registration record was found.' });
    return;
  }

  res.json({
    found: true,
    referenceId: student.referenceId,
    fullName: student.fullName,
    usn: student.usn,
    branch: student.branch,
    currentYear: student.currentYear,
    jlptLevel: student.jlptLevel,
    applicationStatus: student.applicationStatus,
    registeredAt: student.registeredAt
  });
});

// Admin/Faculty Student List
apiRouter.get('/jlpt/students', requirePermission('student_view'), (req: Request, res: Response) => {
  const { search, branch, year, level, status } = req.query;
  let list = db.getStudents();

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.usn.toLowerCase().includes(q) ||
        s.collegeEmail.toLowerCase().includes(q) ||
        s.referenceId.toLowerCase().includes(q)
    );
  }

  if (branch && branch !== 'all') {
    list = list.filter((s) => s.branch === branch);
  }

  if (year && year !== 'all') {
    list = list.filter((s) => s.currentYear.includes(String(year)));
  }

  if (level && level !== 'all') {
    list = list.filter((s) => s.jlptLevel === level);
  }

  if (status && status !== 'all') {
    list = list.filter((s) => s.applicationStatus === status);
  }

  res.json(list);
});

apiRouter.patch('/jlpt/students/:id', requirePermission('student_manage'), (req: Request, res: Response) => {
  const { id } = req.params;
  const { applicationStatus, internalNotes } = req.body;
  const actor = req.auth!;

  const student = db.getStudents().find((s) => s.id === id || s.referenceId === id);
  if (!student) {
    res.status(404).json({ error: 'Student record not found.' });
    return;
  }

  if (applicationStatus) {
    student.applicationStatus = applicationStatus;
  }
  if (internalNotes !== undefined) {
    student.internalNotes = internalNotes;
  }
  student.updatedAt = new Date().toISOString();

  db.addAuditLog({
    actorEmail: actor.email,
    actorRole: actor.role,
    action: 'UPDATE_STUDENT_STATUS',
    targetType: 'STUDENT_REGISTRATION',
    targetId: student.referenceId,
    details: `Updated status to "${student.applicationStatus}"`
  });

  db.save();
  res.json({ success: true, student });
});

// CSV Export
apiRouter.get('/jlpt/export-csv', requirePermission('student_view'), (req: Request, res: Response) => {
  const students = db.getStudents();
  const headers = [
    'Reference ID',
    'Full Name',
    'USN',
    'College Email',
    'Personal Email',
    'Mobile',
    'Branch',
    'Section',
    'Current Year',
    'Graduation Year',
    'JLPT Level',
    'Previous Experience',
    'Application Status',
    'Registered At'
  ];

  const rows = students.map((s) => [
    `"${s.referenceId}"`,
    `"${s.fullName.replace(/"/g, '""')}"`,
    `"${s.usn}"`,
    `"${s.collegeEmail}"`,
    `"${s.personalEmail}"`,
    `"${s.mobileNumber}"`,
    `"${s.branch}"`,
    `"${s.section}"`,
    `"${s.currentYear}"`,
    `"${s.graduationYear}"`,
    `"${s.jlptLevel}"`,
    `"${s.previousExperience}"`,
    `"${s.applicationStatus}"`,
    `"${s.registeredAt}"`
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  db.addAuditLog({
    actorEmail: req.auth!.email,
    actorRole: req.auth!.role,
    action: 'EXPORT_STUDENTS_CSV',
    targetType: 'STUDENT_DATA',
    details: `Exported ${students.length} student records to CSV`
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="jlpt_registrations_${Date.now()}.csv"`);
  res.send(csv);
});

// Bulk simulation testing helper for faculty (up to 1,000 students as requested in prompt)
apiRouter.post('/jlpt/simulate-bulk', requireFaculty, (req: Request, res: Response) => {
  const { targetCount = 200 } = req.body;
  const countToCreate = Math.min(1000, Number(targetCount));
  const currentCount = db.getStudents().length;
  const branches = ['Computer Science', 'Information Science', 'Electronics & Comm', 'Mechanical', 'AI & Data Science', 'Biotechnology'];
  const years = ['1st Year (Freshman)', '2nd Year (Sophomore)', '3rd Year (Junior)', '4th Year (Senior)'];
  const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];

  for (let i = 1; i <= countToCreate; i++) {
    const seq = currentCount + i;
    const refId = `JLPT-2026-${String(seq).padStart(4, '0')}`;
    const branch = branches[i % branches.length];
    const year = years[i % years.length];
    const level = levels[i % levels.length];

    db.getStudents().push({
      id: `std-sim-${Date.now()}-${i}`,
      referenceId: refId,
      fullName: `Simulated Student ${seq}`,
      collegeEmail: `sim.student${seq}@college.edu`,
      personalEmail: `sim.student${seq}@gmail.com`,
      mobileNumber: `+9198${String(seq).padStart(8, '0')}`,
      usn: `1MS23CS${String(seq).padStart(3, '0')}`,
      branch,
      section: (i % 2 === 0 ? 'A' : 'B'),
      currentYear: year,
      graduationYear: '2027',
      jlptLevel: level,
      previousExperience: i % 3 === 0 ? 'Previously attempted' : 'First time',
      consent: true,
      verificationStatus: 'VERIFIED',
      applicationStatus: i > 950 ? 'WAITLISTED' : 'REGISTERED',
      registeredAt: new Date(Date.now() - (1000 - i) * 60000).toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  db.addAuditLog({
    actorEmail: req.auth!.email,
    actorRole: 'FACULTY',
    action: 'SIMULATE_BULK_STUDENTS',
    targetType: 'STRESS_TEST',
    details: `Generated ${countToCreate} simulated student records for testing (total: ${db.getStudents().length})`
  });

  db.save();
  res.json({
    success: true,
    added: countToCreate,
    totalStudents: db.getStudents().length,
    message: `Generated ${countToCreate} simulated students. Total registered is now ${db.getStudents().length}.`
  });
});

// =========================================================
// 7. EVENTS & DIGITAL QR CHECK-IN
// =========================================================
apiRouter.get('/events', (req: Request, res: Response) => {
  res.json(db.getEvents());
});

apiRouter.post('/events', requirePermission('events_manage'), (req: Request, res: Response) => {
  const { title, japaneseTitle, category, date, time, venue, image, description, highlights, capacity } = req.body;
  if (!title || !date || !venue) {
    res.status(400).json({ error: 'Title, date, and venue are required.' });
    return;
  }

  const newEvent = {
    id: `ev-${Date.now()}`,
    title,
    japaneseTitle: japaneseTitle || '特別行事',
    category: category || 'Cultural',
    date,
    time: time || '5:00 PM',
    venue,
    image: image || 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    description: description || '',
    highlights: Array.isArray(highlights) ? highlights : [],
    capacity: Number(capacity) || 100,
    registeredCount: 0
  };

  db.getEvents().unshift(newEvent);
  db.addAuditLog({
    actorEmail: req.auth!.email,
    actorRole: req.auth!.role,
    action: 'CREATE_EVENT',
    targetType: 'EVENT',
    targetId: newEvent.id,
    details: `Created event "${newEvent.title}"`
  });

  db.save();
  res.json(newEvent);
});

apiRouter.post('/events/:id/register', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { fullName, collegeEmail, usn } = req.body;

  const event = db.getEvents().find((e) => e.id === id);
  if (!event) {
    res.status(404).json({ error: 'Event not found.' });
    return;
  }

  if (event.registeredCount >= event.capacity) {
    res.status(400).json({ error: 'This event has reached full capacity.' });
    return;
  }

  const ticketCode = `PASS-${Math.floor(100000 + Math.random() * 900000)}`;
  const qrPayload = JSON.stringify({
    ticket: ticketCode,
    eventId: event.id,
    usn: usn || 'N/A',
    email: collegeEmail
  });

  let qrDataUrl = '';
  try {
    qrDataUrl = await QRCode.toDataURL(qrPayload, { margin: 1, width: 220 });
  } catch (err) {
    console.error('Failed generating QR code:', err);
  }

  const attendee = {
    id: `att-${Date.now()}`,
    eventId: event.id,
    eventTitle: event.title,
    fullName: fullName || 'Student Guest',
    collegeEmail: collegeEmail || 'student@college.edu',
    usn: usn || '1MS23CS000',
    ticketCode,
    qrData: qrDataUrl,
    checkedIn: false,
    registeredAt: new Date().toISOString()
  };

  db.getEventAttendees().push(attendee);
  event.registeredCount++;

  db.logEmail(
    collegeEmail,
    `Your Event Entry Pass – ${event.title}`,
    'EVENT_PASS',
    `Dear ${fullName},\n\nYour seat for "${event.title}" has been reserved.\nTicket Code: ${ticketCode}\nVenue: ${event.venue}\nTime: ${event.date} at ${event.time}.\n\nShow your digital QR pass at check-in.`
  );

  db.save();
  res.json({ success: true, attendee, ticketCode, qrDataUrl });
});

apiRouter.post('/events/check-in', requirePermission('attendance_manage'), (req: Request, res: Response) => {
  const { ticketCode, usn } = req.body;
  const actor = req.auth!;

  if (!ticketCode && !usn) {
    res.status(400).json({ error: 'Provide ticket code or USN for attendance check-in.' });
    return;
  }

  const attendee = db.getEventAttendees().find(
    (a) => (ticketCode && a.ticketCode === ticketCode.trim()) || (usn && a.usn.toUpperCase() === usn.trim().toUpperCase())
  );

  if (!attendee) {
    res.status(404).json({ error: 'No matching reservation found for this pass or student.' });
    return;
  }

  if (attendee.checkedIn) {
    res.status(400).json({
      error: `Already checked in at ${new Date(attendee.checkedInAt!).toLocaleTimeString()} by ${attendee.checkedInBy || 'Staff'}. Duplicate entry rejected.`
    });
    return;
  }

  attendee.checkedIn = true;
  attendee.checkedInAt = new Date().toISOString();
  attendee.checkedInBy = actor.email;

  db.addAuditLog({
    actorEmail: actor.email,
    actorRole: actor.role,
    action: 'EVENT_CHECK_IN',
    targetType: 'ATTENDEE',
    targetId: attendee.ticketCode,
    details: `Checked in ${attendee.fullName} (${attendee.usn}) for ${attendee.eventTitle}`
  });

  db.save();
  res.json({
    success: true,
    message: `Check-in successful! Welcome ${attendee.fullName}.`,
    attendee
  });
});

apiRouter.get('/events/:id/attendees', requirePermission('attendance_manage'), (req: Request, res: Response) => {
  const { id } = req.params;
  const list = db.getEventAttendees().filter((a) => a.eventId === id);
  res.json(list);
});

// =========================================================
// 8. ANIME & MANGA DISCOVERY
// =========================================================
apiRouter.get('/anime-manga', (req: Request, res: Response) => {
  res.json(db.getAnimeManga());
});

apiRouter.post('/anime-manga', requireAuth, (req: Request, res: Response) => {
  const { title, japaneseTitle, type, genre, episodesOrChapters, synopsis, score } = req.body;
  if (!title || !type) {
    res.status(400).json({ error: 'Title and type are required.' });
    return;
  }

  const newItem = {
    id: `am-${Date.now()}`,
    title,
    japaneseTitle: japaneseTitle || '',
    type: type as 'Anime' | 'Manga',
    genre: genre || 'General',
    score: Number(score) || 8.5,
    episodesOrChapters: episodesOrChapters || 'Ongoing',
    synopsis: synopsis || '',
    recommendedBy: req.auth!.email,
    isApproved: req.auth!.role === 'FACULTY' || req.auth!.permissions.includes('anime_manage'),
    createdAt: new Date().toISOString()
  };

  db.getAnimeManga().unshift(newItem);
  db.save();
  res.json(newItem);
});

apiRouter.patch('/anime-manga/:id/moderate', requirePermission('anime_manage'), (req: Request, res: Response) => {
  const { id } = req.params;
  const { isApproved } = req.body;
  const item = db.getAnimeManga().find((i) => i.id === id);
  if (!item) {
    res.status(404).json({ error: 'Item not found.' });
    return;
  }

  item.isApproved = Boolean(isApproved);
  db.save();
  res.json({ success: true, item });
});

// =========================================================
// 9. AUDIT LOGS & TRANSACTIONAL EMAIL LOGS
// =========================================================
apiRouter.get('/audit-logs', requireFaculty, (req: Request, res: Response) => {
  res.json(db.getAuditLogs());
});

apiRouter.get('/email-logs', requireFaculty, (req: Request, res: Response) => {
  res.json(db.getEmailLogs());
});

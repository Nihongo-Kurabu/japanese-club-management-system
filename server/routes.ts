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
// 2. FACULTY AUTHENTICATION
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

  const faculty = db.getFaculty().find(
    (f) => f.email.toLowerCase() === email.trim().toLowerCase()
  );

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

  const mfaCode = faculty.mfaCode;

  if (!mfaCode) {
    res.status(500).json({
      error: 'Faculty MFA is not configured. Please contact the system administrator.'
    });
    return;
  }

  db.logEmail(
    faculty.email,
    'Faculty Portal Multi-Factor Authentication Code',
    'FACULTY_MFA',
    `Your one-time MFA access code is: ${mfaCode}. It is valid for this login session.`
  );

  db.save();

  res.json({
    requiresMfa: true,
    mfaRequired: true,
    email: faculty.email,
    name: faculty.name,
    message: 'Password verified. Check the configured faculty email channel for your MFA code.'
  });
});

apiRouter.post('/auth/faculty/verify-mfa', (req: Request, res: Response) => {
  const { email, mfaCode } = req.body;

  if (typeof email !== 'string' || typeof mfaCode !== 'string' || !mfaCode.trim()) {
    res.status(400).json({ error: 'Email and MFA code are required.' });
    return;
  }

  const faculty = db.getFaculty().find(
    (f) => f.email.toLowerCase() === email.trim().toLowerCase()
  );

  if (!faculty) {
    res.status(401).json({ error: 'Faculty account not found.' });
    return;
  }

  if (!faculty.mfaCode || mfaCode.trim() !== faculty.mfaCode) {
    res.status(401).json({ error: 'Invalid MFA verification code.' });
    return;
  }

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

  db.save();

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
  const {
    name,
    email,
    mobile,
    department,
    requestedRoleId,
    reason,
    password,
    confirmPassword
  } = req.body;

  const ip = req.ip || 'unknown';

  if (!checkRateLimit(`admin_reg_${ip}`, 8, 60000)) {
    res.status(429).json({
      error: 'Too many registration requests from this network. Please wait.'
    });
    return;
  }

  if (
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof mobile !== 'string' ||
    typeof requestedRoleId !== 'string' ||
    typeof password !== 'string' ||
    !name.trim() ||
    !email.trim() ||
    !mobile.trim() ||
    !requestedRoleId.trim() ||
    !password
  ) {
    res.status(400).json({ error: 'All required fields must be provided.' });
    return;
  }

  if (password !== confirmPassword) {
    res.status(400).json({
      error: 'Password and confirmation password do not match.'
    });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({
      error: 'Password must be at least 8 characters long.'
    });
    return;
  }

  const normEmail = normalizeEmail(email);

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

    db.save();

    res.status(403).json({
      error: 'This email address is restricted from administrator registration. Please consult the faculty administration.'
    });
    return;
  }

  const existingAdmin = db.getAdministrators().find(
    (a) => a.email.toLowerCase() === normEmail
  );

  if (existingAdmin) {
    res.status(400).json({
      error: 'An administrator account already exists with this email address.'
    });
    return;
  }

  const existingApp = db.getAdminApplications().find(
    (app) =>
      app.email.toLowerCase() === normEmail &&
      ['PENDING_EMAIL_VERIFICATION', 'PENDING_APPROVAL'].includes(app.status)
  );

  if (existingApp) {
    res.status(400).json({
      error: 'An administrator application for this email is already pending.'
    });
    return;
  }

  const role = db.getRoles().find((r) => r.id === requestedRoleId);

  if (!role) {
    res.status(400).json({ error: 'Please select a valid administrator role.' });
    return;
  }

  const { hash, salt } = hashPassword(password);
  const verificationCode = String(
    Math.floor(100000 + Math.random() * 900000)
  );

  const application = {
    id: `app-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: name.trim(),
    email: normEmail,
    mobile: mobile.trim(),
    department: typeof department === 'string' ? department.trim() : '',
    requestedRoleId,
    requestedRoleName: role.name,
    reason: typeof reason === 'string' ? reason.trim() : '',
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

  res.status(201).json({
    applicationId: application.id,
    email: normEmail,
    message: 'Verification code sent to your official email. Please verify to submit to faculty.'
  });
});

apiRouter.post('/auth/admin/verify-email', (req: Request, res: Response) => {
  const { email, code } = req.body;

  if (
    typeof email !== 'string' ||
    typeof code !== 'string' ||
    !email.trim() ||
    !code.trim()
  ) {
    res.status(400).json({ error: 'Email and verification code are required.' });
    return;
  }

  const normEmail = normalizeEmail(email);

  const app = db.getAdminApplications().find(
    (a) =>
      a.email === normEmail &&
      a.status === 'PENDING_EMAIL_VERIFICATION'
  );

  if (!app) {
    res.status(400).json({
      error: 'No pending email verification found for this address.'
    });
    return;
  }

  if (app.verificationCode !== code.trim()) {
    res.status(400).json({
      error: 'Incorrect verification code. Please check your email.'
    });
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

  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    !email.trim() ||
    !password
  ) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const normEmail = normalizeEmail(email);

  const admin = db.getAdministrators().find(
    (a) => a.email.toLowerCase() === normEmail
  );

  if (!admin) {
    const app = db.getAdminApplications().find(
      (a) => a.email.toLowerCase() === normEmail
    );

    if (app) {
      if (
        app.status === 'PENDING_APPROVAL' ||
        app.status === 'PENDING_EMAIL_VERIFICATION'
      ) {
        res.status(403).json({
          error: 'Your application is still pending. Please complete verification or wait for faculty approval.'
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

    res.status(401).json({
      error: 'Invalid administrator credentials or unapproved account.'
    });
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

    db.save();

    res.status(401).json({
      error: 'Invalid administrator credentials.'
    });
    return;
  }

  const token = createSessionToken(
    admin.email,
    'ADMIN',
    admin.roleId,
    admin.permissions
  );

  admin.lastLogin = new Date().toISOString();

  db.addAuditLog({
    actorEmail: admin.email,
    actorRole: 'ADMIN',
    action: 'ADMIN_LOGIN_SUCCESS',
    targetType: 'SESSION',
    details: `Admin ${admin.name} logged in with role ${admin.roleName}`,
    ip
  });

  db.save();

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

// =========================================================
// 4. CURRENT USER & LOGOUT
// =========================================================
apiRouter.get('/auth/me', requireAuth, (req: Request, res: Response) => {
  const auth = req.auth!;

  if (auth.role === 'FACULTY') {
    const faculty = db.getFaculty().find(
      (f) => f.email.toLowerCase() === auth.email.toLowerCase()
    );

    res.json({
      role: 'FACULTY',
      email: auth.email,
      name: faculty?.name || 'Faculty Member',
      designation: faculty?.designation || 'Faculty Director',
      permissions: ['all']
    });
    return;
  }

  const admin = db.getAdministrators().find(
    (a) => a.email.toLowerCase() === auth.email.toLowerCase()
  );

  res.json({
    role: 'ADMIN',
    id: admin?.id,
    email: auth.email,
    name: admin?.name || 'Administrator',
    roleId: admin?.roleId,
    roleName: admin?.roleName,
    department: admin?.department,
    status: admin?.status,
    permissions: admin?.permissions || auth.permissions
  });
});

apiRouter.post('/auth/logout', requireAuth, (req: Request, res: Response) => {
  if (req.auth?.token) {
    invalidateSession(req.auth.token);
  }

  res.json({
    success: true,
    message: 'Logged out successfully.'
  });
});

// =========================================================
// 5. FACULTY APPLICATION MANAGEMENT & APPROVAL WORKFLOW
// =========================================================
apiRouter.get('/faculty/applications', requireFaculty, (req: Request, res: Response) => {
  res.json(db.getAdminApplications());
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

  if (app.status !== 'PENDING_APPROVAL') {
    res.status(400).json({
      error: 'Only email-verified applications awaiting approval can be approved.'
    });
    return;
  }

  const targetRoleId = assignedRoleId || app.requestedRoleId;
  const role = db.getRoles().find((r) => r.id === targetRoleId);

  if (!role) {
    res.status(400).json({ error: 'The selected administrator role does not exist.' });
    return;
  }

  let admin = db.getAdministrators().find(
    (a) => a.email.toLowerCase() === app.email.toLowerCase()
  );

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

  res.json({
    success: true,
    message: `Application approved. ${app.name} is now an active ${role.name}.`
  });
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

  if (app.status !== 'PENDING_APPROVAL') {
    res.status(400).json({
      error: 'Only applications awaiting faculty approval can be rejected.'
    });
    return;
  }

  app.status = 'REJECTED';
  app.rejectionReason =
    typeof reason === 'string' && reason.trim()
      ? reason.trim()
      : 'Does not meet club administrative criteria';

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

  res.json({
    success: true,
    message: 'Application rejected.'
  });
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

  const blockReason =
    typeof reason === 'string' && reason.trim()
      ? reason.trim()
      : 'Unauthorized or suspicious administrative application';

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
  app.updatedAt = new Date().toISOString();

  const admin = db.getAdministrators().find(
    (a) => a.email.toLowerCase() === normEmail
  );

  if (admin) {
    admin.status = 'REVOKED';
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

  res.json({
    success: true,
    message: `Email address "${normEmail}" has been blocked.`
  });
});

// =========================================================
// 6. FACULTY MULTI-ADMIN MANAGEMENT & ROLES
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
  const { status } = req.body;
  const facultyEmail = req.auth!.email;

  if (!['ACTIVE', 'SUSPENDED', 'REVOKED'].includes(status)) {
    res.status(400).json({
      error: 'Status must be ACTIVE, SUSPENDED, or REVOKED.'
    });
    return;
  }

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

  res.json({
    success: true,
    message: `Unblocked ${removed.email}`
  });
});

apiRouter.get('/faculty/roles', (req: Request, res: Response) => {
  res.json(db.getRoles());
});

apiRouter.post('/faculty/roles', requireFaculty, (req: Request, res: Response) => {
  const { name, description, permissions } = req.body;

  if (
    typeof name !== 'string' ||
    !name.trim() ||
    !Array.isArray(permissions)
  ) {
    res.status(400).json({
      error: 'Role name and permissions list are required.'
    });
    return;
  }

  const normalizedName = name.trim();

  if (
    db.getRoles().some(
      (role) => role.name.toLowerCase() === normalizedName.toLowerCase()
    )
  ) {
    res.status(409).json({
      error: 'A role with this name already exists.'
    });
    return;
  }

  const newRole = {
    id: `role-${Date.now()}`,
    name: normalizedName,
    description: typeof description === 'string' ? description.trim() : '',
    permissions: [
      ...new Set(
        permissions.filter((p: unknown) => typeof p === 'string')
      )
    ],
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

  res.status(201).json(newRole);
});

// =========================================================
// 7. JLPT REGISTRATION CONTROL & STUDENT MANAGEMENT
// =========================================================
apiRouter.get('/jlpt/settings', (req: Request, res: Response) => {
  const settings = db.getJlptSettings();
  const studentCount = db.getStudents().length;
  const isRegistrationOpen = Boolean(
    settings.isEnabled && settings.status === 'OPEN'
  );

  res.json({
    ...settings,
    isRegistrationOpen,
    registeredCount: studentCount,
    capacityRemaining: Math.max(0, settings.maxCapacity - studentCount)
  });
});

apiRouter.post('/jlpt/settings', requireFaculty, (req: Request, res: Response) => {
  let {
    isEnabled,
    status,
    isRegistrationOpen,
    startDate,
    endDate,
    maxCapacity,
    allowWaitlistWhenFull,
    allowedLevels,
    instructions
  } = req.body;

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
      maxCapacity: maxCapacity !== undefined
        ? Number(maxCapacity)
        : undefined,
      allowWaitlistWhenFull: allowWaitlistWhenFull !== undefined
        ? Boolean(allowWaitlistWhenFull)
        : undefined,
      allowedLevels: Array.isArray(allowedLevels)
        ? allowedLevels
        : undefined,
      instructions: instructions !== undefined
        ? String(instructions)
        : undefined
    },
    facultyEmail
  );

  const studentCount = db.getStudents().length;

  res.json({
    ...updated,
    isRegistrationOpen: Boolean(
      updated.isEnabled && updated.status === 'OPEN'
    ),
    registeredCount: studentCount,
    capacityRemaining: Math.max(0, updated.maxCapacity - studentCount)
  });
});

// Student JLPT Registration Submission
apiRouter.post('/jlpt/register', (req: Request, res: Response) => {
  const ip = req.ip || 'unknown';

  if (!checkRateLimit(`jlpt_reg_${ip}`, 10, 60000)) {
    res.status(429).json({
      error: 'Too many registration requests. Please wait a moment.'
    });
    return;
  }

  const collegeEmail =
    typeof req.body.collegeEmail === 'string'
      ? req.body.collegeEmail.trim().toLowerCase()
      : '';

  const personalEmail =
    typeof req.body.personalEmail === 'string'
      ? req.body.personalEmail.trim().toLowerCase()
      : '';

  const mobileNumber =
    typeof req.body.mobileNumber === 'string'
      ? req.body.mobileNumber.trim()
      : '';

  const section =
    typeof req.body.section === 'string'
      ? req.body.section.trim()
      : '';

  const currentYear =
    typeof req.body.currentYear === 'string'
      ? req.body.currentYear.trim()
      : '';

  const graduationYear =
    typeof req.body.graduationYear === 'string'
      ? req.body.graduationYear.trim()
      : '';

  const normalizedPayload = {
    ...req.body,
    fullName:
      typeof req.body.fullName === 'string'
        ? req.body.fullName.trim()
        : '',
    collegeEmail,
    personalEmail,
    mobileNumber,
    usn:
      typeof req.body.usn === 'string'
        ? req.body.usn.trim().toUpperCase()
        : '',
    branch:
      typeof req.body.branch === 'string'
        ? req.body.branch.trim()
        : '',
    section,
    currentYear,
    graduationYear,
    jlptLevel: req.body.jlptLevel,
    previousExperience: req.body.previousExperience,
    additionalInfo:
      typeof req.body.additionalInfo === 'string'
        ? req.body.additionalInfo.trim()
        : typeof req.body.motivationReason === 'string'
          ? req.body.motivationReason.trim()
          : '',
    consent:
      req.body.consent !== undefined
        ? req.body.consent
        : req.body.consentDeclaration
  };

  const validation = validateStudentJlptForm(
    normalizedPayload,
    db.getJlptSettings().allowedLevels
  );

  if (!validation.isValid) {
    res.status(400).json({
      error: 'Form validation failed.',
      details: validation.errors
    });
    return;
  }

  const result = db.registerStudent(normalizedPayload);

  if (!result.success) {
    res.status(400).json({ error: result.error });
    return;
  }

  res.status(201).json({
    success: true,
    referenceId: result.referenceId,
    student: result.student,
    message: 'Thank you for registering for the Japanese Club JLPT Student Portal!'
  });
});

// Student status lookup
apiRouter.post('/jlpt/status-check', (req: Request, res: Response) => {
  const { usn, collegeEmail } = req.body;

  if (
    typeof usn !== 'string' ||
    typeof collegeEmail !== 'string' ||
    !usn.trim() ||
    !collegeEmail.trim()
  ) {
    res.status(400).json({
      error: 'Both USN and registered College Email are required to check status.'
    });
    return;
  }

  const normUsn = usn.trim().toUpperCase();
  const normEmail = normalizeEmail(collegeEmail);

  const student = db.getStudents().find(
    (s) =>
      s.usn.trim().toUpperCase() === normUsn &&
      s.collegeEmail.trim().toLowerCase() === normEmail
  );

  if (!student) {
    res.status(404).json({
      error: 'No matching student registration record was found.'
    });
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

  const student = db.getStudents().find(
    (s) => s.id === id || s.referenceId === id
  );

  if (!student) {
    res.status(404).json({ error: 'Student record not found.' });
    return;
  }

  const allowedStatuses = [
    'REGISTERED',
    'UNDER_REVIEW',
    'APPROVED',
    'REJECTED',
    'WAITLISTED',
    'CANCELLED'
  ];

  if (
    applicationStatus !== undefined &&
    !allowedStatuses.includes(applicationStatus)
  ) {
    res.status(400).json({ error: 'Invalid student application status.' });
    return;
  }

  if (
    internalNotes !== undefined &&
    typeof internalNotes !== 'string'
  ) {
    res.status(400).json({ error: 'Internal notes must be text.' });
    return;
  }

  if (applicationStatus !== undefined) {
    student.applicationStatus = applicationStatus;
  }

  if (internalNotes !== undefined) {
    student.internalNotes = internalNotes.trim();
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

  const escapeCsv = (value: unknown): string => {
    const text = value === null || value === undefined
      ? ''
      : String(value);

    return `"${text.replace(/"/g, '""')}"`;
  };

  const rows = students.map((s) => [
    s.referenceId,
    s.fullName,
    s.usn,
    s.collegeEmail,
    s.personalEmail,
    s.mobileNumber,
    s.branch,
    s.section,
    s.currentYear,
    s.graduationYear,
    s.jlptLevel,
    s.previousExperience,
    s.applicationStatus,
    s.registeredAt
  ].map(escapeCsv));

  const csv = [
    headers.map(escapeCsv).join(','),
    ...rows.map((row) => row.join(','))
  ].join('\r\n');

  db.addAuditLog({
    actorEmail: req.auth!.email,
    actorRole: req.auth!.role,
    action: 'EXPORT_STUDENTS_CSV',
    targetType: 'STUDENT_DATA',
    details: `Exported ${students.length} student records to CSV`
  });

  db.save();

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="jlpt_registrations_${Date.now()}.csv"`
  );

  res.send(`\uFEFF${csv}`);
});

// Bulk simulation testing helper for faculty
apiRouter.post('/jlpt/simulate-bulk', requireFaculty, (req: Request, res: Response) => {
  const targetCount = Number(req.body?.targetCount ?? 200);

  if (
    !Number.isInteger(targetCount) ||
    targetCount < 1 ||
    targetCount > 1000
  ) {
    res.status(400).json({
      error: 'targetCount must be an integer between 1 and 1000.'
    });
    return;
  }

  const branches = [
    'Computer Science',
    'Information Science',
    'Electronics and Communication',
    'Mechanical',
    'Civil'
  ];

  const levels = db.getJlptSettings().allowedLevels;

  const experienceOptions = [
    'First time',
    'Previously attempted',
    'Previously passed'
  ];

  const created: StudentRegistration[] = [];

  for (let i = 0; i < targetCount; i += 1) {
    const suffix = `${Date.now()}${i}`;

    const studentData = {
      fullName: `Test Student ${i + 1}`,
      collegeEmail: `teststudent${suffix}@college.edu`,
      personalEmail: `teststudent${suffix}@example.com`,
      mobileNumber: `90000${String(i).padStart(5, '0').slice(-5)}`,
      usn: `TEST${String(i).padStart(6, '0')}`,
      branch: branches[i % branches.length],
      section: 'A',
      currentYear: '2nd Year',
      graduationYear: '2028',
      jlptLevel: levels[i % Math.max(levels.length, 1)] || 'N5',
      previousExperience: experienceOptions[i % experienceOptions.length],
      additionalInfo: 'Generated test record',
      consent: true
    };

    const result = db.registerStudent(studentData);

    if (result.success && result.student) {
      created.push(result.student);
    }
  }

  db.addAuditLog({
    actorEmail: req.auth!.email,
    actorRole: 'FACULTY',
    action: 'SIMULATE_BULK_STUDENTS',
    targetType: 'STUDENT_DATA',
    details: `Generated ${created.length} test student records`
  });

  db.save();

  res.json({
    success: true,
    requested: targetCount,
    created: created.length,
    students: created
  });
});

// =========================================================
// 8. EVENTS & QR ATTENDANCE MANAGEMENT
// =========================================================
apiRouter.get('/events', (req: Request, res: Response) => {
  res.json(db.getEvents());
});

apiRouter.post('/events', requirePermission('events_manage'), (req: Request, res: Response) => {
  const {
    title,
    description,
    date,
    time,
    venue,
    capacity,
    image,
    category
  } = req.body;

  if (
    typeof title !== 'string' ||
    !title.trim() ||
    typeof date !== 'string' ||
    !date.trim() ||
    typeof time !== 'string' ||
    !time.trim() ||
    typeof venue !== 'string' ||
    !venue.trim()
  ) {
    res.status(400).json({
      error: 'Event title, date, time, and venue are required.'
    });
    return;
  }

  const parsedCapacity = Number(capacity);

  if (
    capacity !== undefined &&
    (!Number.isInteger(parsedCapacity) || parsedCapacity < 1)
  ) {
    res.status(400).json({
      error: 'Event capacity must be a positive whole number.'
    });
    return;
  }

  const event = {
    id: `event-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title: title.trim(),
    description: typeof description === 'string' ? description.trim() : '',
    date: date.trim(),
    time: time.trim(),
    venue: venue.trim(),
    capacity: capacity === undefined ? 0 : parsedCapacity,
    registeredCount: 0,
    image: typeof image === 'string' ? image : '',
    category: typeof category === 'string' ? category : 'General',
    createdAt: new Date().toISOString(),
    createdBy: req.auth!.email
  };

  db.getEvents().push(event);

  db.addAuditLog({
    actorEmail: req.auth!.email,
    actorRole: req.auth!.role,
    action: 'CREATE_EVENT',
    targetType: 'EVENT',
    targetId: event.id,
    details: `Created event "${event.title}"`
  });

  db.save();

  res.status(201).json(event);
});

// Public event registration
apiRouter.post('/events/:id/register', async (req: Request, res: Response) => {
  const eventId = req.params.id;

  const { fullName, collegeEmail, usn } = req.body;

  if (
    typeof fullName !== 'string' ||
    typeof collegeEmail !== 'string' ||
    typeof usn !== 'string' ||
    !fullName.trim() ||
    !collegeEmail.trim() ||
    !usn.trim()
  ) {
    res.status(400).json({
      error: 'Full name, college email, and USN are required.'
    });
    return;
  }

  const event = db.getEvents().find((e) => e.id === eventId);

  if (!event) {
    res.status(404).json({ error: 'Event not found.' });
    return;
  }

  const attendees = db.getEventAttendeesByEvent(eventId);

  if (
    Number(event.capacity) > 0 &&
    attendees.length >= Number(event.capacity)
  ) {
    res.status(409).json({
      error: 'This event has reached its registration capacity.'
    });
    return;
  }

  const normalizedEmail = normalizeEmail(collegeEmail);
  const normalizedUsn = usn.trim().toUpperCase();

  const duplicate = attendees.some(
    (attendee) =>
      attendee.collegeEmail.toLowerCase() === normalizedEmail ||
      attendee.usn.toUpperCase() === normalizedUsn
  );

  if (duplicate) {
    res.status(409).json({
      error: 'This email address or USN is already registered for this event.'
    });
    return;
  }

  const ticketCode = String(
    Math.floor(100000 + Math.random() * 900000)
  );

  const ticketExists = db.getEventAttendeesByEvent(eventId).some(
    (attendee) => attendee.ticketCode === ticketCode
  );

  if (ticketExists) {
    res.status(500).json({
      error: 'Unable to generate a unique ticket. Please try again.'
    });
    return;
  }

  try {
    const qrCode = await QRCode.toDataURL(ticketCode);

    const registrationResult = db.registerEventAttendee({
      eventId,
      fullName: fullName.trim(),
      collegeEmail: normalizedEmail,
      usn: normalizedUsn,
      ticketCode,
      qrCode
    });

    if (!registrationResult.success) {
      res.status(409).json({
        error: registrationResult.error || 'Unable to register for this event.'
      });
      return;
    }

    db.logEmail(
      normalizedEmail,
      `Event Registration Confirmation: ${event.title}`,
      'EVENT_REGISTRATION',
      `Hello ${fullName.trim()},\n\nYour registration for "${event.title}" is confirmed.\n\nTicket Code: ${ticketCode}\nEvent Date: ${event.date}\nEvent Time: ${event.time}\nVenue: ${event.venue}\n\nPlease present your ticket QR code at the event entrance.\n\nRegards,\nKomorebi Japanese Club`
    );

    db.addAuditLog({
      actorEmail: normalizedEmail,
      actorRole: 'STUDENT',
      action: 'EVENT_REGISTRATION',
      targetType: 'EVENT',
      targetId: eventId,
      details: `Registered ${fullName.trim()} (${normalizedUsn}) for "${event.title}"`
    });

    db.save();

    res.status(201).json({
      success: true,
      attendee: registrationResult.attendee,
      ticketCode,
      qrCode,
      message: 'Event registration completed successfully.'
    });
  } catch (error) {
    console.error('Event registration error:', error);

    res.status(500).json({
      error: 'An error occurred while registering for this event.'
    });
  }
});

// Event attendance check-in
apiRouter.post('/events/check-in', requirePermission('attendance_manage'), (req: Request, res: Response) => {
  const { ticketCode, usn, eventId } = req.body;

  if (
    typeof ticketCode !== 'string' &&
    !(typeof usn === 'string' && typeof eventId === 'string')
  ) {
    res.status(400).json({
      error: 'Provide a ticket code or both event ID and USN.'
    });
    return;
  }

  let attendee;

  if (typeof ticketCode === 'string' && ticketCode.trim()) {
    attendee = db.getEventAttendeeByTicket(ticketCode.trim());
  } else {
    const normalizedUsn = usn.trim().toUpperCase();

    attendee = db.getEventAttendeesByEvent(eventId).find(
      (item) => item.usn.toUpperCase() === normalizedUsn
    );
  }

  if (!attendee) {
    res.status(404).json({
      error: 'No matching event registration was found.'
    });
    return;
  }

  if (attendee.checkedIn) {
    res.status(409).json({
      error: 'This attendee has already been checked in.',
      attendee
    });
    return;
  }

  const checkedIn = db.checkInEventAttendee(
    attendee.ticketCode,
    req.auth!.email
  );

  if (!checkedIn) {
    res.status(409).json({
      error: 'Unable to check in attendee. The ticket may already be used.'
    });
    return;
  }

  db.addAuditLog({
    actorEmail: req.auth!.email,
    actorRole: req.auth!.role,
    action: 'EVENT_ATTENDEE_CHECK_IN',
    targetType: 'EVENT_ATTENDEE',
    targetId: attendee.ticketCode,
    details: `Checked in ${attendee.fullName} (${attendee.usn})`
  });

  db.save();

  res.json({
    success: true,
    attendee: checkedIn,
    message: 'Attendee checked in successfully.'
  });
});

// Event attendees list
apiRouter.get('/events/:id/attendees', requirePermission('attendance_manage'), (req: Request, res: Response) => {
  const event = db.getEvents().find((e) => e.id === req.params.id);

  if (!event) {
    res.status(404).json({ error: 'Event not found.' });
    return;
  }

  res.json(db.getEventAttendeesByEvent(req.params.id));
});

// =========================================================
// 9. ANIME & MANGA DISCOVERY
// =========================================================
apiRouter.get('/anime-manga', (req: Request, res: Response) => {
  res.json(db.getAnimeManga());
});

apiRouter.post('/anime-manga', requireAuth, (req: Request, res: Response) => {
  const {
    title,
    type,
    genre,
    description,
    image,
    rating
  } = req.body;

  if (
    typeof title !== 'string' ||
    !title.trim() ||
    typeof type !== 'string' ||
    !type.trim()
  ) {
    res.status(400).json({
      error: 'Anime or manga title and type are required.'
    });
    return;
  }

  const item = {
    id: `anime-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title: title.trim(),
    type: type.trim(),
    genre: typeof genre === 'string' ? genre.trim() : '',
    description: typeof description === 'string' ? description.trim() : '',
    image: typeof image === 'string' ? image.trim() : '',
    rating: rating !== undefined ? Number(rating) : 0,
    isApproved: false,
    submittedBy: req.auth!.email,
    createdAt: new Date().toISOString()
  };

  db.getAnimeManga().push(item);

  db.addAuditLog({
    actorEmail: req.auth!.email,
    actorRole: req.auth!.role,
    action: 'SUBMIT_ANIME_MANGA',
    targetType: 'ANIME_MANGA',
    targetId: item.id,
    details: `Submitted "${item.title}" for review`
  });

  db.save();

  res.status(201).json({
    success: true,
    item,
    message: 'Your suggestion has been submitted for review.'
  });
});

apiRouter.patch('/anime-manga/:id/moderate', requirePermission('anime_manage'), (req: Request, res: Response) => {
  const { id } = req.params;
  const { isApproved } = req.body;

  if (typeof isApproved !== 'boolean') {
    res.status(400).json({
      error: 'isApproved must be a boolean value.'
    });
    return;
  }

  const item = db.getAnimeManga().find((a) => a.id === id);

  if (!item) {
    res.status(404).json({ error: 'Item not found.' });
    return;
  }

  item.isApproved = isApproved;

  db.addAuditLog({
    actorEmail: req.auth!.email,
    actorRole: req.auth!.role,
    action: isApproved ? 'APPROVE_ANIME_MANGA' : 'REJECT_ANIME_MANGA',
    targetType: 'ANIME_MANGA',
    targetId: item.id,
    details: `${isApproved ? 'Approved' : 'Rejected'} "${item.title}"`
  });

  db.save();

  res.json({
    success: true,
    item
  });
});

// =========================================================
// 10. AUDIT LOGS & TRANSACTIONAL EMAIL LOGS
// =========================================================
apiRouter.get('/audit-logs', requireFaculty, (req: Request, res: Response) => {
  res.json(db.getAuditLogs());
});

apiRouter.get('/email-logs', requireFaculty, (req: Request, res: Response) => {
  res.json(db.getEmailLogs());
});
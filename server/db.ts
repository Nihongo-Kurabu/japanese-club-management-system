import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface FacultyMember {
  id: string;
  name: string;
  email: string;
  mobile: string;
  designation: string;
  passwordHash: string;
  salt: string;
  mfaCode: string;
  createdAt: string;
  lastLogin?: string;
}

export interface AdminRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
}

export interface AdminApplication {
  id: string;
  name: string;
  email: string;
  mobile: string;
  department: string;
  requestedRoleId: string;
  requestedRoleName: string;
  reason: string;
  passwordHash: string;
  salt: string;
  verificationCode: string;
  isEmailVerified: boolean;
  status: 'PENDING_EMAIL_VERIFICATION' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'BLOCKED';
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Administrator {
  id: string;
  name: string;
  email: string;
  mobile: string;
  department: string;
  roleId: string;
  roleName: string;
  permissions: string[];
  passwordHash: string;
  salt: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'REVOKED';
  approvedBy: string;
  approvedAt: string;
  lastLogin?: string;
  createdAt: string;
}

export interface BlockedEmail {
  id: string;
  email: string;
  reason: string;
  blockedBy: string;
  blockedAt: string;
}

export interface StudentRegistration {
  id: string;
  referenceId: string; // e.g. JLPT-2026-0001
  fullName: string;
  collegeEmail: string;
  personalEmail: string;
  mobileNumber: string;
  usn: string;
  branch: string;
  section: string;
  currentYear: string;
  graduationYear: string;
  jlptLevel: string;
  previousExperience: string;
  additionalInfo?: string;
  consent: boolean;
  verificationStatus: 'VERIFIED' | 'PENDING_VERIFICATION';
  applicationStatus: 'REGISTERED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'WAITLISTED' | 'CANCELLED';
  internalNotes?: string;
  registeredAt: string;
  updatedAt: string;
}

export interface JlptSettings {
  isEnabled: boolean; // Master toggle
  status: 'OPEN' | 'CLOSED';
  startDate: string;
  endDate: string;
  maxCapacity: number;
  allowWaitlistWhenFull: boolean;
  allowedLevels: string[];
  instructions: string;
}

export interface EventRecord {
  id: string;
  title: string;
  japaneseTitle: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  image: string;
  description: string;
  highlights: string[];
  capacity: number;
  registeredCount: number;
  isPast?: boolean;
}

export interface EventAttendee {
  id: string;
  eventId: string;
  eventTitle: string;
  fullName: string;
  collegeEmail: string;
  usn: string;
  ticketCode: string;
  qrData: string;
  checkedIn: boolean;
  checkedInAt?: string;
  checkedInBy?: string;
  registeredAt: string;
}

export interface AnimeMangaItem {
  id: string;
  title: string;
  japaneseTitle: string;
  type: 'Anime' | 'Manga';
  genre: string;
  score: number;
  episodesOrChapters: string;
  synopsis: string;
  recommendedBy: string;
  isApproved: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId?: string;
  details: string;
  ip?: string;
}

export interface TransactionalEmail {
  id: string;
  timestamp: string;
  recipient: string;
  subject: string;
  eventType: string;
  body: string;
  status: 'DELIVERED' | 'SIMULATED' | 'FAILED';
}

export interface DatabaseSchema {
  faculty: FacultyMember[];
  roles: AdminRole[];
  adminApplications: AdminApplication[];
  administrators: Administrator[];
  blockedEmails: BlockedEmail[];
  students: StudentRegistration[];
  jlptSettings: JlptSettings;
  events: EventRecord[];
  eventAttendees: EventAttendee[];
  animeManga: AnimeMangaItem[];
  auditLogs: AuditLog[];
  emailLogs: TransactionalEmail[];
  activeSessions: Record<string, { email: string; role: string; roleId?: string; permissions: string[]; expiresAt: number }>;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Password hashing helper
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const finalSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, finalSalt, 64).toString('hex');
  return { hash, salt: finalSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const calculated = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(calculated, 'hex'));
}

export class JsonDatabase {
  private data: DatabaseSchema;

  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } catch (err) {
        console.error('Failed to parse database.json, initializing fresh store:', err);
        this.data = this.getDefaultData();
        this.save();
      }
    } else {
      this.data = this.getDefaultData();
      this.save();
    }
  }

  private getDefaultData(): DatabaseSchema {
    const facultySalt = crypto.randomBytes(16).toString('hex');
    const facultyHash = hashPassword('Faculty@Komorebi2026!', facultySalt).hash;

    const defaultRoles: AdminRole[] = [
      {
        id: 'role-president',
        name: 'President',
        description: 'Full club authority, operations oversight, and approval decisions',
        permissions: ['all', 'admin_view', 'admin_manage', 'student_view', 'student_manage', 'events_manage', 'announcements_manage', 'learning_manage', 'anime_manage', 'gallery_manage', 'audit_view'],
        isSystem: true
      },
      {
        id: 'role-vp',
        name: 'Vice President',
        description: 'Operations, cross-department coordination, and event administration',
        permissions: ['admin_view', 'student_view', 'events_manage', 'announcements_manage', 'learning_manage', 'gallery_manage'],
        isSystem: true
      },
      {
        id: 'role-secretary',
        name: 'Secretary',
        description: 'Club announcements, records documentation, and minutes',
        permissions: ['announcements_manage', 'student_view', 'events_view', 'audit_view'],
        isSystem: true
      },
      {
        id: 'role-event-mgr',
        name: 'Event Manager',
        description: 'Create and update events, manage participant lists and digital QR check-in',
        permissions: ['events_manage', 'attendance_manage', 'student_view'],
        isSystem: true
      },
      {
        id: 'role-tech-admin',
        name: 'Technical Administrator',
        description: 'Technical platform maintenance, logs oversight, and digital workflows',
        permissions: ['tech_manage', 'audit_view', 'events_view', 'student_view'],
        isSystem: true
      },
      {
        id: 'role-anime-mod',
        name: 'Anime Group Moderator',
        description: 'Curate anime/manga recommendations and moderate community discussions',
        permissions: ['anime_manage', 'announcements_manage'],
        isSystem: true
      },
      {
        id: 'role-learning-coord',
        name: 'Learning Coordinator',
        description: 'Manage Japanese language resources, quizzes, and JLPT study circles',
        permissions: ['learning_manage', 'student_view'],
        isSystem: true
      },
      {
        id: 'role-gallery-mgr',
        name: 'Gallery Manager',
        description: 'Upload and organize official club photography and event archives',
        permissions: ['gallery_manage'],
        isSystem: true
      },
      {
        id: 'role-general-admin',
        name: 'General Administrator',
        description: 'Basic administrative oversight and event attendance monitoring',
        permissions: ['student_view', 'events_view'],
        isSystem: true
      }
    ];

    const initialFaculty: FacultyMember = {
      id: 'faculty-001',
      name: 'Dr. Kenji Sato',
      email: 'faculty.head@college.edu',
      mobile: '+919845012345',
      designation: 'Faculty Advisor & Director of Japanese Studies',
      passwordHash: facultyHash,
      salt: facultySalt,
      mfaCode: '654321', // Secure simulation code for faculty verification
      createdAt: new Date().toISOString()
    };

    // Pre-seed an approved admin: Pranav (Technical Head)
    const pranavSalt = crypto.randomBytes(16).toString('hex');
    const pranavHash = hashPassword('Admin@Komorebi2026!', pranavSalt).hash;
    const initialAdmin: Administrator = {
      id: 'admin-001',
      name: 'Pranav Anand',
      email: 'pranavanand350@college.edu',
      mobile: '+919876543210',
      department: 'Computer Science',
      roleId: 'role-tech-admin',
      roleName: 'Technical Administrator',
      permissions: ['tech_manage', 'audit_view', 'events_view', 'student_view'],
      passwordHash: pranavHash,
      salt: pranavSalt,
      status: 'ACTIVE',
      approvedBy: 'faculty.head@college.edu',
      approvedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    // Seed 15 diverse student registrations to test filters and exports
    const seedStudents: StudentRegistration[] = [
      {
        id: 'std-001',
        referenceId: 'JLPT-2026-0001',
        fullName: 'Aarav Sharma',
        collegeEmail: 'aarav.s@college.edu',
        personalEmail: 'aarav.sharma.personal@gmail.com',
        mobileNumber: '+919811223344',
        usn: '1MS22CS001',
        branch: 'Computer Science',
        section: 'A',
        currentYear: '3rd Year (Junior)',
        graduationYear: '2027',
        jlptLevel: 'N5',
        previousExperience: 'First time',
        consent: true,
        verificationStatus: 'VERIFIED',
        applicationStatus: 'APPROVED',
        internalNotes: 'Attended all orientation meetings',
        registeredAt: '2026-11-01T10:15:00Z',
        updatedAt: '2026-11-01T10:15:00Z'
      },
      {
        id: 'std-002',
        referenceId: 'JLPT-2026-0002',
        fullName: 'Diya Patel',
        collegeEmail: 'diya.p@college.edu',
        personalEmail: 'diya.patel99@outlook.com',
        mobileNumber: '+919822334455',
        usn: '1MS22IS014',
        branch: 'Information Science',
        section: 'B',
        currentYear: '3rd Year (Junior)',
        graduationYear: '2027',
        jlptLevel: 'N4',
        previousExperience: 'Previously passed',
        consent: true,
        verificationStatus: 'VERIFIED',
        applicationStatus: 'APPROVED',
        internalNotes: 'Passed N5 in Dec 2025 with 145/180',
        registeredAt: '2026-11-01T11:20:00Z',
        updatedAt: '2026-11-01T11:20:00Z'
      },
      {
        id: 'std-003',
        referenceId: 'JLPT-2026-0003',
        fullName: 'Rohan Kulkarni',
        collegeEmail: 'rohan.k@college.edu',
        personalEmail: 'rohan.kulkarni@gmail.com',
        mobileNumber: '+919833445566',
        usn: '1MS23EC032',
        branch: 'Electronics & Communication',
        section: 'A',
        currentYear: '2nd Year (Sophomore)',
        graduationYear: '2028',
        jlptLevel: 'N5',
        previousExperience: 'First time',
        consent: true,
        verificationStatus: 'VERIFIED',
        applicationStatus: 'REGISTERED',
        registeredAt: '2026-11-02T09:05:00Z',
        updatedAt: '2026-11-02T09:05:00Z'
      },
      {
        id: 'std-004',
        referenceId: 'JLPT-2026-0004',
        fullName: 'Ananya Roy',
        collegeEmail: 'ananya.r@college.edu',
        personalEmail: 'ananya.roy.creative@yahoo.com',
        mobileNumber: '+919844556677',
        usn: '1MS24AI018',
        branch: 'Artificial Intelligence & ML',
        section: 'A',
        currentYear: '1st Year (Freshman)',
        graduationYear: '2029',
        jlptLevel: 'N5',
        previousExperience: 'First time',
        consent: true,
        verificationStatus: 'VERIFIED',
        applicationStatus: 'REGISTERED',
        registeredAt: '2026-11-02T14:40:00Z',
        updatedAt: '2026-11-02T14:40:00Z'
      },
      {
        id: 'std-005',
        referenceId: 'JLPT-2026-0005',
        fullName: 'Vikramaditya Rao',
        collegeEmail: 'vikram.r@college.edu',
        personalEmail: 'vikram.aditya@gmail.com',
        mobileNumber: '+919855667788',
        usn: '1MS21ME040',
        branch: 'Mechanical Engineering',
        section: 'B',
        currentYear: '4th Year (Senior)',
        graduationYear: '2026',
        jlptLevel: 'N3',
        previousExperience: 'Previously attempted',
        consent: true,
        verificationStatus: 'VERIFIED',
        applicationStatus: 'UNDER_REVIEW',
        registeredAt: '2026-11-03T08:30:00Z',
        updatedAt: '2026-11-03T08:30:00Z'
      }
    ];

    // Seed events (zero dummy registrations, strictly starts at 0/capacity)
    const seedEvents: EventRecord[] = [
      {
        id: 'hanami-matsuri-2026',
        title: 'Haru Matsuri: Cherry Blossom Spring Festival',
        japaneseTitle: '春祭り・桜の宴',
        category: 'Cultural',
        date: 'March 28, 2026',
        time: '4:00 PM – 8:30 PM',
        venue: 'Campus Central Amphitheater & Zen Courtyard',
        image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
        description: 'An evening celebration of spring featuring traditional Yukata dress codes, Japanese street food stalls (Takoyaki, Dango), Koto music performances, and lantern lighting under blooming cherry trees.',
        highlights: ['Yukata dress-up booth', 'Authentic Matcha tea tasting', 'Live Taiko drumming demonstration', 'Origami wish-tree installation'],
        capacity: 250,
        registeredCount: 182
      },
      {
        id: 'kanji-calligraphy-masterclass',
        title: 'Shodo: Japanese Calligraphy Masterclass',
        japaneseTitle: '書道マスタークラス',
        category: 'Workshop',
        date: 'April 08, 2026',
        time: '2:30 PM – 5:00 PM',
        venue: 'Design Studio 4B, Humanities Building',
        image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
        description: 'Learn the ancient art of Japanese brush calligraphy (書道). Understand brush control, ink grinding on Suzuri stones, and write your own favorite Kanji on handmade Washi rice paper.',
        highlights: ['Traditional Sumi ink & Fude brushes provided', 'Guidance on Kaisho and Gyosho styles', 'Take home your framed personalized Kanji scroll'],
        capacity: 40,
        registeredCount: 36
      },
      {
        id: 'anime-cinematic-night',
        title: 'Anime Universe: The Art of Visual Storytelling',
        japaneseTitle: 'アニメ・シネマナイト',
        category: 'Anime & Media',
        date: 'April 18, 2026',
        time: '6:00 PM – 9:30 PM',
        venue: 'Auditorium Hall B',
        image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80',
        description: 'A deep-dive analytical showcase examining anime composition, sakuga animation highlights from master studios, followed by trivia.',
        highlights: ['Sakuga frame-by-frame breakdown', 'OST acoustic tribute session', 'Anime trivia grand championship with imported prizes'],
        capacity: 180,
        registeredCount: 145
      },
      {
        id: 'jlpt-starter-camp',
        title: 'Nihongo Bootcamp: Zero to Hiragana & Everyday Greetings',
        japaneseTitle: '日本語スターターキャンプ',
        category: 'Language',
        date: 'May 02, 2026',
        time: '10:00 AM – 1:00 PM',
        venue: 'Seminar Hall 201',
        image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
        description: 'An interactive crash course designed for complete beginners. Master the 46 Hiragana characters and essential greetings.',
        highlights: ['Printed Hiragana mnemonic workbooks', 'Pronunciation drill with speech feedback', 'Interactive flashcard speed challenge'],
        capacity: 60,
        registeredCount: 52
      }
    ];

    return {
      faculty: [initialFaculty],
      roles: defaultRoles,
      adminApplications: [],
      administrators: [initialAdmin],
      blockedEmails: [],
      students: seedStudents,
      jlptSettings: {
        isEnabled: true,
        status: 'OPEN',
        startDate: '2026-11-01',
        endDate: '2026-12-15',
        maxCapacity: 1000,
        allowWaitlistWhenFull: true,
        allowedLevels: ['N5', 'N4', 'N3', 'N2', 'N1', 'Not yet decided'],
        instructions: 'Please bring your college identity card and JLPT portal registration slip for all orientation sessions.'
      },
      events: seedEvents,
      eventAttendees: [],
      animeManga: [
        {
          id: 'am-1',
          title: 'Frieren: Beyond Journey’s End',
          japaneseTitle: '葬送のフリーレン',
          type: 'Anime',
          genre: 'Fantasy / Philosophical',
          score: 9.3,
          episodesOrChapters: '28 Episodes',
          synopsis: 'An elven mage ponders human mortality and friendship after a decade-long quest concludes.',
          recommendedBy: 'Abrar (Anime Moderator)',
          isApproved: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 'am-2',
          title: 'Vagabond',
          japaneseTitle: 'バガボンド',
          type: 'Manga',
          genre: 'Historical / Martial Arts',
          score: 9.2,
          episodesOrChapters: '327 Chapters',
          synopsis: 'Takehiko Inoue’s breathtaking portrayal of legendary swordmaster Miyamoto Musashi and the Way of the Sword.',
          recommendedBy: 'Sameer Bhaiya (Club Senpai)',
          isApproved: true,
          createdAt: new Date().toISOString()
        }
      ],
      auditLogs: [
        {
          id: 'audit-001',
          timestamp: new Date().toISOString(),
          actorEmail: 'system',
          actorRole: 'SYSTEM',
          action: 'SYSTEM_BOOTSTRAP',
          targetType: 'SYSTEM',
          details: 'Initial database created with institutional faculty credentials, default roles, and JLPT control settings'
        }
      ],
      emailLogs: [
        {
          id: 'email-001',
          timestamp: new Date().toISOString(),
          recipient: 'faculty.head@college.edu',
          subject: 'Komorebi Japanese Club System Initialized',
          eventType: 'SYSTEM_NOTIFICATION',
          body: 'System initialized with capacity 1000 and institutional faculty oversight.',
          status: 'SIMULATED'
        }
      ],
      activeSessions: {}
    };
  }

  // Atomic write pattern: writes to temporary file then renames
  public save(): void {
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(this.data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  }

  // Accessors
  public getFaculty(): FacultyMember[] {
    return this.data.faculty;
  }

  public getRoles(): AdminRole[] {
    return this.data.roles;
  }

  public getAdminApplications(): AdminApplication[] {
    return this.data.adminApplications;
  }

  public getAdministrators(): Administrator[] {
    return this.data.administrators;
  }

  public getBlockedEmails(): BlockedEmail[] {
    return this.data.blockedEmails;
  }

  public getStudents(): StudentRegistration[] {
    return this.data.students;
  }

  public getJlptSettings(): JlptSettings {
    return this.data.jlptSettings;
  }

  public getEvents(): EventRecord[] {
    return this.data.events;
  }

  public getEventAttendees(): EventAttendee[] {
    return this.data.eventAttendees;
  }

  public getAnimeManga(): AnimeMangaItem[] {
    return this.data.animeManga;
  }

  public getAuditLogs(): AuditLog[] {
    return this.data.auditLogs;
  }

  public getEmailLogs(): TransactionalEmail[] {
    return this.data.emailLogs;
  }

  public getActiveSessions(): Record<string, { email: string; role: string; roleId?: string; permissions: string[]; expiresAt: number }> {
    return this.data.activeSessions;
  }

  // Mutations
  public addAuditLog(entry: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const log: AuditLog = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...entry
    };
    this.data.auditLogs.unshift(log);
    // Keep last 1000 logs
    if (this.data.auditLogs.length > 1000) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 1000);
    }
    this.save();
  }

  public logEmail(recipient: string, subject: string, eventType: string, body: string): void {
    const emailRecord: TransactionalEmail = {
      id: `mail-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      recipient,
      subject,
      eventType,
      body,
      status: 'SIMULATED'
    };
    this.data.emailLogs.unshift(emailRecord);
    if (this.data.emailLogs.length > 500) {
      this.data.emailLogs = this.data.emailLogs.slice(0, 500);
    }
    this.save();
  }

  public updateJlptSettings(newSettings: Partial<JlptSettings>, actorEmail: string): JlptSettings {
    this.data.jlptSettings = { ...this.data.jlptSettings, ...newSettings };
    this.addAuditLog({
      actorEmail,
      actorRole: 'FACULTY',
      action: 'UPDATE_JLPT_SETTINGS',
      targetType: 'JLPT_SETTINGS',
      details: `Updated settings: ${JSON.stringify(newSettings)}`
    });
    this.save();
    return this.data.jlptSettings;
  }

  // Concurrency-safe atomic student registration
  public registerStudent(formData: Omit<StudentRegistration, 'id' | 'referenceId' | 'registeredAt' | 'updatedAt' | 'verificationStatus' | 'applicationStatus'>): {
    success: boolean;
    referenceId?: string;
    student?: StudentRegistration;
    error?: string;
  } {
    const settings = this.data.jlptSettings;

    if (!settings.isEnabled || settings.status !== 'OPEN') {
      return { success: false, error: 'JLPT student registration is currently closed. Please check for future announcements.' };
    }

    const normCollegeEmail = formData.collegeEmail.trim().toLowerCase();
    const normUsn = formData.usn.trim().toUpperCase();

    // Check duplicate email
    const duplicateEmail = this.data.students.find((s) => s.collegeEmail.trim().toLowerCase() === normCollegeEmail);
    if (duplicateEmail) {
      return { success: false, error: `A registration with college email "${formData.collegeEmail}" already exists (Ref: ${duplicateEmail.referenceId}).` };
    }

    // Check duplicate USN
    const duplicateUsn = this.data.students.find((s) => s.usn.trim().toUpperCase() === normUsn);
    if (duplicateUsn) {
      return { success: false, error: `A registration with University Seat Number "${formData.usn}" already exists (Ref: ${duplicateUsn.referenceId}).` };
    }

    // Check capacity
    const currentCount = this.data.students.length;
    let applicationStatus: StudentRegistration['applicationStatus'] = 'REGISTERED';

    if (currentCount >= settings.maxCapacity) {
      if (settings.allowWaitlistWhenFull) {
        applicationStatus = 'WAITLISTED';
      } else {
        return { success: false, error: `Registration capacity of ${settings.maxCapacity} students has been reached. Submissions are now closed.` };
      }
    }

    const nextSeq = currentCount + 1;
    const refId = `JLPT-2026-${String(nextSeq).padStart(4, '0')}`;
    const newStudent: StudentRegistration = {
      id: `std-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      referenceId: refId,
      ...formData,
      collegeEmail: normCollegeEmail,
      usn: normUsn,
      verificationStatus: 'VERIFIED',
      applicationStatus,
      registeredAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.students.push(newStudent);

    // Auto close if capacity reached and waitlist not allowed
    if (this.data.students.length >= settings.maxCapacity && !settings.allowWaitlistWhenFull) {
      this.data.jlptSettings.status = 'CLOSED';
    }

    this.addAuditLog({
      actorEmail: normCollegeEmail,
      actorRole: 'STUDENT',
      action: 'SUBMIT_JLPT_REGISTRATION',
      targetType: 'STUDENT_REGISTRATION',
      targetId: refId,
      details: `New registration for ${formData.fullName} (${normUsn}), level: ${formData.jlptLevel}, status: ${applicationStatus}`
    });

    this.logEmail(
      normCollegeEmail,
      `JLPT Registration Confirmation – ${refId}`,
      'STUDENT_REGISTRATION_CONFIRMATION',
      `Dear ${formData.fullName},\n\nThank you for registering for the Komorebi Japanese Club JLPT Student Portal.\nYour registration reference is: ${refId}.\nStatus: ${applicationStatus}.\n\nRegards,\nJapanese Club Administration`
    );

    this.save();
    return { success: true, referenceId: refId, student: newStudent };
  }
}

export const db = new JsonDatabase();

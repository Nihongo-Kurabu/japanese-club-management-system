export interface StudentJlptFormData {
  fullName: string;
  collegeEmail: string;
  personalEmail: string;
  mobileNumber: string;
  usn: string;
  branch: string;
  section: string;
  currentYear: string;
  graduationYear: string;
  jlptLevel: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | 'Not yet decided';
  previousExperience: 'First time' | 'Previously attempted' | 'Previously passed';
  additionalInfo?: string;
  consent: boolean;
}

export interface JlptValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateStudentJlptForm(
  data: StudentJlptFormData,
  allowedLevels: string[] = ['N5', 'N4', 'N3', 'N2', 'N1', 'Not yet decided']
): JlptValidationResult {
  const errors: Record<string, string> = {};

  if (!data.fullName || data.fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.collegeEmail || !emailRegex.test(data.collegeEmail.trim())) {
    errors.collegeEmail = 'A valid college email address is required.';
  }

  if (!data.personalEmail || !emailRegex.test(data.personalEmail.trim())) {
    errors.personalEmail = 'A valid personal email address is required.';
  }

  if (data.collegeEmail && data.personalEmail && data.collegeEmail.trim().toLowerCase() === data.personalEmail.trim().toLowerCase()) {
    errors.personalEmail = 'Personal email should be distinct from your college email.';
  }

  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{7,14}$/;
  if (!data.mobileNumber || !phoneRegex.test(data.mobileNumber.trim())) {
    errors.mobileNumber = 'Please enter a valid mobile phone number.';
  }

  // USN validation (alphanumeric, at least 6 characters, e.g. 1MS21CS001, USN-2024-99)
  const usnRegex = /^[A-Za-z0-9\-_]{6,20}$/;
  if (!data.usn || !usnRegex.test(data.usn.trim())) {
    errors.usn = 'Valid University Seat Number (USN / Roll No) is required (6-20 alphanumeric characters).';
  }

  if (!data.branch || data.branch.trim().length < 2) {
    errors.branch = 'Branch / Department is required.';
  }

  if (!data.section || data.section.trim().length < 1) {
    errors.section = 'Section is required (e.g., A, B, CS-1).';
  }

  if (!data.currentYear || data.currentYear.trim() === '') {
    errors.currentYear = 'Current year of study is required.';
  }

  const currentYearNum = new Date().getFullYear();
  const gradYearNum = parseInt(data.graduationYear, 10);
  if (isNaN(gradYearNum) || gradYearNum < currentYearNum - 1 || gradYearNum > currentYearNum + 7) {
    errors.graduationYear = `Expected graduation year must be a realistic year between ${currentYearNum - 1} and ${currentYearNum + 7}.`;
  }

  if (!data.jlptLevel || !allowedLevels.includes(data.jlptLevel)) {
    errors.jlptLevel = 'Please select a valid JLPT proficiency level.';
  }

  if (!data.previousExperience) {
    errors.previousExperience = 'Please select your previous Japanese study/exam experience.';
  }

  if (!data.consent) {
    errors.consent = 'You must consent to the collection and use of registration information.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function generateJlptReferenceId(sequenceNumber: number, year = 2026): string {
  const padded = String(sequenceNumber).padStart(4, '0');
  return `JLPT-${year}-${padded}`;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isEmailBlocked(email: string, blockedList: string[]): boolean {
  const norm = normalizeEmail(email);
  return blockedList.some((b) => normalizeEmail(b) === norm);
}

export function checkCapacityAndStatus(
  currentCount: number,
  maxCapacity: number,
  isOpen: boolean
): { canRegister: boolean; reason?: 'CLOSED' | 'CAPACITY_REACHED' } {
  if (!isOpen) {
    return { canRegister: false, reason: 'CLOSED' };
  }
  if (currentCount >= maxCapacity) {
    return { canRegister: false, reason: 'CAPACITY_REACHED' };
  }
  return { canRegister: true };
}

export interface JlptLevelMeta {
  title: string;
  kanji: string;
  kanjiCount: number;
  vocabCount: number;
  desc: string;
  target: string;
}

export const JLPT_LEVEL_INFO: Record<'N5' | 'N4' | 'N3' | 'N2' | 'N1', JlptLevelMeta> = {
  N5: {
    title: 'Beginner / Introductory',
    kanji: '初級前半',
    kanjiCount: 100,
    vocabCount: 800,
    desc: 'The ability to understand basic Japanese. Able to read and comprehend typical expressions and sentences written in hiragana, katakana, and basic kanji.',
    target: 'Ideal for students beginning their Japanese journey and club enthusiasts.'
  },
  N4: {
    title: 'Elementary / Basic',
    kanji: '初級後半',
    kanjiCount: 300,
    vocabCount: 1500,
    desc: 'The ability to understand basic Japanese. Can read and understand passages on familiar daily topics written in basic vocabulary and kanji.',
    target: 'Second-year students or those who completed beginner conversational courses.'
  },
  N3: {
    title: 'Intermediate / Bridge',
    kanji: '中級',
    kanjiCount: 650,
    vocabCount: 3750,
    desc: 'The ability to understand Japanese used in everyday situations to a certain degree. Comprehends slightly difficult texts and spoken conversations at natural speed.',
    target: 'Crucial milestone for technical internships, student exchange, and study abroad.'
  },
  N2: {
    title: 'Pre-Advanced / Business',
    kanji: '中上級',
    kanjiCount: 1000,
    vocabCount: 6000,
    desc: 'The ability to understand Japanese in everyday situations, and in a variety of circumstances to a certain degree. High-level comprehension of articles and news commentary.',
    target: 'Standard prerequisite for employment at Japanese multinational technology firms.'
  },
  N1: {
    title: 'Advanced / Native Nuance',
    kanji: '上級',
    kanjiCount: 2000,
    vocabCount: 10000,
    desc: 'The ability to understand Japanese used in a wide variety of sophisticated circumstances. Reads complex essays, technical documents, and comprehends nuanced abstract debates.',
    target: 'Senior students, bilingual researchers, and professional translators.'
  }
};


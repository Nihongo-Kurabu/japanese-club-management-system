export interface MembershipFormData {
  fullName: string;
  collegeEmail: string;
  department: string;
  yearOfStudy: string;
  interests: string[];
  reason: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateMembershipForm(data: MembershipFormData): FormValidationResult {
  const errors: Record<string, string> = {};

  if (!data.fullName || data.fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters long.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.collegeEmail || !emailRegex.test(data.collegeEmail.trim())) {
    errors.collegeEmail = 'Please provide a valid college email address.';
  }

  if (!data.department || data.department.trim().length < 2) {
    errors.department = 'Department or major is required.';
  }

  if (!data.yearOfStudy || data.yearOfStudy.trim() === '') {
    errors.yearOfStudy = 'Please select your current year of study.';
  }

  if (!data.interests || data.interests.length === 0) {
    errors.interests = 'Please select at least one area of interest.';
  }

  if (!data.reason || data.reason.trim().length < 15) {
    errors.reason = 'Please share a brief reason for joining (at least 15 characters).';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function validateContactForm(data: ContactFormData): FormValidationResult {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Please provide your name.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email.trim())) {
    errors.email = 'Please provide a valid email address.';
  }

  if (!data.subject || data.subject.trim().length < 3) {
    errors.subject = 'Subject is required.';
  }

  if (!data.message || data.message.trim().length < 10) {
    errors.message = 'Message must be at least 10 characters long.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function generateMemberId(prefix = 'JP-CLUB'): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${randomNum}`;
}

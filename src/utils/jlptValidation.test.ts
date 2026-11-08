import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateStudentJlptForm,
  generateJlptReferenceId,
  normalizeEmail,
  isEmailBlocked,
  checkCapacityAndStatus,
  StudentJlptFormData
} from './jlptValidation';

test('validateStudentJlptForm accepts valid student entry', () => {
  const validData: StudentJlptFormData = {
    fullName: 'Aoi Miyazaki',
    collegeEmail: 'aoi.m@university.edu',
    personalEmail: 'aoi.personal@gmail.com',
    mobileNumber: '+919876543210',
    usn: '1MS22CS045',
    branch: 'Computer Science',
    section: 'A',
    currentYear: '3rd Year',
    graduationYear: '2027',
    jlptLevel: 'N5',
    previousExperience: 'First time',
    consent: true
  };

  const result = validateStudentJlptForm(validData);
  assert.equal(result.isValid, true);
  assert.equal(Object.keys(result.errors).length, 0);
});

test('validateStudentJlptForm flags duplicate or invalid emails, short USN and missing consent', () => {
  const invalidData: StudentJlptFormData = {
    fullName: 'A',
    collegeEmail: 'bad-email',
    personalEmail: 'bad-email',
    mobileNumber: '123',
    usn: '12',
    branch: '',
    section: '',
    currentYear: '',
    graduationYear: '1990',
    jlptLevel: 'N5',
    previousExperience: 'First time',
    consent: false
  };

  const result = validateStudentJlptForm(invalidData);
  assert.equal(result.isValid, false);
  assert.ok(result.errors.fullName);
  assert.ok(result.errors.collegeEmail);
  assert.ok(result.errors.usn);
  assert.ok(result.errors.branch);
  assert.ok(result.errors.graduationYear);
  assert.ok(result.errors.consent);
});

test('generateJlptReferenceId pads sequence numbers to four digits', () => {
  assert.equal(generateJlptReferenceId(1, 2026), 'JLPT-2026-0001');
  assert.equal(generateJlptReferenceId(42, 2026), 'JLPT-2026-0042');
  assert.equal(generateJlptReferenceId(1000, 2026), 'JLPT-2026-1000');
});

test('normalizeEmail strips whitespace and lowercases', () => {
  assert.equal(normalizeEmail('  Applicant.Student@COLLEGE.edu  '), 'applicant.student@college.edu');
});

test('isEmailBlocked checks blocked email list case-insensitively', () => {
  const blocked = ['spammer@bad.org', 'banned.student@college.edu'];
  assert.equal(isEmailBlocked('BANNED.STUDENT@COLLEGE.EDU', blocked), true);
  assert.equal(isEmailBlocked('normal.student@college.edu', blocked), false);
});

test('checkCapacityAndStatus correctly restricts closed registration or full capacity', () => {
  assert.deepEqual(checkCapacityAndStatus(100, 1000, true), { canRegister: true });
  assert.deepEqual(checkCapacityAndStatus(100, 1000, false), { canRegister: false, reason: 'CLOSED' });
  assert.deepEqual(checkCapacityAndStatus(1000, 1000, true), { canRegister: false, reason: 'CAPACITY_REACHED' });
  assert.deepEqual(checkCapacityAndStatus(1005, 1000, true), { canRegister: false, reason: 'CAPACITY_REACHED' });
});

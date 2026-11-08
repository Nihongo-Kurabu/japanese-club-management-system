import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateMembershipForm,
  validateContactForm,
  generateMemberId
} from './validation';

test('validateMembershipForm rejects incomplete input', () => {
  const result = validateMembershipForm({
    fullName: '',
    collegeEmail: 'not-an-email',
    department: '',
    yearOfStudy: '',
    interests: [],
    reason: 'Too short'
  });

  assert.equal(result.isValid, false);
  assert.ok(result.errors.fullName);
  assert.ok(result.errors.collegeEmail);
  assert.ok(result.errors.department);
  assert.ok(result.errors.yearOfStudy);
  assert.ok(result.errors.interests);
  assert.ok(result.errors.reason);
});

test('validateMembershipForm accepts valid submission', () => {
  const result = validateMembershipForm({
    fullName: 'Ren Amamiya',
    collegeEmail: 'ren.a@university.edu',
    department: 'Computer Science',
    yearOfStudy: '2nd Year',
    interests: ['Anime', 'Language', 'Tech/Media'],
    reason: 'I am passionate about Japanese storytelling and want to practice conversational Japanese.'
  });

  assert.equal(result.isValid, true);
  assert.equal(Object.keys(result.errors).length, 0);
});

test('validateContactForm correctly verifies contact fields', () => {
  const valid = validateContactForm({
    name: 'Tanjiro',
    email: 'tanjiro@club.jp',
    subject: 'Cultural Workshop Inquiry',
    message: 'Hello, I would like to ask about the upcoming tea ceremony workshop date.'
  });
  assert.equal(valid.isValid, true);

  const invalid = validateContactForm({
    name: 'T',
    email: 'bad-email',
    subject: '',
    message: ''
  });
  assert.equal(invalid.isValid, false);
  assert.ok(invalid.errors.email);
});

test('generateMemberId produces expected prefix format', () => {
  const id = generateMemberId('JP-CLUB');
  assert.match(id, /^JP-CLUB-\d{4}-\d{4}$/);
});

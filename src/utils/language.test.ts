import test from 'node:test';
import assert from 'node:assert/strict';
import {
  findKanaByRomaji,
  searchKanji,
  calculateQuizScore,
  HIRAGANA_CHARACTERS,
  SAMPLE_QUIZ_QUESTIONS
} from './language';

test('findKanaByRomaji retrieves correct hiragana character', () => {
  const result = findKanaByRomaji('a');
  assert.ok(result);
  assert.equal(result.kana, 'あ');
  assert.equal(result.type, 'hiragana');
});

test('findKanaByRomaji works for katakana character', () => {
  const result = findKanaByRomaji('ka');
  assert.ok(result);
  // Default is first match (hiragana or katakana)
  assert.equal(result.romaji, 'ka');
});

test('searchKanji filters kanji by meaning', () => {
  const results = searchKanji('mountain');
  assert.equal(results.length, 1);
  assert.equal(results[0].kanji, '山');
});

test('calculateQuizScore accurately evaluates answers', () => {
  const answers = {
    q1: 'a', // correct
    q2: 'さ', // correct
    q3: 'Wrong answer', // incorrect
    q4: '山', // correct
    q5: 'カメラ (kamera)' // correct
  };
  const score = calculateQuizScore(answers, SAMPLE_QUIZ_QUESTIONS);
  assert.equal(score.correctCount, 4);
  assert.equal(score.total, 5);
  assert.equal(score.percentage, 80);
});

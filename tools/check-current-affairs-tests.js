#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const dateHelpers = path.join(root, 'Psc-preparation/Current-Affairs/nepali-date.js');
const testData = path.join(root, 'Psc-preparation/Current-Affairs/tests.js');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(dateHelpers, 'utf8'), sandbox, { filename: dateHelpers });
vm.runInContext(fs.readFileSync(testData, 'utf8'), sandbox, { filename: testData });

const tests = sandbox.window.CA_TESTS;
const nepaliDate = sandbox.window.NepaliDate;
const errors = [];

if (!tests || typeof tests !== 'object' || !nepaliDate) {
  console.error('Current Affairs data or Nepali-date helpers could not be loaded.');
  process.exit(1);
}

// Build a lookup for valid BS dates and their AD weekdays from the shared converter.
const bsDates = new Map();
const firstDay = Date.UTC(2013, 3, 14);
const lastDay = Date.UTC(2034, 3, 14);
for (let timestamp = firstDay; timestamp <= lastDay; timestamp += 86400000) {
  const adDate = new Date(timestamp);
  const bs = nepaliDate.adToBs(adDate);
  if (bs) bsDates.set(nepaliDate.keyOf(bs), adDate.getUTCDay());
}

let questionCount = 0;
for (const [key, set] of Object.entries(tests)) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) {
    errors.push(`${key}: key must use YYYY-MM-DD (BS) format`);
    continue;
  }
  const weekday = bsDates.get(key);
  if (weekday === undefined) errors.push(`${key}: date is outside the supported BS calendar or invalid`);
  else if (weekday !== 3) errors.push(`${key}: test date is not a Wednesday`);

  if (!set || typeof set.name !== 'string' || !set.name.trim()) errors.push(`${key}: missing test name`);
  if (!set || !Array.isArray(set.questions) || set.questions.length === 0) {
    errors.push(`${key}: questions must be a non-empty array`);
    continue;
  }

  set.questions.forEach((question, index) => {
    questionCount += 1;
    const label = `${key}, question ${index + 1}`;
    if (!question || typeof question.question !== 'string' || !question.question.trim()) {
      errors.push(`${label}: missing question text`);
    }
    if (!Array.isArray(question.options) || question.options.length < 2) {
      errors.push(`${label}: at least two options are required`);
      return;
    }
    if (!Number.isInteger(question.correct) || question.correct < 0 || question.correct >= question.options.length) {
      errors.push(`${label}: correct must be a zero-based option index`);
    }
    if (question.explanation != null && typeof question.explanation !== 'string') {
      errors.push(`${label}: explanation must be text when provided`);
    }
  });
}

if (Object.keys(tests).length === 0) errors.push('No current-affairs test sets were found');
if (errors.length) {
  console.error(`Found ${errors.length} current-affairs data issue${errors.length === 1 ? '' : 's'}:`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Validated ${Object.keys(tests).length} Wednesday test set(s) and ${questionCount} question(s).`);

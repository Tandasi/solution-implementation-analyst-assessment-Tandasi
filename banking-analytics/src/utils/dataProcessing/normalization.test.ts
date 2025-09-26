/**
 * Test cases for Banking Data Normalization Functions
 * Assessment Question 1: Comprehensive testing of edge cases
 */

import { parseAmount, normalizeGender, parseDate, normalizeRowData } from './normalization';
import { Gender } from '../../types/banking';

// Test parseAmount function
console.log('=== Testing parseAmount Function ===');

// Test cases covering all scenarios mentioned in the assessment
const amountTestCases = [
  // Standard formats
  { input: '1234.56', expected: 1234.56 },
  { input: '$1,234.56', expected: 1234.56 },
  { input: '1,234.56', expected: 1234.56 },
  
  // Edge cases
  { input: '', expected: 0 },
  { input: 'N/A', expected: 0 },
  { input: 'null', expected: 0 },
  { input: '-', expected: 0 },
  
  // Negative amounts (banking context)
  { input: '-500.00', expected: -500.00 },
  { input: '(500.00)', expected: -500.00 },
  
  // Currency symbols
  { input: '£1234.56', expected: 1234.56 },
  { input: '€2,500.75', expected: 2500.75 },
  
  // Invalid formats
  { input: 'abc123', expected: 0 },
  { input: '12.34.56', expected: 0 }
];

amountTestCases.forEach(({ input, expected }) => {
  const result = parseAmount(input);
  const status = result === expected ? 'PASS' : 'FAIL';
  console.log(`${status} parseAmount("${input}") = ${result} (expected: ${expected})`);
});

// Test normalizeGender function
console.log('\n=== Testing normalizeGender Function ===');

const genderTestCases = [
  // Standard formats
  { input: 'Male', expected: Gender.MALE },
  { input: 'Female', expected: Gender.FEMALE },
  { input: 'Other', expected: Gender.OTHER },
  
  // Variations
  { input: 'M', expected: Gender.MALE },
  { input: 'male', expected: Gender.MALE },
  { input: 'FEMALE', expected: Gender.FEMALE },
  { input: 'f', expected: Gender.FEMALE },
  { input: 'Non-binary', expected: Gender.OTHER },
  
  // Edge cases
  { input: '', expected: Gender.OTHER },
  { input: 'unknown', expected: Gender.OTHER },
  { input: 'xyz', expected: Gender.OTHER }
];

genderTestCases.forEach(({ input, expected }) => {
  const result = normalizeGender(input);
  const status = result === expected ? 'PASS' : 'FAIL';
  console.log(`${status} normalizeGender("${input}") = ${result} (expected: ${expected})`);
});

// Test parseDate function
console.log('\n=== Testing parseDate Function ===');

const dateTestCases = [
  // Standard formats
  { input: '2023-12-15', expected: new Date(2023, 11, 15) },
  { input: '12/15/2023', expected: new Date(2023, 11, 15) },
  { input: '15/12/2023', expected: new Date(2023, 11, 15) }, // Will be ambiguous
  
  // Edge cases
  { input: '', expected: null },
  { input: 'N/A', expected: null },
  { input: 'invalid-date', expected: null },
  
  // Different formats
  { input: '15.12.2023', expected: new Date(2023, 11, 15) },
  { input: '20231215', expected: new Date(2023, 11, 15) }
];

dateTestCases.forEach(({ input, expected }) => {
  const result = parseDate(input);
  const expectedStr = expected ? expected.toDateString() : 'null';
  const resultStr = result ? result.toDateString() : 'null';
  const status = (result?.toDateString() === expected?.toDateString()) ? 'PASS' : 'FAIL';
  console.log(`${status} parseDate("${input}") = ${resultStr} (expected: ${expectedStr})`);
});

// Test comprehensive normalization
console.log('\n=== Testing normalizeRowData Function ===');

const comprehensiveTestCases = [
  {
    amount: '$1,500.00',
    gender: 'Male',
    date: '2023-01-15',
    expectedValid: true
  },
  {
    amount: 'N/A',
    gender: 'unknown',
    date: 'invalid-date',
    expectedValid: false
  },
  {
    amount: '(250.50)',
    gender: 'F',
    date: '01/15/2023',
    expectedValid: true
  }
];

comprehensiveTestCases.forEach((testCase, index) => {
  const result = normalizeRowData(testCase.amount, testCase.gender, testCase.date);
  const status = result.isValid === testCase.expectedValid ? 'PASS' : 'FAIL';
  console.log(`${status} Test ${index + 1}:`);
  console.log(`  Amount: ${result.amount}`);
  console.log(`  Gender: ${result.gender}`);
  console.log(`  Date: ${result.date ? result.date.toDateString() : 'null'}`);
  console.log(`  Valid: ${result.isValid}`);
  console.log(`  Warnings: ${result.warnings.join(', ') || 'None'}`);
  console.log('');
});

export default {
  parseAmount,
  normalizeGender,
  parseDate,
  normalizeRowData
};
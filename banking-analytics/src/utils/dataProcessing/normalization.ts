/**
 * Banking Data Normalization Functions
 * Assessment Question 1: Data Normalization and Type Conversion (15 points)
 * 
 * This module provides robust functions to clean and normalize banking data
 * from various string formats into proper TypeScript types.
 */

import { Gender } from '../../types/banking';

/**
 * Convert string amount to number safely
 * Handles various currency formats and edge cases
 * 
 * @param amount - String representation of monetary amount
 * @returns Parsed number or 0 for invalid inputs
 * 
 * Business Context: Banking systems receive amounts in various formats
 * from different sources (CSV imports, user input, API calls)
 */
export function parseAmount(amount: string): number {
  // Handle null, undefined, or empty strings
  if (!amount || typeof amount !== 'string') {
    return 0;
  }

  // Trim whitespace
  const trimmed = amount.trim();
  
  // Handle empty string after trim
  if (trimmed === '') {
    return 0;
  }

  // Handle common "no data" indicators
  const noDataIndicators = ['N/A', 'n/a', 'NULL', 'null', 'undefined', '-', '--'];
  if (noDataIndicators.includes(trimmed)) {
    return 0;
  }

  // Remove currency symbols and formatting
  // Handles: "$1,234.56", "1,234.56", "£1234.56", "€1,234.56"
  let cleaned = trimmed
    .replace(/[$£€¥₹]/g, '') // Remove currency symbols
    .replace(/,/g, '')       // Remove thousand separators
    .replace(/\s+/g, '');    // Remove any remaining whitespace

  // Handle negative amounts (common in banking for withdrawals)
  const isNegative = cleaned.includes('-') || cleaned.includes('(');
  cleaned = cleaned.replace(/[-()]/g, '');

  // Validate that we have a valid number format
  const numberRegex = /^\d*\.?\d*$/;
  if (!numberRegex.test(cleaned)) {
    console.warn(`Invalid amount format: "${amount}" - defaulting to 0`);
    return 0;
  }

  // Parse the cleaned string
  const parsed = parseFloat(cleaned);
  
  // Handle NaN results
  if (isNaN(parsed)) {
    console.warn(`Could not parse amount: "${amount}" - defaulting to 0`);
    return 0;
  }

  // Apply negative sign if detected
  const result = isNegative ? -parsed : parsed;

  // Banking validation: amounts should typically be reasonable
  // Warn about extremely large amounts (potential data errors)
  if (Math.abs(result) > 10000000) { // 10 million threshold
    console.warn(`Unusually large amount detected: ${result} from "${amount}"`);
  }

  return result;
}

/**
 * Standardize gender values to consistent enum
 * Handles various input formats and edge cases
 * 
 * @param gender - String representation of gender
 * @returns Standardized Gender enum value
 * 
 * Business Context: Customer data comes from various sources with
 * inconsistent gender representation. Banking regulations require
 * consistent categorization for reporting and compliance.
 */
export function normalizeGender(gender: string): Gender {
  // Handle null, undefined, or empty inputs
  if (!gender || typeof gender !== 'string') {
    return Gender.OTHER;
  }

  // Convert to lowercase and trim for consistent comparison
  const normalized = gender.toLowerCase().trim();

  // Handle empty string after normalization
  if (normalized === '') {
    return Gender.OTHER;
  }

  // Male variations
  const maleVariations = [
    'm', 'male', 'man', 'boy', 'masculine', 'mr', 'sir'
  ];

  // Female variations
  const femaleVariations = [
    'f', 'female', 'woman', 'girl', 'feminine', 'ms', 'mrs', 'miss', 'madam'
  ];

  // Other/Non-binary variations
  const otherVariations = [
    'other', 'non-binary', 'nonbinary', 'nb', 'x', 'unknown', 
    'prefer not to say', 'not specified', 'n/a', 'null'
  ];

  // Check against variations
  if (maleVariations.includes(normalized)) {
    return Gender.MALE;
  }

  if (femaleVariations.includes(normalized)) {
    return Gender.FEMALE;
  }

  if (otherVariations.includes(normalized)) {
    return Gender.OTHER;
  }

  // Default to OTHER for unrecognized values
  console.warn(`Unrecognized gender value: "${gender}" - defaulting to OTHER`);
  return Gender.OTHER;
}

/**
 * Parse date string safely from various formats
 * Handles common date formats used in banking systems
 * 
 * @param dateString - String representation of date
 * @returns Date object or null for invalid inputs
 * 
 * Business Context: Banking data comes from legacy systems, CSV exports,
 * and various APIs with different date formats. Consistent date parsing
 * is crucial for transaction analysis and regulatory reporting.
 */
export function parseDate(dateString: string): Date | null {
  // Handle null, undefined, or empty inputs
  if (!dateString || typeof dateString !== 'string') {
    return null;
  }

  // Trim whitespace
  const trimmed = dateString.trim();
  
  // Handle empty string after trim
  if (trimmed === '') {
    return null;
  }

  // Handle common "no date" indicators
  const noDateIndicators = ['N/A', 'n/a', 'NULL', 'null', 'undefined', '-', '--'];
  if (noDateIndicators.includes(trimmed)) {
    return null;
  }

  // Try parsing with native Date constructor first
  // This handles ISO formats: "2023-12-15", "2023-12-15T10:30:00"
  let parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  // Handle common US format: MM/DD/YYYY or M/D/YYYY
  const usDateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const usMatch = trimmed.match(usDateRegex);
  if (usMatch) {
    const [, month, day, year] = usMatch;
    parsed = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  // Handle European format: DD/MM/YYYY or D/M/YYYY
  const euDateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const euMatch = trimmed.match(euDateRegex);
  if (euMatch) {
    const [, day, month, year] = euMatch;
    // Try European format if US format didn't work or seems wrong
    const euDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(euDate.getTime()) && parseInt(day) > 12) {
      // If day > 12, it's definitely DD/MM/YYYY format
      return euDate;
    }
  }

  // Handle dash-separated formats: DD-MM-YYYY, MM-DD-YYYY
  const dashDateRegex = /^(\d{1,2})-(\d{1,2})-(\d{4})$/;
  const dashMatch = trimmed.match(dashDateRegex);
  if (dashMatch) {
    const [, first, second, year] = dashMatch;
    
    // Try MM-DD-YYYY first
    parsed = new Date(parseInt(year), parseInt(first) - 1, parseInt(second));
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
    
    // Try DD-MM-YYYY if first attempt failed
    parsed = new Date(parseInt(year), parseInt(second) - 1, parseInt(first));
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  // Handle dot-separated formats: DD.MM.YYYY (common in European banking)
  const dotDateRegex = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
  const dotMatch = trimmed.match(dotDateRegex);
  if (dotMatch) {
    const [, day, month, year] = dotMatch;
    parsed = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  // Handle YYYYMMDD format (common in financial systems)
  const compactDateRegex = /^(\d{4})(\d{2})(\d{2})$/;
  const compactMatch = trimmed.match(compactDateRegex);
  if (compactMatch) {
    const [, year, month, day] = compactMatch;
    parsed = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  // Banking-specific: Handle Excel date serial numbers
  // Excel stores dates as numbers (days since 1900-01-01)
  const excelSerialRegex = /^\d{5,6}$/; // 5-6 digits typical for recent dates
  if (excelSerialRegex.test(trimmed)) {
    const serial = parseInt(trimmed);
    // Excel date serial number conversion
    const excelEpoch = new Date(1900, 0, 1);
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    parsed = new Date(excelEpoch.getTime() + (serial - 2) * millisecondsPerDay);
    
    if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 1900 && parsed.getFullYear() < 2100) {
      return parsed;
    }
  }

  // Log warning for unparseable dates
  console.warn(`Could not parse date: "${dateString}" - returning null`);
  return null;
}

/**
 * Utility function to validate a parsed date is reasonable for banking context
 * 
 * @param date - Date to validate
 * @returns boolean indicating if date is reasonable for banking operations
 */
export function isReasonableBankingDate(date: Date | null): boolean {
  if (!date) return false;
  
  const year = date.getFullYear();
  const currentYear = new Date().getFullYear();
  
  // Banking context: reasonable date range
  // Accounts shouldn't be older than 100 years or in the future
  return year >= (currentYear - 100) && year <= (currentYear + 1);
}

/**
 * Comprehensive data cleaning function that applies all normalization
 * 
 * @param rawAmount - Raw amount string
 * @param rawGender - Raw gender string  
 * @param rawDate - Raw date string
 * @returns Object with normalized values and validation status
 */
export function normalizeRowData(
  rawAmount: string, 
  rawGender: string, 
  rawDate: string
): {
  amount: number;
  gender: Gender;
  date: Date | null;
  isValid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  
  const amount = parseAmount(rawAmount);
  const gender = normalizeGender(rawGender);
  const date = parseDate(rawDate);
  
  // Validate results
  let isValid = true;
  
  if (amount === 0 && rawAmount && rawAmount.trim() !== '0') {
    warnings.push(`Amount parsing may have failed for: "${rawAmount}"`);
  }
  
  if (gender === Gender.OTHER && rawGender && !['other', 'unknown', 'n/a'].includes(rawGender.toLowerCase())) {
    warnings.push(`Gender value not recognized: "${rawGender}"`);
  }
  
  if (!date && rawDate && rawDate.trim() !== '') {
    warnings.push(`Date parsing failed for: "${rawDate}"`);
    isValid = false; // Invalid dates are critical for banking operations
  }
  
  if (date && !isReasonableBankingDate(date)) {
    warnings.push(`Date appears unreasonable for banking context: ${date}`);
  }
  
  return {
    amount,
    gender,
    date,
    isValid,
    warnings
  };
}
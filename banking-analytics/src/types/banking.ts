// Banking Data Types for TypeScript

// Raw CSV data structure
export interface RawBankingData {
  'Customer ID': string;
  'First Name': string;
  'Last Name': string;
  'Age': string;
  'Gender': string;
  'Address': string;
  'City': string;
  'Contact Number': string;
  'Email': string;
  'Account Type': string;
  'Account Balance': string;
  'Date Of Account Opening': string;
  'Last Transaction Date': string;
  'TransactionID': string;
  'Transaction Date': string;
  'Transaction Type': string;
  'Transaction Amount': string;
  'Account Balance After Transaction': string;
  'Branch ID': string;
  'Loan ID': string;
  'Loan Amount': string;
  'Loan Type': string;
  'Interest Rate': string;
  'Loan Term': string;
  'Approval/Rejection Date': string;
  'Loan Status': string;
  'CardID': string;
  'Card Type': string;
  'Credit Limit': string;
  'Credit Card Balance': string;
  'Minimum Payment Due': string;
  'Payment Due Date': string;
  'Last Credit Card Payment Date': string;
  'Rewards Points': string;
  'Feedback ID': string;
  'Feedback Date': string;
  'Feedback Type': string;
  'Resolution Status': string;
  'Resolution Date': string;
  'Anomaly': string;
}

// Enums for categorical data
export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other'
}

export enum TransactionType {
  DEPOSIT = 'Deposit',
  WITHDRAWAL = 'Withdrawal',
  TRANSFER = 'Transfer'
}

export enum AccountType {
  SAVINGS = 'Savings',
  CURRENT = 'Current',
  CHECKING = 'Checking'
}

// Validation result types
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
  value: any;
}

// Cleaned/normalized transaction for downstream processing
export interface CleanedTransaction {
  customerId: string;
  transactionDate: Date;
  transactionType: TransactionType;
  transactionAmount: number;
  accountBalance: number;
  customerAge: number;
  customerGender: Gender;
  accountType: AccountType;
  branchCode: string;
  accountOpeningDate: Date;
  isValid: boolean;
  validationErrors: string[];
}
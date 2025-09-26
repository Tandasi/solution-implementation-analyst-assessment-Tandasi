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

// Cleaned and processed transaction data
export interface CleanedTransaction {
  customerId: number;
  firstName: string;
  lastName: string;
  age: number;
  gender: Gender;
  address: string;
  city: string;
  contactNumber: string;
  email: string;
  accountType: AccountType;
  accountBalance: number;
  accountOpeningDate: Date;
  lastTransactionDate: Date;
  transactionId: number;
  transactionDate: Date;
  transactionType: TransactionType;
  transactionAmount: number;
  accountBalanceAfterTransaction: number;
  branchId: string;
  loanInfo?: LoanInfo;
  creditCardInfo?: CreditCardInfo;
  feedbackInfo?: FeedbackInfo;
  isAnomaly: boolean;
  isValid: boolean;
  validationErrors: string[];
}

// Enums for categorical data
export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other'
}

export enum AccountType {
  SAVINGS = 'Savings',
  CURRENT = 'Current',
  CHECKING = 'Checking'
}

export enum TransactionType {
  DEPOSIT = 'Deposit',
  WITHDRAWAL = 'Withdrawal',
  TRANSFER = 'Transfer'
}

export enum LoanType {
  MORTGAGE = 'Mortgage',
  AUTO = 'Auto',
  PERSONAL = 'Personal'
}

export enum LoanStatus {
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  CLOSED = 'Closed',
  PENDING = 'Pending'
}

export enum CardType {
  VISA = 'Visa',
  MASTERCARD = 'MasterCard',
  AMEX = 'AMEX'
}

export enum FeedbackType {
  COMPLAINT = 'Complaint',
  SUGGESTION = 'Suggestion',
  PRAISE = 'Praise'
}

export enum ResolutionStatus {
  RESOLVED = 'Resolved',
  PENDING = 'Pending',
  ESCALATED = 'Escalated'
}

// Supporting interfaces
export interface LoanInfo {
  loanId: number;
  loanAmount: number;
  loanType: LoanType;
  interestRate: number;
  loanTerm: number;
  approvalRejectionDate: Date | null;
  loanStatus: LoanStatus;
}

export interface CreditCardInfo {
  cardId: number;
  cardType: CardType;
  creditLimit: number;
  creditCardBalance: number;
  minimumPaymentDue: number;
  paymentDueDate: Date;
  lastCreditCardPaymentDate: Date | null;
  rewardsPoints: number;
}

export interface FeedbackInfo {
  feedbackId: number;
  feedbackDate: Date;
  feedbackType: FeedbackType;
  resolutionStatus: ResolutionStatus;
  resolutionDate: Date | null;
}

// Business Analytics Types
export interface CustomerMetrics {
  customerId: number;
  customerLifetimeValue: number;
  totalTransactions: number;
  averageTransactionAmount: number;
  accountBalance: number;
  riskScore: number;
  isHighValue: boolean;
  lastActivityDate: Date;
}

export interface BranchPerformance {
  branchId: string;
  totalTransactionVolume: number;
  totalCustomers: number;
  averageTransactionAmount: number;
  monthlyGrowthRate: number;
  performanceRank: number;
  isUnderperforming: boolean;
}

export interface MonthlyMetrics {
  month: string;
  year: number;
  totalVolume: number;
  transactionCount: number;
  averageAmount: number;
  branchPerformance: Map<string, number>;
}

// Chart Data Types
export interface ChartDataPoint {
  label: string;
  value: number;
  category?: string;
  date?: Date;
  metadata?: Record<string, any>;
}

export interface TimeSeriesData {
  date: Date;
  value: number;
  category?: string;
}

export interface ScatterPlotData {
  x: number;
  y: number;
  label: string;
  category: string;
  size?: number;
}

// Data Processing Types
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

export interface ProcessingStats {
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  processingTime: number;
  memoryUsage: number;
  validationErrors: ValidationError[];
}

// API and Service Types
export interface DataProcessingOptions {
  validateData: boolean;
  handleAnomalies: boolean;
  normalizeFields: boolean;
  calculateMetrics: boolean;
  batchSize: number;
}

export interface ExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  includeMetadata: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  filters?: Record<string, any>;
}

// UI Component Props Types
export interface DashboardProps {
  data: CleanedTransaction[];
  loading: boolean;
  error?: string;
}

export interface ChartProps {
  data: ChartDataPoint[];
  title: string;
  height?: number;
  width?: number;
  showLegend?: boolean;
}

export interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  data: CleanedTransaction[];
}

export interface FilterState {
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  transactionTypes: TransactionType[];
  accountTypes: AccountType[];
  branches: string[];
  amountRange: {
    min: number;
    max: number;
  };
  customerAgeRange: {
    min: number;
    max: number;
  };
  showAnomaliesOnly: boolean;
}

// State Management Types
export interface AppState {
  rawData: RawBankingData[];
  processedData: CleanedTransaction[];
  customerMetrics: CustomerMetrics[];
  branchPerformance: BranchPerformance[];
  monthlyMetrics: MonthlyMetrics[];
  filters: FilterState;
  loading: boolean;
  error: string | null;
  processingStats: ProcessingStats | null;
}

export type AppAction =
  | { type: 'LOAD_DATA_START' }
  | { type: 'LOAD_DATA_SUCCESS'; payload: RawBankingData[] }
  | { type: 'LOAD_DATA_ERROR'; payload: string }
  | { type: 'PROCESS_DATA_SUCCESS'; payload: { processed: CleanedTransaction[]; stats: ProcessingStats } }
  | { type: 'UPDATE_FILTERS'; payload: FilterState }
  | { type: 'CALCULATE_METRICS_SUCCESS'; payload: { customers: CustomerMetrics[]; branches: BranchPerformance[]; monthly: MonthlyMetrics[] } }
  | { type: 'RESET_STATE' };

// Performance Monitoring Types
export interface PerformanceMetrics {
  dataLoadTime: number;
  processingTime: number;
  renderTime: number;
  memoryUsage: number;
  chartRenderTime: number;
}

export interface OptimizationConfig {
  enableVirtualization: boolean;
  batchSize: number;
  debounceTime: number;
  cacheSize: number;
  lazyLoadCharts: boolean;
}
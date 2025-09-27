/**
 * Business Metrics and Aggregation Functions
 * Assessment Question 4: Business Insights and Aggregation (25 points)
 * 
 * This module implements comprehensive business analytics functions for banking data
 * including monthly volume analysis, anomaly detection, and customer lifetime value calculations.
 */

import { CleanedTransaction, TransactionType } from '../../types/banking';

// Enhanced interfaces for business analytics
export interface MonthlyVolumeData {
  branchId: string;
  month: string;
  transactionCount: number;
  totalVolume: number;
  averageTransactionAmount: number;
  uniqueCustomers: number;
}

export interface AnomalyDetectionResult {
  transaction: CleanedTransaction;
  anomalyScore: number;
  anomalyType: 'amount' | 'frequency' | 'pattern' | 'timing';
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface CustomerLTVData {
  customerId: string;
  lifetimeValue: number;
  transactionCount: number;
  averageTransactionAmount: number;
  firstTransactionDate: Date;
  lastTransactionDate: Date;
  accountAge: number; // in days
  riskScore: number;
  customerSegment: 'low' | 'medium' | 'high' | 'premium';
}

/**
 * Calculate monthly transaction volume by branch
 * Assessment Requirement: getMonthlyVolumeByBranch(data: CleanedTransaction[]): Map<string, Map<string, number>>
 * 
 * Business Context: Branch performance analysis is crucial for:
 * - Resource allocation and staffing decisions
 * - Identifying top-performing locations for replication
 * - Regulatory reporting requirements
 * - Strategic expansion planning
 */
export function getMonthlyVolumeByBranch(data: CleanedTransaction[]): Map<string, Map<string, number>> {
  const result = new Map<string, Map<string, number>>();
  
  data.forEach(tx => {
    const branchId = tx.branchCode || 'Unknown';
    const month = tx.transactionDate.toISOString().slice(0, 7); // YYYY-MM format
    
    if (!result.has(branchId)) {
      result.set(branchId, new Map());
    }
    
    const branchMap = result.get(branchId)!;
    const currentVolume = branchMap.get(month) || 0;
    branchMap.set(month, currentVolume + tx.transactionAmount);
  });
  
  return result;
}

/**
 * Enhanced monthly volume analysis with detailed metrics
 * Provides comprehensive branch performance data for senior management
 */
export function getDetailedMonthlyVolumeByBranch(data: CleanedTransaction[]): MonthlyVolumeData[] {
  const branchMonthData = new Map<string, Map<string, {
    transactions: CleanedTransaction[];
    totalVolume: number;
    uniqueCustomers: Set<string>;
  }>>();
  
  // Aggregate data by branch and month
  data.forEach(tx => {
    const branchId = tx.branchCode || 'Unknown';
    const month = tx.transactionDate.toISOString().slice(0, 7);
    
    if (!branchMonthData.has(branchId)) {
      branchMonthData.set(branchId, new Map());
    }
    
    const branchMap = branchMonthData.get(branchId)!;
    if (!branchMap.has(month)) {
      branchMap.set(month, {
        transactions: [],
        totalVolume: 0,
        uniqueCustomers: new Set<string>()
      });
    }
    
    const monthData = branchMap.get(month)!;
    monthData.transactions.push(tx);
    monthData.totalVolume += tx.transactionAmount;
    monthData.uniqueCustomers.add(tx.customerId);
  });
  
  // Convert to detailed results
  const results: MonthlyVolumeData[] = [];
  branchMonthData.forEach((monthMap, branchId) => {
    monthMap.forEach((monthData, month) => {
      const transactionCount = monthData.transactions.length;
      const averageTransactionAmount = transactionCount > 0 ? 
        monthData.totalVolume / transactionCount : 0;
      
      results.push({
        branchId,
        month,
        transactionCount,
        totalVolume: monthData.totalVolume,
        averageTransactionAmount,
        uniqueCustomers: monthData.uniqueCustomers.size
      });
    });
  });
  
  return results.sort((a, b) => b.totalVolume - a.totalVolume);
}

/**
 * Detect anomalous transactions using multiple detection methods
 * Assessment Requirement: detectAnomalousTransactions(data: CleanedTransaction[]): CleanedTransaction[]
 * 
 * Business Context: Anomaly detection is critical for:
 * - Fraud prevention and detection
 * - Risk management and compliance
 * - Operational efficiency monitoring
 * - Regulatory reporting requirements
 */
export function detectAnomalousTransactions(data: CleanedTransaction[]): CleanedTransaction[] {
  const anomalies: CleanedTransaction[] = [];
  
  // Method 1: Statistical outliers (Z-score > 3)
  const amounts = data.map(tx => tx.transactionAmount);
  const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const variance = amounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / amounts.length;
  const std = Math.sqrt(variance);
  
  const statisticalOutliers = data.filter(tx => {
    const zScore = Math.abs(tx.transactionAmount - mean) / std;
    return zScore > 3;
  });
  
  anomalies.push(...statisticalOutliers);
  
  // Method 2: Unusual transaction patterns by customer
  const customerPatterns = new Map<string, {
    transactions: CleanedTransaction[];
    averageAmount: number;
    frequency: number;
  }>();
  
  data.forEach(tx => {
    if (!customerPatterns.has(tx.customerId)) {
      customerPatterns.set(tx.customerId, {
        transactions: [],
        averageAmount: 0,
        frequency: 0
      });
    }
    customerPatterns.get(tx.customerId)!.transactions.push(tx);
  });
  
  // Calculate patterns
  customerPatterns.forEach((pattern, customerId) => {
    const amounts = pattern.transactions.map(tx => tx.transactionAmount);
    pattern.averageAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    pattern.frequency = pattern.transactions.length;
  });
  
  // Find pattern anomalies
  const patternAnomalies = data.filter(tx => {
    const pattern = customerPatterns.get(tx.customerId);
    if (!pattern || pattern.transactions.length < 3) return false;
    
    // Transaction amount significantly different from customer's average
    const amountDeviation = Math.abs(tx.transactionAmount - pattern.averageAmount) / pattern.averageAmount;
    return amountDeviation > 2; // 200% deviation
  });
  
  anomalies.push(...patternAnomalies);
  
  // Method 3: Unusual timing patterns (transactions outside normal hours)
  const timingAnomalies = data.filter(tx => {
    const hour = tx.transactionDate.getHours();
    // Banking hours typically 9 AM - 5 PM, with some evening hours
    // Flag transactions outside 6 AM - 10 PM as potentially unusual
    return hour < 6 || hour > 22;
  });
  
  anomalies.push(...timingAnomalies);
  
  // Remove duplicates and return
  const uniqueAnomalies = Array.from(new Set(anomalies.map(tx => `${tx.customerId}-${tx.transactionDate.getTime()}-${tx.transactionAmount}`)))
    .map(id => anomalies.find(tx => `${tx.customerId}-${tx.transactionDate.getTime()}-${tx.transactionAmount}` === id)!);
  
  return uniqueAnomalies;
}

/**
 * Enhanced anomaly detection with detailed analysis
 * Provides comprehensive anomaly information for risk management
 */
export function detectAnomalousTransactionsDetailed(data: CleanedTransaction[]): AnomalyDetectionResult[] {
  const results: AnomalyDetectionResult[] = [];
  
  // Statistical analysis
  const amounts = data.map(tx => tx.transactionAmount);
  const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const variance = amounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / amounts.length;
  const std = Math.sqrt(variance);
  
  data.forEach(tx => {
    const zScore = Math.abs(tx.transactionAmount - mean) / std;
    
    if (zScore > 3) {
      let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
      if (zScore > 5) riskLevel = 'critical';
      else if (zScore > 4) riskLevel = 'high';
      else if (zScore > 3.5) riskLevel = 'medium';
      
      results.push({
        transaction: tx,
        anomalyScore: zScore,
        anomalyType: 'amount',
        description: `Transaction amount ${tx.transactionAmount} is ${zScore.toFixed(2)} standard deviations from mean`,
        riskLevel
      });
    }
  });
  
  return results;
}

/**
 * Calculate customer lifetime value
 * Assessment Requirement: calculateCustomerLTV(customerId: number, data: CleanedTransaction[]): number
 * 
 * Business Context: Customer LTV is essential for:
 * - Customer segmentation and targeting
 * - Marketing budget allocation
 * - Risk assessment and credit decisions
 * - Strategic business planning
 */
export function calculateCustomerLTV(customerId: string, data: CleanedTransaction[]): number {
  const customerTransactions = data.filter(tx => tx.customerId === customerId);
  
  if (customerTransactions.length === 0) {
    return 0;
  }
  
  // Calculate net value (deposits - withdrawals)
  const netValue = customerTransactions.reduce((sum, tx) => {
    switch (tx.transactionType) {
      case TransactionType.DEPOSIT:
        return sum + tx.transactionAmount;
      case TransactionType.WITHDRAWAL:
        return sum - tx.transactionAmount;
      case TransactionType.TRANSFER:
        // For transfers, we need to determine if it's incoming or outgoing
        // This is a simplified approach - in practice, you'd have more context
        return sum + tx.transactionAmount; // Assuming positive amounts are incoming
      default:
        return sum;
    }
  }, 0);
  
  return netValue;
}

/**
 * Enhanced customer lifetime value calculation with comprehensive metrics
 * Provides detailed customer analysis for business intelligence
 */
export function calculateCustomerLTVDetailed(customerId: string, data: CleanedTransaction[]): CustomerLTVData {
  const customerTransactions = data.filter(tx => tx.customerId === customerId);
  
  if (customerTransactions.length === 0) {
    return {
      customerId,
      lifetimeValue: 0,
      transactionCount: 0,
      averageTransactionAmount: 0,
      firstTransactionDate: new Date(),
      lastTransactionDate: new Date(),
      accountAge: 0,
      riskScore: 0,
      customerSegment: 'low'
    };
  }
  
  // Sort transactions by date
  const sortedTransactions = customerTransactions.sort((a, b) => 
    a.transactionDate.getTime() - b.transactionDate.getTime()
  );
  
  const firstTransaction = sortedTransactions[0];
  const lastTransaction = sortedTransactions[sortedTransactions.length - 1];
  
  // Calculate lifetime value
  const lifetimeValue = calculateCustomerLTV(customerId, data);
  
  // Calculate average transaction amount
  const totalAmount = customerTransactions.reduce((sum, tx) => sum + tx.transactionAmount, 0);
  const averageTransactionAmount = totalAmount / customerTransactions.length;
  
  // Calculate account age
  const accountAge = Math.floor(
    (lastTransaction.transactionDate.getTime() - firstTransaction.transactionDate.getTime()) / 
    (1000 * 60 * 60 * 24)
  );
  
  // Calculate risk score based on transaction patterns
  const riskScore = calculateCustomerRiskScore(customerTransactions);
  
  // Determine customer segment
  let customerSegment: 'low' | 'medium' | 'high' | 'premium' = 'low';
  if (lifetimeValue > 100000) customerSegment = 'premium';
  else if (lifetimeValue > 50000) customerSegment = 'high';
  else if (lifetimeValue > 10000) customerSegment = 'medium';
  
  return {
    customerId,
    lifetimeValue,
    transactionCount: customerTransactions.length,
    averageTransactionAmount,
    firstTransactionDate: firstTransaction.transactionDate,
    lastTransactionDate: lastTransaction.transactionDate,
    accountAge,
    riskScore,
    customerSegment
  };
}

/**
 * Calculate customer risk score based on transaction patterns
 * Higher scores indicate higher risk
 */
function calculateCustomerRiskScore(transactions: CleanedTransaction[]): number {
  let riskScore = 0;
  
  // Factor 1: Transaction frequency (too many or too few transactions)
  const transactionCount = transactions.length;
  if (transactionCount > 100) riskScore += 20; // Very high frequency
  else if (transactionCount < 5) riskScore += 15; // Very low frequency
  
  // Factor 2: Transaction amount variance
  const amounts = transactions.map(tx => tx.transactionAmount);
  const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const variance = amounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / amounts.length;
  const coefficientOfVariation = Math.sqrt(variance) / mean;
  
  if (coefficientOfVariation > 2) riskScore += 25; // High variance
  else if (coefficientOfVariation > 1) riskScore += 15; // Medium variance
  
  // Factor 3: Unusual transaction times
  const unusualHourTransactions = transactions.filter(tx => {
    const hour = tx.transactionDate.getHours();
    return hour < 6 || hour > 22;
  }).length;
  
  if (unusualHourTransactions > transactions.length * 0.3) {
    riskScore += 20; // More than 30% of transactions at unusual hours
  }
  
  // Factor 4: Large transactions
  const largeTransactions = transactions.filter(tx => tx.transactionAmount > 10000).length;
  if (largeTransactions > transactions.length * 0.1) {
    riskScore += 15; // More than 10% large transactions
  }
  
  return Math.min(riskScore, 100); // Cap at 100
}

/**
 * Get top customers by lifetime value
 * Useful for customer segmentation and targeting
 */
export function getTopCustomersByLTV(data: CleanedTransaction[], limit: number = 10): CustomerLTVData[] {
  const customerIds = new Set(data.map(tx => tx.customerId));
  const customerLTVs = Array.from(customerIds).map(customerId => 
    calculateCustomerLTVDetailed(customerId, data)
  );
  
  return customerLTVs
    .sort((a, b) => b.lifetimeValue - a.lifetimeValue)
    .slice(0, limit);
}

/**
 * Calculate branch performance metrics
 * Provides comprehensive branch analysis for management reporting
 */
export function calculateBranchPerformanceMetrics(data: CleanedTransaction[]): Array<{
  branchId: string;
  totalVolume: number;
  transactionCount: number;
  uniqueCustomers: number;
  averageTransactionAmount: number;
  performanceScore: number;
  rank: number;
}> {
  const branchData = new Map<string, {
    transactions: CleanedTransaction[];
    customers: Set<string>;
  }>();
  
  // Aggregate data by branch
  data.forEach(tx => {
    const branchId = tx.branchCode || 'Unknown';
    
    if (!branchData.has(branchId)) {
      branchData.set(branchId, {
        transactions: [],
        customers: new Set<string>()
      });
    }
    
    const branch = branchData.get(branchId)!;
    branch.transactions.push(tx);
    branch.customers.add(tx.customerId);
  });
  
  // Calculate metrics
  const results = Array.from(branchData.entries()).map(([branchId, branch]) => {
    const totalVolume = branch.transactions.reduce((sum, tx) => sum + tx.transactionAmount, 0);
    const transactionCount = branch.transactions.length;
    const uniqueCustomers = branch.customers.size;
    const averageTransactionAmount = transactionCount > 0 ? totalVolume / transactionCount : 0;
    
    // Performance score based on volume, customer count, and efficiency
    const performanceScore = (totalVolume / 1000000) + (uniqueCustomers / 100) + (averageTransactionAmount / 1000);
    
    return {
      branchId,
      totalVolume,
      transactionCount,
      uniqueCustomers,
      averageTransactionAmount,
      performanceScore,
      rank: 0 // Will be set after sorting
    };
  });
  
  // Sort by performance score and assign ranks
  results.sort((a, b) => b.performanceScore - a.performanceScore);
  results.forEach((result, index) => {
    result.rank = index + 1;
  });
  
  return results;
}

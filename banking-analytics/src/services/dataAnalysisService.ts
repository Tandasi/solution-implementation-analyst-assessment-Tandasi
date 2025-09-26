/**
 * Comprehensive Data Analysis Service
 * Provides robust analysis of banking CSV data with detailed insights and reports
 */

import { RawBankingData } from '../types/banking';

export interface DataAnalysisReport {
  fileInfo: FileInfo;
  dataQuality: DataQualityMetrics;
  businessInsights: BusinessInsights;
  riskAnalysis: RiskAnalysis;
  recommendations: Recommendations;
  summary: AnalysisSummary;
}

export interface FileInfo {
  fileName: string;
  totalRows: number;
  totalColumns: number;
  fileSize: string;
  uploadDate: Date;
  columns: ColumnInfo[];
}

export interface ColumnInfo {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  nullCount: number;
  uniqueCount: number;
  sampleValues: string[];
}

export interface DataQualityMetrics {
  completeness: number; // percentage of non-null values
  consistency: number; // percentage of consistent data formats
  accuracy: number; // percentage of valid business logic
  duplicates: number; // count of duplicate records
  outliers: number; // count of statistical outliers
  issues: DataIssue[];
}

export interface DataIssue {
  type: 'missing' | 'invalid' | 'inconsistent' | 'outlier' | 'duplicate';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedRows: number[];
  recommendation: string;
}

export interface BusinessInsights {
  customerDemographics: CustomerDemographics;
  transactionPatterns: TransactionPatterns;
  branchPerformance: BranchPerformance;
  financialMetrics: FinancialMetrics;
  seasonalTrends: SeasonalTrends;
}

export interface CustomerDemographics {
  totalCustomers: number;
  ageDistribution: { range: string; count: number; percentage: number }[];
  genderDistribution: { gender: string; count: number; percentage: number }[];
  accountTypeDistribution: { type: string; count: number; percentage: number }[];
  topCities: { city: string; customerCount: number }[];
}

export interface TransactionPatterns {
  totalTransactions: number;
  averageTransactionAmount: number;
  transactionTypeDistribution: { type: string; count: number; amount: number }[];
  peakHours: { hour: number; transactionCount: number }[];
  peakDays: { day: string; transactionCount: number }[];
  amountDistribution: { range: string; count: number }[];
}

export interface BranchPerformance {
  totalBranches: number;
  topPerformingBranches: { branchId: string; transactionVolume: number; customerCount: number }[];
  underperformingBranches: { branchId: string; transactionVolume: number; customerCount: number }[];
  averageTransactionsPerBranch: number;
}

export interface FinancialMetrics {
  totalVolume: number;
  averageAccountBalance: number;
  highestTransaction: number;
  lowestTransaction: number;
  revenueByTransactionType: { type: string; revenue: number }[];
  customerLifetimeValue: { customerId: string; ltv: number }[];
}

export interface SeasonalTrends {
  monthlyTrends: { month: string; transactionCount: number; volume: number }[];
  quarterlyTrends: { quarter: string; transactionCount: number; volume: number }[];
  growthRate: number;
  peakMonth: string;
  lowMonth: string;
}

export interface RiskAnalysis {
  suspiciousTransactions: SuspiciousTransaction[];
  highRiskCustomers: HighRiskCustomer[];
  anomalyScore: number;
  riskFactors: RiskFactor[];
}

export interface SuspiciousTransaction {
  transactionId: string;
  customerId: string;
  amount: number;
  reason: string;
  riskScore: number;
  timestamp: Date;
}

export interface HighRiskCustomer {
  customerId: string;
  riskScore: number;
  riskFactors: string[];
  transactionCount: number;
  totalVolume: number;
}

export interface RiskFactor {
  factor: string;
  impact: 'low' | 'medium' | 'high';
  description: string;
  mitigation: string;
}

export interface Recommendations {
  dataQuality: string[];
  businessOperations: string[];
  riskManagement: string[];
  customerRetention: string[];
  growthOpportunities: string[];
}

export interface AnalysisSummary {
  overallScore: number;
  keyFindings: string[];
  criticalIssues: string[];
  opportunities: string[];
  nextSteps: string[];
}

/**
 * Main Data Analysis Service Class
 */
export class DataAnalysisService {
  
  /**
   * Perform comprehensive analysis of uploaded CSV data
   */
  public async analyzeData(rawData: RawBankingData[], fileName: string): Promise<DataAnalysisReport> {
    console.log('Starting comprehensive data analysis...');
    
    const startTime = Date.now();
    
    // Basic file information
    const fileInfo = this.analyzeFileInfo(rawData, fileName);
    
    // Data quality assessment
    const dataQuality = this.assessDataQuality(rawData);
    
    // Business insights
    const businessInsights = this.generateBusinessInsights(rawData);
    
    // Risk analysis
    const riskAnalysis = this.performRiskAnalysis(rawData);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(dataQuality, businessInsights, riskAnalysis);
    
    // Create summary
    const summary = this.createAnalysisSummary(dataQuality, businessInsights, riskAnalysis, recommendations);
    
    const analysisTime = Date.now() - startTime;
    console.log(`Data analysis completed in ${analysisTime}ms`);
    
    return {
      fileInfo,
      dataQuality,
      businessInsights,
      riskAnalysis,
      recommendations,
      summary
    };
  }
  
  /**
   * Analyze basic file information
   */
  private analyzeFileInfo(rawData: RawBankingData[], fileName: string): FileInfo {
    const columns = Object.keys(rawData[0] || {}).map(columnName => {
      const values = rawData.map(row => row[columnName as keyof RawBankingData]);
      const nonNullValues = values.filter(v => v && v.toString().trim() !== '');
      
      return {
        name: columnName,
        type: this.detectColumnType(values),
        nullCount: values.length - nonNullValues.length,
        uniqueCount: new Set(nonNullValues).size,
        sampleValues: nonNullValues.slice(0, 5)
      };
    });
    
    return {
      fileName,
      totalRows: rawData.length,
      totalColumns: columns.length,
      fileSize: this.calculateFileSize(rawData),
      uploadDate: new Date(),
      columns
    };
  }
  
  /**
   * Assess data quality metrics
   */
  private assessDataQuality(rawData: RawBankingData[]): DataQualityMetrics {
    const issues: DataIssue[] = [];
    let totalFields = 0;
    let validFields = 0;
    let duplicateCount = 0;
    let outlierCount = 0;
    
    // Check for duplicates
    const seen = new Set<string>();
    rawData.forEach((row, index) => {
      const key = JSON.stringify(row);
      if (seen.has(key)) {
        duplicateCount++;
        issues.push({
          type: 'duplicate',
          severity: 'medium',
          description: `Duplicate record found`,
          affectedRows: [index],
          recommendation: 'Review and remove duplicate entries'
        });
      } else {
        seen.add(key);
      }
    });
    
    // Check for missing critical fields
    rawData.forEach((row, index) => {
      const criticalFields = ['Customer ID', 'Transaction Date', 'Transaction Amount'];
      criticalFields.forEach(field => {
        totalFields++;
        if (!row[field as keyof RawBankingData] || row[field as keyof RawBankingData].toString().trim() === '') {
          issues.push({
            type: 'missing',
            severity: 'high',
            description: `Missing critical field: ${field}`,
            affectedRows: [index],
            recommendation: 'Ensure all critical fields are populated'
          });
        } else {
          validFields++;
        }
      });
    });
    
    // Check for outliers in transaction amounts
    const amounts = rawData
      .map(row => parseFloat(row['Transaction Amount'] || '0'))
      .filter(amount => !isNaN(amount));
    
    if (amounts.length > 0) {
      const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const std = Math.sqrt(amounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / amounts.length);
      
      amounts.forEach((amount, index) => {
        if (Math.abs(amount - mean) > 3 * std) {
          outlierCount++;
          issues.push({
            type: 'outlier',
            severity: 'medium',
            description: `Unusual transaction amount: ${amount}`,
            affectedRows: [index],
            recommendation: 'Review transaction for accuracy'
          });
        }
      });
    }
    
    const completeness = totalFields > 0 ? (validFields / totalFields) * 100 : 0;
    const consistency = this.calculateConsistency(rawData);
    const accuracy = this.calculateAccuracy(rawData);
    
    return {
      completeness,
      consistency,
      accuracy,
      duplicates: duplicateCount,
      outliers: outlierCount,
      issues
    };
  }
  
  /**
   * Generate comprehensive business insights
   */
  private generateBusinessInsights(rawData: RawBankingData[]): BusinessInsights {
    return {
      customerDemographics: this.analyzeCustomerDemographics(rawData),
      transactionPatterns: this.analyzeTransactionPatterns(rawData),
      branchPerformance: this.analyzeBranchPerformance(rawData),
      financialMetrics: this.calculateFinancialMetrics(rawData),
      seasonalTrends: this.analyzeSeasonalTrends(rawData)
    };
  }
  
  /**
   * Analyze customer demographics
   */
  private analyzeCustomerDemographics(rawData: RawBankingData[]): CustomerDemographics {
    const customers = new Map<string, RawBankingData>();
    
    // Get unique customers
    rawData.forEach(row => {
      const customerId = row['Customer ID'];
      if (customerId && !customers.has(customerId)) {
        customers.set(customerId, row);
      }
    });
    
    const customerList = Array.from(customers.values());
    const totalCustomers = customerList.length;
    
    // Age distribution
    const ageGroups = { '18-25': 0, '26-35': 0, '36-45': 0, '46-55': 0, '56-65': 0, '65+': 0 };
    customerList.forEach(customer => {
      const age = parseInt(customer['Age'] || '0');
      if (age >= 18 && age <= 25) ageGroups['18-25']++;
      else if (age >= 26 && age <= 35) ageGroups['26-35']++;
      else if (age >= 36 && age <= 45) ageGroups['36-45']++;
      else if (age >= 46 && age <= 55) ageGroups['46-55']++;
      else if (age >= 56 && age <= 65) ageGroups['56-65']++;
      else if (age > 65) ageGroups['65+']++;
    });
    
    const ageDistribution = Object.entries(ageGroups).map(([range, count]) => ({
      range,
      count,
      percentage: totalCustomers > 0 ? (count / totalCustomers) * 100 : 0
    }));
    
    // Gender distribution
    const genderCounts = new Map<string, number>();
    customerList.forEach(customer => {
      const gender = customer['Gender'] || 'Unknown';
      genderCounts.set(gender, (genderCounts.get(gender) || 0) + 1);
    });
    
    const genderDistribution = Array.from(genderCounts.entries()).map(([gender, count]) => ({
      gender,
      count,
      percentage: totalCustomers > 0 ? (count / totalCustomers) * 100 : 0
    }));
    
    // Account type distribution
    const accountTypeCounts = new Map<string, number>();
    customerList.forEach(customer => {
      const accountType = customer['Account Type'] || 'Unknown';
      accountTypeCounts.set(accountType, (accountTypeCounts.get(accountType) || 0) + 1);
    });
    
    const accountTypeDistribution = Array.from(accountTypeCounts.entries()).map(([type, count]) => ({
      type,
      count,
      percentage: totalCustomers > 0 ? (count / totalCustomers) * 100 : 0
    }));
    
    // Top cities
    const cityCounts = new Map<string, number>();
    customerList.forEach(customer => {
      const city = customer['City'] || 'Unknown';
      cityCounts.set(city, (cityCounts.get(city) || 0) + 1);
    });
    
    const topCities = Array.from(cityCounts.entries())
      .map(([city, customerCount]) => ({ city, customerCount }))
      .sort((a, b) => b.customerCount - a.customerCount)
      .slice(0, 10);
    
    return {
      totalCustomers,
      ageDistribution,
      genderDistribution,
      accountTypeDistribution,
      topCities
    };
  }
  
  /**
   * Analyze transaction patterns
   */
  private analyzeTransactionPatterns(rawData: RawBankingData[]): TransactionPatterns {
    const totalTransactions = rawData.length;
    const amounts = rawData.map(row => parseFloat(row['Transaction Amount'] || '0')).filter(a => !isNaN(a));
    const averageTransactionAmount = amounts.length > 0 ? amounts.reduce((a, b) => a + b, 0) / amounts.length : 0;
    
    // Transaction type distribution
    const typeCounts = new Map<string, { count: number; amount: number }>();
    rawData.forEach(row => {
      const type = row['Transaction Type'] || 'Unknown';
      const amount = parseFloat(row['Transaction Amount'] || '0');
      const existing = typeCounts.get(type) || { count: 0, amount: 0 };
      typeCounts.set(type, { count: existing.count + 1, amount: existing.amount + amount });
    });
    
    const transactionTypeDistribution = Array.from(typeCounts.entries()).map(([type, data]) => ({
      type,
      count: data.count,
      amount: data.amount
    }));
    
    // Peak hours analysis
    const hourCounts = new Map<number, number>();
    rawData.forEach(row => {
      const date = new Date(row['Transaction Date'] || '');
      if (!isNaN(date.getTime())) {
        const hour = date.getHours();
        hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
      }
    });
    
    const peakHours = Array.from(hourCounts.entries())
      .map(([hour, transactionCount]) => ({ hour, transactionCount }))
      .sort((a, b) => b.transactionCount - a.transactionCount)
      .slice(0, 5);
    
    // Peak days analysis
    const dayCounts = new Map<string, number>();
    rawData.forEach(row => {
      const date = new Date(row['Transaction Date'] || '');
      if (!isNaN(date.getTime())) {
        const day = date.toLocaleDateString('en-US', { weekday: 'long' });
        dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
      }
    });
    
    const peakDays = Array.from(dayCounts.entries())
      .map(([day, transactionCount]) => ({ day, transactionCount }))
      .sort((a, b) => b.transactionCount - a.transactionCount);
    
    // Amount distribution
    const amountRanges = [
      { range: '0-100', min: 0, max: 100 },
      { range: '100-500', min: 100, max: 500 },
      { range: '500-1000', min: 500, max: 1000 },
      { range: '1000-5000', min: 1000, max: 5000 },
      { range: '5000+', min: 5000, max: Infinity }
    ];
    
    const amountDistribution = amountRanges.map(range => ({
      range: range.range,
      count: amounts.filter(amount => amount >= range.min && amount < range.max).length
    }));
    
    return {
      totalTransactions,
      averageTransactionAmount,
      transactionTypeDistribution,
      peakHours,
      peakDays,
      amountDistribution
    };
  }
  
  /**
   * Analyze branch performance
   */
  private analyzeBranchPerformance(rawData: RawBankingData[]): BranchPerformance {
    const branchData = new Map<string, { volume: number; customers: Set<string> }>();
    
    rawData.forEach(row => {
      const branchId = row['Branch ID'] || 'Unknown';
      const amount = parseFloat(row['Transaction Amount'] || '0');
      const customerId = row['Customer ID'] || '';
      
      const existing = branchData.get(branchId) || { volume: 0, customers: new Set() };
      existing.volume += amount;
      existing.customers.add(customerId);
      branchData.set(branchId, existing);
    });
    
    const branchStats = Array.from(branchData.entries()).map(([branchId, data]) => ({
      branchId,
      transactionVolume: data.volume,
      customerCount: data.customers.size
    }));
    
    const sortedBranches = branchStats.sort((a, b) => b.transactionVolume - a.transactionVolume);
    const totalBranches = branchStats.length;
    const averageTransactionsPerBranch = totalBranches > 0 ? 
      branchStats.reduce((sum, branch) => sum + branch.transactionVolume, 0) / totalBranches : 0;
    
    return {
      totalBranches,
      topPerformingBranches: sortedBranches.slice(0, 5),
      underperformingBranches: sortedBranches.slice(-5),
      averageTransactionsPerBranch
    };
  }
  
  /**
   * Calculate financial metrics
   */
  private calculateFinancialMetrics(rawData: RawBankingData[]): FinancialMetrics {
    const amounts = rawData.map(row => parseFloat(row['Transaction Amount'] || '0')).filter(a => !isNaN(a));
    const balances = rawData.map(row => parseFloat(row['Account Balance'] || '0')).filter(b => !isNaN(b));
    
    const totalVolume = amounts.reduce((a, b) => a + b, 0);
    const averageAccountBalance = balances.length > 0 ? balances.reduce((a, b) => a + b, 0) / balances.length : 0;
    const highestTransaction = Math.max(...amounts);
    const lowestTransaction = Math.min(...amounts);
    
    // Revenue by transaction type
    const revenueByType = new Map<string, number>();
    rawData.forEach(row => {
      const type = row['Transaction Type'] || 'Unknown';
      const amount = parseFloat(row['Transaction Amount'] || '0');
      revenueByType.set(type, (revenueByType.get(type) || 0) + amount);
    });
    
    const revenueByTransactionType = Array.from(revenueByType.entries()).map(([type, revenue]) => ({
      type,
      revenue
    }));
    
    // Customer lifetime value
    const customerLTV = new Map<string, number>();
    rawData.forEach(row => {
      const customerId = row['Customer ID'] || '';
      const amount = parseFloat(row['Transaction Amount'] || '0');
      const type = row['Transaction Type'] || '';
      
      const existing = customerLTV.get(customerId) || 0;
      const adjustment = type.toLowerCase().includes('deposit') ? amount : -amount;
      customerLTV.set(customerId, existing + adjustment);
    });
    
    const customerLifetimeValue = Array.from(customerLTV.entries())
      .map(([customerId, ltv]) => ({ customerId, ltv }))
      .sort((a, b) => b.ltv - a.ltv)
      .slice(0, 10);
    
    return {
      totalVolume,
      averageAccountBalance,
      highestTransaction,
      lowestTransaction,
      revenueByTransactionType,
      customerLifetimeValue
    };
  }
  
  /**
   * Analyze seasonal trends
   */
  private analyzeSeasonalTrends(rawData: RawBankingData[]): SeasonalTrends {
    const monthlyData = new Map<string, { count: number; volume: number }>();
    const quarterlyData = new Map<string, { count: number; volume: number }>();
    
    rawData.forEach(row => {
      const date = new Date(row['Transaction Date'] || '');
      if (!isNaN(date.getTime())) {
        const month = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        const quarter = `Q${Math.ceil((date.getMonth() + 1) / 3)} ${date.getFullYear()}`;
        const amount = parseFloat(row['Transaction Amount'] || '0');
        
        // Monthly data
        const monthly = monthlyData.get(month) || { count: 0, volume: 0 };
        monthly.count++;
        monthly.volume += amount;
        monthlyData.set(month, monthly);
        
        // Quarterly data
        const quarterly = quarterlyData.get(quarter) || { count: 0, volume: 0 };
        quarterly.count++;
        quarterly.volume += amount;
        quarterlyData.set(quarter, quarterly);
      }
    });
    
    const monthlyTrends = Array.from(monthlyData.entries()).map(([month, data]) => ({
      month,
      transactionCount: data.count,
      volume: data.volume
    }));
    
    const quarterlyTrends = Array.from(quarterlyData.entries()).map(([quarter, data]) => ({
      quarter,
      transactionCount: data.count,
      volume: data.volume
    }));
    
    // Calculate growth rate
    const sortedMonths = monthlyTrends.sort((a, b) => a.month.localeCompare(b.month));
    const growthRate = sortedMonths.length > 1 ? 
      ((sortedMonths[sortedMonths.length - 1].volume - sortedMonths[0].volume) / sortedMonths[0].volume) * 100 : 0;
    
    const peakMonth = monthlyTrends.reduce((max, current) => 
      current.volume > max.volume ? current : max, monthlyTrends[0] || { month: 'N/A', volume: 0 }).month;
    
    const lowMonth = monthlyTrends.reduce((min, current) => 
      current.volume < min.volume ? current : min, monthlyTrends[0] || { month: 'N/A', volume: Infinity }).month;
    
    return {
      monthlyTrends,
      quarterlyTrends,
      growthRate,
      peakMonth,
      lowMonth
    };
  }
  
  /**
   * Perform risk analysis
   */
  private performRiskAnalysis(rawData: RawBankingData[]): RiskAnalysis {
    const suspiciousTransactions: SuspiciousTransaction[] = [];
    const highRiskCustomers: HighRiskCustomer[] = [];
    const riskFactors: RiskFactor[] = [];
    
    // Identify suspicious transactions
    const amounts = rawData.map(row => parseFloat(row['Transaction Amount'] || '0')).filter(a => !isNaN(a));
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const std = Math.sqrt(amounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / amounts.length);
    
    rawData.forEach((row, index) => {
      const amount = parseFloat(row['Transaction Amount'] || '0');
      const zScore = Math.abs(amount - mean) / std;
      
      if (zScore > 3) {
        suspiciousTransactions.push({
          transactionId: row['TransactionID'] || index.toString(),
          customerId: row['Customer ID'] || '',
          amount,
          reason: 'Statistical outlier',
          riskScore: Math.min(zScore * 10, 100),
          timestamp: new Date(row['Transaction Date'] || '')
        });
      }
    });
    
    // Identify high-risk customers
    const customerTransactions = new Map<string, { count: number; volume: number; amounts: number[] }>();
    rawData.forEach(row => {
      const customerId = row['Customer ID'] || '';
      const amount = parseFloat(row['Transaction Amount'] || '0');
      
      const existing = customerTransactions.get(customerId) || { count: 0, volume: 0, amounts: [] };
      existing.count++;
      existing.volume += amount;
      existing.amounts.push(amount);
      customerTransactions.set(customerId, existing);
    });
    
    customerTransactions.forEach((data, customerId) => {
      const avgAmount = data.volume / data.count;
      const maxAmount = Math.max(...data.amounts);
      const riskScore = (maxAmount / avgAmount) * Math.log(data.count);
      
      if (riskScore > 50) {
        highRiskCustomers.push({
          customerId,
          riskScore,
          riskFactors: ['High transaction variance', 'Large transaction amounts'],
          transactionCount: data.count,
          totalVolume: data.volume
        });
      }
    });
    
    // Calculate overall anomaly score
    const anomalyScore = suspiciousTransactions.length > 0 ? 
      suspiciousTransactions.reduce((sum, t) => sum + t.riskScore, 0) / suspiciousTransactions.length : 0;
    
    // Risk factors
    riskFactors.push(
      {
        factor: 'Data Quality Issues',
        impact: 'medium',
        description: 'Some data quality issues detected',
        mitigation: 'Implement data validation processes'
      },
      {
        factor: 'Suspicious Transactions',
        impact: suspiciousTransactions.length > 10 ? 'high' : 'medium',
        description: `${suspiciousTransactions.length} suspicious transactions detected`,
        mitigation: 'Review flagged transactions manually'
      }
    );
    
    return {
      suspiciousTransactions,
      highRiskCustomers,
      anomalyScore,
      riskFactors
    };
  }
  
  /**
   * Generate recommendations based on analysis
   */
  private generateRecommendations(
    dataQuality: DataQualityMetrics,
    businessInsights: BusinessInsights,
    riskAnalysis: RiskAnalysis
  ): Recommendations {
    const recommendations: Recommendations = {
      dataQuality: [],
      businessOperations: [],
      riskManagement: [],
      customerRetention: [],
      growthOpportunities: []
    };
    
    // Data quality recommendations
    if (dataQuality.completeness < 95) {
      recommendations.dataQuality.push('Improve data collection processes to reduce missing values');
    }
    if (dataQuality.duplicates > 0) {
      recommendations.dataQuality.push('Implement duplicate detection and removal processes');
    }
    
    // Business operations recommendations
    const topBranch = businessInsights.branchPerformance.topPerformingBranches[0];
    if (topBranch) {
      recommendations.businessOperations.push(
        `Replicate successful practices from top-performing branch: ${topBranch.branchId}`
      );
    }
    
    const peakHour = businessInsights.transactionPatterns.peakHours[0];
    if (peakHour) {
      recommendations.businessOperations.push(
        `Optimize staffing during peak hours (${peakHour.hour}:00)`
      );
    }
    
    // Risk management recommendations
    if (riskAnalysis.suspiciousTransactions.length > 0) {
      recommendations.riskManagement.push(
        'Implement real-time transaction monitoring system'
      );
    }
    
    // Customer retention recommendations
    const highValueCustomers = businessInsights.financialMetrics.customerLifetimeValue.slice(0, 5);
    if (highValueCustomers.length > 0) {
      recommendations.customerRetention.push(
        'Develop VIP program for high-value customers'
      );
    }
    
    // Growth opportunities
    if (businessInsights.seasonalTrends.growthRate > 0) {
      recommendations.growthOpportunities.push(
        'Capitalize on positive growth trends with targeted marketing'
      );
    }
    
    return recommendations;
  }
  
  /**
   * Create analysis summary
   */
  private createAnalysisSummary(
    dataQuality: DataQualityMetrics,
    businessInsights: BusinessInsights,
    riskAnalysis: RiskAnalysis,
    recommendations: Recommendations
  ): AnalysisSummary {
    const overallScore = (dataQuality.completeness + dataQuality.consistency + dataQuality.accuracy) / 3;
    
    const keyFindings: string[] = [
      `Dataset contains ${businessInsights.customerDemographics.totalCustomers} unique customers`,
      `Total transaction volume: KSH ${businessInsights.financialMetrics.totalVolume.toLocaleString()}`,
      `Data quality score: ${overallScore.toFixed(1)}%`,
      `Identified ${riskAnalysis.suspiciousTransactions.length} suspicious transactions`
    ];
    
    const criticalIssues: string[] = [];
    dataQuality.issues.forEach(issue => {
      if (issue.severity === 'critical' || issue.severity === 'high') {
        criticalIssues.push(issue.description);
      }
    });
    
    const opportunities: string[] = [
      'Optimize branch operations based on performance data',
      'Implement customer segmentation strategies',
      'Enhance risk monitoring capabilities'
    ];
    
    const nextSteps: string[] = [
      'Review and address critical data quality issues',
      'Implement recommended business process improvements',
      'Set up automated monitoring for suspicious activities',
      'Develop customer retention programs'
    ];
    
    return {
      overallScore,
      keyFindings,
      criticalIssues,
      opportunities,
      nextSteps
    };
  }
  
  // Helper methods
  private detectColumnType(values: any[]): 'string' | 'number' | 'date' | 'boolean' {
    const nonNullValues = values.filter(v => v && v.toString().trim() !== '');
    if (nonNullValues.length === 0) return 'string';
    
    // Check if all values are numbers
    if (nonNullValues.every(v => !isNaN(parseFloat(v.toString())))) return 'number';
    
    // Check if all values are dates
    if (nonNullValues.every(v => !isNaN(new Date(v.toString()).getTime()))) return 'date';
    
    // Check if all values are booleans
    if (nonNullValues.every(v => v.toString().toLowerCase() === 'true' || v.toString().toLowerCase() === 'false')) return 'boolean';
    
    return 'string';
  }
  
  private calculateFileSize(rawData: RawBankingData[]): string {
    const jsonString = JSON.stringify(rawData);
    const bytes = new Blob([jsonString]).size;
    const kb = bytes / 1024;
    const mb = kb / 1024;
    
    if (mb > 1) return `${mb.toFixed(2)} MB`;
    return `${kb.toFixed(2)} KB`;
  }
  
  private calculateConsistency(rawData: RawBankingData[]): number {
    // Simple consistency check - can be enhanced
    let consistentFields = 0;
    let totalFields = 0;
    
    Object.keys(rawData[0] || {}).forEach(column => {
      const values = rawData.map(row => row[column as keyof RawBankingData]);
      const nonNullValues = values.filter(v => v && v.toString().trim() !== '');
      
      if (nonNullValues.length > 0) {
        totalFields++;
        // Check if all non-null values have consistent format
        const firstValue = nonNullValues[0].toString();
        const isConsistent = nonNullValues.every(v => 
          v.toString().length === firstValue.length || 
          this.detectColumnType([v]) === this.detectColumnType([firstValue])
        );
        
        if (isConsistent) consistentFields++;
      }
    });
    
    return totalFields > 0 ? (consistentFields / totalFields) * 100 : 100;
  }
  
  private calculateAccuracy(rawData: RawBankingData[]): number {
    // Simple accuracy check based on business rules
    let accurateRecords = 0;
    
    rawData.forEach(row => {
      const customerId = row['Customer ID'];
      const transactionAmount = parseFloat(row['Transaction Amount'] || '0');
      const transactionDate = new Date(row['Transaction Date'] || '');
      
      let isAccurate = true;
      
      // Check basic business rules
      if (!customerId || customerId.toString().trim() === '') isAccurate = false;
      if (isNaN(transactionAmount)) isAccurate = false;
      if (isNaN(transactionDate.getTime())) isAccurate = false;
      
      if (isAccurate) accurateRecords++;
    });
    
    return rawData.length > 0 ? (accurateRecords / rawData.length) * 100 : 100;
  }
}

// Export singleton instance
export const dataAnalysisService = new DataAnalysisService();

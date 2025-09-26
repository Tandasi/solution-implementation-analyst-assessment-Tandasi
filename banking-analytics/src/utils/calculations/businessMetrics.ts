// Business Metrics and Aggregation Functions
import { CleanedTransaction } from '../../types/banking';

// Calculate monthly transaction volume by branch
export function getMonthlyVolumeByBranch(data: CleanedTransaction[]): Map<string, Map<string, number>> {
  const result = new Map<string, Map<string, number>>();
  data.forEach(tx => {
    const branch = tx.branchCode;
    const month = tx.transactionDate.toISOString().slice(0, 7); // YYYY-MM
    if (!result.has(branch)) result.set(branch, new Map());
    const branchMap = result.get(branch)!;
    branchMap.set(month, (branchMap.get(month) || 0) + 1);
  });
  return result;
}

// Find customers with unusual spending patterns (simple: z-score on transaction amount)
export function detectAnomalousTransactions(data: CleanedTransaction[]): CleanedTransaction[] {
  const amounts = data.map(tx => tx.transactionAmount);
  const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const std = Math.sqrt(amounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / amounts.length);
  return data.filter(tx => Math.abs(tx.transactionAmount - mean) > 3 * std);
}

// Calculate customer lifetime value (sum of all deposits minus withdrawals)
export function calculateCustomerLTV(customerId: string, data: CleanedTransaction[]): number {
  return data.filter(tx => tx.customerId === customerId)
    .reduce((sum, tx) => {
      if (tx.transactionType === 'Deposit') return sum + tx.transactionAmount;
      if (tx.transactionType === 'Withdrawal') return sum - tx.transactionAmount;
      return sum;
    }, 0);
}

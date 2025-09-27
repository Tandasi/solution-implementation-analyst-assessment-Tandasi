// Edge Case Management Utilities for Banking Data
// Implements solutions for: inconsistent ages, balance reconciliation failures, duplicate transactions
import { CleanedTransaction } from '../../types/banking';

/**
 * Detects customers with inconsistent ages across transactions.
 * Returns a map of customerId to array of unique ages found.
 */
export function findCustomersWithInconsistentAges(data: CleanedTransaction[]): Map<string, number[]> {
  const ageMap = new Map<string, Set<number>>();
  data.forEach(tx => {
    if (!ageMap.has(tx.customerId)) ageMap.set(tx.customerId, new Set());
    if (tx.customerAge) ageMap.get(tx.customerId)!.add(tx.customerAge);
  });
  const result = new Map<string, number[]>();
  ageMap.forEach((ages, customerId) => {
    if (ages.size > 1) result.set(customerId, Array.from(ages));
  });
  return result;
}

/**
 * Detects transactions where the account balance does not reconcile mathematically.
 * Returns an array of problematic transactions (by index or id).
 */
export function findBalanceReconciliationFailures(data: CleanedTransaction[]): number[] {
  const failures: number[] = [];
  for (let i = 1; i < data.length; i++) {
    const prev = data[i - 1];
    const curr = data[i];
    if (curr.customerId === prev.customerId) {
      let expected = prev.accountBalance;
      if (curr.transactionType === 'Deposit') expected += curr.transactionAmount;
      else if (curr.transactionType === 'Withdrawal') expected -= curr.transactionAmount;
      // Add more logic for 'Transfer' if needed
      if (Math.abs(curr.accountBalance - expected) > 0.01) failures.push(i);
    }
  }
  return failures;
}

/**
 * Removes duplicate transactions based on a composite key (customerId, date, amount, type).
 * Returns a deduplicated array.
 */
export function removeDuplicateTransactions(data: CleanedTransaction[]): CleanedTransaction[] {
  const seen = new Set<string>();
  return data.filter(tx => {
    const key = `${tx.customerId}|${tx.transactionDate.toISOString()}|${tx.transactionAmount}|${tx.transactionType}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

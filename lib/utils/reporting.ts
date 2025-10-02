import { Category } from '@/types/category';
import { Transaction } from '@/types/transactions';

export interface CategorySummary {
  categoryId: string;
  categoryName: string;
  total: number;
  color: string;
  icon: string;
}

export interface MonthlySummary {
  month: string;
  total: number;
  monthNumber: number;
  year: number;
}

export interface ReportFilters {
  month?: string;
  categoryId?: string;
  transactionType?: 'income' | 'expense' | 'all';
  startDate?: string;
  endDate?: string;
}

/**
 * Groups transactions by category and returns summary data
 */
export function groupTransactionsByCategory(
  transactions: Transaction[],
  categories: Category[]
): CategorySummary[] {
  const categoryMap = new Map<string, { total: number; category: Category }>();

  // Initialize all categories with 0 totals
  categories.forEach(category => {
    categoryMap.set(category.id, {
      total: 0,
      category,
    });
  });

  // Sum up transactions by category
  transactions.forEach(transaction => {
    if (transaction.type === 'expense' && transaction.categoryId) {
      const existing = categoryMap.get(transaction.categoryId);
      if (existing) {
        existing.total += Math.abs(transaction.amount);
      }
    }
  });

  // Convert to array and filter out categories with 0 total
  return Array.from(categoryMap.entries())
    .map(([categoryId, { total, category }]) => ({
      categoryId,
      categoryName: category.name,
      total,
      color: category.color,
      icon: category.icon,
    }))
    .filter(item => item.total > 0)
    .sort((a, b) => b.total - a.total);
}

/**
 * Groups transactions by month and returns monthly spending data
 */
export function groupTransactionsByMonth(transactions: Transaction[]): MonthlySummary[] {
  const monthMap = new Map<string, number>();

  transactions.forEach(transaction => {
    if (transaction.type === 'expense') {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      
      const existing = monthMap.get(monthKey) || 0;
      monthMap.set(monthKey, existing + Math.abs(transaction.amount));
    }
  });

  // Convert to array and sort by date
  return Array.from(monthMap.entries())
    .map(([monthKey, total]) => {
      const [year, month] = monthKey.split('-').map(Number);
      const date = new Date(year, month - 1);
      return {
        month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        total,
        monthNumber: month,
        year,
      };
    })
    .sort((a, b) => a.year - b.year || a.monthNumber - b.monthNumber);
}

/**
 * Filters transactions based on provided filters
 */
export function filterTransactions(
  transactions: Transaction[],
  filters: ReportFilters
): Transaction[] {
  let filtered = [...transactions];

  // Filter by date range
  if (filters.startDate && filters.endDate) {
    const startDate = new Date(filters.startDate);
    const endDate = new Date(filters.endDate);
    filtered = filtered.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  }

  // Filter by specific month
  if (filters.month) {
    const [year, month] = filters.month.split('-').map(Number);
    filtered = filtered.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.getFullYear() === year && transactionDate.getMonth() === month - 1;
    });
  }

  // Filter by category
  if (filters.categoryId) {
    filtered = filtered.filter(transaction => transaction.categoryId === filters.categoryId);
  }

  // Filter by transaction type
  if (filters.transactionType && filters.transactionType !== 'all') {
    filtered = filtered.filter(transaction => transaction.type === filters.transactionType);
  }

  return filtered;
}

/**
 * Gets the current month in YYYY-MM format
 */
export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Gets the last 12 months for filtering options
 */
export function getLast12Months(): string[] {
  const months: string[] = [];
  const now = new Date();
  
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    months.push(`${year}-${month}`);
  }
  
  return months;
}

/**
 * Formats a month string (YYYY-MM) to a readable format
 */
export function formatMonthString(monthString: string): string {
  const [year, month] = monthString.split('-').map(Number);
  const date = new Date(year, month - 1);
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
}

/**
 * Calculates total spending from transactions
 */
export function calculateTotalSpending(transactions: Transaction[]): number {
  return transactions
    .filter(transaction => transaction.type === 'expense')
    .reduce((total, transaction) => total + Math.abs(transaction.amount), 0);
}

/**
 * Calculates total income from transactions
 */
export function calculateTotalIncome(transactions: Transaction[]): number {
  return transactions
    .filter(transaction => transaction.type === 'income')
    .reduce((total, transaction) => total + Math.abs(transaction.amount), 0);
}

/**
 * Calculates net amount (income - expenses) from transactions
 */
export function calculateNetAmount(transactions: Transaction[]): number {
  const income = calculateTotalIncome(transactions);
  const expenses = calculateTotalSpending(transactions);
  return income - expenses;
}

/**
 * Gets spending trend (increase/decrease) compared to previous period
 */
export function getSpendingTrend(currentTotal: number, previousTotal: number): {
  percentage: number;
  isIncrease: boolean;
} {
  if (previousTotal === 0) {
    return { percentage: 0, isIncrease: false };
  }
  
  const percentage = ((currentTotal - previousTotal) / previousTotal) * 100;
  return {
    percentage: Math.abs(percentage),
    isIncrease: percentage > 0,
  };
}

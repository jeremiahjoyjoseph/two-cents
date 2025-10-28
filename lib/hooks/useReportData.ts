import { useAuth } from '@/contexts/AuthContext';
import { useCategories } from '@/lib/hooks/useCategories';
import { useTransactionsListener } from '@/lib/hooks/useTransactionsListener';
import {
  calculateNetAmount,
  calculateTotalIncome,
  calculateTotalSpending,
  CategorySummary,
  filterTransactions,
  formatMonthString,
  getCurrentMonth,
  getLast12Months,
  getSpendingTrend,
  groupTransactionsByCategory,
  groupTransactionsByMonth,
  MonthlySummary,
  ReportFilters,
} from '@/lib/utils/reporting';
import { useMemo, useState } from 'react';

interface UseReportDataResult {
  // Data
  filteredTransactions: any[];
  pieData: CategorySummary[];
  graphData: MonthlySummary[];
  totalSpending: number;
  totalIncome: number;
  netAmount: number;
  spendingTrend: { percentage: number; isIncrease: boolean };
  categories: any[];
  
  // Filters
  selectedMonth: string | null;
  selectedCategoryId: string | null;
  selectedTransactionType: 'income' | 'expense' | 'all';
  availableMonths: string[];
  
  // Loading states
  loading: boolean;
  
  // Filter setters
  setSelectedMonth: (month: string | null) => void;
  setSelectedCategoryId: (categoryId: string | null) => void;
  setSelectedTransactionType: (type: 'income' | 'expense' | 'all') => void;
  clearFilters: () => void;
  
  // Helper functions
  formatMonthString: (monthString: string) => string;
}

export const useReportData = (
  userId: string | undefined,
  groupId: string | null | undefined
): UseReportDataResult => {
  const { user } = useAuth();
  const { transactions, loading: transactionsLoading } = useTransactionsListener(userId, groupId);
  const { categories, loading: categoriesLoading } = useCategories(user?.uid || '', groupId);
  
  // Filter state
  const [selectedMonth, setSelectedMonth] = useState<string | null>(getCurrentMonth());
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedTransactionType, setSelectedTransactionType] = useState<'income' | 'expense' | 'all'>('all');
  
  const loading = transactionsLoading || categoriesLoading;
  
  // Get available months (last 12 months)
  const availableMonths = useMemo(() => getLast12Months(), []);
  
  // Apply filters to transactions
  const filteredTransactions = useMemo(() => {
    if (!transactions.length) return [];
    
    const filters: ReportFilters = {};
    
    if (selectedMonth) {
      filters.month = selectedMonth;
    }
    
    if (selectedCategoryId) {
      filters.categoryId = selectedCategoryId;
    }
    
    if (selectedTransactionType !== 'all') {
      filters.transactionType = selectedTransactionType;
    }
    
    return filterTransactions(transactions, filters);
  }, [transactions, selectedMonth, selectedCategoryId, selectedTransactionType]);
  
  // Generate pie chart data (category summaries)
  const pieData = useMemo(() => {
    if (!filteredTransactions.length || !categories.length) return [];
    return groupTransactionsByCategory(filteredTransactions, categories);
  }, [filteredTransactions, categories]);
  
  // Generate graph data (monthly summaries)
  const graphData = useMemo(() => {
    if (!transactions.length) return [];
    return groupTransactionsByMonth(transactions);
  }, [transactions]);
  
  // Calculate totals
  const totalSpending = useMemo(() => {
    return calculateTotalSpending(filteredTransactions);
  }, [filteredTransactions]);

  const totalIncome = useMemo(() => {
    return calculateTotalIncome(filteredTransactions);
  }, [filteredTransactions]);

  const netAmount = useMemo(() => {
    return calculateNetAmount(filteredTransactions);
  }, [filteredTransactions]);
  
  // Calculate spending trend
  const spendingTrend = useMemo(() => {
    if (!selectedMonth || graphData.length < 2) {
      return { percentage: 0, isIncrease: false };
    }
    
    const currentMonthData = graphData.find(item => {
      const [year, month] = selectedMonth.split('-').map(Number);
      return item.year === year && item.monthNumber === month;
    });
    
    const previousMonthData = graphData.find(item => {
      const [year, month] = selectedMonth.split('-').map(Number);
      const prevDate = new Date(year, month - 2);
      return item.year === prevDate.getFullYear() && item.monthNumber === prevDate.getMonth() + 1;
    });
    
    if (!currentMonthData || !previousMonthData) {
      return { percentage: 0, isIncrease: false };
    }
    
    return getSpendingTrend(currentMonthData.total, previousMonthData.total);
  }, [selectedMonth, graphData]);
  
  // Clear all filters
  const clearFilters = () => {
    setSelectedMonth(getCurrentMonth());
    setSelectedCategoryId(null);
    setSelectedTransactionType('all');
  };
  
  return {
    filteredTransactions,
    pieData,
    graphData,
    totalSpending,
    totalIncome,
    netAmount,
    spendingTrend,
    categories,
    selectedMonth,
    selectedCategoryId,
    selectedTransactionType,
    availableMonths,
    loading,
    setSelectedMonth,
    setSelectedCategoryId,
    setSelectedTransactionType,
    clearFilters,
    formatMonthString,
  };
};

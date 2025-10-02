import ParallaxScrollView from '@/components/ParallaxScrollView';
import Price from '@/components/Price';
import { SummaryCards } from '@/components/SummaryCards';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { TransactionListItem } from '@/components/TransactionListItem';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactionsListener } from '@/lib/hooks/useTransactionsListener';
import { autoTestEncryptionKeyOnLoad } from '@/lib/testing';
import { Transaction } from '@/types/transactions';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { FAB, useTheme } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MonthRangeModal from '../../components/MonthRangeModal';

const groupTransactionsByDate = (transactions: Transaction[]) => {
  return transactions.reduce((acc: { [key: string]: Transaction[] }, transaction: Transaction) => {
    // Parse the date string properly to get the date part
    let dateKey: string;

    if (transaction.date.includes('T')) {
      // Handle ISO string format (legacy)
      const transactionDate = new Date(transaction.date);
      dateKey = transactionDate.toISOString().split('T')[0];
    } else {
      // Handle timezone-neutral format (YYYY-MM-DD)
      dateKey = transaction.date;
    }

    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(transaction);
    return acc;
  }, {});
};

const formatDateGroup = (date: string) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Parse the date string properly
  let transactionDate: Date;

  if (date.includes('T')) {
    // Handle ISO string format (legacy)
    transactionDate = new Date(date);
  } else {
    // Handle timezone-neutral format (YYYY-MM-DD)
    transactionDate = new Date(date + 'T00:00:00');
  }

  // Check if the date is valid
  if (isNaN(transactionDate.getTime())) {
    return 'Invalid Date';
  }

  // Compare dates by their date parts only (ignoring time)
  const isToday =
    transactionDate.getFullYear() === today.getFullYear() &&
    transactionDate.getMonth() === today.getMonth() &&
    transactionDate.getDate() === today.getDate();

  const isYesterday =
    transactionDate.getFullYear() === yesterday.getFullYear() &&
    transactionDate.getMonth() === yesterday.getMonth() &&
    transactionDate.getDate() === yesterday.getDate();

  if (isToday) {
    return `Today, ${transactionDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    })}`;
  }
  if (isYesterday) {
    return `Yesterday, ${transactionDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    })}`;
  }
  return transactionDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
};

export default function Home() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { transactions, loading, refreshing, setRefreshing } = useTransactionsListener(
    user?.uid,
    user?.linkedGroupId
  );
  const [selectedType, setSelectedType] = useState<'income' | 'expense' | null>(null);
  const tabBarHeight = useBottomTabBarHeight();
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const insets = useSafeAreaInsets();
  const [monthModalVisible, setMonthModalVisible] = useState(false);

  // Development testing - run on app load
  React.useEffect(() => {
    if (__DEV__) {
      autoTestEncryptionKeyOnLoad(user);
    }
  }, [user]);

  const months = React.useMemo(() => {
    const arr = [];
    const start = new Date(2024, 0, 1);
    const end = new Date(2026, 11, 1);
    let current = new Date(start);
    while (current <= end) {
      arr.push(new Date(current));
      current.setMonth(current.getMonth() + 1);
    }
    return arr;
  }, []);
  const now = new Date();
  const currentMonthIndex = months.findIndex(
    m => m.getFullYear() === now.getFullYear() && m.getMonth() === now.getMonth()
  );
  const [selectedMonthIdx, setSelectedMonthIdx] = useState<number | null>(null);
  const [allTimeSelected, setAllTimeSelected] = useState(true);

  // Month label for sticky header
  let monthLabel = '';
  if (allTimeSelected) {
    monthLabel = `To ${now.toLocaleString('default', { month: 'short', day: '2-digit' })}`;
  } else if (selectedMonthIdx !== null && months[selectedMonthIdx]) {
    const date = months[selectedMonthIdx];
    const isCurrentYear = date.getFullYear() === now.getFullYear();
    monthLabel = isCurrentYear
      ? date.toLocaleString('default', { month: 'long' })
      : `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
  }

  // Filter transactions by month or all time, and by type if selected
  const filteredTransactions = React.useMemo(() => {
    let filtered = transactions;
    
    // Apply month filter
    if (!allTimeSelected && selectedMonthIdx !== null && months[selectedMonthIdx]) {
      const selectedDate = months[selectedMonthIdx];
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      filtered = filtered.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getFullYear() === year && tDate.getMonth() === month;
      });
    }
    
    // Apply type filter
    if (selectedType) {
      filtered = filtered.filter(t => t.type === selectedType);
    }
    
    return filtered;
  }, [transactions, allTimeSelected, selectedMonthIdx, months, selectedType]);

  const getTotalExpense = () => {
    return filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalIncome = () => {
    return filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const groupedTransactions = groupTransactionsByDate(filteredTransactions);
  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  const handleScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    setShowStickyHeader(y > 60); // Adjust threshold as needed
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {showStickyHeader && (
        <View
          style={[
            styles.stickyHeader,
            {
              backgroundColor: theme.colors.background,
              paddingTop: insets.top + 8,
              borderBottomColor: theme.colors.surfaceVariant,
            },
          ]}
        >
          <View>
            <ThemedText style={styles.stickyHeaderCurrency}>INR</ThemedText>
            <ThemedText style={styles.stickyHeaderAmount}>
              {(getTotalIncome() - getTotalExpense()).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
              })}
            </ThemedText>
          </View>
          {/* Month selector button triggers modal */}
          <TouchableOpacity
            onPress={() => setMonthModalVisible(true)}
            style={[
              styles.stickyHeaderMonthButton,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
          >
            <IconSymbol name="calendar-today" size={16} color={theme.colors.onSurface} />
            <ThemedText style={[styles.stickyHeaderMonthText, { color: theme.colors.onSurface }]}>
              {monthLabel}
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}
      <ParallaxScrollView style={{ paddingBottom: tabBarHeight + insets.bottom + 20 }} onScroll={handleScroll}>
        <ThemedView style={styles.container}>
          <Price
            value={getTotalIncome() - getTotalExpense()}
            symbolPosition="before"
            type="title"
          />
        </ThemedView>
        <SummaryCards
          income={getTotalIncome()}
          expenses={getTotalExpense()}
          selected={selectedType}
          onSelect={setSelectedType}
        />
        <View style={styles.monthPickerContainer}>
          <TouchableOpacity
            onPress={() => setMonthModalVisible(true)}
            style={[
              styles.stickyHeaderMonthButton,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
          >
            <IconSymbol name="calendar-today" size={16} color={theme.colors.onSurface} />
            <ThemedText style={[styles.stickyHeaderMonthText, { color: theme.colors.onSurface }]}>
              {monthLabel}
            </ThemedText>
          </TouchableOpacity>
        </View>
        {sortedDates.map(date => {
          const dailyTotal = groupedTransactions[date].reduce((sum: number, t: Transaction) => {
            return sum + (t.type === 'income' ? t.amount : -t.amount);
          }, 0);

          return (
            <View key={date}>
              <View style={styles.dateHeader}>
                <ThemedText style={styles.headerText}>{formatDateGroup(date)}</ThemedText>
                <Price
                  value={dailyTotal}
                  symbolPosition="before"
                  style={styles.headerText}
                  showDecimals={false}
                />
              </View>
              {groupedTransactions[date].map((t: Transaction) => (
                <TransactionListItem
                  key={t.id || t.createdAt?.toString()}
                  transaction={{
                    id: t.id || '',
                    title: t.title,
                    amount: t.amount,
                    date: t.date,
                    type: t.type === 'income' ? 'income' : 'expense',
                    categoryName: t.categoryName,
                    categoryIcon: t.categoryIcon,
                    categoryColor: t.categoryColor,
                  }}
                />
              ))}
            </View>
          );
        })}
      </ParallaxScrollView>
      <FAB
        icon={({ size, color }) => <IconSymbol name="add" size={size} color={color} />}
        style={[
          styles.fab,
          {
            backgroundColor: theme.colors.secondary,
            bottom: tabBarHeight + 4,
          },
        ]}
        onPress={() => router.push('/(transaction)')}
        color={theme.colors.onSecondary}
      />
      {/* Month/Range Modal */}
      <MonthRangeModal
        isVisible={monthModalVisible}
        onClose={() => setMonthModalVisible(false)}
        selectedMonthIdx={selectedMonthIdx}
        setSelectedMonthIdx={setSelectedMonthIdx}
        allTimeSelected={allTimeSelected}
        setAllTimeSelected={setAllTimeSelected}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 16,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.6,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    zIndex: 999,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingBottom: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  stickyHeaderCurrency: {
    fontSize: 16,
    opacity: 0.6,
  },
  stickyHeaderAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  stickyHeaderMonthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    minHeight: 48,
    gap: 8,
  },
  stickyHeaderMonthText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  monthPickerContainer: {
    marginTop: 0,
    alignItems: 'flex-start',
  },
});

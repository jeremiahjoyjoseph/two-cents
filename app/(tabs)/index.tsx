import ParallaxScrollView from '@/components/ParallaxScrollView';
import Price from '@/components/Price';
import { SummaryCards } from '@/components/SummaryCards';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { TransactionListItem } from '@/components/TransactionListItem';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactionsListener } from '@/lib/hooks/useTransactionsListener';
import { Transaction } from '@/types/transactions';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { FAB, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

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

  const getTotalExpense = () => {
    return transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalIncome = () => {
    return transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  };

  const filteredTransactions = selectedType
    ? transactions.filter(t => t.type === selectedType)
    : transactions;

  const groupedTransactions = groupTransactionsByDate(filteredTransactions);
  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ParallaxScrollView>
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
            bottom: tabBarHeight + 16,
          },
        ]}
        onPress={() => router.push('/(transaction)')}
        color={theme.colors.onSecondary}
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
});

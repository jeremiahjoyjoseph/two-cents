import { Card } from '@/components/Card';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import Price from '@/components/Price';
import { SummaryCards } from '@/components/SummaryCards';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';
import { getAllTransactions } from '@/lib/api/transactions';
import { Transaction } from '@/types/transactions';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { FAB, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Home() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;
      try {
        const data = await getAllTransactions(user.uid, null);
        setTransactions(data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    fetchTransactions();
  }, [user]);

  const getTotalExpense = () => {
    return transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalIncome = () => {
    return transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  };

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
        <SummaryCards income={getTotalIncome()} expenses={getTotalExpense()} />
        {transactions.map(t => (
          <Card
            key={t.id || t.createdAt?.toString()}
            id={t.id || ''}
            title={t.title}
            amount={t.amount}
            date={t.date}
            type={t.type === 'income' ? 'income' : 'expense'}
          />
        ))}
      </ParallaxScrollView>
      <FAB
        icon="plus"
        style={{ ...styles.fab, backgroundColor: theme.colors.secondary }}
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

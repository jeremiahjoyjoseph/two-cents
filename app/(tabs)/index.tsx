import { Card } from '@/components/Card';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import Price from '@/components/Price';
import { SummaryCards } from '@/components/SummaryCards';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { firestore } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { getAllTransactions } from '@/lib/api/transactions';
import { Transaction } from '@/types/transactions';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { FAB, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Home() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const tabBarHeight = useBottomTabBarHeight();

  useEffect(() => {
    async function fetchData() {
      if (!user?.uid) return;

      try {
        // Get user's linkedGroupId
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        const userData = userDoc.data();
        const groupId = userData?.linkedGroupId || null;

        const data = await getAllTransactions(user.uid, groupId);
        setTransactions(data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user?.uid]);

  const getTotalExpense = () => {
    return transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalIncome = () => {
    return transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
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
        icon={({ size, color }) => <IconSymbol name="add" size={size} color={color} />}
        style={[
          styles.fab,
          {
            backgroundColor: theme.colors.secondary,
            bottom: Platform.select({
              ios: tabBarHeight + 16,
              default: 16,
            }),
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

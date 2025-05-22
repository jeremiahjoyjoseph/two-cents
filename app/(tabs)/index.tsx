import { Card } from '@/components/Card';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import Price from '@/components/Price';
import { SummaryCards } from '@/components/SummaryCards';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { getAllTransactions } from '@/lib/api/transactions';
import { Transaction } from '@/types/transactions';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Platform, RefreshControl, StyleSheet, View } from 'react-native';
import { FAB, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Home() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState<'income' | 'expense' | null>(null);
  const tabBarHeight = useBottomTabBarHeight();

  const fetchData = async () => {
    try {
      if (!user) {
        console.log('No user logged in');
        return;
      }

      const groupId = user.linkedGroupId || null;
      console.log('[fetchData] Group ID:', groupId);

      const transactions = await getAllTransactions(user.uid, groupId);
      setTransactions(transactions);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [user?.uid]);

  useEffect(() => {
    fetchData();
  }, [user?.uid]);

  useFocusEffect(
    React.useCallback(() => {
      if (user?.uid) {
        fetchData();
      }
    }, [user?.uid])
  );

  const getTotalExpense = () => {
    return transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalIncome = () => {
    return transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  };

  const filteredTransactions = selectedType
    ? transactions.filter(t => t.type === selectedType)
    : transactions;

  if (loading) {
    return (
      <View style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ParallaxScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
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
        {filteredTransactions.map(t => (
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

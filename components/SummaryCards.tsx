import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import Price from './Price';
import { ThemedText } from './ThemedText';
import { IconSymbol } from './ui/IconSymbol';

interface SummaryCardsProps {
  income: number;
  expenses: number;
  currency?: string;
}

export function SummaryCards({ income, expenses, currency = 'INR' }: SummaryCardsProps) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      {/* Income Card */}
      <View style={[styles.card, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.iconLabelRow}>
          <IconSymbol name="arrow-downward" size={20} color={theme.colors.onPrimary} />
          <ThemedText
            type="defaultSemiBold"
            style={[styles.label, { color: theme.colors.onPrimary }]}
          >
            Income
          </ThemedText>
        </View>
        <Price
          value={income}
          currency={currency}
          type="defaultSemiBold"
          style={{ color: theme.colors.onPrimary, marginTop: 8 }}
        />
      </View>
      {/* Expenses Card */}
      <View style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}>
        <View style={styles.iconLabelRow}>
          <IconSymbol name="arrow-upward" size={20} color={theme.colors.onSurface} />
          <ThemedText
            type="defaultSemiBold"
            style={[styles.label, { color: theme.colors.onSurface }]}
          >
            Expenses
          </ThemedText>
        </View>
        <Price
          value={expenses}
          currency={currency}
          type="defaultSemiBold"
          style={{ color: theme.colors.onSurface, marginTop: 8 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginVertical: 16,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    minWidth: 140,
    elevation: 2,
  },
  iconLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});

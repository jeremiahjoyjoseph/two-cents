import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import Price from './Price';
import { ThemedText } from './ThemedText';
import { IconSymbol } from './ui/IconSymbol';

interface SummaryCardProps {
  type: 'income' | 'expense';
  amount: number;
  currency?: string;
  selected?: 'income' | 'expense' | null;
  onSelect?: (type: 'income' | 'expense' | null) => void;
}

function SummaryCard({ type, amount, currency = 'INR', selected, onSelect }: SummaryCardProps) {
  const theme = useTheme();
  const isSelected = selected === type;

  return (
    <Pressable
      style={[
        styles.card,
        {
          backgroundColor: isSelected ? theme.colors.secondary : theme.colors.surfaceVariant,
        },
      ]}
      onPress={() => onSelect?.(isSelected ? null : type)}
    >
      <View style={styles.iconLabelRow}>
        <IconSymbol
          name={type === 'income' ? 'arrow-downward' : 'arrow-upward'}
          size={20}
          color={isSelected ? theme.colors.primary : theme.colors.onSurface}
        />
        <ThemedText
          type="defaultSemiBold"
          style={[
            styles.label,
            { color: isSelected ? theme.colors.primary : theme.colors.onSurface },
          ]}
        >
          {type === 'income' ? 'Income' : 'Expenses'}
        </ThemedText>
      </View>
      <Price
        value={amount}
        currency={currency}
        type="defaultSemiBold"
        style={{
          color: isSelected ? theme.colors.primary : theme.colors.onSurface,
          marginTop: 8,
        }}
      />
    </Pressable>
  );
}

interface SummaryCardsProps {
  income: number;
  expenses: number;
  currency?: string;
  selected?: 'income' | 'expense' | null;
  onSelect?: (type: 'income' | 'expense' | null) => void;
}

export function SummaryCards({
  income,
  expenses,
  currency = 'INR',
  selected,
  onSelect,
}: SummaryCardsProps) {
  return (
    <View style={styles.row}>
      <SummaryCard
        type="income"
        amount={income}
        currency={currency}
        selected={selected}
        onSelect={onSelect}
      />
      <SummaryCard
        type="expense"
        amount={expenses}
        currency={currency}
        selected={selected}
        onSelect={onSelect}
      />
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

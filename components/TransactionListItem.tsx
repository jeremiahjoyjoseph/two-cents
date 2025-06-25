import { useTheme } from '@/constants/theme';
import { Transaction } from '@/types/transactions';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Price from './Price';
import { ThemedText } from './ThemedText';
import { IconSymbol } from './ui/IconSymbol';

type TransactionListItemProps = {
  transaction: Omit<Transaction, 'createdAt' | 'createdBy' | 'groupId'>;
};

export const TransactionListItem = ({ transaction }: TransactionListItemProps) => {
  const theme = useTheme();
  const router = useRouter();
  const { id, title, amount, type, date } = transaction;

  const isExpense = type === 'expense';
  const iconName = isExpense ? 'arrow-upward' : 'arrow-downward';
  const iconColor = theme.colors.primary;
  const priceColor = isExpense ? theme.colors.error : theme.colors.success;

  const handlePress = () => {
    router.push({
      pathname: '/(transaction)',
      params: { id, title, amount, type, date },
    });
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <View style={styles.container}>
        <View style={styles.left}>
          <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
            <IconSymbol name={iconName} size={24} color={iconColor} />
          </View>
          <ThemedText
            type="defaultSemiBold"
            style={styles.title}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {title}
          </ThemedText>
        </View>
        <View style={styles.right}>
          {/* {isExpense && (
            <IconSymbol
              name="keyboard-arrow-down"
              size={Platform.select({ ios: 12, default: 24 })}
              color={priceColor}
              style={styles.icon}
            />
          )}
          {!isExpense && (
            <IconSymbol
              name="keyboard-arrow-up"
              size={Platform.select({ ios: 12, default: 24 })}
              color={priceColor}
              style={styles.icon}
            />
          )} */}
          <Price
            value={amount}
            symbolPosition="before"
            type="defaultSemiBold"
            style={{ color: priceColor }}
            showDecimals={false}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    flexShrink: 1,
    flexGrow: 1,
    minWidth: 0,
    flexWrap: 'wrap',
    marginLeft: 12,
  },
});

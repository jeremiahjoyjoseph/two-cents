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
  const { id, title, amount, type, date, categoryId, categoryName, categoryIcon, categoryColor } = transaction;

  const isExpense = type === 'expense';
  const iconName = isExpense ? 'arrow-downward' : 'arrow-upward';
  const iconColor = theme.colors.primary;
  // More classy colors for income/expense
  const priceColor = isExpense ? '#E53E3E' : '#38A169'; // Deep red for expenses, forest green for income
  
  // Use category info if available, otherwise fallback to income/expense icons
  const hasCategory = categoryName && categoryIcon && categoryColor;
  
  // Display logic: show category name if no title, or show category name below title if both exist
  const shouldShowCategoryName = hasCategory && (!title || title.trim() === '');
  const shouldShowCategoryBelowTitle = hasCategory && title && title.trim() !== '';

  const handlePress = () => {
    router.push({
      pathname: '/(transaction)',
      params: { 
        id, 
        title, 
        amount, 
        type, 
        date,
        categoryId: categoryId || '',
        categoryName: categoryName || '',
        categoryIcon: categoryIcon || '',
        categoryColor: categoryColor || '',
      },
    });
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <View style={styles.container}>
        <View style={styles.left}>
          {hasCategory ? (
            <View style={[styles.iconContainer, { backgroundColor: 'transparent', borderColor: theme.colors.outline }]}>
              <IconSymbol name={categoryIcon as any} size={24} color={categoryColor} />
            </View>
          ) : (
            <View style={[styles.iconContainer, { backgroundColor: 'transparent', borderColor: theme.colors.outline }]}>
              <IconSymbol name={iconName} size={24} color={iconColor} />
            </View>
          )}
          <View style={styles.titleContainer}>
            {shouldShowCategoryName ? (
              <ThemedText
                type="defaultSemiBold"
                style={styles.title}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {categoryName}
              </ThemedText>
            ) : (
              <ThemedText
                type="defaultSemiBold"
                style={styles.title}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {title}
              </ThemedText>
            )}
            {shouldShowCategoryBelowTitle && (
              <ThemedText
                type="default"
                style={styles.categoryName}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {categoryName}
              </ThemedText>
            )}
          </View>
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
            style={{ 
              color: priceColor, 
              fontSize: 18, 
              fontWeight: '700',
              textAlign: 'right'
            }}
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
    paddingVertical: 16,
    backgroundColor: 'transparent',
    borderRadius: 12,
    marginVertical: 2,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 16,
    minWidth: 0,
  },
  categoryName: {
    fontSize: 14,
    opacity: 0.8,
    marginTop: 4,
    fontWeight: '500',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  icon: {
    marginRight: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    flexShrink: 1,
    minWidth: 0,
  },
});

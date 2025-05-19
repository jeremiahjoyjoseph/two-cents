import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MD3Theme, useTheme } from 'react-native-paper';
import Price from './Price';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';

// Import the ExtendedMD3Theme type from the theme constants
import type { ExtendedMD3Theme } from '../constants/theme';
import { DateDisplay } from './DateDisplay';

interface CardProps {
  title: string;
  amount: number;
  date: string;
  type: 'expense' | 'income';
}

const getStyles = (theme: MD3Theme) => {
  const t = theme as ExtendedMD3Theme;
  return StyleSheet.create({
    card: {
      borderRadius: 24,
      padding: 20,
      backgroundColor: t.colors.elevation.level3,
      marginVertical: 12,
      elevation: 3,
      gap: 12,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    amountNegative: {
      color: t.colors.mutedForeground || t.colors.onSurfaceVariant,
      fontSize: 20,
      fontWeight: 'bold',
    },
    amountText: {
      color: t.colors.mutedForeground || t.colors.onSurfaceVariant,
      fontSize: 20,
      fontWeight: 'bold',
    },
    contentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      marginTop: 8,
    },
    iconTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    iconCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: t.colors.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    title: {
      color: t.colors.onSurface,
      fontWeight: 'bold',
      fontSize: 22,
    },
    amountBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: t.colors.surfaceVariant,
      borderRadius: 32,
      paddingVertical: 8,
      paddingHorizontal: 18,
    },
    amountBoxText: {
      color: t.colors.onSurface,
      fontWeight: 'bold',
      fontSize: 22,
    },
  });
};

export function Card({ title, amount, date, type }: CardProps) {
  const theme = useTheme();
  const styles = getStyles(theme);
  return (
    <ThemedView style={styles.card}>
      <View style={styles.headerRow}>
        <DateDisplay date={date} />
      </View>
      <View>
        <ThemedText type="title" style={styles.title}>
          {title}
        </ThemedText>
      </View>
      <View style={styles.contentRow}>
        <View style={styles.iconTitleRow}>
          <View style={styles.iconCircle}>
            <IconSymbol name="arrow-upward" size={28} color={theme.colors.onSurface} />
          </View>
        </View>
        <View style={styles.amountBox}>
          <Price value={amount} symbolPosition="after" type="title" style={styles.amountBoxText} />
        </View>
      </View>
    </ThemedView>
  );
}

export default Card;

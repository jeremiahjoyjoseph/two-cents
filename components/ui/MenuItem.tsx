import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface MenuItemProps {
  label: string;
  onPress: () => void;
  color?: string;
  showDivider?: boolean;
  showArrow?: boolean;
}

export function MenuItem({
  label,
  onPress,
  color,
  showDivider = true,
  showArrow = true,
}: MenuItemProps) {
  const theme = useTheme();
  const textColor = color ?? theme.colors.onSurface;

  return (
    <>
      <TouchableOpacity style={styles.container} onPress={onPress}>
        <ThemedText style={{ color: textColor }}>{label}</ThemedText>
        {showArrow && <IconSymbol name="chevron.right" size={20} color={textColor} />}
      </TouchableOpacity>
      {showDivider && <View style={[styles.divider, { backgroundColor: theme.colors.outline }]} />}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  divider: {
    height: 1,
  },
});

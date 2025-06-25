import React from 'react';
import { StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';

interface PillButtonProps {
  children: React.ReactNode;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function PillButton({
  children,
  selected,
  onPress,
  style,
  textStyle,
}: PillButtonProps) {
  const theme = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.pill,
        {
          backgroundColor: selected ? theme.colors.primary : theme.colors.surfaceVariant,
        },
        style,
      ]}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.text,
          {
            color: selected ? theme.colors.onPrimary : theme.colors.onSurfaceVariant,
            fontWeight: 'bold',
          },
          textStyle,
        ]}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    minWidth: 64,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginRight: 4,
  },
  text: {
    fontSize: 16,
  },
});

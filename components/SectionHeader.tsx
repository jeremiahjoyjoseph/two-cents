import React from 'react';
import { StyleSheet, Text, TextStyle } from 'react-native';
import { useTheme } from 'react-native-paper';

interface SectionHeaderProps {
  children: React.ReactNode;
  style?: TextStyle;
}

export default function SectionHeader({ children, style }: SectionHeaderProps) {
  const theme = useTheme();
  return (
    <Text style={[styles.header, { color: theme.colors.onSurface, fontWeight: 'bold' }, style]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 22,
    marginLeft: 20,
    marginTop: 24,
    marginBottom: 24,
  },
});

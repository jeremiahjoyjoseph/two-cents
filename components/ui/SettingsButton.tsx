import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import { ThemedText } from '@/components/ThemedText';

type IconName = React.ComponentProps<typeof MaterialIcons>['name'];

interface SettingsButtonProps {
  title: string;
  subtitle?: string;
  icon: IconName;
  onPress: () => void;
  color?: string;
}

export function SettingsButton({ title, subtitle, icon, onPress, color }: SettingsButtonProps) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: color ?? theme.colors.primary }]}>
        <MaterialIcons name={icon} size={20} color={theme.colors.surface} />
      </View>
      <View style={styles.textContainer}>
        <ThemedText type="defaultSemiBold">{title}</ThemedText>
        {subtitle && (
          <ThemedText type="default" style={{ fontSize: 14, color: theme.colors.onSurfaceVariant }}>
            {subtitle}
          </ThemedText>
        )}
      </View>
      <MaterialIcons name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  iconContainer: {
    padding: 6,
    borderRadius: 6,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
});

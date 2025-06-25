import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import { ThemedText } from '@/components/ThemedText';
import { useThemeMode } from '@/contexts/ThemeContext';

type IconName = React.ComponentProps<typeof MaterialIcons>['name'];

export function ThemeToggle() {
  const theme = useTheme();
  const { themeMode, setThemeMode } = useThemeMode();

  const options: { mode: 'light' | 'dark' | 'system'; label: string; icon: IconName }[] = [
    { mode: 'light', label: 'Light', icon: 'wb-sunny' },
    { mode: 'dark', label: 'Dark', icon: 'nightlight-round' },
    { mode: 'system', label: 'System', icon: 'settings' },
  ];

  return (
    <View style={styles.container}>
      {options.map(option => (
        <TouchableOpacity
          key={option.mode}
          style={[
            styles.option,
            {
              backgroundColor:
                themeMode === option.mode ? theme.colors.primary : theme.colors.surfaceVariant,
            },
          ]}
          onPress={() => setThemeMode(option.mode)}
        >
          <MaterialIcons
            name={option.icon}
            size={20}
            color={
              themeMode === option.mode ? theme.colors.onPrimary : theme.colors.onSurfaceVariant
            }
          />
          <ThemedText
            type="defaultSemiBold"
            style={[
              styles.label,
              {
                color:
                  themeMode === option.mode
                    ? theme.colors.onPrimary
                    : theme.colors.onSurfaceVariant,
              },
            ]}
          >
            {option.label}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  label: {
    fontSize: 14,
  },
});

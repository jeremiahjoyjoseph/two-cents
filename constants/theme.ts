// src/constants/theme.ts

import { MD3DarkTheme, MD3LightTheme, MD3Theme } from 'react-native-paper';
import { Colors } from './Colors';

export type ExtendedMD3Theme = MD3Theme & {
  colors: MD3Theme['colors'] & {
    success: string;
    warning: string;
    muted: string;
    mutedForeground: string;
  };
};

export const lightTheme: ExtendedMD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,

    // Core brand colors
    primary: Colors.light.primary,
    onPrimary: Colors.light.primaryForeground,
    primaryContainer: '#ffe1db',
    onPrimaryContainer: '#2e0500',

    secondary: Colors.light.secondary,
    onSecondary: Colors.light.secondaryForeground,
    secondaryContainer: '#eae2d9',
    onSecondaryContainer: '#2c221a',

    // Backgrounds and surfaces
    background: Colors.light.background,
    onBackground: Colors.light.text,
    surface: Colors.light.surface,
    onSurface: Colors.light.text,

    surfaceVariant: '#f0f0f0',
    onSurfaceVariant: '#4a4a4a',

    // Feedback & accent
    error: Colors.light.destructive,
    onError: '#ffffff',
    outline: Colors.light.border,
    outlineVariant: Colors.light.ring,

    // Custom semantic additions (optional)
    success: Colors.light.success,
    warning: Colors.light.warning,

    muted: Colors.light.muted,
    mutedForeground: Colors.light.mutedForeground,

    // Elevation
    elevation: {
      level0: 'transparent',
      level1: '#f9f9f9',
      level2: '#f2f2f2',
      level3: '#ebebeb',
      level4: '#e5e5e5',
      level5: '#e0e0e0',
    },
  },
};

export const darkTheme: ExtendedMD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,

    // Core brand colors
    primary: Colors.dark.primary,
    onPrimary: Colors.dark.primaryForeground,
    primaryContainer: '#3c0804',
    onPrimaryContainer: '#ffd8d2',

    secondary: Colors.dark.secondary,
    onSecondary: Colors.dark.secondaryForeground,
    secondaryContainer: '#3a322d',
    onSecondaryContainer: '#f0e8e1',

    // Backgrounds and surfaces
    background: Colors.dark.background,
    onBackground: Colors.dark.text,
    surface: Colors.dark.surface,
    onSurface: Colors.dark.text,

    surfaceVariant: '#2a2a2a',
    onSurfaceVariant: '#e5e5e5',

    // Feedback & accent
    error: Colors.dark.destructive,
    onError: '#ffffff',
    outline: Colors.dark.border,
    outlineVariant: Colors.dark.ring,

    // Custom semantic additions (optional)
    success: Colors.dark.success,
    warning: Colors.dark.warning,

    muted: Colors.dark.muted,
    mutedForeground: Colors.dark.mutedForeground,

    // Elevation
    elevation: {
      level0: 'transparent',
      level1: '#222',
      level2: '#2c2c2c',
      level3: '#363636',
      level4: '#404040',
      level5: '#4a4a4a',
    },
  },
};

// src/constants/theme.ts

import {
  MD3DarkTheme,
  MD3LightTheme,
  MD3Theme,
  useTheme as usePaperTheme,
} from 'react-native-paper';
import { Colors } from './Colors';

export type ExtendedMD3Theme = MD3Theme & {
  colors: MD3Theme['colors'] & {
    success: string;
    warning: string;
    muted: string;
    mutedForeground: string;
    input: string;
    foreground: string;
    cardForeground: string;
    popoverForeground: string;
  };
};

export const lightTheme: ExtendedMD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,

    // Core brand colors
    primary: Colors.light.primary,
    onPrimary: Colors.light.primaryForeground,
    primaryContainer: Colors.light.primaryContainer,
    onPrimaryContainer: Colors.light.onPrimaryContainer,

    secondary: Colors.light.secondary,
    onSecondary: Colors.light.secondaryForeground,
    secondaryContainer: Colors.light.secondaryContainer,
    onSecondaryContainer: Colors.light.onSecondaryContainer,

    // Backgrounds and surfaces
    background: Colors.light.background,
    onBackground: Colors.light.text,
    surface: Colors.light.surface,
    onSurface: Colors.light.text,

    surfaceVariant: Colors.light.surfaceVariant,
    onSurfaceVariant: Colors.light.onSurfaceVariant,

    // Feedback & accent
    error: Colors.light.destructive,
    onError: Colors.light.onError,
    outline: Colors.light.border,
    outlineVariant: Colors.light.ring,

    // Custom semantic additions (optional)
    success: Colors.light.success,
    warning: Colors.light.warning,

    muted: Colors.light.muted,
    mutedForeground: Colors.light.mutedForeground,

    // New colors from OKLCH scheme
    input: Colors.light.input,
    foreground: Colors.light.foreground,
    cardForeground: Colors.light.cardForeground,
    popoverForeground: Colors.light.popoverForeground,

    // Elevation
    elevation: {
      level0: Colors.light.elevation0,
      level1: Colors.light.elevation1,
      level2: Colors.light.elevation2,
      level3: Colors.light.elevation3,
      level4: Colors.light.elevation4,
      level5: Colors.light.elevation5,
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
    primaryContainer: Colors.dark.primaryContainer,
    onPrimaryContainer: Colors.dark.onPrimaryContainer,

    secondary: Colors.dark.secondary,
    onSecondary: Colors.dark.secondaryForeground,
    secondaryContainer: Colors.dark.secondaryContainer,
    onSecondaryContainer: Colors.dark.onSecondaryContainer,

    // Backgrounds and surfaces
    background: Colors.dark.background,
    onBackground: Colors.dark.text,
    surface: Colors.dark.surface,
    onSurface: Colors.dark.text,

    surfaceVariant: Colors.dark.surfaceVariant,
    onSurfaceVariant: Colors.dark.onSurfaceVariant,

    // Feedback & accent
    error: Colors.dark.destructive,
    onError: Colors.dark.onError,
    outline: Colors.dark.border,
    outlineVariant: Colors.dark.ring,

    // Custom semantic additions (optional)
    success: Colors.dark.success,
    warning: Colors.dark.warning,

    muted: Colors.dark.muted,
    mutedForeground: Colors.dark.mutedForeground,

    // New colors from OKLCH scheme
    input: Colors.dark.input,
    foreground: Colors.dark.foreground,
    cardForeground: Colors.dark.cardForeground,
    popoverForeground: Colors.dark.popoverForeground,

    // Elevation
    elevation: {
      level0: Colors.dark.elevation0,
      level1: Colors.dark.elevation1,
      level2: Colors.dark.elevation2,
      level3: Colors.dark.elevation3,
      level4: Colors.dark.elevation4,
      level5: Colors.dark.elevation5,
    },
  },
};

export const useTheme = () => usePaperTheme<ExtendedMD3Theme>();

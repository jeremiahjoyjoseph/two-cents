import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider, useThemeMode } from '@/contexts/ThemeContext';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { en, registerTranslation } from 'react-native-paper-dates';
import 'react-native-reanimated';

import { darkTheme, lightTheme } from '@/constants/theme';

registerTranslation('en', en);

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, isAuthReady } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const { isDark } = useThemeMode();

  useEffect(() => {
    if (!isAuthReady) return;

    const inAuthGroup = segments[0] === '(auth)';
    if (!user && !inAuthGroup) {
      router.replace('/(auth)');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, segments, isAuthReady]);

  if (!isAuthReady) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: isDark ? darkTheme.colors.background : lightTheme.colors.background,
        },
      }}
    />
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) return null;

  return (
    <ThemeProvider>
      <AuthProvider>
        <RootLayoutContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

function RootLayoutContent() {
  const { isAuthReady } = useAuth();
  const { isDark } = useThemeMode();

  useEffect(() => {
    if (isAuthReady) {
      // Hide the splash screen when auth is ready
      SplashScreen.hideAsync();
    }
  }, [isAuthReady]);

  if (!isAuthReady) {
    return null;
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDark ? darkTheme.colors.background : lightTheme.colors.background,
      }}
    >
      <PaperProvider theme={isDark ? darkTheme : lightTheme}>
        <RootLayoutNav />
        <StatusBar style={isDark ? 'light' : 'dark'} translucent />
      </PaperProvider>
    </View>
  );
}

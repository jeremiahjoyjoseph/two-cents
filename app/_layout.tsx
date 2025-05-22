import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';

import { darkTheme, lightTheme } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';

function RootLayoutNav() {
  const { user, isAuthReady } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();

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
          backgroundColor:
            colorScheme === 'dark' ? darkTheme.colors.background : lightTheme.colors.background,
        },
      }}
    />
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) return null;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor:
          colorScheme === 'dark' ? darkTheme.colors.background : lightTheme.colors.background,
      }}
    >
      <AuthProvider>
        <RootLayoutContent />
      </AuthProvider>
    </View>
  );
}

function RootLayoutContent() {
  const { isAuthReady } = useAuth();
  const colorScheme = useColorScheme();

  if (!isAuthReady) {
    return null;
  }

  return (
    <PaperProvider theme={colorScheme === 'dark' ? darkTheme : lightTheme}>
      <RootLayoutNav />
      <StatusBar style="auto" />
    </PaperProvider>
  );
}

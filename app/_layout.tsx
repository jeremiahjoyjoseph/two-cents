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
  const { user } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    if (!user && !inAuthGroup) {
      router.replace('/(auth)');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, segments]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 500,
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
        <PaperProvider theme={colorScheme === 'dark' ? darkTheme : lightTheme}>
          <RootLayoutNav />
          <StatusBar style="auto" />
        </PaperProvider>
      </AuthProvider>
    </View>
  );
}

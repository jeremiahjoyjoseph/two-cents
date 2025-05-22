import { Stack } from 'expo-router';
import React from 'react';
import { useTheme } from 'react-native-paper';

export default function TransactionLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
        animation: 'slide_from_right',
        animationDuration: 500,
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}

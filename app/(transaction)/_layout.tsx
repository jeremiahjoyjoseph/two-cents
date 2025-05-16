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
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack>
  );
}

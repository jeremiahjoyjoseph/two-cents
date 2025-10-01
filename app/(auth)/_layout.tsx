import { useAuth } from '@/contexts/AuthContext';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';

export default function AuthLayout() {
  const { user, isAuthReady } = useAuth();
  const [needsName, setNeedsName] = useState(false);

  useEffect(() => {
    if (user && isAuthReady) {
      // Check if user needs to provide their name
      if (!user.name || user.name.trim() === '') {
        setNeedsName(true);
      } else {
        setNeedsName(false);
      }
    }
  }, [user, isAuthReady]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      {needsName && <Stack.Screen name="NameCollection" />}
    </Stack>
  );
}

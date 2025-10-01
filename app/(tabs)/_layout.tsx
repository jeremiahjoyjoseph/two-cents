import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { TabBarButton } from '@/components/ui/TabBarButton';
import { Colors } from '@/constants/Colors';
import { useThemeMode } from '@/contexts/ThemeContext';

export default function TabLayout() {
  const theme = useTheme();
  const { isDark } = useThemeMode();
  const insets = useSafeAreaInsets();

  const tabBarBackgroundColor = isDark
    ? `${Colors.dark.background}CC` // 80% opacity
    : `${Colors.light.background}CC`; // 80% opacity

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,
          backgroundColor: tabBarBackgroundColor,
          height: 80 + insets.bottom,
          paddingTop: 8,
          paddingBottom: 8 + insets.bottom,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarButton: props => (
            <TabBarButton {...props} focused={props.accessibilityState?.selected} />
          ),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="home" color={color} />,
          tabBarLabel: ({ focused, color, children }) => (
            <Text style={{ color, fontWeight: focused ? 'bold' : 'normal' }}>{children}</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          title: 'Profile',
          tabBarButton: props => (
            <TabBarButton {...props} focused={props.accessibilityState?.selected} />
          ),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person" color={color} />,
          tabBarLabel: ({ focused, color, children }) => (
            <Text style={{ color, fontWeight: focused ? 'bold' : 'normal' }}>{children}</Text>
          ),
        }}
      />
    </Tabs>
  );
}

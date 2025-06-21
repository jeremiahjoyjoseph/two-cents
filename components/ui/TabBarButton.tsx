import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { GestureResponderEvent, Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface TabBarButtonWithFocus extends BottomTabBarButtonProps {
  focused?: boolean;
}

export const TabBarButton = (props: TabBarButtonWithFocus) => {
  const theme = useTheme();

  const { children, onPress } = props;

  const handlePress = (e: GestureResponderEvent) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) {
      onPress(e);
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSpring(props.focused ? 1 : 0, {
            damping: 15,
            stiffness: 120,
          }),
        },
      ],
    };
  });

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <Animated.View
        style={[styles.pill, { backgroundColor: theme.colors.primaryContainer }, animatedStyle]}
      />
      <View style={styles.iconContainer}>{children}</View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pill: {
    position: 'absolute',
    height: 40,
    width: 64,
    borderRadius: 20,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
});

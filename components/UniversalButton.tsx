import * as Haptics from 'expo-haptics';
import React, { useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  TextStyle,
  ViewStyle
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { ThemedText } from './ThemedText';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'auth' | 'surface';
export type ButtonSize = 'small' | 'medium' | 'large' | 'xl';

export interface UniversalButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  hapticFeedback?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export function UniversalButton({
  children,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
  hapticFeedback = true,
  icon,
  iconPosition = 'left',
}: UniversalButtonProps) {
  const theme = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled || loading) return;
    
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled || loading) return;
    
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePress = () => {
    if (disabled || loading) return;

    // Enhanced haptic feedback based on button size and variant
    if (hapticFeedback && Platform.OS === 'ios') {
      let hapticStyle: Haptics.ImpactFeedbackStyle;
      
      if (variant === 'auth' || size === 'xl') {
        hapticStyle = Haptics.ImpactFeedbackStyle.Heavy;
      } else if (size === 'large') {
        hapticStyle = Haptics.ImpactFeedbackStyle.Medium;
      } else if (size === 'small') {
        hapticStyle = Haptics.ImpactFeedbackStyle.Light;
      } else {
        hapticStyle = Haptics.ImpactFeedbackStyle.Light;
      }
      
      Haptics.impactAsync(hapticStyle);
    }

    onPress?.();
  };

  const getButtonStyles = (): ViewStyle => {
    const baseStyles: ViewStyle = {
      borderRadius: getBorderRadius(),
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      opacity: disabled ? 0.5 : 1,
    };

    // Only apply shadow/elevation for non-ghost variants
    const shadowStyles: ViewStyle = variant !== 'ghost' ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    } : {};

    const sizeStyles = getSizeStyles();
    const variantStyles = getVariantStyles();

    return {
      ...baseStyles,
      ...shadowStyles,
      ...sizeStyles,
      ...variantStyles,
      ...(fullWidth && { width: '100%' }),
    };
  };

  const getTextStyles = (): TextStyle => {
    const baseTextStyles: TextStyle = {
      textAlign: 'center',
      fontWeight: '600',
    };

    const sizeTextStyles = getSizeTextStyles();
    const variantTextStyles = getVariantTextStyles();

    return {
      ...baseTextStyles,
      ...sizeTextStyles,
      ...variantTextStyles,
    };
  };

  const getBorderRadius = (): number => {
    switch (size) {
      case 'small':
        return 8;
      case 'medium':
        return 12;
      case 'large':
        return 16;
      case 'xl':
        return 20;
      default:
        return 12;
    }
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'small':
        return {
          minHeight: 32,
          paddingHorizontal: 12,
          paddingVertical: 6,
          gap: 6,
        };
      case 'medium':
        return {
          minHeight: 44,
          paddingHorizontal: 16,
          paddingVertical: 10,
          gap: 8,
        };
      case 'large':
        return {
          minHeight: 52,
          paddingHorizontal: 20,
          paddingVertical: 12,
          gap: 10,
        };
      case 'xl':
        return {
          minHeight: 60,
          paddingHorizontal: 24,
          paddingVertical: 16,
          gap: 12,
        };
      default:
        return {
          minHeight: 44,
          paddingHorizontal: 16,
          paddingVertical: 10,
          gap: 8,
        };
    }
  };

  const getSizeTextStyles = (): TextStyle => {
    switch (size) {
      case 'small':
        return {
          fontSize: 12,
          lineHeight: 16,
        };
      case 'medium':
        return {
          fontSize: 14,
          lineHeight: 20,
        };
      case 'large':
        return {
          fontSize: 16,
          lineHeight: 22,
        };
      case 'xl':
        return {
          fontSize: 18,
          lineHeight: 24,
        };
      default:
        return {
          fontSize: 14,
          lineHeight: 20,
        };
    }
  };

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.colors.primary,
          borderWidth: 0,
        };
      case 'secondary':
        return {
          backgroundColor: theme.colors.secondary,
          borderWidth: 0,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: theme.colors.primary,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
      case 'destructive':
        return {
          backgroundColor: theme.colors.error,
          borderWidth: 0,
        };
      case 'auth':
        return {
          backgroundColor: '#ffffff',
          borderWidth: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 4,
        };
      case 'surface':
        return {
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.outline,
        };
      default:
        return {
          backgroundColor: theme.colors.primary,
          borderWidth: 0,
        };
    }
  };

  const getVariantTextStyles = (): TextStyle => {
    switch (variant) {
      case 'primary':
        return {
          color: theme.colors.onPrimary,
        };
      case 'secondary':
        return {
          color: theme.colors.onSecondary,
        };
      case 'outline':
        return {
          color: theme.colors.primary,
        };
      case 'ghost':
        return {
          color: theme.colors.primary,
        };
      case 'destructive':
        return {
          color: theme.colors.onError,
        };
      case 'auth':
        return {
          color: '#000000',
          fontWeight: '700',
        };
      case 'surface':
        return {
          color: theme.colors.onSurface,
        };
      default:
        return {
          color: theme.colors.onPrimary,
        };
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="small"
          color={getVariantTextStyles().color}
        />
      );
    }

    const textElement = (
      <ThemedText
        style={[getTextStyles(), textStyle]}
        type="defaultSemiBold"
      >
        {children}
      </ThemedText>
    );

    if (icon) {
      return (
        <>
          {iconPosition === 'left' && icon}
          {textElement}
          {iconPosition === 'right' && icon}
        </>
      );
    }

    return textElement;
  };

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Pressable
        style={[getButtonStyles(), style]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
      >
        {renderContent()}
      </Pressable>
    </Animated.View>
  );
}


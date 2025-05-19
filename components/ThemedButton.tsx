import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { ThemedText } from './ThemedText';

export type ThemedButtonProps = React.ComponentProps<typeof Button> & {
  style?: StyleProp<ViewStyle>;
};

export function ThemedButton({
  style,
  mode = 'contained',
  children,
  labelStyle,
  ...props
}: ThemedButtonProps) {
  const theme = useTheme();

  return (
    <Button
      mode={mode}
      style={[
        {
          borderRadius: 24,
          backgroundColor: mode === 'contained' ? theme.colors.primary : theme.colors.background,
          borderColor: theme.colors.primary,
          borderWidth: mode === 'outlined' ? 1 : 0,
        },
        style,
      ]}
      labelStyle={[
        {
          color: mode === 'contained' ? theme.colors.onPrimary : theme.colors.primary,
        },
        labelStyle,
      ]}
      {...props}
    >
      <ThemedText
        type="defaultSemiBold"
        style={{
          color: mode === 'contained' ? theme.colors.onPrimary : theme.colors.primary,
          fontSize: 18,
          textAlign: 'center',
        }}
      >
        {children}
      </ThemedText>
    </Button>
  );
}

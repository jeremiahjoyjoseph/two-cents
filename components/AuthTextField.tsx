import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';

interface AuthTextFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'phone-pad' | 'number-pad' | 'email-address';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength?: number;
  returnKeyType?: 'done' | 'next' | 'search' | 'send';
  onSubmitEditing?: () => void;
  autoFocus?: boolean;
  secureTextEntry?: boolean;
  style?: any;
}

export const AuthTextField: React.FC<AuthTextFieldProps> = ({
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  autoCapitalize = 'none',
  maxLength,
  returnKeyType = 'done',
  onSubmitEditing,
  autoFocus = false,
  secureTextEntry = false,
  style,
}) => {
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <TextInput
      label=""
      value={value}
      onChangeText={onChangeText}
      mode="flat"
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.onSurfaceDisabled}
      style={[styles.textInput, style]}
      underlineColor={theme.colors.outlineVariant}
      activeUnderlineColor={theme.colors.outlineVariant}
      contentStyle={styles.inputContent}
      maxLength={maxLength}
      returnKeyType={returnKeyType}
      onSubmitEditing={onSubmitEditing}
      autoFocus={autoFocus}
      blurOnSubmit={true}
      secureTextEntry={secureTextEntry && !showPassword}
      right={
        secureTextEntry ? (
          <TextInput.Icon
            icon={showPassword ? "eye" : "eye-off"}
            onPress={() => setShowPassword(!showPassword)}
            forceTextInputFocus={false}
          />
        ) : undefined
      }
    />
  );
};

const styles = StyleSheet.create({
  textInput: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingBottom: 8,
    marginBottom: 24,
  },
  inputContent: {
    fontSize: 18,
    fontWeight: '600',
    paddingBottom: 8,
  },
});

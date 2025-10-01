import React from 'react';
import { StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';

interface AuthTextFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'phone-pad' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength?: number;
  returnKeyType?: 'done' | 'next' | 'search' | 'send';
  onSubmitEditing?: () => void;
  autoFocus?: boolean;
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
  style,
}) => {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      mode="flat"
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      placeholder={placeholder}
      placeholderTextColor="#666"
      style={[styles.textInput, style]}
      underlineColor="#666"
      activeUnderlineColor="#fff"
      textColor="#fff"
      maxLength={maxLength}
      returnKeyType={returnKeyType}
      onSubmitEditing={onSubmitEditing}
      autoFocus={autoFocus}
      blurOnSubmit={true}
    />
  );
};

const styles = StyleSheet.create({
  textInput: {
    backgroundColor: 'transparent',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'left',
    height: 70,
    paddingRight: 16,
    paddingLeft: 0,
  },
});

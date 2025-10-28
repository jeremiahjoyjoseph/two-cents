import { useTheme } from '@/constants/theme';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

interface PINInputProps {
  length?: number;
  value: string;
  onChangeText: (text: string) => void;
  autoFocus?: boolean;
  secureTextEntry?: boolean;
}

export const PINInput: React.FC<PINInputProps> = ({
  length = 6,
  value,
  onChangeText,
  autoFocus = false,
  secureTextEntry = false,
}) => {
  const theme = useTheme();
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const digits = value.split('');

  // Reset focus to first input when value is cleared
  useEffect(() => {
    if (value === '' && autoFocus) {
      inputRefs.current[0]?.focus();
    }
  }, [value, autoFocus]);

  const handleChange = (text: string, index: number) => {
    // Only allow digits
    const digit = text.replace(/[^0-9]/g, '');
    
    if (digit.length === 0) {
      // Handle backspace
      const newValue = digits.slice(0, index).join('') + digits.slice(index + 1).join('');
      onChangeText(newValue);
      
      // Move to previous input
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (digit.length === 1) {
      // Handle single digit input
      const newDigits = [...digits];
      newDigits[index] = digit;
      const newValue = newDigits.join('').slice(0, length);
      onChangeText(newValue);
      
      // Move to next input
      if (index < length - 1 && digit) {
        inputRefs.current[index + 1]?.focus();
      }
    } else if (digit.length > 1) {
      // Handle paste or multiple digits
      const newValue = (value.slice(0, index) + digit).slice(0, length);
      onChangeText(newValue);
      
      // Focus on the next empty input or last input
      const nextIndex = Math.min(newValue.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      // If current box is empty and backspace is pressed, move to previous and clear it
      const newValue = digits.slice(0, index - 1).join('') + digits.slice(index).join('');
      onChangeText(newValue);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
  };

  const handleBlur = () => {
    setFocusedIndex(null);
  };

  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, index) => {
        const isFocused = focusedIndex === index;
        const hasValue = !!digits[index];

        return (
          <TextInput
            key={index}
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            style={[
              styles.input,
              {
                borderColor: isFocused
                  ? theme.colors.primary
                  : hasValue
                  ? theme.colors.outline
                  : theme.colors.outlineVariant,
                backgroundColor: theme.colors.surface,
                color: theme.colors.onSurface,
              },
              isFocused && styles.inputFocused,
            ]}
            value={digits[index] || ''}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            onFocus={() => handleFocus(index)}
            onBlur={handleBlur}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
            autoFocus={autoFocus && index === 0}
            secureTextEntry={secureTextEntry}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 4,
  },
  input: {
    flex: 1,
    height: 56,
    borderWidth: 2,
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 0,
  },
  inputFocused: {
    borderWidth: 2,
  },
});


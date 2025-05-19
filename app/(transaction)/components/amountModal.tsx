import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import { Button, MD3Theme, useTheme } from 'react-native-paper';

import Price from '@/components/Price';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

const KEYPAD_LAYOUT = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', '⌫'],
];

interface AmountProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit?: (amount: string) => void;
  amount: string;
  setAmount: (amount: string) => void;
}

const getStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    modalContainer: {
      margin: 0,
      justifyContent: 'flex-end',
    },
    modalContent: {
      width: '100%',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      overflow: 'hidden',
    },
    amountContainer: {
      paddingVertical: 32,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.elevation.level3,
    },
    keypadContainer: {
      paddingHorizontal: 24,
      paddingBottom: 16,
      backgroundColor: theme.colors.elevation.level3,
    },
    keypadRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 16,
      marginBottom: 16,
    },
    keypadButton: {
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceVariant,
    },
    backspaceButton: {
      backgroundColor: theme.colors.surfaceVariant,
    },
    decimalButton: {
      backgroundColor: theme.colors.surfaceVariant,
    },
    keypadText: {
      fontSize: 32,
      color: theme.colors.onSurface,
    },
    actionButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
      backgroundColor: theme.colors.elevation.level3,
    },
    enterButton: {
      paddingHorizontal: 24,
    },
  });

export function AmountModal({ isVisible, onClose, onSubmit, amount, setAmount }: AmountProps) {
  const theme = useTheme();
  const styles = getStyles(theme);

  const handleKeyPress = (key: string) => {
    if (key === '⌫') {
      setAmount(amount.length > 1 ? amount.slice(0, -1) : '0');
      return;
    }

    if (key === '.') {
      if (amount.includes('.')) return; // Don't allow multiple decimal points
      setAmount(amount + key);
      return;
    }

    // If there's a decimal point, check decimal places
    if (amount.includes('.')) {
      const decimalPlaces = amount.split('.')[1].length;
      if (decimalPlaces >= 2) return; // Don't allow more than 2 decimal places
    }

    if (amount === '0' && key !== '.') {
      setAmount(key);
    } else {
      setAmount(amount + key);
    }
  };

  const handleSubmit = () => {
    onClose();
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={styles.modalContainer}
      backdropColor={theme.colors.background}
      backdropOpacity={0.8}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      useNativeDriver
    >
      <ThemedView style={styles.modalContent}>
        {/* Amount Display */}
        <ThemedView style={styles.amountContainer}>
          <Price value={amount} symbolPosition="after" type="title" showDecimals={false} />
        </ThemedView>

        {/* Keypad */}
        <ThemedView style={styles.keypadContainer}>
          {KEYPAD_LAYOUT.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.keypadRow}>
              {row.map(key => (
                <TouchableOpacity
                  key={key}
                  onPress={() => handleKeyPress(key)}
                  style={[
                    styles.keypadButton,
                    key === '⌫' && styles.backspaceButton,
                    key === '.' && styles.decimalButton,
                  ]}
                >
                  {key === '⌫' ? (
                    <IconSymbol name="backspace" size={24} color={theme.colors.error} />
                  ) : (
                    <ThemedText style={styles.keypadText} type="defaultSemiBold">
                      {key}
                    </ThemedText>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </ThemedView>

        {/* Action Buttons */}
        <ThemedView style={styles.actionButtonsContainer}>
          <Button
            mode="text"
            onPress={onClose}
            icon={({ size, color }: { size: number; color: string }) => (
              <IconSymbol name="close" size={size} color={color} />
            )}
            textColor={theme.colors.onSurface}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            icon={({ size, color }: { size: number; color: string }) => (
              <IconSymbol name="check" size={size} color={color} />
            )}
            buttonColor={theme.colors.primary}
            style={styles.enterButton}
          >
            Enter
          </Button>
        </ThemedView>
      </ThemedView>
    </Modal>
  );
}

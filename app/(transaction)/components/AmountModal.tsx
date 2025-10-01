import { UniversalButton } from '@/components/UniversalButton';
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import { MD3Theme, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

const getStyles = (theme: MD3Theme, safeAreaInsets: { top: number; bottom: number }) =>
  StyleSheet.create({
    modalContainer: {
      margin: 0,
      justifyContent: 'flex-end',
    },
    modalContent: {
      width: '100%',
      maxHeight: '90%',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      overflow: 'hidden',
      paddingTop: Platform.OS === 'ios' ? safeAreaInsets.top : 0,
      paddingBottom: Platform.OS === 'ios' ? safeAreaInsets.bottom : 0,
    },
    amountContainer: {
      paddingVertical: 32,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.elevation.level1,
    },
    keypadContainer: {
      paddingHorizontal: 24,
      paddingBottom: 8,
      backgroundColor: theme.colors.elevation.level1,
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
      justifyContent: 'space-evenly',
      paddingHorizontal: 24,
      paddingVertical: 24,
      paddingBottom: Platform.OS === 'ios' ? 40 : 32,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
      backgroundColor: theme.colors.elevation.level1,
      gap: 16,
    },
    cancelButton: {
      flex: 1,
      minHeight: 48,
    },
    enterButton: {
      flex: 1,
      minHeight: 48,
    },
  });

export default function AmountModal({
  isVisible,
  onClose,
  onSubmit,
  amount: initialAmount,
  setAmount: setParentAmount,
}: AmountProps) {
  const theme = useTheme();
  const safeAreaInsets = useSafeAreaInsets();
  const styles = getStyles(theme, safeAreaInsets);
  const [localAmount, setLocalAmount] = useState(initialAmount);

  // Reset local amount when modal becomes visible
  useEffect(() => {
    if (isVisible) {
      setLocalAmount(initialAmount);
    }
  }, [isVisible, initialAmount]);

  const handleKeyPress = (key: string) => {
    if (key === '⌫') {
      if (localAmount.length <= 1 || localAmount === '0') {
        setLocalAmount('0');
      } else {
        setLocalAmount(localAmount.slice(0, -1));
      }
      return;
    }

    if (key === '.') {
      if (localAmount.includes('.')) return; // Don't allow multiple decimal points
      setLocalAmount(localAmount + key);
      return;
    }

    // If there's a decimal point, check decimal places
    if (localAmount.includes('.')) {
      const decimalPlaces = localAmount.split('.')[1].length;
      if (decimalPlaces >= 2) return; // Don't allow more than 2 decimal places
    }

    if (localAmount === '0' && key !== '.') {
      setLocalAmount(key);
    } else {
      setLocalAmount(localAmount + key);
    }
  };

  const handleSubmit = () => {
    // Ensure we're sending a valid number string
    const finalAmount = localAmount === '0' ? '0' : localAmount;

    setParentAmount(finalAmount);
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
          <Price value={localAmount} symbolPosition="after" type="title" showDecimals={false} />
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
          <UniversalButton
            variant="ghost"
            size="large"
            onPress={onClose}
            icon={<IconSymbol name="close" size={20} color={theme.colors.onSurface} />}
            iconPosition="left"
            style={styles.cancelButton}

          >
            Cancel
          </UniversalButton>
          <UniversalButton
            variant="primary"
            size="large"
            onPress={handleSubmit}
            icon={<IconSymbol name="check" size={20} color={theme.colors.onPrimary} />}
            iconPosition="left"
            style={styles.enterButton}

          >
            Enter
          </UniversalButton>
        </ThemedView>
      </ThemedView>
    </Modal>
  );
}

import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, useTheme } from 'react-native-paper';

import Price from '@/components/Price';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { SafeAreaView } from 'react-native-safe-area-context';

const KEYPAD_LAYOUT = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', '⌫'],
];

export default function AmountModal() {
  const router = useRouter();
  const theme = useTheme();
  const [amount, setAmount] = useState('0');

  const handleKeyPress = (key: string) => {
    if (key === '⌫') {
      setAmount(prev => (prev.length > 1 ? prev.slice(0, -1) : '0'));
      return;
    }

    if (key === '.' && amount.includes('.')) return;

    setAmount(prev => {
      if (prev === '0' && key !== '.') return key;
      return prev + key;
    });
  };

  const handleSubmit = () => {
    // TODO: Handle amount submission
    console.log('Amount:', amount);
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ThemedView style={styles.mainContainer}>
        {/* Amount Display */}
        <ThemedView style={styles.amountContainer}>
          <Price value={Number(amount)} symbolPosition="after" type="title" />
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
                    <ThemedText style={styles.keypadText}>{key}</ThemedText>
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
            onPress={() => router.back()}
            icon={({ size, color }: { size: number; color: string }) => (
              <IconSymbol name="close" size={size} color={color} />
            )}
            textColor="white"
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
  },
  amountContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keypadContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  keypadButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  backspaceButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)', // red-500/10
  },
  decimalButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  keypadText: {
    fontSize: 30,
    color: 'white',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  enterButton: {
    paddingHorizontal: 24,
  },
});

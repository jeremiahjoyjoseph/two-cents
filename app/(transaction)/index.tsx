import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Button, Divider, TextInput, useTheme } from 'react-native-paper';

import Price from '@/components/Price';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AmountModal } from './components/amountModal';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  mainContainer: {
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleInput: {
    marginTop: 16,
    backgroundColor: 'transparent',
    fontWeight: 'bold',
    paddingHorizontal: 0,
    paddingBottom: 8,
  },
  bottomSection: {
    marginTop: 'auto',
    paddingTop: 16,
  },
  amountText: {
    fontWeight: 'bold',
    marginVertical: 16,
  },
  addButton: {
    marginTop: 16,
  },
  priceContainer: {
    marginVertical: 16,
  },
});

export default function Transaction() {
  const theme = useTheme();
  const router = useRouter();
  const [isModalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState('0');
  const [title, setTitle] = useState('');

  const handleSubmit = (amount: string) => {
    // TODO: Handle amount submission
    console.log('Amount:', amount);
    console.log('Title:', title);
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.mainContainer}>
          <TouchableOpacity
            style={[
              styles.closeButton,
              {
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.outline,
              },
            ]}
            onPress={() => router.back()}
          >
            <IconSymbol name="close" size={20} color={theme.colors.onSurface} />
          </TouchableOpacity>

          <TextInput
            mode="flat"
            label=""
            value={title}
            onChangeText={setTitle}
            style={styles.titleInput}
            placeholder="Enter expense title"
            underlineColor={theme.colors.outlineVariant}
            activeUnderlineColor={theme.colors.outlineVariant}
            contentStyle={{
              fontSize: 32,
              fontWeight: 'bold',
              paddingBottom: 8,
            }}
            placeholderTextColor={theme.colors.onSurfaceDisabled}
          />

          <ThemedView style={styles.bottomSection}>
            <Divider />
            <TouchableOpacity style={styles.priceContainer} onPress={() => setModalVisible(true)}>
              <Price value={parseFloat(amount)} type="title" style={styles.amountText} />
            </TouchableOpacity>
            <Button mode="contained" onPress={() => handleSubmit(amount)} style={styles.addButton}>
              Add
            </Button>
          </ThemedView>
        </ThemedView>
      </SafeAreaView>
      <AmountModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        amount={amount}
        setAmount={setAmount}
      />
    </>
  );
}

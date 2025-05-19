import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Button, Divider, TextInput, useTheme } from 'react-native-paper';

import Price from '@/components/Price';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AmountModal } from './components/AmountModal';
import { TransactionTypeModal } from './components/TransactionTypeModal';

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
  const [isTransactionTypeModalVisible, setTransactionTypeModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState<'income' | 'expense'>('expense');

  const handleSubmit = (amount: string) => {
    // TODO: Handle amount submission
    console.log('Amount:', amount);
    console.log('Title:', title);
  };

  const handleSetType = () => {
    // You can handle the selected type here (e.g., update form, etc.)
    setTransactionTypeModalVisible(false);
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.mainContainer}>
          <ThemedView
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
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

            <ThemedButton
              mode="outlined"
              icon={() => (
                <IconSymbol
                  name={
                    selectedType === 'income'
                      ? 'file-download'
                      : selectedType === 'expense'
                      ? 'file-upload'
                      : 'swap-horiz'
                  }
                  size={24}
                  color={theme.colors.onSurface}
                />
              )}
              onPress={() => setTransactionTypeModalVisible(true)}
              style={{
                borderRadius: 30,
                backgroundColor: theme.colors.background,
              }}
            >
              {selectedType === 'income'
                ? 'Income'
                : selectedType === 'expense'
                ? 'Expense'
                : 'Transfer'}
            </ThemedButton>
          </ThemedView>

          <TextInput
            mode="flat"
            label=""
            value={title}
            onChangeText={setTitle}
            style={styles.titleInput}
            placeholder={
              selectedType === 'income'
                ? 'Enter income title'
                : selectedType === 'expense'
                ? 'Enter expense title'
                : 'Enter transfer title'
            }
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
      <TransactionTypeModal
        isVisible={isTransactionTypeModalVisible}
        onClose={() => setTransactionTypeModalVisible(false)}
        selectedType={selectedType}
        onSelectType={setSelectedType}
        onSet={handleSetType}
      />
    </>
  );
}

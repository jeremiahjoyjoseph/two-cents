import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Button, TextInput, useTheme } from 'react-native-paper';

import Price from '@/components/Price';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { addTransaction, deleteTransaction, updateTransaction } from '@/lib/api/transactions';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AmountModal from './components/AmountModal';
import TransactionTypeModal, { TransactionType } from './components/TransactionTypeModal';

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
    marginTop: 32,
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
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default function Transaction() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const [isModalVisible, setModalVisible] = useState(true);
  const [amount, setAmount] = useState(params.amount?.toString() || '0');
  const [title, setTitle] = useState(params.title?.toString() || '');
  const [isTransactionTypeModalVisible, setTransactionTypeModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState<TransactionType>(
    (params.type as TransactionType) || 'expense'
  );
  const [transactionId, setTransactionId] = useState<string | null>(params.id?.toString() || null);

  useEffect(() => {
    // Only set initial values if they exist and haven't been set yet
    if (params.amount && !amount) {
      setAmount(params.amount.toString());
    }
    if (params.title && !title) {
      setTitle(params.title.toString());
    }
    if (params.type && selectedType === 'expense') {
      setSelectedType(params.type as TransactionType);
    }
    if (params.id && !transactionId) {
      setTransactionId(params.id.toString());
    }
  }, []); // Empty dependency array means this only runs once on mount

  const handleSubmit = async (amount: string) => {
    if (!user) {
      console.log('No user logged in');
      return;
    }

    const transaction = {
      type: selectedType,
      amount: parseFloat(amount),
      title: title,
      date: new Date().toISOString(),
      createdBy: user.uid,
    };

    const groupId = user?.linkedGroupId || null;
    console.log('[fetchData] Group ID:', groupId);

    try {
      if (transactionId) {
        await updateTransaction(user.uid, user.linkedGroupId || null, transactionId, transaction);
      } else {
        await addTransaction(user.uid, user.linkedGroupId || null, transaction);
      }
      router.dismiss();
    } catch (error) {
      console.error('Error saving transaction:', error);
      // Handle error (show error message to user etc)
    }
  };

  const handleSetType = () => {
    // You can handle the selected type here (e.g., update form, etc.)
    setTransactionTypeModalVisible(false);
  };

  const handleDelete = async () => {
    if (!user || !transactionId) {
      console.log('No user logged in or no transaction ID');
      return;
    }
    await deleteTransaction(user.uid, user.linkedGroupId || null, transactionId);
    router.dismiss();
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.mainContainer}>
          <ThemedView style={styles.typeRow}>
            <TouchableOpacity
              style={[
                styles.closeButton,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.outline,
                },
              ]}
              onPress={() => router.dismiss()}
            >
              <IconSymbol name="close" size={20} color={theme.colors.onSurface} />
            </TouchableOpacity>

            <ThemedView style={styles.typeRow}>
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
              <TouchableOpacity style={[styles.deleteButton]} onPress={handleDelete}>
                <IconSymbol name="delete" size={24} color={theme.colors.error} />
              </TouchableOpacity>
            </ThemedView>
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
            <TouchableOpacity style={styles.priceContainer} onPress={() => setModalVisible(true)}>
              <Price value={parseFloat(amount)} type="title" style={styles.amountText} />
            </TouchableOpacity>
            <Button mode="contained" onPress={() => handleSubmit(amount)} style={styles.addButton}>
              Submit
            </Button>
          </ThemedView>
        </ThemedView>
      </SafeAreaView>
      <AmountModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
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

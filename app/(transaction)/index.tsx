import React, { useCallback, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, TextInput, useTheme } from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';

import Price from '@/components/Price';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedText } from '@/components/ThemedText';
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
  datePickerButton: {
    paddingVertical: 12,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  datePickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default function Transaction() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user, getEncryptionKey } = useAuth();
  const [isModalVisible, setModalVisible] = useState(!params.id);
  const [amount, setAmount] = useState(params.amount?.toString() || '0');
  const [title, setTitle] = useState(params.title?.toString() || '');
  const [isTransactionTypeModalVisible, setTransactionTypeModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState<TransactionType>(
    (params.type as TransactionType) || 'expense'
  );
  const [transactionId, setTransactionId] = useState<string | null>(params.id?.toString() || null);
  const [date, setDate] = useState<string>(() => {
    if (params.date?.toString()) {
      // If editing existing transaction, parse the date properly
      const existingDate = new Date(params.date.toString());
      const year = existingDate.getFullYear();
      const month = String(existingDate.getMonth() + 1).padStart(2, '0');
      const day = String(existingDate.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } else {
      // For new transactions, use today's date in timezone-neutral format
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  });

  const [open, setOpen] = useState(false);

  const onDismissSingle = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const onConfirmSingle = useCallback(
    (params: { date: Date | undefined }) => {
      setOpen(false);
      if (params.date) {
        // Store date in timezone-neutral format (YYYY-MM-DD)
        const year = params.date.getFullYear();
        const month = String(params.date.getMonth() + 1).padStart(2, '0');
        const day = String(params.date.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        setDate(dateString);
      }
    },
    [setOpen, setDate]
  );

  const getFormattedDate = (dateString: string) => {
    // Parse the date string (could be YYYY-MM-DD or ISO string)
    const dateObj = new Date(dateString);
    const today = new Date();

    // Compare dates by their date parts only (ignoring time)
    const isToday =
      dateObj.getFullYear() === today.getFullYear() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getDate() === today.getDate();

    if (isToday) {
      return 'Today';
    }
    return dateObj.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleSubmit = async (amount: string) => {
    if (!user) {
      console.log('No user logged in');
      return;
    }

    try {
      // Get encryption key from AuthContext
      const encryptionKey = await getEncryptionKey();
      if (!encryptionKey) {
        console.error('No encryption key available');
        return;
      }

      const transaction = {
        type: selectedType,
        amount: parseFloat(amount),
        title: title,
        date: date,
        createdBy: user.uid,
        groupId: user.linkedGroupId || null,
      };

      const groupId = user?.linkedGroupId || null;
      console.log('[fetchData] Group ID:', groupId);

      if (transactionId) {
        await updateTransaction(
          user.uid,
          user.linkedGroupId || null,
          transactionId,
          transaction,
          encryptionKey
        );
      } else {
        await addTransaction(user.uid, user.linkedGroupId || null, transaction, encryptionKey);
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

          <TouchableOpacity onPress={() => setOpen(true)} style={styles.datePickerButton}>
            <View style={styles.datePickerContent}>
              <IconSymbol name="calendar-today" size={24} color={theme.colors.primary} />
              <ThemedText style={styles.dateText}>{getFormattedDate(date)}</ThemedText>
            </View>
          </TouchableOpacity>

          <ThemedView style={styles.bottomSection}>
            <TouchableOpacity style={styles.priceContainer} onPress={() => setModalVisible(true)}>
              <Price value={parseFloat(amount)} type="title" style={styles.amountText} />
            </TouchableOpacity>
            <Button mode="contained" onPress={() => handleSubmit(amount)} style={styles.addButton}>
              {transactionId ? 'Save' : 'Submit'}
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
      <DatePickerModal
        locale="en"
        mode="single"
        visible={open}
        onDismiss={onDismissSingle}
        date={new Date(date + 'T00:00:00')}
        onConfirm={onConfirmSingle}
      />
    </>
  );
}

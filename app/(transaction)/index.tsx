import { UniversalButton } from '@/components/UniversalButton';
import React, { useCallback, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';

import CategoryPickerModal from '@/components/CategoryPickerModal';
import { CreateCategoryModal } from '@/components/CreateCategoryModal';
import Price from '@/components/Price';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { addTransaction, deleteTransaction, updateTransaction } from '@/lib/api/transactions';
import { useCategories } from '@/lib/hooks/useCategories';
import { Category } from '@/types/category';
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
  categoryButton: {
    paddingVertical: 12,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  categoryText: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
});

export default function Transaction() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user, getEncryptionKey, getGroupEncryptionKey } = useAuth();
  const [isModalVisible, setModalVisible] = useState(!params.id);
  const [hasUserEnteredAmount, setHasUserEnteredAmount] = useState(false);
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
  
  // Category selection state
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(() => {
    if (params.categoryName && params.categoryIcon && params.categoryColor) {
      return {
        id: params.categoryId?.toString() || '',
        name: params.categoryName.toString(),
        icon: params.categoryIcon.toString(),
        color: params.categoryColor.toString(),
      };
    }
    return null;
  });
  const [isCategoryPickerVisible, setIsCategoryPickerVisible] = useState(false);
  const [isCreateCategoryVisible, setIsCreateCategoryVisible] = useState(false);
  const [userDismissedCategoryPicker, setUserDismissedCategoryPicker] = useState(false);

  
  // Get categories from hook
  const { categories, createCategory, updateCategory, deleteCategory } = useCategories(user?.uid || '', user?.linkedGroupId);
  
  // Update selected category if it was updated
  React.useEffect(() => {
    if (selectedCategory && categories.length > 0) {
      // First, try to find the category by ID
      let updatedCategory = categories.find(cat => cat.id === selectedCategory.id);
      
      // If not found by ID, it might be a default category that was edited
      // Look for a custom category with the same name
      if (!updatedCategory && selectedCategory.name) {
        updatedCategory = categories.find(cat => 
          cat.name === selectedCategory.name && 
          cat.isCustom === true
        );
      }
      
      if (updatedCategory && (
        updatedCategory.name !== selectedCategory.name ||
        updatedCategory.icon !== selectedCategory.icon ||
        updatedCategory.color !== selectedCategory.color
      )) {
        setSelectedCategory(updatedCategory);
      }
    }
  }, [categories, selectedCategory]);

  // Clear selected category if it was deleted
  React.useEffect(() => {
    if (selectedCategory && selectedCategory.id && categories.length > 0) {
      const categoryStillExists = categories.find(cat => cat.id === selectedCategory.id);
      if (!categoryStillExists) {
        console.log('Selected category was deleted, clearing selection');
        setSelectedCategory(null);
      }
    }
  }, [categories, selectedCategory]);
  
  // Auto-popup category selection when amount is entered
  React.useEffect(() => {
    const amountValue = parseFloat(amount);
    
    // Only auto-open if amount is valid, no category selected, amount modal is closed, user has entered amount, and user hasn't manually dismissed the picker
    if (amountValue > 0 && 
        !selectedCategory && 
        !isCategoryPickerVisible && 
        !isCreateCategoryVisible &&
        !isModalVisible &&
        hasUserEnteredAmount &&
        !userDismissedCategoryPicker) {
      // Small delay to ensure amount modal is closed first
      const timer = setTimeout(() => {
        setIsCategoryPickerVisible(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [amount, selectedCategory, isCategoryPickerVisible, isCreateCategoryVisible, isModalVisible, hasUserEnteredAmount, userDismissedCategoryPicker]);

  // Reset the dismissed flag when amount changes
  React.useEffect(() => {
    setUserDismissedCategoryPicker(false);
  }, [amount]);

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
      // Get encryption keys from AuthContext
      const personalKey = await getEncryptionKey();
      const groupKey = user.linkedGroupId ? await getGroupEncryptionKey() : null;

      if (!personalKey && !groupKey) {
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
        // Include category information if selected
        categoryId: selectedCategory?.id,
        categoryName: selectedCategory?.name,
        categoryIcon: selectedCategory?.icon,
        categoryColor: selectedCategory?.color,
      };

      const groupId = user?.linkedGroupId || null;
      console.log('[fetchData] Group ID:', groupId);

      if (transactionId) {
        await updateTransaction(
          user.uid,
          user.linkedGroupId || null,
          transactionId,
          transaction,
          personalKey,
          groupKey
        );
      } else {
        await addTransaction(
          user.uid,
          user.linkedGroupId || null,
          transaction,
          personalKey,
          groupKey
        );
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
              <UniversalButton
                variant="surface"
                size="medium"
                onPress={() => setTransactionTypeModalVisible(true)}
                style={{
                  borderRadius: 30,
                }}
              >
                {selectedType === 'income'
                  ? 'Income'
                  : selectedType === 'expense'
                  ? 'Expense'
                  : 'Transfer'}
              </UniversalButton>
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

          {/* Category Selection */}
          <TouchableOpacity 
            onPress={() => setIsCategoryPickerVisible(true)} 
            style={styles.categoryButton}
          >
            <View style={styles.categoryContent}>
              <IconSymbol 
                name={selectedCategory ? selectedCategory.icon as any : 'category'} 
                size={24} 
                color={selectedCategory ? selectedCategory.color : theme.colors.primary} 
              />
              <ThemedText style={styles.categoryText}>
                {selectedCategory ? selectedCategory.name : 'Select Category'}
              </ThemedText>
            </View>
          </TouchableOpacity>

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
            <UniversalButton 
              variant="primary" 
              size="large" 
              onPress={() => handleSubmit(amount)} 
              style={styles.addButton}
              fullWidth
            >
              {transactionId ? 'Save' : 'Submit'}
            </UniversalButton>
          </ThemedView>
        </ThemedView>
      </SafeAreaView>
      <AmountModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        amount={amount}
        setAmount={(newAmount) => {
          setAmount(newAmount);
          setHasUserEnteredAmount(true);
        }}
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
      <CategoryPickerModal
        visible={isCategoryPickerVisible}
        onClose={() => {
          setIsCategoryPickerVisible(false);
          setUserDismissedCategoryPicker(true);
        }}
        onSelectCategory={(category) => {
          setSelectedCategory(category);
          setUserDismissedCategoryPicker(false); // Reset flag when category is selected
        }}
        categories={categories}
        onCreateCustom={() => {
          // Close category picker first
          setIsCategoryPickerVisible(false);
          // Use a longer delay to ensure the first modal is fully closed
          setTimeout(() => {
            setIsCreateCategoryVisible(true);
          }, 500);
        }}
        onUpdateCategory={updateCategory}
        onDeleteCategory={deleteCategory}
        onCategoriesUpdated={() => {
          // Categories will automatically refresh due to the real-time listener
          console.log('Categories updated - listener will handle refresh');
          console.log('Current categories:', categories);
          console.log('Selected category:', selectedCategory);
        }}
        currentSelectedCategory={selectedCategory}
      />
      <CreateCategoryModal
        visible={isCreateCategoryVisible}
        onClose={() => setIsCreateCategoryVisible(false)}
        onCreateCategory={createCategory}
      />
    </>
  );
}

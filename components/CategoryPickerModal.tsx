import { useTheme } from '@/constants/theme';
import { Category } from '@/types/category';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CategoryBadge } from './CategoryBadge';
import { ThemedText } from './ThemedText';
import { UniversalButton } from './UniversalButton';
import { IconSymbol } from './ui/IconSymbol';

type CategoryPickerModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelectCategory: (category: Category) => void;
  categories: Category[];
  onCreateCustom: () => void;
};

export const CategoryPickerModal = ({
  visible,
  onClose,
  onSelectCategory,
  categories,
  onCreateCustom,
}: CategoryPickerModalProps) => {
  const theme = useTheme();
  const safeAreaInsets = useSafeAreaInsets();
  const styles = getStyles(theme, safeAreaInsets);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category);
  };

  const handleConfirm = () => {
    if (selectedCategory) {
      onSelectCategory(selectedCategory);
      onClose();
    } else {
      Alert.alert('Please select a category', 'You need to select a category before continuing.');
    }
  };

  const handleCreateCustom = () => {
    onCreateCustom();
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={styles.modalContainer}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.5}
      useNativeDriver={true}
    >
      <View style={[styles.modalContent, { backgroundColor: theme.colors.elevation.level3 }]}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Select Category
          </ThemedText>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <IconSymbol name="close" size={24} color={theme.colors.onSurface} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryItem,
                  selectedCategory?.id === category.id && styles.selectedCategory,
                ]}
                onPress={() => handleSelectCategory(category)}
              >
                <CategoryBadge
                  categoryName={category.name}
                  categoryIcon={category.icon}
                  categoryColor={category.color}
                  size="medium"
                  showName={true}
                />
                {selectedCategory?.id === category.id && (
                  <View style={styles.checkmark}>
                    <IconSymbol name="check" size={16} color={theme.colors.primary} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.createCustomButton}
            onPress={handleCreateCustom}
          >
            <IconSymbol name="add" size={20} color={theme.colors.primary} />
            <ThemedText type="defaultSemiBold" style={styles.createCustomText}>
              Create Custom Category
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.footer}>
          <UniversalButton
            variant="primary"
            size="large"
            onPress={handleConfirm}
            disabled={!selectedCategory}
            style={styles.confirmButton}
          >
            Confirm
          </UniversalButton>
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (theme: any, safeAreaInsets: { top: number; bottom: number }) => StyleSheet.create({
  modalContainer: {
    margin: 0,
    justifyContent: 'flex-end',
    paddingHorizontal: 0,
  },
  modalContent: {
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    height: '80%',
    paddingBottom: Platform.OS === 'ios' ? safeAreaInsets.bottom : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  categoryItem: {
    width: '48%',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    backgroundColor: theme.colors.surface,
  },
  selectedCategory: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryContainer,
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createCustomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginVertical: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
    backgroundColor: theme.colors.surface,
  },
  createCustomText: {
    marginLeft: 8,
    color: theme.colors.primary,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 32,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
  },
  confirmButton: {
    width: '100%',
    minHeight: 48,
  },
});

import { CreateCategoryModal } from '@/components/CreateCategoryModal';
import { ThemedView } from '@/components/ThemedView';
import { UniversalButton } from '@/components/UniversalButton';
import { IconSymbol } from '@/components/ui/IconSymbol';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import { useTheme } from 'react-native-paper';

interface CategoryPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectCategory: (category: any) => void;
  categories: any[];
  onCreateCustom: () => void;
  onUpdateCategory?: (categoryId: string, updatedCategory: any) => Promise<void>;
  onCategoriesUpdated?: () => void;
  currentSelectedCategory?: any;
}

export default function CategoryPickerModal({
  visible,
  onClose,
  onSelectCategory,
  categories,
  onCreateCustom,
  onUpdateCategory,
  onCategoriesUpdated,
  currentSelectedCategory,
}: CategoryPickerModalProps) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  const handleCategorySelect = (category: any) => {
    setSelectedCategory(category);
  };

  const handleConfirmSelection = () => {
    if (selectedCategory) {
      onSelectCategory(selectedCategory);
      onClose();
    }
  };

  const handleCancel = () => {
    setSelectedCategory(null);
    onClose();
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setEditModalVisible(true);
  };

  const handleUpdateCategory = async (updatedCategory: any) => {
    if (onUpdateCategory && editingCategory) {
      await onUpdateCategory(editingCategory.id, updatedCategory);
      // Notify parent component to refresh categories
      if (onCategoriesUpdated) {
        onCategoriesUpdated();
      }
    }
    setEditModalVisible(false);
    setEditingCategory(null);
  };

  const handleCloseEditModal = () => {
    setEditModalVisible(false);
    setEditingCategory(null);
  };

  // Auto-highlight current selected category when modal opens
  React.useEffect(() => {
    if (visible) {
      setSelectedCategory(currentSelectedCategory || null);
    }
  }, [visible, currentSelectedCategory]);

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={styles.modal}
      backdropColor={theme.colors.background}
      backdropOpacity={0.8}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      useNativeDriver
    >
      <ThemedView style={[styles.container, { backgroundColor: theme.colors.elevation.level1 }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            Select Category
          </Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={onCreateCustom}
          >
            <IconSymbol name="add" size={20} color={theme.colors.onPrimary} />
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Category Options */}
          {categories.map((category) => (
            <View
              key={category.id}
              style={[
                styles.categoryItem,
                {
                  backgroundColor: selectedCategory?.id === category.id 
                    ? theme.colors.primaryContainer + '40' // More subtle with 40% opacity
                    : theme.colors.surfaceVariant,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.categoryContent}
                onPress={() => handleCategorySelect(category)}
              >
                <View style={[
                  styles.categoryIcon,
                  {
                    backgroundColor: category.color,
                  },
                ]}>
                  <IconSymbol 
                    name={category.icon as any} 
                    size={20} 
                    color="#FFFFFF" 
                  />
                </View>
                <Text style={[
                  styles.categoryName,
                  {
                    color: theme.colors.onSurfaceVariant,
                  },
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
              
              {/* Edit Button */}
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEditCategory(category)}
              >
                <IconSymbol 
                  name="edit" 
                  size={18} 
                  color={theme.colors.onSurfaceVariant} 
                />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.footer}>
          <UniversalButton
            variant="ghost"
            size="large"
            onPress={handleCancel}
            icon={<IconSymbol name="close" size={20} color={theme.colors.onSurface} />}
            iconPosition="left"
            style={styles.cancelButton}
          >
            Cancel
          </UniversalButton>
          <UniversalButton
            variant="primary"
            size="large"
            onPress={handleConfirmSelection}
            disabled={!selectedCategory}
            icon={<IconSymbol name="check" size={20} color={theme.colors.onPrimary} />}
            iconPosition="left"
            style={styles.confirmButton}
          >
            Select
          </UniversalButton>
        </View>
      </ThemedView>

      {/* Edit Category Modal */}
      <CreateCategoryModal
        visible={editModalVisible}
        onClose={handleCloseEditModal}
        onCreateCategory={async (categoryData) => {
          // This should not be called when editing, but keeping for safety
          console.warn('CreateCategory called in edit mode');
        }}
        onUpdateCategory={async (categoryId, categoryData) => {
          if (onUpdateCategory) {
            await onUpdateCategory(categoryId, categoryData);
            // Notify parent component to refresh categories
            if (onCategoriesUpdated) {
              onCategoriesUpdated();
            }
          }
          setEditModalVisible(false);
          setEditingCategory(null);
        }}
        editingCategory={editingCategory}
      />
    </Modal>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  container: {
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  scrollView: {
    maxHeight: 400,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    borderRadius: 12,
  },
  editButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
    backgroundColor: theme.colors.elevation.level1,
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    minHeight: 48,
  },
  confirmButton: {
    flex: 1,
    minHeight: 48,
  },
});
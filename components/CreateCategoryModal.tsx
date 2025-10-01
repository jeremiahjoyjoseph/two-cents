import { CATEGORY_COLOR_OPTIONS, CATEGORY_ICON_OPTIONS } from '@/constants/categories';
import { useTheme } from '@/constants/theme';
import { Category } from '@/types/category';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { UniversalButton } from './UniversalButton';
import { IconSymbol } from './ui/IconSymbol';

type CreateCategoryModalProps = {
  visible: boolean;
  onClose: () => void;
  onCreateCategory: (category: Omit<Category, 'id'>) => Promise<void>;
};

export const CreateCategoryModal = ({
  visible,
  onClose,
  onCreateCategory,
}: CreateCategoryModalProps) => {
  const theme = useTheme();
  const safeAreaInsets = useSafeAreaInsets();
  const styles = getStyles(theme, safeAreaInsets);
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(CATEGORY_ICON_OPTIONS[0]);
  const [selectedColor, setSelectedColor] = useState(CATEGORY_COLOR_OPTIONS[0]);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a category name.');
      return;
    }

    if (name.trim().length < 2) {
      Alert.alert('Error', 'Category name must be at least 2 characters long.');
      return;
    }

    setIsCreating(true);
    try {
      await onCreateCategory({
        name: name.trim(),
        icon: selectedIcon,
        color: selectedColor,
      });
      
      // Reset form
      setName('');
      setSelectedIcon(CATEGORY_ICON_OPTIONS[0]);
      setSelectedColor(CATEGORY_COLOR_OPTIONS[0]);
      onClose();
    } catch (err) {
      console.error('Failed to create category:', err);
      Alert.alert('Error', 'Failed to create category. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setName('');
    setSelectedIcon(CATEGORY_ICON_OPTIONS[0]);
    setSelectedColor(CATEGORY_COLOR_OPTIONS[0]);
    onClose();
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={handleClose}
      onBackButtonPress={handleClose}
      style={[styles.modalContainer, { zIndex: 1000 }]}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.5}
      useNativeDriver={true}
    >
      <ThemedView style={[styles.modalContent, { backgroundColor: theme.colors.elevation.level3 }]}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Create Custom Category
          </ThemedText>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <IconSymbol name="close" size={24} color={theme.colors.onSurface} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Category Name Input */}
          <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Category Name
            </ThemedText>
            <TextInput
              style={[styles.input, { 
                borderColor: theme.colors.outline,
                color: theme.colors.onSurface,
                backgroundColor: theme.colors.surface 
              }]}
              value={name}
              onChangeText={setName}
              placeholder="Enter category name"
              placeholderTextColor={theme.colors.onSurface + '80'}
              maxLength={30}
            />
          </View>

          {/* Icon Selection */}
          <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Choose Icon
            </ThemedText>
            <View style={styles.iconsGrid}>
              {CATEGORY_ICON_OPTIONS.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.iconOption,
                    selectedIcon === icon && styles.selectedIconOption,
                    { borderColor: selectedIcon === icon ? selectedColor : theme.colors.outline }
                  ]}
                  onPress={() => setSelectedIcon(icon)}
                >
                  <IconSymbol 
                    name={icon as any} 
                    size={24} 
                    color={selectedIcon === icon ? selectedColor : theme.colors.onSurface} 
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Color Selection */}
          <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Choose Color
            </ThemedText>
            <View style={styles.colorsGrid}>
              {CATEGORY_COLOR_OPTIONS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.selectedColorOption,
                  ]}
                  onPress={() => setSelectedColor(color)}
                >
                  {selectedColor === color && (
                    <IconSymbol name="check" size={16} color={theme.colors.onSurface} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Preview */}
          <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Preview
            </ThemedText>
            <View style={styles.preview}>
              <View style={[styles.previewIcon, { backgroundColor: `${selectedColor}20` }]}>
                <IconSymbol name={selectedIcon as any} size={24} color={selectedColor} />
              </View>
              <ThemedText type="defaultSemiBold" style={styles.previewText}>
                {name || 'Category Name'}
              </ThemedText>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <UniversalButton
            variant="outline"
            size="large"
            onPress={handleClose}
            style={styles.cancelButton}
          >
            Cancel
          </UniversalButton>
          <UniversalButton
            variant="primary"
            size="large"
            onPress={handleCreate}
            disabled={!name.trim() || isCreating}
            loading={isCreating}
            style={styles.createButton}
          >
            {isCreating ? "Creating..." : "Create Category"}
          </UniversalButton>
        </View>
      </ThemedView>
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
    height: '85%',

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
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: theme.colors.onSurface,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: theme.colors.surface,
    color: theme.colors.onSurface,
  },
  iconsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: theme.colors.surface,
  },
  selectedIconOption: {
    backgroundColor: theme.colors.primaryContainer,
  },
  colorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColorOption: {
    borderColor: theme.colors.onSurface,
    borderWidth: 3,
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  previewIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  previewText: {
    fontSize: 16,
    color: theme.colors.onSurface,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 32,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    minHeight: 48,
  },
  createButton: {
    flex: 1,
    minHeight: 48,
  },
});

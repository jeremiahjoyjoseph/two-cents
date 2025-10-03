import { CATEGORY_COLOR_OPTIONS, CATEGORY_ICON_OPTIONS } from '@/constants/categories';
import { useTheme } from '@/constants/theme';
import { Category } from '@/types/category';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Modal from 'react-native-modal';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { UniversalButton } from './UniversalButton';
import { IconSymbol } from './ui/IconSymbol';

type CreateCategoryModalProps = {
  visible: boolean;
  onClose: () => void;
  onCreateCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  editingCategory?: Category | null;
  onUpdateCategory?: (categoryId: string, category: Omit<Category, 'id'>) => Promise<void>;
};

export const CreateCategoryModal = ({
  visible,
  onClose,
  onCreateCategory,
  editingCategory,
  onUpdateCategory,
}: CreateCategoryModalProps) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(CATEGORY_ICON_OPTIONS[0]);
  const [selectedColor, setSelectedColor] = useState(CATEGORY_COLOR_OPTIONS[0]);
  const [isCreating, setIsCreating] = useState(false);

  // Initialize form with editing category data
  React.useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
      setSelectedIcon(editingCategory.icon);
      setSelectedColor(editingCategory.color);
    } else {
      setName('');
      setSelectedIcon(CATEGORY_ICON_OPTIONS[0]);
      setSelectedColor(CATEGORY_COLOR_OPTIONS[0]);
    }
  }, [editingCategory, visible]);

  // Function to determine if a color is light or dark
  const isLightColor = (color: string) => {
    // Remove # if present
    const hex = color.replace('#', '');
    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  };

  // Accessibility labels for icons
  const getIconLabel = (icon: string) => {
    const labels: { [key: string]: string } = {
      'home': 'Rent / Housing',
      'local-grocery-store': 'Groceries',
      'restaurant': 'Food / Dining',
      'commute': 'Travel / Fuel',
      'shopping-bag': 'Shopping',
      'payments': 'Loan / EMI / Bills',
      'pets': 'Pets / Misc',
      'favorite': 'Self-care / Luxuries',
      'medical-services': 'Health',
      'savings': 'Income / Savings',
      'subscriptions': 'Subscriptions / OTT',
      'category': 'Catch-all / Other',
    };
    return labels[icon] || icon;
  };

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
      const categoryData = {
        name: name.trim(),
        icon: selectedIcon,
        color: selectedColor,
      };

      if (editingCategory && onUpdateCategory) {
        // Update existing category
        await onUpdateCategory(editingCategory.id, categoryData);
      } else {
        // Create new category
        await onCreateCategory(categoryData);
      }
      
      // Reset form
      setName('');
      setSelectedIcon(CATEGORY_ICON_OPTIONS[0]);
      setSelectedColor(CATEGORY_COLOR_OPTIONS[0]);
      onClose();
    } catch (err) {
      console.error('Failed to save category:', err);
      Alert.alert('Error', 'Failed to save category. Please try again.');
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
            {editingCategory ? 'Edit Category' : 'Create Custom Category'}
          </ThemedText>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <IconSymbol name="close" size={24} color={theme.colors.onSurface} />
          </TouchableOpacity>
        </View>

        {/* Sticky Preview Section */}
        <View style={[styles.stickyPreview, { 
          backgroundColor: theme.colors.elevation.level3,
          borderBottomColor: theme.colors.outline 
        }]}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Preview
          </ThemedText>
          <View style={styles.preview}>
            <View style={[styles.previewIcon, { backgroundColor: `${selectedColor}30` }]}>
              <IconSymbol name={selectedIcon as any} size={24} color={selectedColor} />
            </View>
            <ThemedText type="defaultSemiBold" style={styles.previewText}>
              {name || 'Category Name'}
            </ThemedText>
          </View>
        </View>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
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
                  accessibilityLabel={getIconLabel(icon)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: selectedIcon === icon }}
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
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.colorsScrollContainer}
            >
              {CATEGORY_COLOR_OPTIONS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.selectedColorOption,
                  ]}
                  onPress={() => setSelectedColor(color)}
                  accessibilityLabel={`Color ${color}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: selectedColor === color }}
                >
                  {selectedColor === color && (
                    <View style={[
                      styles.selectionIndicator,
                      { 
                        backgroundColor: isLightColor(color) ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)',
                        borderColor: isLightColor(color) ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)'
                      }
                    ]}>
                      <IconSymbol 
                        name="check" 
                        size={20} 
                        color={isLightColor(color) ? 'white' : 'black'} 
                      />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
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
            {isCreating 
              ? (editingCategory ? "Updating..." : "Creating...") 
              : (editingCategory ? "Update Category" : "Create Category")
            }
          </UniversalButton>
        </View>
      </ThemedView>
    </Modal>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  modalContainer: {
    margin: 0,
    justifyContent: 'flex-end',
    paddingHorizontal: 0,
    paddingBottom: 0,
  },
  modalContent: {
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    height: '90%',
    maxHeight: '95%',
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
  stickyPreview: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingBottom: 48, // Increased padding to ensure all content is visible
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
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
    justifyContent: 'flex-start',
    gap: 12,
    paddingHorizontal: 4,
    minHeight: 120, // Adjusted height for 2x circular icons
  },
  iconOption: {
    width: 48, // 2x bigger
    height: 48, // 2x bigger
    borderRadius: 24, // Perfect circle
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: theme.colors.surface,
  },
  selectedIconOption: {
    backgroundColor: theme.colors.primaryContainer,
  },
  colorsScrollContainer: {
    flexDirection: 'row',
    paddingHorizontal: 4,
    gap: 16,
  },
  colorOption: {
    width: 48, // 2x bigger (24 * 2)
    height: 48, // 2x bigger (24 * 2)
    borderRadius: 24, // Perfect circle
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColorOption: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectionIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
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
    justifyContent: 'space-evenly',
    paddingHorizontal: 24,
    paddingVertical: 32,
    paddingBottom: 60,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
    backgroundColor: theme.colors.elevation.level1,
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

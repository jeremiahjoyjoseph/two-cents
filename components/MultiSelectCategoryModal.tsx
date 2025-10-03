import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import { Button, useTheme } from 'react-native-paper';

interface MultiSelectCategoryModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedCategoryIds: string[];
  onCategorySelect: (categoryIds: string[]) => void;
  categories: any[];
}

export default function MultiSelectCategoryModal({
  isVisible,
  onClose,
  selectedCategoryIds,
  onCategorySelect,
  categories,
}: MultiSelectCategoryModalProps) {
  const theme = useTheme();
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>(selectedCategoryIds);

  // Sync local state with parent when modal opens
  useEffect(() => {
    if (isVisible) {
      setLocalSelectedIds(selectedCategoryIds);
    }
  }, [isVisible, selectedCategoryIds]);

  const handleCategoryToggle = (categoryId: string) => {
    setLocalSelectedIds(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleSelectAll = () => {
    setLocalSelectedIds([]);
  };

  const handleApply = () => {
    onCategorySelect(localSelectedIds);
    onClose();
  };

  const handleClear = () => {
    setLocalSelectedIds([]);
  };

  return (
    <Modal
      isVisible={isVisible}
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
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            Select Categories
          </Text>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClear}
          >
            <Text style={[styles.clearButtonText, { color: theme.colors.primary }]}>
              Clear
            </Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* All Categories Option */}
          <TouchableOpacity
            style={[
              styles.categoryItem,
              {
                backgroundColor: localSelectedIds.length === 0 
                  ? theme.colors.primary 
                  : theme.colors.surfaceVariant,
              },
            ]}
            onPress={handleSelectAll}
          >
            <View style={styles.categoryContent}>
              <View style={[
                styles.categoryIcon,
                {
                  backgroundColor: localSelectedIds.length === 0 
                    ? theme.colors.onPrimary 
                    : theme.colors.onSurfaceVariant,
                },
              ]}>
                <IconSymbol 
                  name="category" 
                  size={20} 
                  color={localSelectedIds.length === 0 ? theme.colors.primary : theme.colors.onSurfaceVariant} 
                />
              </View>
              <Text style={[
                styles.categoryName,
                {
                  color: localSelectedIds.length === 0 
                    ? theme.colors.onPrimary 
                    : theme.colors.onSurfaceVariant,
                },
              ]}>
                All Categories
              </Text>
            </View>
            {localSelectedIds.length === 0 && (
              <IconSymbol name="check" size={20} color={theme.colors.onPrimary} />
            )}
          </TouchableOpacity>

          {/* Category Options */}
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryItem,
                {
                  backgroundColor: localSelectedIds.includes(category.id) 
                    ? theme.colors.primary 
                    : theme.colors.surfaceVariant,
                },
              ]}
              onPress={() => handleCategoryToggle(category.id)}
            >
              <View style={styles.categoryContent}>
                <View style={[
                  styles.categoryIcon,
                  {
                    backgroundColor: localSelectedIds.includes(category.id) 
                      ? theme.colors.onPrimary 
                      : category.color,
                  },
                ]}>
                  <IconSymbol 
                    name={category.icon as any} 
                    size={20} 
                    color={localSelectedIds.includes(category.id) ? theme.colors.primary : '#FFFFFF'} 
                  />
                </View>
                <Text style={[
                  styles.categoryName,
                  {
                    color: localSelectedIds.includes(category.id) 
                      ? theme.colors.onPrimary 
                      : theme.colors.onSurfaceVariant,
                  },
                ]}>
                  {category.name}
                </Text>
              </View>
              {localSelectedIds.includes(category.id) && (
                <IconSymbol name="check" size={20} color={theme.colors.onPrimary} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <Button
            mode="text"
            onPress={onClose}
            icon={({ size, color }: { size: number; color: string }) => (
              <IconSymbol name="close" size={size} color={color} />
            )}
            textColor={theme.colors.onSurface}
            style={styles.cancelButton}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleApply}
            icon={({ size, color }: { size: number; color: string }) => (
              <IconSymbol name="check" size={size} color={color} />
            )}
            buttonColor={theme.colors.primary}
            style={styles.applyButton}
          >
            Apply
          </Button>
        </View>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  titleContainer: {
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
  },
  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  scrollView: {
    maxHeight: 400,
    paddingHorizontal: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    borderRadius: 12,
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
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#f5f5f5',
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    marginRight: 12,
  },
  applyButton: {
    flex: 1,
    marginLeft: 12,
  },
});

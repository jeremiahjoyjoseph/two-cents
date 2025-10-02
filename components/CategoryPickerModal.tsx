import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import { Button, useTheme } from 'react-native-paper';

interface CategoryPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectCategory: (category: any) => void;
  categories: any[];
  onCreateCustom: () => void;
}

export default function CategoryPickerModal({
  visible,
  onClose,
  onSelectCategory,
  categories,
  onCreateCustom,
}: CategoryPickerModalProps) {
  const theme = useTheme();

  const handleCategorySelect = (category: any) => {
    onSelectCategory(category);
    onClose();
  };

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
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          Select Category
        </Text>
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Category Options */}
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryItem,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                },
              ]}
              onPress={() => handleCategorySelect(category)}
            >
              <View style={styles.categoryContent}>
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
              </View>
            </TouchableOpacity>
          ))}
          
          {/* Create Custom Category Option */}
          <TouchableOpacity
            style={[
              styles.categoryItem,
              {
                backgroundColor: theme.colors.primary,
              },
            ]}
            onPress={onCreateCustom}
          >
            <View style={styles.categoryContent}>
              <View style={[
                styles.categoryIcon,
                {
                  backgroundColor: theme.colors.onPrimary,
                },
              ]}>
                <IconSymbol 
                  name="add" 
                  size={20} 
                  color={theme.colors.primary} 
                />
              </View>
              <Text style={[
                styles.categoryName,
                {
                  color: theme.colors.onPrimary,
                },
              ]}>
                Create Custom Category
              </Text>
            </View>
          </TouchableOpacity>
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
            style={styles.actionButton}
          >
            Close
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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 20,
    marginTop: 24,
    marginBottom: 24,
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
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: 'transparent',
    marginTop: 24,
  },
  actionButton: {
    flex: 1,
  },
});
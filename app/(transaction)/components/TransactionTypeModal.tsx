import { ThemedButton } from '@/components/ThemedButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import { useTheme } from 'react-native-paper';

export type TransactionType = 'income' | 'expense' | 'transfer';

interface TransactionTypeModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedType: TransactionType;
  onSelectType: (type: TransactionType) => void;
  onSet: () => void;
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    modalContainer: {
      margin: 0,
      justifyContent: 'flex-end',
    },
    modalContent: {
      width: '100%',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      overflow: 'hidden',
      backgroundColor: theme.colors.elevation.level3,
      paddingBottom: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      marginTop: 24,
      marginBottom: 24,
      alignSelf: 'center',
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 18,
      paddingHorizontal: 20,
      borderRadius: 16,
      marginBottom: 12,
      backgroundColor: 'transparent',
    },
    optionSelected: {
      backgroundColor: theme.colors.surface,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    optionIcon: {
      marginRight: 16,
    },
    selectedText: {
      marginLeft: 'auto',
      color: theme.colors.primary,
      fontWeight: 'bold',
      fontSize: 16,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 24,
      paddingHorizontal: 16,
    },
    setButton: {
      borderRadius: 24,
      paddingHorizontal: 32,
      paddingVertical: 4,
      backgroundColor: theme.colors.primary,
    },

    closeButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
  });

const options = [
  {
    type: 'income',
    label: 'Income',
    icon: 'file-download',
  },
  {
    type: 'expense',
    label: 'Expense',
    icon: 'file-upload',
  },
] as const;

export default function TransactionTypeModal({
  isVisible,
  onClose,
  selectedType,
  onSelectType,
  onSet,
}: TransactionTypeModalProps) {
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={styles.modalContainer}
      backdropColor={theme.colors.background}
      backdropOpacity={0.8}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      useNativeDriver
    >
      <ThemedView style={styles.modalContent}>
        <ThemedText type="title" style={styles.title}>
          Choose transaction type
        </ThemedText>
        <View style={{ paddingHorizontal: 12 }}>
          {options.map(option => (
            <TouchableOpacity
              key={option.type}
              style={[styles.option, selectedType === option.type && styles.optionSelected]}
              onPress={() => onSelectType(option.type)}
              activeOpacity={0.85}
            >
              <IconSymbol
                name={option.icon}
                size={24}
                color={theme.colors.onSurface}
                style={styles.optionIcon}
              />
              <ThemedText type="defaultSemiBold" style={{ fontSize: 18 }}>
                {option.label}
              </ThemedText>
              {selectedType === option.type && (
                <ThemedText style={styles.selectedText}>Selected</ThemedText>
              )}
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <IconSymbol name="close" size={24} color={theme.colors.onSurface} />
          </TouchableOpacity>
          <ThemedButton
            mode="contained"
            onPress={onSet}
            style={styles.setButton}
            contentStyle={{ paddingHorizontal: 16, paddingVertical: 2 }}
          >
            Set
          </ThemedButton>
        </View>
      </ThemedView>
    </Modal>
  );
}

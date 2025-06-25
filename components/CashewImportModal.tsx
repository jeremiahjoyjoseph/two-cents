import { useAuth } from '@/contexts/AuthContext';
import { addTransaction } from '@/lib/api/transactions';
import { TransactionInput } from '@/types/transactions';
import * as DocumentPicker from 'expo-document-picker';
import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import Modal from 'react-native-modal';
import { Button, MD3Theme, useTheme } from 'react-native-paper';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';

interface ImportModalProps {
  visible: boolean;
  onDismiss: () => void;
}

interface CashewTransaction {
  amount: string;
  title: string;
  note: string;
  date: string;
  income: string;
  category: string;
}

const getStyles = (theme: MD3Theme) =>
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
    },
    contentContainer: {
      padding: 24,
      backgroundColor: theme.colors.elevation.level3,
    },
    title: {
      marginBottom: 24,
      textAlign: 'center',
    },
    message: {
      textAlign: 'center',
      marginBottom: 24,
      color: theme.colors.onSurfaceVariant,
    },
    fileInfoContainer: {
      marginBottom: 24,
      padding: 16,
      borderRadius: 8,
      backgroundColor: theme.colors.surfaceVariant,
    },
    fileInfoText: {
      marginBottom: 4,
    },
    actionButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
    },
    error: {
      marginBottom: 24,
      textAlign: 'center',
      color: theme.colors.error,
    },
    loading: {
      marginBottom: 24,
    },
    progressContainer: {
      marginBottom: 24,
      padding: 16,
      borderRadius: 8,
      backgroundColor: theme.colors.surfaceVariant,
    },
    progressText: {
      textAlign: 'center',
      marginBottom: 8,
    },
    progressBar: {
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.outline,
    },
    progressFill: {
      height: '100%',
      borderRadius: 2,
      backgroundColor: theme.colors.primary,
    },
  });

const parseCSV = (csvText: string): CashewTransaction[] => {
  const lines = csvText.split('\n');
  if (lines.length < 2) {
    throw new Error('Invalid CSV file: No data found');
  }

  // Parse header
  const header = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const expectedHeaders = ['amount', 'title', 'note', 'date', 'income', 'category name'];

  const headerIndexes = expectedHeaders.map(h => header.indexOf(h));
  const missingHeaders = expectedHeaders.filter((h, i) => headerIndexes[i] === -1);

  if (missingHeaders.length > 0) {
    throw new Error(
      `Invalid CSV format: Missing required columns: ${missingHeaders.join(', ')}\n` +
        `Found columns: ${header.join(', ')}\n` +
        `Expected columns: ${expectedHeaders.join(', ')}`
    );
  }

  // Parse data rows
  const transactions: CashewTransaction[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Handle CSV with quotes and commas in fields
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim()); // Add the last value

    if (values.length >= expectedHeaders.length) {
      transactions.push({
        amount: values[headerIndexes[0]].replace(/"/g, ''),
        title: values[headerIndexes[1]].replace(/"/g, ''),
        note: values[headerIndexes[2]].replace(/"/g, ''),
        date: values[headerIndexes[3]].replace(/"/g, ''),
        income: values[headerIndexes[4]].replace(/"/g, ''),
        category: values[headerIndexes[5]].replace(/"/g, ''),
      });
    }
  }
  return transactions;
};

const convertCashewToTransaction = (cashewTx: CashewTransaction): TransactionInput => {
  const amount = parseFloat(cashewTx.amount.replace(/[$,]/g, ''));
  const isExpense = cashewTx.income.toLowerCase() === 'false' || amount < 0;

  // Parse date with better error handling
  let dateStr = cashewTx.date.trim();

  try {
    // Handle Cashew datetime format: "2025-06-21 14:42:44.000"
    if (dateStr.includes(' ') && dateStr.includes(':')) {
      // Extract just the date part (before the space)
      const datePart = dateStr.split(' ')[0];
      if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
        dateStr = datePart;
      }
    }
    // Try parsing as ISO string
    else if (dateStr.includes('T') || dateStr.includes('Z')) {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        dateStr = date.toISOString().split('T')[0];
      }
    }
    // Try parsing MM/DD/YYYY format
    else if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const [month, day, year] = parts;
        // Handle both MM/DD/YYYY and DD/MM/YYYY formats
        let parsedDate;
        if (year.length === 4) {
          // Assume MM/DD/YYYY if year is 4 digits
          parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else {
          // Assume DD/MM/YYYY if year is 2 digits
          parsedDate = new Date(2000 + parseInt(year), parseInt(month) - 1, parseInt(day));
        }
        if (!isNaN(parsedDate.getTime())) {
          dateStr = parsedDate.toISOString().split('T')[0];
        }
      }
    }
    // Try parsing as timestamp
    else if (/^\d+$/.test(dateStr)) {
      const timestamp = parseInt(dateStr);
      // Check if it's milliseconds or seconds
      const date = timestamp > 1000000000000 ? new Date(timestamp) : new Date(timestamp * 1000);
      if (!isNaN(date.getTime())) {
        dateStr = date.toISOString().split('T')[0];
      }
    }
    // Try parsing YYYY-MM-DD format
    else if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
      }
    }

    // Validate the final date
    const finalDate = new Date(dateStr);
    if (isNaN(finalDate.getTime())) {
      dateStr = new Date().toISOString().split('T')[0];
    }
  } catch (error) {
    dateStr = new Date().toISOString().split('T')[0];
  }

  return {
    title: cashewTx.title || '',
    amount: Math.abs(amount),
    type: isExpense ? 'expense' : 'income',
    date: dateStr,
    createdBy: 'import', // Will be replaced with actual user ID
  };
};

export const CashewImportModal: React.FC<ImportModalProps> = ({ visible, onDismiss }) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerResult | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(
    null
  );

  const handleSelectFile = async () => {
    try {
      setError(null);
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      setSelectedFile(result);
    } catch (err) {
      setError('Failed to select file');
    }
  };

  const handleImport = async () => {
    if (!selectedFile || !user?.uid || !selectedFile.assets || !selectedFile.assets[0]) return;

    try {
      setIsLoading(true);
      setError(null);
      setImportProgress({ current: 0, total: 0 });

      // Read the file
      const response = await fetch(selectedFile.assets[0].uri);
      const csvText = await response.text();

      // Parse CSV
      const cashewTransactions = parseCSV(csvText);
      setImportProgress({ current: 0, total: cashewTransactions.length });

      // Convert and import transactions
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < cashewTransactions.length; i++) {
        try {
          const cashewTx = cashewTransactions[i];
          const transaction = convertCashewToTransaction(cashewTx);
          transaction.createdBy = user.uid;

          await addTransaction(user.uid, user.linkedGroupId ?? null, transaction);
          successCount++;
        } catch (err) {
          errorCount++;
        }

        setImportProgress({ current: i + 1, total: cashewTransactions.length });
      }

      // Show results
      const message = `Import completed!\n\nSuccessfully imported: ${successCount} transactions`;
      if (errorCount > 0) {
        Alert.alert('Import Results', `${message}\nFailed to import: ${errorCount} transactions`);
      } else {
        Alert.alert('Import Successful', message);
      }

      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import file');
    } finally {
      setIsLoading(false);
      setImportProgress(null);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setError(null);
    setImportProgress(null);
    onDismiss();
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={handleClose}
      onBackButtonPress={handleClose}
      style={styles.modalContainer}
      backdropColor={theme.colors.background}
      backdropOpacity={0.8}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      useNativeDriver
    >
      <ThemedView style={styles.modalContent}>
        <ThemedView style={styles.contentContainer}>
          <ThemedText type="title" style={styles.title}>
            Import Transactions
          </ThemedText>

          <ThemedText style={styles.message}>
            Select a CSV file exported from Cashew to import your transactions.
          </ThemedText>

          {selectedFile && selectedFile.assets && selectedFile.assets[0] ? (
            <View style={styles.fileInfoContainer}>
              <ThemedText style={styles.fileInfoText}>
                Selected: {selectedFile.assets[0].name}
              </ThemedText>
              <ThemedText style={styles.fileInfoText}>
                Size:{' '}
                {(selectedFile.assets[0].size ? selectedFile.assets[0].size / 1024 : 0).toFixed(1)}{' '}
                KB
              </ThemedText>
            </View>
          ) : (
            <Button
              mode="outlined"
              onPress={handleSelectFile}
              icon={({ size, color }: { size: number; color: string }) => (
                <IconSymbol name="file-download" size={size} color={color} />
              )}
              style={{ marginBottom: 24 }}
            >
              Select CSV File
            </Button>
          )}

          {importProgress && (
            <View style={styles.progressContainer}>
              <ThemedText style={styles.progressText}>
                Importing... {importProgress.current} of {importProgress.total}
              </ThemedText>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(importProgress.current / importProgress.total) * 100}%` },
                  ]}
                />
              </View>
            </View>
          )}

          {error && <ThemedText style={styles.error}>{error}</ThemedText>}

          <View style={styles.actionButtonsContainer}>
            <Button
              mode="text"
              onPress={handleClose}
              icon={({ size, color }: { size: number; color: string }) => (
                <IconSymbol name="close" size={size} color={color} />
              )}
              textColor={theme.colors.onSurface}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleImport}
              icon={({ size, color }: { size: number; color: string }) => (
                <IconSymbol name="download" size={size} color={color} />
              )}
              buttonColor={theme.colors.primary}
              loading={isLoading}
              disabled={isLoading || !selectedFile}
            >
              Import
            </Button>
          </View>
        </ThemedView>
      </ThemedView>
    </Modal>
  );
};

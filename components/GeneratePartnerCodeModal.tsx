import { useAuth } from '@/contexts/AuthContext';
import { generatePairCode } from '@/lib/api/pair';
import * as Clipboard from 'expo-clipboard';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import { MD3Theme, useTheme } from 'react-native-paper';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { UniversalButton } from './UniversalButton';
import { IconSymbol } from './ui/IconSymbol';

interface GeneratePartnerCodeModalProps {
  visible: boolean;
  onClose: () => void;
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
    codeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
      padding: 16,
      borderRadius: 8,
      backgroundColor: theme.colors.surfaceVariant,
    },
    code: {
      fontSize: 24,
      letterSpacing: 2,
      marginRight: 12,
    },
    copyButton: {
      padding: 8,
    },
    actionButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      paddingHorizontal: 24,
      paddingVertical: 24,
      paddingBottom: 40,
      gap: 16,
    },
    cancelButton: {
      flex: 1,
      minHeight: 48,
    },
    actionButton: {
      flex: 1,
      minHeight: 48,
    },
    error: {
      marginBottom: 24,
      textAlign: 'center',
      color: theme.colors.error,
    },
    loading: {
      marginBottom: 24,
    },
  });

export const GeneratePartnerCodeModal: React.FC<GeneratePartnerCodeModalProps> = ({
  visible,
  onClose,
}) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { user } = useAuth();
  const [partnerCode, setPartnerCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateCode = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user?.uid) {
        throw new Error('User not authenticated');
      }

      const code = await generatePairCode(user.uid);
      setPartnerCode(code);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate code');
      console.log(err);
      setPartnerCode('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (partnerCode) {
      await Clipboard.setStringAsync(partnerCode);
    }
  };

  const handleClose = () => {
    setPartnerCode('');
    setError(null);
    onClose();
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
            Partner Code
          </ThemedText>

          {!partnerCode && !isLoading && !error && (
            <ThemedText style={styles.message}>
              Generate a unique code to share with your partner. This code will expire in 10
              minutes.
            </ThemedText>
          )}

          {isLoading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loading} />
          ) : error ? (
            <ThemedText style={styles.error}>{error}</ThemedText>
          ) : partnerCode ? (
            <TouchableOpacity style={styles.codeContainer} onPress={handleCopyCode}>
              <ThemedText style={styles.code}>{partnerCode}</ThemedText>
              <View style={styles.copyButton}>
                <IconSymbol name="content-copy" size={24} color={theme.colors.primary} />
              </View>
            </TouchableOpacity>
          ) : null}

          <View style={styles.actionButtonsContainer}>
            <UniversalButton
              variant="ghost"
              size="large"
              onPress={handleClose}
              icon={<IconSymbol name="close" size={20} color={theme.colors.onSurface} />}
              iconPosition="left"
              style={styles.cancelButton}
            >
              Cancel
            </UniversalButton>
            {!partnerCode ? (
              <UniversalButton
                variant="primary"
                size="large"
                onPress={generateCode}
                loading={isLoading}
                disabled={isLoading}
                icon={<IconSymbol name="key" size={20} color={theme.colors.onPrimary} />}
                iconPosition="left"
                style={styles.actionButton}
              >
                Generate Code
              </UniversalButton>
            ) : (
              <UniversalButton
                variant="primary"
                size="large"
                onPress={handleCopyCode}
                icon={<IconSymbol name="content-copy" size={20} color={theme.colors.onPrimary} />}
                iconPosition="left"
                style={styles.actionButton}
              >
                Copy Code
              </UniversalButton>
            )}
          </View>
        </ThemedView>
      </ThemedView>
    </Modal>
  );
};

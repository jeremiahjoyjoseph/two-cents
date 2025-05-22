import { useAuth } from '@/contexts/AuthContext';
import { redeemPartnerCode } from '@/lib/api/pair';
import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import Modal from 'react-native-modal';
import { Button, MD3Theme, TextInput, useTheme } from 'react-native-paper';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';

interface HandleLinkingPartnerCodeProps {
  visible: boolean;
  onDismiss: () => void;
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
    inputContainer: {
      marginBottom: 24,
    },
    input: {
      backgroundColor: theme.colors.surfaceVariant,
      fontSize: 24,
      letterSpacing: 2,
      textAlign: 'center',
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
  });

export const HandleLinkingPartnerCode: React.FC<HandleLinkingPartnerCodeProps> = ({
  visible,
  onDismiss,
}) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      setError(null);
      if (!user?.uid) {
        throw new Error('User not authenticated');
      }
      if (!code || code.length !== 6) {
        throw new Error('Please enter a valid 6-digit code');
      }
      await redeemPartnerCode(user.uid, code);
      Alert.alert(
        'Success',
        'Your account has been successfully linked with your partner. You can now share and manage transactions together.',
        [{ text: 'OK', onPress: onDismiss }]
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to link partner code');
    }
  };

  const handleClose = () => {
    setCode('');
    setError(null);
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
            Link Partner Code
          </ThemedText>

          <ThemedText style={styles.message}>
            Enter the 6-digit code shared by your partner to link your accounts.
          </ThemedText>

          <View style={styles.inputContainer}>
            <TextInput
              mode="outlined"
              value={code}
              onChangeText={text => setCode(text.toUpperCase())}
              maxLength={6}
              style={styles.input}
              placeholder="Enter 6-digit code"
              autoCapitalize="characters"
              keyboardType="default"
            />
          </View>

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
              onPress={handleSubmit}
              icon={({ size, color }: { size: number; color: string }) => (
                <IconSymbol name="link" size={size} color={color} />
              )}
              buttonColor={theme.colors.primary}
              disabled={!code || code.length !== 6}
            >
              Link Partner
            </Button>
          </View>
        </ThemedView>
      </ThemedView>
    </Modal>
  );
};

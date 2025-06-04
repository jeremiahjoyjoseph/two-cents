import { firestore } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { unlinkPartner } from '@/lib/api/pair';
import { doc, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import Modal from 'react-native-modal';
import { Button, MD3Theme, useTheme } from 'react-native-paper';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';

interface HandleUnlinkPartnerCodeProps {
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

export const HandleUnlinkPartnerCode: React.FC<HandleUnlinkPartnerCodeProps> = ({
  visible,
  onDismiss,
}) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { user, updateLinkedGroupId } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Listen for changes to user's own document
  useEffect(() => {
    if (!user?.uid) return;

    const userDoc = doc(firestore, 'users', user.uid);
    const unsubscribe = onSnapshot(userDoc, snapshot => {
      if (snapshot.exists()) {
        const userData = snapshot.data();
        // Update context if linkedGroupId changes
        if (userData.linkedGroupId !== user.linkedGroupId) {
          updateLinkedGroupId(userData.linkedGroupId);
        }
      }
    });

    return () => unsubscribe();
  }, [user?.uid, user?.linkedGroupId, updateLinkedGroupId]);

  const handleUnlink = async () => {
    try {
      setError(null);
      setIsLoading(true);

      if (!user?.uid) {
        throw new Error('User not authenticated');
      }

      await unlinkPartner(user.uid, updateLinkedGroupId);

      Alert.alert(
        'Success',
        'Your account has been successfully unlinked. Your transactions have been moved back to your personal account.',
        [{ text: 'OK', onPress: onDismiss }]
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlink partner');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
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
            Unlink Partner
          </ThemedText>

          <ThemedText style={styles.message}>
            Are you sure you want to unlink your account from your partner? This will move all
            shared transactions back to your personal account.
          </ThemedText>

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
              onPress={handleUnlink}
              icon={({ size, color }: { size: number; color: string }) => (
                <IconSymbol name="link-off" size={size} color={color} />
              )}
              buttonColor={theme.colors.error}
              loading={isLoading}
              disabled={isLoading}
            >
              Unlink Partner
            </Button>
          </View>
        </ThemedView>
      </ThemedView>
    </Modal>
  );
};

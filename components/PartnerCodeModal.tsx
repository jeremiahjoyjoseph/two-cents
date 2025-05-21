import { useAuth } from '@/contexts/AuthContext';
import { generatePairCode } from '@/lib/api/pair';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { ThemedText } from './ThemedText';

interface PartnerCodeModalProps {
  visible: boolean;
  onClose: () => void;
  groupId: string;
}

export const PartnerCodeModal: React.FC<PartnerCodeModalProps> = ({
  visible,
  onClose,
  groupId,
}) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [partnerCode, setPartnerCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      generateCode();
    }
  }, [visible]);

  const generateCode = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user?.uid) {
        throw new Error('User not authenticated');
      }

      const code = await generatePairCode(user.uid, groupId);
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

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
          <ThemedText type="title" style={styles.title}>
            Partner Code
          </ThemedText>

          {isLoading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} />
          ) : error ? (
            <ThemedText style={[styles.error, { color: theme.colors.error }]}>{error}</ThemedText>
          ) : (
            <View style={styles.codeContainer}>
              <ThemedText style={styles.code}>{partnerCode}</ThemedText>
              <TouchableOpacity onPress={handleCopyCode} style={styles.copyButton}>
                <Ionicons name="copy-outline" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          )}

          <Button mode="contained" onPress={onClose} style={styles.closeButton}>
            Close
          </Button>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  title: {
    marginBottom: 20,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  code: {
    fontSize: 24,
    letterSpacing: 2,
    marginRight: 10,
  },
  copyButton: {
    padding: 5,
  },
  closeButton: {
    marginTop: 10,
  },
  error: {
    marginBottom: 20,
    textAlign: 'center',
  },
});

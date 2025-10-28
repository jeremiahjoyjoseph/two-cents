import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { UniversalButton } from '@/components/UniversalButton';
import { validatePIN } from '@/lib/utils';
import React, { useState } from 'react';
import { Keyboard, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import Modal from 'react-native-modal';
import { useTheme } from 'react-native-paper';
import { PINInput } from './PINInput';
import { useDialog } from './ThemedDialog';

interface PINVerificationBottomSheetProps {
  isVisible: boolean;
  onVerify: (pin: string) => Promise<boolean>;
  onCancel?: () => void;
}

export const PINVerificationBottomSheet: React.FC<PINVerificationBottomSheetProps> = ({
  isVisible,
  onVerify,
  onCancel,
}) => {
  const theme = useTheme();
  const { showDialog, Dialog } = useDialog();
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    if (!validatePIN(pin)) {
      showDialog('PIN must be exactly 6 digits', { type: 'error', title: 'Invalid PIN' });
      return;
    }

    setIsLoading(true);
    try {
      const isValid = await onVerify(pin);
      if (isValid) {
        setPin('');
        // Modal will close via parent state change
      } else {
        showDialog('The PIN you entered is incorrect. Please try again.', { type: 'error', title: 'Incorrect PIN' });
        setPin('');
      }
    } catch (error: any) {
      showDialog('Failed to verify PIN. Please try again.', { type: 'error', title: 'Error' });
      setPin('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setPin('');
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <>
      <Modal
        isVisible={isVisible}
        onBackdropPress={handleCancel}
        onBackButtonPress={handleCancel}
        onSwipeComplete={handleCancel}
        swipeDirection={['down']}
        style={styles.modal}
        backdropOpacity={0.5}
        useNativeDriverForBackdrop
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ThemedView style={[styles.container, { backgroundColor: theme.colors.surface }]}>
            <ThemedView style={styles.handle} />
            
            <ThemedView style={styles.content}>
              <ThemedText type="subtitle" style={styles.title}>
                Verify Your Identity
              </ThemedText>
              
              <ThemedText style={styles.description}>
                Enter your 6-digit PIN to continue
              </ThemedText>

              <ThemedView style={styles.pinContainer}>
                <PINInput
                  value={pin}
                  onChangeText={setPin}
                  autoFocus
                  secureTextEntry={false}
                />
              </ThemedView>

              <UniversalButton
                variant="primary"
                size="large"
                onPress={handleVerify}
                loading={isLoading}
                disabled={isLoading || pin.length !== 6}
                fullWidth
                style={styles.button}
              >
                Verify
              </UniversalButton>

              <UniversalButton
                variant="ghost"
                size="medium"
                onPress={handleCancel}
                style={styles.cancelButton}
              >
                Cancel
              </UniversalButton>
            </ThemedView>
          </ThemedView>
        </TouchableWithoutFeedback>
      </Modal>
      <Dialog />
    </>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  content: {
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 24,
    textAlign: 'center',
  },
  pinContainer: {
    marginBottom: 24,
  },
  button: {
    marginTop: 8,
  },
  cancelButton: {
    marginTop: 8,
    alignSelf: 'center',
  },
});


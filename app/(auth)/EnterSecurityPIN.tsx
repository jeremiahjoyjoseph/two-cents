import { UniversalButton } from '@/components/UniversalButton';
import { useAuth } from '@/contexts/AuthContext';
import { validatePIN } from '@/lib/utils';
import { router } from 'expo-router';
import { useState } from 'react';
import { Keyboard, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PINInput } from '@/components/PINInput';
import { useDialog } from '@/components/ThemedDialog';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function EnterSecurityPIN() {
  const theme = useTheme();
  const { login, user } = useAuth();
  const { showDialog, Dialog } = useDialog();
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!validatePIN(pin)) {
      showDialog('PIN must be exactly 6 digits', {
        type: 'error',
        title: 'Invalid PIN',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Re-login with PIN to decrypt the encryption key
      if (user?.email) {
        // Note: This requires the user to have already authenticated with Firebase
        // The PIN is only used to decrypt the personal encryption key
        await login({ email: user.email, password: '', pin });
        router.replace('/(tabs)');
      } else {
        throw new Error('User email not found');
      }
    } catch (error: any) {
      console.error('PIN verification error:', error);
      if (error.message.includes('incorrect PIN')) {
        showDialog('The PIN you entered is incorrect. Please try again.', {
          type: 'error',
          title: 'Incorrect PIN',
        });
      } else {
        showDialog('Failed to verify PIN. Please try again.', {
          type: 'error',
        });
      }
      setPin('');
      setIsLoading(false);
    }
  };

  const handleForgotPin = () => {
    showDialog(
      'Unfortunately, without your PIN, we cannot decrypt your data. This is by design to protect your privacy.\n\nYour options:\n1. Try to remember your PIN\n2. Start fresh (all existing data will be lost)',
      {
        type: 'warning',
        title: 'Forgot PIN?',
        actions: [
          { label: 'Cancel', onPress: () => {} },
          {
            label: 'Start Fresh',
            onPress: () => {
              showDialog(
                'This will delete all your existing encrypted data and create a new account. Are you sure?',
                {
                  type: 'warning',
                  title: 'Start Fresh',
                  actions: [
                    { label: 'Cancel', onPress: () => {} },
                    {
                      label: 'Yes, Start Fresh',
                      onPress: async () => {
                        // TODO: Implement account reset logic
                        // For now, just navigate back to auth
                        router.replace('/(auth)');
                      },
                    },
                  ],
                }
              );
            },
          },
        ],
      }
    );
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <ThemedView style={styles.container}>
          <ThemedView style={styles.formSection}>
            <ThemedText type="title" style={styles.title}>
              Enter Security PIN
            </ThemedText>

            <ThemedText style={styles.description}>
              Enter your 6-digit PIN to decrypt your data
            </ThemedText>

            <PINInput
              value={pin}
              onChangeText={setPin}
              autoFocus
              secureTextEntry={false}
            />

            <UniversalButton 
              variant="ghost" 
              size="medium" 
              onPress={handleForgotPin} 
              style={styles.forgotButton}
            >
              Forgot PIN?
            </UniversalButton>
          </ThemedView>

          <ThemedView style={styles.buttonSection}>
            <UniversalButton 
              variant="auth" 
              size="xl" 
              onPress={handleSubmit} 
              style={styles.button}
              loading={isLoading}
              disabled={isLoading}
              fullWidth
            >
              Continue
            </UniversalButton>
          </ThemedView>
        </ThemedView>
      </TouchableWithoutFeedback>
      <Dialog />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    justifyContent: 'space-between',
  },
  formSection: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  buttonSection: {
    marginTop: 'auto',
    paddingTop: 24,
  },
  title: {
    textAlign: 'left',
    marginBottom: 32,
    paddingTop: 8,
    fontSize: 32,
    fontWeight: 'bold',
  },
  description: {
    textAlign: 'left',
    marginBottom: 32,
    opacity: 0.7,
  },
  button: {
    marginTop: 8,
  },
  forgotButton: {
    marginTop: 24,
    alignSelf: 'flex-start',
    paddingHorizontal: 0,
    paddingLeft: 0,
    marginLeft: 0,
  },
});


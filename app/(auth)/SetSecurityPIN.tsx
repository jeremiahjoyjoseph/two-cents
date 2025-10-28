import { UniversalButton } from '@/components/UniversalButton';
import { validatePIN } from '@/lib/utils';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Keyboard, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PINInput } from '@/components/PINInput';
import { useDialog } from '@/components/ThemedDialog';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';

export default function SetSecurityPIN() {
  const theme = useTheme();
  const params = useLocalSearchParams();
  const { register } = useAuth();
  const { showDialog, Dialog } = useDialog();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'set' | 'confirm'>('set');
  const [isLoading, setIsLoading] = useState(false);

  const handleSetPin = () => {
    if (!validatePIN(pin)) {
      showDialog('PIN must be exactly 6 digits', {
        type: 'error',
        title: 'Invalid PIN',
      });
      return;
    }
    setStep('confirm');
  };

  const handleConfirmPin = async () => {
    if (pin !== confirmPin) {
      showDialog('The PINs you entered do not match. Please try again.', {
        type: 'error',
        title: 'PIN Mismatch',
      });
      setConfirmPin('');
      return;
    }

    setIsLoading(true);
    try {
      // Get registration data from route params
      const email = params.email as string;
      const password = params.password as string;
      const name = params.name as string;

      if (!email || !password || !name) {
        throw new Error('Missing registration data');
      }

      // Register user with PIN
      await register({ email, password, name, pin });
      
      // Registration successful, navigate to main app
      router.replace('/(tabs)' as any);
    } catch (error: any) {
      console.error('Registration error:', error);
      showDialog(error.message || 'Failed to complete registration', {
        type: 'error',
      });
      setIsLoading(false);
    }
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
              {step === 'set' ? 'Set Security PIN' : 'Confirm PIN'}
            </ThemedText>

            <ThemedText style={styles.description}>
              {step === 'set' 
                ? 'Create a 6-digit PIN to protect your data. You will need this PIN to access your transactions.'
                : 'Re-enter your PIN to confirm'}
            </ThemedText>

            <PINInput
              value={step === 'set' ? pin : confirmPin}
              onChangeText={step === 'set' ? setPin : setConfirmPin}
              autoFocus
              secureTextEntry={false}
            />

            <ThemedText style={styles.warning}>
              Remember this PIN - you'll need it.
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.buttonSection}>
            {step === 'set' ? (
              <UniversalButton 
                variant="auth" 
                size="xl" 
                onPress={handleSetPin} 
                style={styles.button}
                fullWidth
              >
                Continue
              </UniversalButton>
            ) : (
              <>
                <UniversalButton 
                  variant="auth" 
                  size="xl" 
                  onPress={handleConfirmPin} 
                  style={styles.button}
                  loading={isLoading}
                  disabled={isLoading}
                  fullWidth
                >
                  Confirm PIN
                </UniversalButton>

                <UniversalButton 
                  variant="ghost" 
                  size="medium" 
                  onPress={() => {
                    setStep('set');
                    setPin('');
                    setConfirmPin('');
                  }} 
                  style={styles.backButton}
                >
                  Back
                </UniversalButton>
              </>
            )}
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
    lineHeight: 22,
  },
  warning: {
    textAlign: 'left',
    marginTop: 24,
    opacity: 0.6,
    fontSize: 14,
  },
  button: {
    marginTop: 8,
  },
  backButton: {
    marginTop: 16,
    alignSelf: 'center',
  },
});


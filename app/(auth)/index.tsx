import { AuthTextField } from '@/components/AuthTextField';
import { UniversalButton } from '@/components/UniversalButton';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { BackHandler, Keyboard, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useDialog } from '@/components/ThemedDialog';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';

export default function Auth() {
  const theme = useTheme();
  const { login, register, forgotPassword } = useAuth();
  const router = useRouter();
  const { showDialog, Dialog } = useDialog();
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async () => {
    try {
      if (isLogin) {
        const data = { email, password };
        try {
          await login(data);
          console.log('Login successful');
          // If login succeeds without PIN, key was cached, go to app
          // This will be handled by AuthContext
        } catch (error: any) {
          if (error.message === 'PIN_REQUIRED') {
            // Navigate to PIN entry screen
            router.push('/(auth)/EnterSecurityPIN' as any);
          } else {
            throw error;
          }
        }
      } else {
        if (password !== confirmPassword) {
          showDialog('Passwords do not match', {
            type: 'error',
            title: 'Validation Error',
          });
          return;
        }
        // For registration, navigate to PIN setup
        // Store credentials temporarily for use after PIN is set
        router.push({
          pathname: '/(auth)/SetSecurityPIN' as any,
          params: { email, password, name }
        });
      }
    } catch (error: any) {
      showDialog(error.message || 'An error occurred', {
        type: 'error',
      });
    }
  };

  const handleForgotPassword = async () => {
    try {
      if (!email) {
        showDialog('Please enter your email address', {
          type: 'warning',
          title: 'Email Required',
        });
        return;
      }
      await forgotPassword(email);
      showDialog(
        'Please check your email for instructions to reset your password.',
        {
          type: 'success',
          title: 'Password Reset Email Sent',
          actions: [
            {
              label: 'OK',
              onPress: () => {
                setShowForgotPassword(false);
                setEmail('');
              },
            },
          ],
        }
      );
    } catch (error: any) {
      showDialog(error.message || 'Failed to send password reset email', {
        type: 'error',
      });
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Handle back button/gesture
  useEffect(() => {
    const backAction = () => {
      if (showForgotPassword) {
        setShowForgotPassword(false);
        return true; // Prevent default behavior
      }
      // For the main auth screen, we don't want to allow going back
      // as this is the entry point for unauthenticated users
      return true; // Prevent default behavior
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [showForgotPassword]);

  if (showForgotPassword) {
    return (
      <>
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
          <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <ThemedView style={styles.container}>
              <ThemedView style={styles.formSection}>
                <ThemedText type="title" style={styles.title}>
                  Reset Password
                </ThemedText>

              <ThemedText style={styles.description}>
                Enter your email address and we&apos;ll send you a link to reset your password.
              </ThemedText>

              <AuthTextField
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="Email"
              />
            </ThemedView>

            <ThemedView style={styles.buttonSection}>
              <UniversalButton 
                variant="auth" 
                size="xl" 
                onPress={handleForgotPassword} 
                style={styles.button}
                fullWidth
              >
                Send Reset Email
              </UniversalButton>

              <UniversalButton 
                variant="ghost" 
                size="medium" 
                onPress={() => setShowForgotPassword(false)} 
                style={styles.switchButton}
              >
                Back to Sign In
              </UniversalButton>
              </ThemedView>
            </ThemedView>
          </TouchableWithoutFeedback>
        </SafeAreaView>
        <Dialog />
      </>
    );
  }

  return (
    <>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <ThemedView style={styles.container}>
            <ThemedView style={styles.formSection}>
              <ThemedText type="title" style={styles.title}>
                {isLogin ? 'Sign In' : 'Sign Up'}
              </ThemedText>

            {!isLogin && (
              <AuthTextField
                value={name}
                onChangeText={setName}
                placeholder="Name"
              />
            )}

            <AuthTextField
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="Email"
            />

            <AuthTextField
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry
            />

            {!isLogin && (
              <AuthTextField
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm Password"
                secureTextEntry
              />
            )}

            {isLogin && (
              <UniversalButton 
                variant="ghost" 
                size="medium" 
                onPress={() => setShowForgotPassword(true)} 
                style={styles.forgotPasswordButton}
              >
                Forgot Password?
              </UniversalButton>
            )}
          </ThemedView>

          <ThemedView style={styles.buttonSection}>
            <UniversalButton 
              variant="auth" 
              size="xl" 
              onPress={handleSubmit} 
              style={styles.button}
              fullWidth
            >
              {isLogin ? 'Sign In' : 'Sign Up'}
            </UniversalButton>

            <UniversalButton 
              variant="ghost" 
              size="medium" 
              onPress={() => setIsLogin(!isLogin)} 
              style={styles.switchButton}
            >
              {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
            </UniversalButton>
            </ThemedView>
          </ThemedView>
        </TouchableWithoutFeedback>
      </SafeAreaView>
      <Dialog />
    </>
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
    marginBottom: 24,
    opacity: 0.7,
  },
  button: {
    marginTop: 8,
  },
  forgotPasswordButton: {
    marginTop: 16,
    alignSelf: 'flex-start',
    paddingHorizontal: 0,
    paddingLeft: 0,
    marginLeft: 0,
  },
  switchButton: {
    marginTop: 16,
    alignSelf: 'center',
  },
});

import { UniversalButton } from '@/components/UniversalButton';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, BackHandler, Keyboard, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';

export default function Auth() {
  const theme = useTheme();
  const { login, register, forgotPassword } = useAuth();
  const router = useRouter();
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
        const response = await login(data);
        console.log('Login results:', response);
      } else {
        if (password !== confirmPassword) {
          Alert.alert('Passwords do not match');
          return;
        }
        const data = { email, password, name };
        const response = await register(data);
        console.log('Register results:', response);
      }
    } catch (error: any) {
      Alert.alert(error.message);
    }
  };

  const handleForgotPassword = async () => {
    try {
      if (!email) {
        Alert.alert('Please enter your email address');
        return;
      }
      await forgotPassword(email);
      Alert.alert(
        'Password Reset Email Sent',
        'Please check your email for instructions to reset your password.',
        [
          {
            text: 'OK',
            onPress: () => {
              setShowForgotPassword(false);
              setEmail('');
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message);
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

            <TextInput
              label=""
              value={email}
              onChangeText={setEmail}
              mode="flat"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="Email"
              style={styles.input}
              underlineColor={theme.colors.outlineVariant}
              activeUnderlineColor={theme.colors.outlineVariant}
              contentStyle={styles.inputContent}
              placeholderTextColor={theme.colors.onSurfaceDisabled}
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
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <ThemedView style={styles.container}>
          <ThemedView style={styles.formSection}>
            <ThemedText type="title" style={styles.title}>
              {isLogin ? 'Sign In' : 'Sign Up'}
            </ThemedText>

          {!isLogin && (
            <TextInput
              label=""
              value={name}
              onChangeText={setName}
              mode="flat"
              placeholder="Name"
              style={styles.input}
              underlineColor={theme.colors.outlineVariant}
              activeUnderlineColor={theme.colors.outlineVariant}
              contentStyle={styles.inputContent}
              placeholderTextColor={theme.colors.onSurfaceDisabled}
            />
          )}

          <TextInput
            label=""
            value={email}
            onChangeText={setEmail}
            mode="flat"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="Email"
            style={styles.input}
            underlineColor={theme.colors.outlineVariant}
            activeUnderlineColor={theme.colors.outlineVariant}
            contentStyle={styles.inputContent}
            placeholderTextColor={theme.colors.onSurfaceDisabled}
          />

          <TextInput
            label=""
            value={password}
            onChangeText={setPassword}
            mode="flat"
            secureTextEntry
            placeholder="Password"
            style={styles.input}
            underlineColor={theme.colors.outlineVariant}
            activeUnderlineColor={theme.colors.outlineVariant}
            contentStyle={styles.inputContent}
            placeholderTextColor={theme.colors.onSurfaceDisabled}
          />

          {!isLogin && (
            <TextInput
              label=""
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              mode="flat"
              secureTextEntry
              placeholder="Confirm Password"
              style={styles.input}
              underlineColor={theme.colors.outlineVariant}
              activeUnderlineColor={theme.colors.outlineVariant}
              contentStyle={styles.inputContent}
              placeholderTextColor={theme.colors.onSurfaceDisabled}
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
  input: {
    marginBottom: 24,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingBottom: 8,
  },
  inputContent: {
    fontSize: 18,
    fontWeight: '600',
    paddingBottom: 8,
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

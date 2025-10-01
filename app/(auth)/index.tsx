import { UniversalButton } from '@/components/UniversalButton';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, BackHandler, Keyboard, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Surface, TextInput } from 'react-native-paper';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';

export default function Auth() {
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
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <ThemedView style={styles.container}>
          <Surface style={styles.surface} elevation={4}>
            <ThemedText type="title" style={styles.title}>
              Reset Password
            </ThemedText>

            <ThemedText style={styles.description}>
              Enter your email address and we'll send you a link to reset your password.
            </ThemedText>

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

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
          </Surface>
        </ThemedView>
      </TouchableWithoutFeedback>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <ThemedView style={styles.container}>
        <Surface style={styles.surface} elevation={4}>
          <ThemedText type="title" style={styles.title}>
            {isLogin ? 'Sign In' : 'Sign Up'}
          </ThemedText>

          {!isLogin && (
            <TextInput
              label="Name"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
            />
          )}

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry
            style={styles.input}
          />

          {!isLogin && (
            <TextInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              mode="outlined"
              secureTextEntry
              style={styles.input}
            />
          )}

          <UniversalButton 
            variant="auth" 
            size="xl" 
            onPress={handleSubmit} 
            style={styles.button}
            fullWidth
          >
            {isLogin ? 'Sign In' : 'Sign Up'}
          </UniversalButton>

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

          <UniversalButton 
            variant="ghost" 
            size="medium" 
            onPress={() => setIsLogin(!isLogin)} 
            style={styles.switchButton}
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </UniversalButton>
        </Surface>
      </ThemedView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  surface: {
    padding: 24,
    borderRadius: 10,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
    paddingTop: 8,
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  forgotPasswordButton: {
    marginTop: 8,
    alignSelf: 'center',
  },
  switchButton: {
    marginTop: 16,
  },
});

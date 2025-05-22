import { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { Button, Surface, TextInput } from 'react-native-paper';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';

export default function Auth() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
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

  return (
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

        <Button mode="contained" onPress={handleSubmit} style={styles.button}>
          {isLogin ? 'Sign In' : 'Sign Up'}
        </Button>

        <Button mode="text" onPress={() => setIsLogin(!isLogin)} style={styles.switchButton}>
          {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
        </Button>
      </Surface>
    </ThemedView>
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
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  switchButton: {
    marginTop: 16,
  },
});

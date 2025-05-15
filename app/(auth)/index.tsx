import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button, Surface, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';

export default function Auth() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async () => {
    try {
      if (isLogin) {
        await login(email, password);
        router.replace('/(tabs)');
      } else {
        if (password !== confirmPassword) {
          alert('Passwords do not match');
          return;
        }
        const response = await register(email, password, name);
        if (response.success) {
          router.replace('/(tabs)');
        }
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <Surface style={styles.surface} elevation={4}>
          <ThemedText type="title" style={styles.title} darkColor='#212121'>
            {isLogin ? 'Sign In' : 'Sign Up'}
          </ThemedText>

          {!isLogin && (
            <TextInput
              label="Name"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
              theme={{ colors: { primary: '#424242' } }}
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
            theme={{ colors: { primary: '#424242' } }}
          />
          
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry
            style={styles.input}
            theme={{ colors: { primary: '#424242' } }}
          />

          {!isLogin && (
            <TextInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              mode="outlined"
              secureTextEntry
              style={styles.input}
              theme={{ colors: { primary: '#424242' } }}
            />
          )}

          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.button}
            buttonColor="#424242"
          >
            {isLogin ? 'Sign In' : 'Sign Up'}
          </Button>

          <Button
            mode="text"
            onPress={() => setIsLogin(!isLogin)}
            style={styles.switchButton}
            textColor="#424242"
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </Button>
        </Surface>
      </ThemedView>
    </SafeAreaView>
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
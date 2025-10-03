import { UniversalButton } from '@/components/UniversalButton';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Keyboard, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { auth } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';

export default function NameCollection() {
  const theme = useTheme();
  const { updateUser, setUser } = useAuth();
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.log('No authenticated user found, checking if this is test mode...');
      
      // For test mode, create a mock user in AuthContext
      // This prevents the "No user UID available" error
      const testUser = {
        uid: 'test-user-' + Date.now(),
        phoneNumber: '+91 9876543210', // Default test phone
        name: '',
        email: '',
        linkedGroupId: null,
        createdAt: new Date().toISOString()
      };
      
      console.log('Setting test user in AuthContext:', testUser.uid);
      setUser(testUser);
    } else {
      console.log('User authenticated:', currentUser.uid);
    }
  }, [setUser]);

  const handleSubmit = async () => {
    try {
      if (!name.trim()) {
        Alert.alert('Please enter your name');
        return;
      }
      
      // Check authentication before proceeding
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.log('No Firebase Auth user found, this is test mode');
        Alert.alert('Test Mode', 'In test mode, user creation is simulated. Proceeding to main app.');
        // For test mode, just navigate to main app
        router.replace('/(tabs)');
        return;
      }
      
      console.log('Updating name for user:', currentUser.uid);
      setIsLoading(true);
      await updateUser(currentUser.uid);
      Alert.alert('Welcome!', 'Your account has been set up successfully.');
      // Navigate to main app
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Error updating user name:', error);
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ThemedView style={styles.container}>
          <ThemedView style={styles.formSection}>
            <ThemedText type="title" style={styles.title}>
              What's your name?
            </ThemedText>
          
          <TextInput
            label=""
            value={name}
            onChangeText={setName}
            mode="flat"
            placeholder="Name"
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            autoFocus={true}
            style={styles.nameInput}
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
            onPress={handleSubmit} 
            style={styles.continueButton}
            loading={isLoading}
            disabled={isLoading}
            fullWidth
          >
            Continue
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
  nameInput: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingBottom: 8,
    marginBottom: 24,
  },
  inputContent: {
    fontSize: 18,
    fontWeight: '600',
    paddingBottom: 8,
  },
  continueButton: {
    marginTop: 8,
  },
});

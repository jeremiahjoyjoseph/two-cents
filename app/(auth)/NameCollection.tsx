import { UniversalButton } from '@/components/UniversalButton';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Keyboard, StyleSheet, TouchableWithoutFeedback } from 'react-native';

import { AuthTextField } from '@/components/AuthTextField';
import { ThemedView } from '@/components/ThemedView';
import { auth } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';

export default function NameCollection() {
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ThemedView style={styles.container}>
        <AuthTextField
          value={name}
          onChangeText={setName}
          placeholder="Name"
          autoCapitalize="words"
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
          autoFocus={true}
          style={styles.nameInput}
        />

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
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingTop: 100,
    paddingBottom: 40,
  },
  nameInput: {
    marginBottom: 40,
  },
  continueButton: {
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingVertical: 12,
    marginTop: 'auto',
    marginBottom: 20,
  },
});

import {
  cleanupKeys,
  decryptTransaction,
  decryptWithGroupKey,
  decryptWithPrivateKey,
  encryptTransaction,
  encryptWithGroupKey,
  encryptWithPublicKey,
  generateGroupKey,
  generateKeyPair,
  getPrivateKey,
  getPublicKey,
  storePrivateKey,
  storePublicKey,
} from '@/lib/crypto/encryption';
import { Transaction } from '@/types/transactions';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';

export const EncryptionDemo: React.FC = () => {
  const [keysGenerated, setKeysGenerated] = useState(false);
  const [demoData, setDemoData] = useState<string>('');
  const [encryptedData, setEncryptedData] = useState<string>('');
  const [decryptedData, setDecryptedData] = useState<string>('');
  const [groupKey, setGroupKey] = useState<string>('');
  const [demoTransaction, setDemoTransaction] = useState<Transaction | null>(null);
  const [encryptedTransaction, setEncryptedTransaction] = useState<any>(null);
  const [decryptedTransaction, setDecryptedTransaction] = useState<Transaction | null>(null);

  const handleGenerateKeys = async () => {
    try {
      const keyPair = await generateKeyPair();
      await storePrivateKey(keyPair.privateKey);
      await storePublicKey(keyPair.publicKey);
      setKeysGenerated(true);
      Alert.alert('Success', 'Key pair generated and stored securely!');
    } catch (error) {
      Alert.alert('Error', `Failed to generate keys: ${error}`);
    }
  };

  const handleGenerateGroupKey = () => {
    try {
      const newGroupKey = generateGroupKey();
      setGroupKey(newGroupKey);
      Alert.alert('Success', 'Group key generated!');
    } catch (error) {
      Alert.alert('Error', `Failed to generate group key: ${error}`);
    }
  };

  const handleEncryptWithPublicKey = async () => {
    if (!demoData.trim()) {
      Alert.alert('Error', 'Please enter some data to encrypt');
      return;
    }

    try {
      const publicKey = await getPublicKey();
      if (!publicKey) {
        Alert.alert('Error', 'Public key not found. Generate keys first.');
        return;
      }

      const encrypted = encryptWithPublicKey(demoData, publicKey);
      setEncryptedData(encrypted);
      Alert.alert('Success', 'Data encrypted with public key!');
    } catch (error) {
      Alert.alert('Error', `Failed to encrypt: ${error}`);
    }
  };

  const handleDecryptWithPrivateKey = async () => {
    if (!encryptedData.trim()) {
      Alert.alert('Error', 'Please encrypt some data first');
      return;
    }

    try {
      const privateKey = await getPrivateKey();
      if (!privateKey) {
        Alert.alert('Error', 'Private key not found. Generate keys first.');
        return;
      }

      const decrypted = decryptWithPrivateKey(encryptedData, privateKey);
      setDecryptedData(decrypted);
      Alert.alert('Success', 'Data decrypted with private key!');
    } catch (error) {
      Alert.alert('Error', `Failed to decrypt: ${error}`);
    }
  };

  const handleEncryptWithGroupKey = () => {
    if (!groupKey || !demoData.trim()) {
      Alert.alert('Error', 'Please generate a group key and enter data to encrypt');
      return;
    }

    try {
      const encrypted = encryptWithGroupKey(demoData, groupKey);
      setEncryptedData(encrypted);
      Alert.alert('Success', 'Data encrypted with group key!');
    } catch (error) {
      Alert.alert('Error', `Failed to encrypt: ${error}`);
    }
  };

  const handleDecryptWithGroupKey = () => {
    if (!groupKey || !encryptedData.trim()) {
      Alert.alert('Error', 'Please generate a group key and encrypt some data first');
      return;
    }

    try {
      const decrypted = decryptWithGroupKey(encryptedData, groupKey);
      setDecryptedData(decrypted);
      Alert.alert('Success', 'Data decrypted with group key!');
    } catch (error) {
      Alert.alert('Error', `Failed to decrypt: ${error}`);
    }
  };

  const handleCreateDemoTransaction = () => {
    const transaction: Transaction = {
      title: 'Coffee with friend',
      amount: 5.5,
      type: 'expense',
      date: '2025-01-15',
      createdAt: new Date() as any,
      createdBy: 'demo-user',
      notes: 'Shared coffee expense',
    };
    setDemoTransaction(transaction);
    Alert.alert('Success', 'Demo transaction created!');
  };

  const handleEncryptTransaction = () => {
    if (!demoTransaction || !groupKey) {
      Alert.alert('Error', 'Please create a demo transaction and generate a group key first');
      return;
    }

    try {
      const encrypted = encryptTransaction(demoTransaction, groupKey);
      setEncryptedTransaction(encrypted);
      Alert.alert('Success', 'Transaction encrypted!');
    } catch (error) {
      Alert.alert('Error', `Failed to encrypt transaction: ${error}`);
    }
  };

  const handleDecryptTransaction = () => {
    if (!encryptedTransaction || !groupKey) {
      Alert.alert('Error', 'Please encrypt a transaction first');
      return;
    }

    try {
      const decrypted = decryptTransaction(encryptedTransaction, groupKey);
      setDecryptedTransaction(decrypted);
      Alert.alert('Success', 'Transaction decrypted!');
    } catch (error) {
      Alert.alert('Error', `Failed to decrypt transaction: ${error}`);
    }
  };

  const handleCleanup = async () => {
    try {
      await cleanupKeys();
      setKeysGenerated(false);
      setDemoData('');
      setEncryptedData('');
      setDecryptedData('');
      setGroupKey('');
      setDemoTransaction(null);
      setEncryptedTransaction(null);
      setDecryptedTransaction(null);
      Alert.alert('Success', 'Keys cleaned up!');
    } catch (error) {
      Alert.alert('Error', `Failed to cleanup: ${error}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Encryption Workflow Demo</Text>

      {/* Key Generation Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Key Generation & Storage</Text>
        <Button
          mode="contained"
          onPress={handleGenerateKeys}
          disabled={keysGenerated}
          style={styles.button}
        >
          {keysGenerated ? 'Keys Generated ✓' : 'Generate Key Pair'}
        </Button>
        <Text style={styles.description}>
          Generates RSA key pair and stores private key securely using expo-secure-store
        </Text>
      </View>

      {/* Group Key Generation Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Group Key Generation</Text>
        <Button mode="contained" onPress={handleGenerateGroupKey} style={styles.button}>
          Generate Group Key
        </Button>
        {groupKey && (
          <Text style={styles.keyDisplay}>Group Key: {groupKey.substring(0, 20)}...</Text>
        )}
        <Text style={styles.description}>
          Generates a random AES-256 symmetric key for group encryption
        </Text>
      </View>

      {/* Asymmetric Encryption Demo */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. Asymmetric Encryption Demo</Text>
        <View style={styles.buttonRow}>
          <Button
            mode="contained"
            onPress={handleEncryptWithPublicKey}
            disabled={!keysGenerated || !demoData.trim()}
            style={[styles.button, styles.halfButton]}
          >
            Encrypt with Public Key
          </Button>
          <Button
            mode="contained"
            onPress={handleDecryptWithPrivateKey}
            disabled={!keysGenerated || !encryptedData.trim()}
            style={[styles.button, styles.halfButton]}
          >
            Decrypt with Private Key
          </Button>
        </View>
        {encryptedData && (
          <Text style={styles.encryptedDisplay}>
            Encrypted: {encryptedData.substring(0, 50)}...
          </Text>
        )}
        {decryptedData && <Text style={styles.decryptedDisplay}>Decrypted: {decryptedData}</Text>}
      </View>

      {/* Symmetric Encryption Demo */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. Symmetric Encryption Demo</Text>
        <View style={styles.buttonRow}>
          <Button
            mode="contained"
            onPress={handleEncryptWithGroupKey}
            disabled={!groupKey || !demoData.trim()}
            style={[styles.button, styles.halfButton]}
          >
            Encrypt with Group Key
          </Button>
          <Button
            mode="contained"
            onPress={handleDecryptWithGroupKey}
            disabled={!groupKey || !encryptedData.trim()}
            style={[styles.button, styles.halfButton]}
          >
            Decrypt with Group Key
          </Button>
        </View>
      </View>

      {/* Transaction Encryption Demo */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>5. Transaction Encryption Demo</Text>
        <Button mode="contained" onPress={handleCreateDemoTransaction} style={styles.button}>
          Create Demo Transaction
        </Button>
        {demoTransaction && (
          <View style={styles.transactionDisplay}>
            <Text>Title: {demoTransaction.title}</Text>
            <Text>Amount: ${demoTransaction.amount}</Text>
            <Text>Notes: {demoTransaction.notes}</Text>
          </View>
        )}
        <View style={styles.buttonRow}>
          <Button
            mode="contained"
            onPress={handleEncryptTransaction}
            disabled={!demoTransaction || !groupKey}
            style={[styles.button, styles.halfButton]}
          >
            Encrypt Transaction
          </Button>
          <Button
            mode="contained"
            onPress={handleDecryptTransaction}
            disabled={!encryptedTransaction || !groupKey}
            style={[styles.button, styles.halfButton]}
          >
            Decrypt Transaction
          </Button>
        </View>
        {encryptedTransaction && (
          <Text style={styles.encryptedDisplay}>
            Encrypted Transaction: {JSON.stringify(encryptedTransaction).substring(0, 100)}...
          </Text>
        )}
        {decryptedTransaction && (
          <View style={styles.transactionDisplay}>
            <Text>Decrypted Title: {decryptedTransaction.title}</Text>
            <Text>Decrypted Amount: ${decryptedTransaction.amount}</Text>
            <Text>Decrypted Notes: {decryptedTransaction.notes}</Text>
          </View>
        )}
      </View>

      {/* Cleanup Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>6. Cleanup</Text>
        <Button mode="outlined" onPress={handleCleanup} style={styles.button}>
          Cleanup Keys & Reset Demo
        </Button>
        <Text style={styles.description}>
          Securely removes stored keys and resets the demo state
        </Text>
      </View>

      {/* Workflow Explanation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        <Text style={styles.explanation}>
          1. Generate RSA key pair on user registration{'\n'}
          2. Store private key securely on device{'\n'}
          3. Upload public key to Firestore{'\n'}
          4. When pairing users, generate AES group key{'\n'}
          5. Encrypt group key with each user's public key{'\n'}
          6. Store encrypted group keys in Firestore{'\n'}
          7. Encrypt transactions with group key{'\n'}
          8. Decrypt on client using private key + group key
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  button: {
    marginVertical: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  halfButton: {
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    marginVertical: 8,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  keyDisplay: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 4,
    fontFamily: 'monospace',
    fontSize: 12,
    marginTop: 8,
  },
  encryptedDisplay: {
    backgroundColor: '#fff3cd',
    padding: 8,
    borderRadius: 4,
    fontFamily: 'monospace',
    fontSize: 12,
    marginTop: 8,
    color: '#856404',
  },
  decryptedDisplay: {
    backgroundColor: '#d4edda',
    padding: 8,
    borderRadius: 4,
    fontFamily: 'monospace',
    fontSize: 12,
    marginTop: 8,
    color: '#155724',
  },
  transactionDisplay: {
    backgroundColor: '#e7f3ff',
    padding: 12,
    borderRadius: 4,
    marginTop: 8,
  },
  explanation: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

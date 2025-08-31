# TwoCents App - Hybrid Client-Side Encryption Implementation

## Overview

This document describes the implementation of a hybrid client-side encryption system in the TwoCents app, which provides **field-level encryption** for shared financial transactions between paired users while maintaining security and performance.

## Field-Level Encryption Strategy

### 🔐 **Fields to Encrypt (Sensitive Data)**

For transactions under `groups/{groupId}/transactions/{txId}`, **only** these sensitive fields are encrypted:

- `encryptedTitle`: The user-entered description of the transaction
- `encryptedAmount`: The monetary value
- `encryptedNotes`: Any extra user note (optional)

**These fields are NEVER visible in Firestore in plaintext form.**

### 📊 **Fields to Leave in Plaintext (Performance & Functionality)**

To maintain app performance, querying, and UI behaviors, these fields remain non-encrypted:

- `type`: `'income' | 'expense'` - For UI categorization and filtering
- `date`: Transaction date - For display and UI grouping
- `createdAt`: Firestore timestamp - For sorting and sync operations
- `createdBy`: User UID identifier - For access control and attribution
- `groupId`: Group reference - For routing and organization

### 🚀 **Benefits of Field-Level Strategy**

- **Performance**: Non-sensitive fields can be queried and indexed efficiently
- **Functionality**: UI features like filtering, sorting, and grouping work seamlessly
- **Security**: Sensitive financial data remains encrypted end-to-end
- **Compliance**: Meets data protection requirements while maintaining usability

## Architecture

### Hybrid Encryption Model

The system uses a **hybrid approach** combining:

- **Asymmetric encryption (RSA)** for secure key exchange
- **Symmetric encryption (AES-256)** for efficient data encryption

This approach provides the security benefits of asymmetric encryption with the performance advantages of symmetric encryption for large data payloads.

### Key Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User A        │    │   Firestore     │    │   User B        │
│                 │    │                 │    │                 │
│ Private Key A   │    │ Public Key A    │    │ Private Key B   │
│ (Secure Store)  │◄──►│ Public Key B    │◄──►│ (Secure Store)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Group Key       │    │ Encrypted       │    │ Group Key       │
│ (AES-256)      │    │ Group Keys      │    │ (AES-256)      │
│                 │    │                 │    │                 │
│ Encrypted with  │    │ {uidA: encKeyA, │    │ Encrypted with  │
│ Public Key A    │    │  uidB: encKeyB} │    │ Public Key B    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Transactions    │    │ Field-Level     │    │ Transactions    │
│ Encrypted with  │    │ Encryption      │    │ Encrypted with  │
│ Group Key       │    │ (Title+Amount+  │    │ Group Key       │
│ (Sensitive      │    │ Notes only)     │    │ (Sensitive      │
│ fields only)    │    │                 │    │ fields only)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Implementation Details

### 1. Key Generation & Storage

#### User Registration Flow

```typescript
// When a user registers, keys are automatically generated
export const registerUser = async (userData: UserRegistrationData) => {
  // 1. Generate RSA key pair
  const keyPair = await generateKeyPair();

  // 2. Store private key securely on device
  await storePrivateKey(keyPair.privateKey);

  // 3. Store public key in Firestore
  const userDataWithKey = {
    ...userData,
    publicKey: keyPair.publicKey,
  };

  await setDoc(doc(firestore, 'users', uid), userDataWithKey);
};
```

#### Key Storage

- **Private Key**: Stored securely using `expo-secure-store` (iOS Keychain/Android Keystore)
- **Public Key**: Stored in Firestore at `/users/{uid}/publicKey`

### 2. Group Pairing & Key Exchange

#### Pairing Process

```typescript
export const redeemPartnerCode = async (uid: string, code: string) => {
  // 1. Validate partner code
  const codeData = await validateCode(code);

  // 2. Fetch public keys for both users
  const [userA, userB] = await fetchUserPublicKeys([codeData.generatedBy, uid]);

  // 3. Generate AES group key
  const groupKey = generateGroupKey();

  // 4. Encrypt group key for each user
  const encryptedGroupKeys = encryptGroupKeyForUsers(groupKey, {
    [userA.uid]: userA.publicKey,
    [userB.uid]: userB.publicKey,
  });

  // 5. Create a new group with encrypted keys
  const groupRef = await addDoc(collection(firestore, 'groups'), {
    userIds: [userA.uid, userB.uid],
    encryptedGroupKeys,
    createdAt: Timestamp.now(),
  });

  // 6. Migrate and encrypt existing transactions
  await migrateAndEncryptTransactions(groupRef.id, groupKey);
};
```

### 3. Field-Level Transaction Encryption

#### Adding New Transactions

```typescript
export const addTransaction = async (userId: string, groupId: string, data: TransactionInput) => {
  if (groupId) {
    // 1. Get encrypted group key for current user
    const groupDoc = await getDoc(doc(firestore, 'groups', groupId));
    const encryptedGroupKey = groupDoc.data().encryptedGroupKeys[userId];

    // 2. Decrypt group key using private key
    const groupKey = await decryptGroupKey(encryptedGroupKey);

    // 3. Encrypt ONLY sensitive fields with group key
    const encryptedTransaction = encryptTransaction(data, groupKey);

    // 4. Store encrypted transaction (sensitive fields encrypted, others plaintext)
    return await addDoc(
      collection(firestore, 'groups', groupId, 'transactions'),
      encryptedTransaction
    );
  } else {
    // Individual transactions stored as plain text (no encryption needed)
    return await addDoc(collection(firestore, 'users', userId, 'transactions'), data);
  }
};
```

#### Fetching & Decrypting Transactions

```typescript
export const getTransactionsByMonth = async (userId: string, groupId: string, month: string) => {
  if (groupId) {
    // 1. Get encrypted group key
    const groupDoc = await getDoc(doc(firestore, 'groups', groupId));
    const encryptedGroupKey = groupDoc.data().encryptedGroupKeys[userId];

    // 2. Decrypt group key
    const groupKey = await decryptGroupKey(encryptedGroupKey);

    // 3. Fetch and decrypt ONLY sensitive fields
    const snapshot = await getDocs(query);
    const decryptedTransactions = await Promise.all(
      snapshot.docs.map(async doc => {
        const encryptedData = doc.data() as EncryptedTransaction;
        return decryptTransaction(encryptedData, groupKey);
      })
    );

    return decryptedTransactions;
  } else {
    // Return individual transactions as-is (already plaintext)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};
```

### 4. Data Structures

#### User Document

```typescript
{
  uid: string;
  email: string;
  name: string;
  publicKey: string;        // RSA public key for encryption
  linkedGroupId?: string;   // Reference to paired group
  createdAt: Timestamp;
}
```

#### Group Document

```typescript
{
  id: string;
  userIds: string[];        // Array of user IDs
  encryptedGroupKeys: {     // Group key encrypted for each user
    [uidA]: string;         // Encrypted with user A's public key
    [uidB]: string;         // Encrypted with user B's public key
  };
  createdAt: Timestamp;
}
```

#### Encrypted Transaction (Field-Level Encryption)

```typescript
{
  id?: string;

  // 🔐 ENCRYPTED FIELDS (sensitive data only)
  encryptedTitle: string;      // AES encrypted title
  encryptedAmount: string;     // AES encrypted amount
  encryptedNotes?: string;     // AES encrypted notes (optional)

  // 📊 PLAINTEXT FIELDS (non-sensitive, needed for performance)
  type: TransactionType;       // For UI categorization and filtering
  date: string;                // For display and UI grouping
  createdAt: Timestamp;        // For sorting and sync operations
  createdBy: string;           // For access control and attribution
  groupId?: string;            // For routing and organization
}
```

## Security Rules & Field Validation

### Firestore Security Rules

The system implements comprehensive security rules that enforce the field-level encryption strategy:

```javascript
function isValidEncryptedTransactionFields(data) {
  // Define allowed fields for encrypted transactions
  let allowedFields = [
    'encryptedTitle',      // Encrypted sensitive field
    'encryptedAmount',     // Encrypted sensitive field
    'encryptedNotes',      // Encrypted sensitive field (optional)
    'type',               // Plaintext for performance
    'date',               // Plaintext for performance
    'createdAt',          // Plaintext for performance
    'createdBy',          // Plaintext for performance
    'groupId'             // Plaintext for performance
  ];

  // Check if all fields are allowed
  return data.keys().hasOnly(allowedFields);
}

// Group transactions - enforce field-level encryption
match /groups/{groupId}/transactions/{transactionId} {
  allow create: if isAuthenticated() &&
                isGroupMember(get('../../groupId')) &&
                isValidEncryptedTransactionFields(resource.data) &&
                // Ensure sensitive fields are actually encrypted (not empty)
                resource.data.encryptedTitle is string &&
                resource.data.encryptedTitle.size() > 0 &&
                resource.data.encryptedAmount is string &&
                resource.data.encryptedAmount.size() > 0;
}
```

### Field Validation

The system includes comprehensive validation to ensure only allowed fields are present:

```typescript
// Field-level encryption configuration
export const ENCRYPTED_FIELDS = ['encryptedTitle', 'encryptedAmount', 'encryptedNotes'] as const;

export const PLAINTEXT_FIELDS = ['type', 'date', 'createdAt', 'createdBy', 'groupId'] as const;

export const ALLOWED_TRANSACTION_FIELDS = [
  ...ENCRYPTED_FIELDS,
  ...PLAINTEXT_FIELDS,
  'id', // Document ID is allowed
] as const;

// Type guard to ensure only allowed fields are present
export const isValidTransactionFields = (data: any): data is EncryptedTransaction => {
  const dataKeys = Object.keys(data);
  return dataKeys.every(key => ALLOWED_TRANSACTION_FIELDS.includes(key as any));
};
```

## Security Features

### 1. Key Isolation

- Private keys never leave the device
- Public keys are stored in Firestore for key exchange
- Group keys are encrypted before storage

### 2. Secure Storage

- Uses `expo-secure-store` for private key storage
- Leverages platform-specific secure storage (iOS Keychain, Android Keystore)
- Keys are automatically cleaned up on logout

### 3. Encryption Strength

- RSA-2048 for asymmetric encryption (key exchange)
- AES-256 for symmetric encryption (data)
- Random key generation for each group

### 4. Access Control

- Each user can only decrypt their own encrypted group key
- Group keys are unique per group
- Transactions are encrypted with group-specific keys

### 5. Field-Level Security

- **Sensitive fields** (title, amount, notes) are always encrypted
- **Non-sensitive fields** remain in plaintext for performance
- Firestore rules enforce field structure validation
- No sensitive data can be stored in plaintext

## Usage Examples

### Demo Component

The `EncryptionDemo` component provides an interactive demonstration of the encryption workflow:

```typescript
import { EncryptionDemo } from '@/components/EncryptionDemo';

// Add to your app for testing
<EncryptionDemo />;
```

### Manual Key Management

```typescript
import {
  generateKeyPair,
  storePrivateKey,
  getPrivateKey,
  cleanupKeys,
} from '@/lib/crypto/encryption';

// Generate new keys
const keyPair = await generateKeyPair();
await storePrivateKey(keyPair.privateKey);

// Retrieve private key
const privateKey = await getPrivateKey();

// Cleanup on logout
await cleanupKeys();
```

### Transaction Encryption

```typescript
import { encryptTransaction, decryptTransaction } from '@/lib/crypto/encryption';

// Encrypt transaction (only sensitive fields)
const encrypted = encryptTransaction(transactionData, groupKey);

// Decrypt transaction (only sensitive fields)
const decrypted = decryptTransaction(encryptedTransaction, groupKey);
```

### Field Validation

```typescript
import { validateTransactionFields } from '@/lib/crypto/encryption';

// Validate transaction structure
if (!validateTransactionFields(transactionData)) {
  throw new Error('Invalid transaction structure');
}
```

## Performance Considerations

### 1. Encryption Overhead

- **Key Generation**: One-time cost during user registration
- **Transaction Encryption**: Minimal overhead per transaction (only 3 fields)
- **Key Exchange**: Only during pairing/unpairing

### 2. Storage Impact

- Encrypted transactions are slightly larger than plain text
- Only 3 fields are encrypted, minimizing storage overhead
- Group keys add minimal storage overhead
- Public keys are small (typically < 1KB)

### 3. Network Efficiency

- Only encrypted data is transmitted for sensitive fields
- Non-sensitive fields remain in plaintext for efficient querying
- Keys are exchanged only during pairing
- Real-time decryption on client side

### 4. Query Performance

- **Plaintext fields** can be indexed and queried efficiently
- **Encrypted fields** are not queryable (by design)
- UI features like filtering and sorting work seamlessly
- No performance impact on common operations

## Security Best Practices

### 1. Key Management

- Never log or store private keys in plain text
- Use secure storage APIs (expo-secure-store)
- Implement key rotation for long-term security

### 2. Error Handling

- Fail securely on encryption/decryption errors
- Don't expose sensitive information in error messages
- Implement graceful degradation

### 3. Audit & Monitoring

- Log encryption/decryption operations (without sensitive data)
- Monitor for unusual patterns
- Implement rate limiting for key operations

### 4. Field Validation

- Validate transaction structure before encryption
- Ensure only allowed fields are present
- Reject transactions with invalid field structures

## Production Considerations

### 1. Key Strength

- Consider upgrading to RSA-4096 for production
- Implement proper key derivation functions
- Add key versioning for future upgrades

### 2. Platform Support

- Test on both iOS and Android
- Verify secure storage implementation
- Handle platform-specific security features

### 3. Backup & Recovery

- Implement secure key backup mechanisms
- Plan for key recovery scenarios
- Consider hardware security modules (HSM)

### 4. Field-Level Security

- Ensure sensitive fields are never logged
- Implement field-level access controls
- Monitor for unauthorized field access attempts

## Troubleshooting

### Common Issues

#### 1. Key Not Found Errors

```typescript
// Check if keys exist
const privateKey = await getPrivateKey();
if (!privateKey) {
  // Regenerate keys or handle missing key scenario
  await handleMissingKeys();
}
```

#### 2. Decryption Failures

```typescript
try {
  const decrypted = decryptTransaction(encryptedData, groupKey);
} catch (error) {
  // Handle decryption failure
  console.error('Decryption failed:', error);
  // Implement fallback or error recovery
}
```

#### 3. Field Validation Errors

```typescript
// Validate transaction structure
if (!validateTransactionFields(transactionData)) {
  console.error('Invalid transaction structure');
  // Handle validation failure
}
```

#### 4. Storage Permission Issues

```typescript
// Ensure secure store permissions
import * as SecureStore from 'expo-secure-store';

// Check if secure store is available
if (SecureStore.isAvailableAsync()) {
  // Proceed with key storage
} else {
  // Handle fallback storage
}
```

## Future Enhancements

### 1. Advanced Cryptography

- Implement ECC (Elliptic Curve Cryptography) for better performance
- Add post-quantum cryptography support
- Implement zero-knowledge proofs for privacy

### 2. Key Management

- Add key rotation capabilities
- Implement hierarchical key management
- Add multi-device key synchronization

### 3. Privacy Features

- Implement differential privacy
- Add anonymous transaction capabilities
- Implement secure multi-party computation

### 4. Field-Level Enhancements

- Add field-level access controls
- Implement selective field encryption
- Add field-level audit logging

## Conclusion

The **field-level hybrid client-side encryption system** provides a robust foundation for secure financial data sharing in the TwoCents app. By encrypting only sensitive fields while keeping performance-critical fields in plaintext, it achieves both security and usability goals.

The implementation follows security best practices and provides a solid foundation for future enhancements and production deployment. The field-level strategy ensures that:

- **Sensitive financial data** is always encrypted
- **App performance** is maintained through plaintext querying
- **UI functionality** works seamlessly without encryption overhead
- **Security compliance** is met through comprehensive field validation

This approach provides the optimal balance between security, performance, and user experience for a financial application.

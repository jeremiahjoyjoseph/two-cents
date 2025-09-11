# Testing Utilities

This folder contains development testing utilities that should be removed or disabled in production builds.

## Structure

```
lib/testing/
├── index.ts                 # Main export file for all testing utilities
├── encryptionKeyTest.ts     # Encryption key testing functions
└── README.md               # This documentation file
```

## Usage

### Encryption Key Testing

The `encryptionKeyTest.ts` file provides utilities to test encryption key functionality:

```typescript
import { testEncryptionKey, testAllEncryptionKeys } from '@/lib/testing';

// Test a single user's encryption key
const result = await testEncryptionKey(userId);

// Test multiple users' encryption keys
const results = await testAllEncryptionKeys([userId1, userId2]);
```

### Development-Only Features

In your components, use `__DEV__` flag to show testing features only in development:

```typescript
{
  __DEV__ && (
    <TouchableOpacity onPress={handleTestEncryptionKey}>
      <Text>Test Encryption Key</Text>
    </TouchableOpacity>
  );
}
```

## Production Considerations

- Remove or disable these testing utilities in production builds
- The `__DEV__` flag automatically hides development features in production
- Consider adding environment variables to control testing features

## Adding New Tests

1. Create a new test file in this folder (e.g., `userTest.ts`)
2. Export your test functions from the file
3. Add exports to `index.ts`
4. Import and use in your components with `__DEV__` guards

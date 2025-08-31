// Mock expo-secure-store globally
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
}));

// Mock crypto-js for consistent testing
jest.mock('crypto-js', () => {
  // Create a deterministic mock for consistent test results
  const mockCryptoJS = {
    AES: {
      encrypt: jest.fn((text, key) => {
        // Simple mock encryption that's deterministic
        return {
          toString: () => `encrypted_${text}_${key}`,
        };
      }),
      decrypt: jest.fn((encrypted, key) => {
        // Simple mock decryption - always return the original text
        if (encrypted.toString().startsWith('encrypted_')) {
          const parts = encrypted.toString().split('_');
          if (parts.length >= 3) {
            return {
              toString: encoding => {
                if (encoding === 'utf8') {
                  return parts[1]; // Return the original text
                }
                return encrypted.toString();
              },
            };
          }
        }
        // For any other case, return empty string
        return {
          toString: () => '',
        };
      }),
    },
    lib: {
      WordArray: {
        random: jest.fn(size => ({
          toString: () => `random_key_${size}_test`,
        })),
      },
    },
    enc: {
      Utf8: 'utf8',
    },
  };

  return mockCryptoJS;
});

// Global test timeout
jest.setTimeout(10000);

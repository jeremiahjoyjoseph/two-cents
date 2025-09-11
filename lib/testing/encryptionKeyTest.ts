import { getEncryptionKey, verifyEncryptionKey } from '@/lib/api/auth';

/**
 * Testing utilities for encryption key functionality
 * This file should be removed or disabled in production
 */

export const testEncryptionKey = async (uid: string) => {
  console.log('🔐 Testing encryption key for user:', uid);

  try {
    // Verify if key exists
    const keyExists = await verifyEncryptionKey(uid);

    if (keyExists) {
      // Get the actual key
      const key = await getEncryptionKey(uid);

      console.log('✅ Encryption key test results:');
      console.log('   - Key exists: true');
      console.log('   - Key length:', key?.length || 0, 'characters');
      console.log(
        '   - Key preview:',
        key?.substring(0, 8) + '...' + key?.substring((key?.length || 0) - 8)
      );
      console.log('   - Full key:', key);

      return {
        success: true,
        keyExists: true,
        keyLength: key?.length || 0,
        keyPreview: key?.substring(0, 8) + '...' + key?.substring((key?.length || 0) - 8),
        fullKey: key,
      };
    } else {
      console.log('❌ Encryption key test failed:');
      console.log('   - Key exists: false');
      console.log('   - No encryption key found for this user');

      return {
        success: false,
        keyExists: false,
        error: 'No encryption key found',
      };
    }
  } catch (error) {
    console.error('❌ Encryption key test error:', error);
    return {
      success: false,
      keyExists: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export const testAllEncryptionKeys = async (uids: string[]) => {
  console.log('🔐 Testing encryption keys for multiple users:', uids);

  const results = await Promise.all(uids.map(uid => testEncryptionKey(uid)));

  const summary = {
    total: uids.length,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results,
  };

  console.log('📊 Encryption key test summary:', summary);
  return summary;
};

/**
 * Auto-test encryption key on app load
 * This function should only be called in development mode
 */
export const autoTestEncryptionKeyOnLoad = async (user: { uid: string } | null) => {
  if (!user?.uid) {
    console.log('❌ No user UID available for testing');
    return;
  }

  console.log('🧪 Testing encryption key on app load...');
  await testEncryptionKey(user.uid);
};

/**
 * Test encryption key from AuthContext
 * This function demonstrates how to use the AuthContext encryption key
 */
export const testAuthContextEncryptionKey = async (
  getEncryptionKey: () => Promise<string | null>
) => {
  console.log('🧪 Testing encryption key from AuthContext...');

  try {
    const key = await getEncryptionKey();

    if (key) {
      console.log('✅ AuthContext encryption key test results:');
      console.log('   - Key exists: true');
      console.log('   - Key length:', key.length, 'characters');
      console.log('   - Key preview:', key.substring(0, 8) + '...' + key.substring(key.length - 8));
      console.log('   - Full key:', key);

      return {
        success: true,
        keyExists: true,
        keyLength: key.length,
        keyPreview: key.substring(0, 8) + '...' + key.substring(key.length - 8),
        fullKey: key,
      };
    } else {
      console.log('❌ AuthContext encryption key test failed:');
      console.log('   - Key exists: false');
      console.log('   - No encryption key available from AuthContext');

      return {
        success: false,
        keyExists: false,
        error: 'No encryption key available from AuthContext',
      };
    }
  } catch (error) {
    console.error('❌ AuthContext encryption key test error:', error);
    return {
      success: false,
      keyExists: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

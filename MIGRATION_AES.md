# AES Encryption Migration Guide

## Overview

This migration upgrades the encryption system from XOR (insecure) to AES-256-CBC (production-grade). This is a **breaking change** that requires all existing encrypted data to be cleared.

## What Changed

### Before (XOR Encryption)
- ❌ Simple XOR encryption (not cryptographically secure)
- ❌ Personal keys only stored on device
- ❌ No multi-device support
- ❌ Vulnerable to known-plaintext attacks

### After (AES-256-CBC Encryption)
- ✅ AES-256-CBC encryption (industry standard)
- ✅ Personal keys encrypted with password-derived KEK (PBKDF2)
- ✅ Personal keys backed up in Firestore (encrypted)
- ✅ Seamless multi-device support
- ✅ Production-ready security

## Architecture

```
User Password → PBKDF2 → KEK (Key Encryption Key)
Personal Key (32 bytes) → AES-256-CBC encrypted with KEK → Firestore
Transaction Amounts → AES-256-CBC encrypted with Personal Key → Firestore
Group Key → AES-256-CBC encrypted with each user's Personal Key → Firestore
```

## Multi-Device Support

Users can now seamlessly switch devices:

1. **Device A**: Register → Personal key generated → Encrypted with password → Stored in cloud
2. **Device B**: Login → Fetch encrypted key from cloud → Decrypt with password → Store locally
3. **Result**: Same transactions accessible on both devices

## Breaking Changes

⚠️ **All existing encrypted data will be incompatible**

- Existing transactions encrypted with XOR cannot be decrypted with AES
- Users must start fresh after this update
- Group pairings will need to be re-established

## Migration Steps

### For Development/Testing

1. **Clear Firestore Data** (Optional - only if you want to test fresh):
   ```bash
   # In Firebase Console:
   # 1. Go to Firestore Database
   # 2. Delete all documents in:
   #    - users/{uid}/transactions (all subcollections)
   #    - groups/{groupId}/transactions (all subcollections)
   ```

2. **Update App**:
   - Pull latest changes
   - Run `npm install` to get `aes-js` dependency
   - Run the app

3. **Test Flow**:
   - Register new account
   - Add transactions
   - Logout
   - Login from different device (or clear app data)
   - Verify transactions are accessible

### For Production

1. **Notify Users**:
   - Add a migration notice in the app
   - Explain that transactions will be cleared
   - Provide export option if needed (future feature)

2. **Deploy Update**:
   - Users will be logged out automatically (old keys incompatible)
   - Users must re-register or re-login
   - Fresh start with secure AES encryption

## Security Improvements

| Feature | XOR | AES-256-CBC |
|---------|-----|-------------|
| Algorithm Strength | Weak | Military-grade |
| Key Derivation | None | PBKDF2 (100k iterations) |
| Multi-Device | ❌ | ✅ |
| Cloud Backup | ❌ | ✅ (encrypted) |
| Known-Plaintext Attack | Vulnerable | Resistant |
| Production Ready | ❌ | ✅ |

## New Firestore Schema

```typescript
users/{uid} {
  uid: string;
  email: string;
  name: string;
  linkedGroupId: string | null;
  createdAt: string;
  encryptedPersonalKey: string;  // NEW: AES-encrypted personal key
  keySalt: string;                // NEW: Salt for PBKDF2
}
```

## Technical Details

### Files Modified

- `lib/utils/aes.ts` (NEW) - AES encryption utilities
- `lib/utils/encryption.ts` - Cloud storage for encrypted keys
- `lib/utils/transactionEncryption.ts` - Replaced XOR with AES
- `lib/api/auth.ts` - Password-based key encryption on register/login
- `lib/api/pair.ts` - AES group key encryption
- `types/user.ts` - Added encryption key fields
- `types/aes-js.d.ts` (NEW) - Type definitions

### Dependencies Added

- `aes-js` - Pure JavaScript AES implementation

## Testing Checklist

- [ ] Register new account → key stored in cloud
- [ ] Login from same device → key retrieved from cloud
- [ ] Login from different device → key retrieved and decrypted
- [ ] Add transaction → encrypted with AES
- [ ] View transaction → decrypted correctly
- [ ] Pair with partner → group key encrypted with AES
- [ ] Partner views shared transaction → decrypted correctly
- [ ] Unlink partner → data cleared correctly

## Troubleshooting

### "Encryption key not found"
- Old account with XOR encryption
- Solution: Register new account

### "Failed to decrypt personal key"
- Incorrect password
- Solution: Use correct password or reset (if implemented)

### Transactions not visible on new device
- Key not synced properly
- Solution: Logout and login again

## Future Enhancements

- [ ] Key rotation mechanism
- [ ] Export/import encrypted transactions
- [ ] Password recovery flow
- [ ] Backup codes for key recovery

## Questions?

Contact the development team or check the code documentation in:
- `lib/utils/aes.ts` - Core AES functions
- `lib/utils/encryption.ts` - Key management


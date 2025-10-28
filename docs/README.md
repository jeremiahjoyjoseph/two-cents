# Two-Cents Documentation

This folder contains technical documentation for the Two-Cents expense tracking application.

## Documentation Files

### [AES_IMPLEMENTATION_SUMMARY.md](./AES_IMPLEMENTATION_SUMMARY.md)
Complete documentation for the AES-256 encryption implementation that replaced the original XOR encryption. This covers:
- Core encryption utilities
- Personal key management
- Transaction encryption
- Group key encryption
- Multi-device support
- Security guarantees and testing checklist

### [MIGRATION_AES.md](./MIGRATION_AES.md)
Migration guide from XOR to AES encryption. Includes:
- Breaking changes
- Step-by-step migration instructions
- Security improvements
- Backward compatibility notes

### [PIN_MIGRATION_IMPLEMENTATION.md](./PIN_MIGRATION_IMPLEMENTATION.md)
Implementation guide for PIN-based encryption (replacing password-based encryption). Covers:
- Complete implementation details
- Registration and login flows
- Periodic PIN verification
- Integration instructions
- Testing checklist
- Security properties

## Quick Links

**For Developers:**
- Setting up encryption: See [AES_IMPLEMENTATION_SUMMARY.md](./AES_IMPLEMENTATION_SUMMARY.md)
- Implementing PIN auth: See [PIN_MIGRATION_IMPLEMENTATION.md](./PIN_MIGRATION_IMPLEMENTATION.md)

**For Security Review:**
- Encryption architecture: [AES_IMPLEMENTATION_SUMMARY.md](./AES_IMPLEMENTATION_SUMMARY.md) → "How It Works"
- Key management: [PIN_MIGRATION_IMPLEMENTATION.md](./PIN_MIGRATION_IMPLEMENTATION.md) → "Security Properties"

## Architecture Overview

```
User Authentication:
  Email + Password (Firebase Auth)
    ↓
  6-digit PIN (for encryption)
    ↓
  PIN → PBKDF2 → KEK (Key Encryption Key)
    ↓
  KEK encrypts Personal Encryption Key
    ↓
  Personal Key encrypts transaction data (AES-256-CBC)
```

## File Structure

```
two-cents/
├── docs/                           ← You are here
│   ├── README.md
│   ├── AES_IMPLEMENTATION_SUMMARY.md
│   ├── MIGRATION_AES.md
│   └── PIN_MIGRATION_IMPLEMENTATION.md
├── lib/
│   └── utils/
│       ├── aes.ts                 ← Core AES encryption
│       ├── encryption.ts          ← Key management
│       └── transactionEncryption.ts
├── lib/api/
│   ├── auth.ts                    ← Registration/login with PIN
│   ├── transactions.ts            ← Transaction encryption
│   └── pair.ts                    ← Group key encryption
└── app/(auth)/
    ├── SetSecurityPIN.tsx         ← PIN setup UI
    └── EnterSecurityPIN.tsx       ← PIN entry UI
```

## Latest Updates

**December 2024:**
- ✅ Migrated from password-based to PIN-based encryption
- ✅ Enhanced transaction encryption (title, amount, category)
- ✅ Implemented periodic PIN verification
- ✅ Added comprehensive testing documentation

**Previous:**
- ✅ Migrated from XOR to AES-256-CBC encryption
- ✅ Implemented multi-device key synchronization
- ✅ Added group encryption for paired users

---

For questions or issues, refer to the specific documentation file related to your concern.


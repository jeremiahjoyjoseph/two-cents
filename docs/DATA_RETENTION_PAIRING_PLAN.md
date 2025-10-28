# Data Retention During Partner Pairing

## Overview
Allow users to choose whether to retain existing data when pairing. If yes, re-encrypt all transactions from both users with the new group key and merge categories, showing progress during the migration.

## User Flow

### When User B Redeems Code:
1. Show confirmation dialog:
   - "Link with [Partner Name]?"
   - Two options:
     - **"Start Fresh"** - Delete all existing transactions (current behavior)
     - **"Keep Our Data"** - Merge all transactions and categories
2. If "Keep Our Data":
   - Show full-screen modal with progress bar
   - Block all app interaction
   - Display: "Merging data... X of Y transactions migrated"
   - Show percentage progress
3. After completion:
   - Navigate to home with merged data

---

## Implementation Changes

### 1. Create Migration UI Components

**`components/DataMigrationModal.tsx`** (new file):
- Full-screen blocking modal
- Progress bar component
- Status text: "Migrating User A's transactions...", "Migrating User B's transactions...", "Merging categories..."
- Percentage display
- Cannot be dismissed during migration

**`components/PairingConfirmationDialog.tsx`** (new file):
- Dialog asking: "Do you want to keep existing data?"
- Two buttons:
  - "Start Fresh" (current behavior)
  - "Keep Our Data" (new feature)
- Explanation text about what each option does

### 2. Modify `lib/api/pair.ts`

**Add new migration functions:**

```typescript
// Decrypt user's transactions and re-encrypt with group key
const migrateUserTransactions = async (
  userId: string,
  personalKey: string,
  groupKey: string,
  groupId: string,
  onProgress: (current: number, total: number) => void
): Promise<void> => {
  // 1. Fetch all user's personal transactions
  // 2. For each transaction:
  //    - Decrypt with personalKey
  //    - Re-encrypt with groupKey
  //    - Save to group transactions collection
  //    - Call onProgress callback
  // 3. Delete original personal transactions
}

// Fetch and merge categories from both users
const mergeCategoriesForGroup = async (
  userAId: string,
  userBId: string,
  groupId: string
): Promise<void> => {
  // 1. Fetch custom categories from both users
  // 2. Group by name (case-insensitive)
  // 3. For matching names: keep one, map to both users' transactions
  // 4. For unique names: create in group categories
  // 5. Return category mapping for transaction updates
}
```

**Modify `redeemPartnerCode` function:**

```typescript
export const redeemPartnerCode = async (
  uid: string,
  code: string,
  retainData: boolean, // NEW PARAMETER
  onProgress?: (stage: string, current: number, total: number) => void,
  updateLinkedGroupId: (groupId: string | null) => void
): Promise<string> => {
  // ... existing validation code ...
  
  if (retainData) {
    // NEW: Data migration flow
    
    // Get personal keys for both users
    const userAKey = await getPersonalKey(codeData.generatedBy);
    const userBKey = await getPersonalKey(uid);
    
    // Count transactions for progress
    const userATransactions = await countUserTransactions(codeData.generatedBy);
    const userBTransactions = await countUserTransactions(uid);
    const totalTransactions = userATransactions + userBTransactions;
    
    // Migrate User A's transactions
    onProgress?.('userA', 0, totalTransactions);
    await migrateUserTransactions(
      codeData.generatedBy,
      userAKey,
      rawGroupKey,
      groupId,
      (current, total) => onProgress?.('userA', current, totalTransactions)
    );
    
    // Migrate User B's transactions
    onProgress?.('userB', userATransactions, totalTransactions);
    await migrateUserTransactions(
      uid,
      userBKey,
      rawGroupKey,
      groupId,
      (current, total) => onProgress?.('userB', userATransactions + current, totalTransactions)
    );
    
    // Merge categories
    onProgress?.('categories', totalTransactions, totalTransactions);
    await mergeCategoriesForGroup(codeData.generatedBy, uid, groupId);
    
  } else {
    // EXISTING: Clear all transactions (fresh start)
    await Promise.all([
      clearUserTransactions(codeData.generatedBy),
      clearUserTransactions(uid)
    ]);
  }
  
  // ... rest of existing code ...
}
```

### 3. Update Pairing UI Screen

**File: `app/(tabs)/settings/pair.tsx` (or wherever pairing screen is)**

Add confirmation dialog before redeeming code:

```typescript
const handleRedeemCode = async () => {
  // Show confirmation dialog
  const retainData = await showPairingConfirmation();
  
  if (retainData === null) return; // User cancelled
  
  if (retainData) {
    // Show migration modal
    setMigrationModalVisible(true);
    
    await redeemPartnerCode(
      user.uid,
      code,
      true, // retainData
      (stage, current, total) => {
        setMigrationProgress({ stage, current, total });
      },
      updateLinkedGroupId
    );
    
    setMigrationModalVisible(false);
  } else {
    // Fresh start (current behavior)
    await redeemPartnerCode(user.uid, code, false, undefined, updateLinkedGroupId);
  }
}
```

### 4. Update Transaction Migration Logic

**In `lib/api/transactions.ts`:**

Add helper to fetch and decrypt user transactions:

```typescript
export const getUserTransactionsForMigration = async (
  userId: string,
  personalKey: string
): Promise<DecryptedTransaction[]> => {
  // Fetch all transactions
  // Decrypt each with personal key
  // Return array of decrypted transactions
}

export const saveGroupTransactionBulk = async (
  groupId: string,
  transactions: DecryptedTransaction[],
  groupKey: string
): Promise<void> => {
  // Re-encrypt with group key
  // Batch write to Firestore (max 500 per batch)
  // Handle large datasets with multiple batches
}
```

### 5. Category Merging Logic

**In `lib/api/categories.ts`:**

```typescript
export const mergeCategoriesForPairing = async (
  userAId: string,
  userBId: string,
  groupId: string
): Promise<Map<string, string>> => {
  // Return mapping: oldCategoryId -> newGroupCategoryId
  
  // 1. Fetch both users' custom categories
  // 2. Default categories (built-in): no action needed
  // 3. Custom categories:
  //    - Group by name (case-insensitive)
  //    - If same name: create one group category, map both
  //    - If unique: create separate group categories
  // 4. Update transaction categoryId references
  // 5. Return category ID mapping
}
```

---

## Progress Stages

1. **"Fetching User A's data..."** - Fetch User A transactions
2. **"Migrating User A's transactions... X/Y"** - Decrypt + re-encrypt
3. **"Fetching User B's data..."** - Fetch User B transactions
4. **"Migrating User B's transactions... X/Y"** - Decrypt + re-encrypt
5. **"Merging categories..."** - Category deduplication
6. **"Finalizing..."** - Cleanup + group setup

---

## Error Handling

- If migration fails midway:
  - Rollback: Delete partial group data
  - Keep original personal data intact
  - Show error: "Migration failed. Your data is safe. Please try again."
- If user loses connection:
  - Resume from last checkpoint
  - Or restart migration

---

## Performance Considerations

- **Batch Operations**: Process transactions in batches of 50
- **Progress Updates**: Update UI every 10 transactions (not every single one)
- **Firestore Limits**: Max 500 writes per batch, handle large datasets
- **Estimated Time**: ~1 transaction per 100ms → 100 transactions = 10 seconds

---

## Testing Scenarios

1. **Small dataset** (10 transactions each): Fast migration
2. **Large dataset** (500+ transactions each): Progress bar works well
3. **Network interruption**: Graceful error handling
4. **Same category names**: Merges correctly
5. **Different category names**: Creates both
6. **Cancel during migration**: Not allowed (blocked)
7. **User A has data, User B empty**: Works correctly
8. **Both users empty**: No migration needed, instant

---

## Files to Modify

### New Files:
- `components/DataMigrationModal.tsx`
- `components/PairingConfirmationDialog.tsx`

### Existing Files:
- `lib/api/pair.ts` - Add migration logic, modify `redeemPartnerCode`
- `lib/api/transactions.ts` - Add bulk migration helpers
- `lib/api/categories.ts` - Add category merging logic
- `app/(tabs)/settings/pair.tsx` - Add confirmation dialog and progress UI

---

## User-Facing Text

**Confirmation Dialog:**
- Title: "Keep Your Data?"
- Message: "You and [Partner] both have existing transactions. What would you like to do?"
- Option 1: "Start Fresh" - "Delete all transactions and start tracking together from now"
- Option 2: "Keep Our Data" - "Combine all transactions from both accounts"

**Progress Modal:**
- Title: "Merging Your Data"
- Subtitle: "This may take a moment..."
- Progress: "[====>     ] 45% (234 of 520 transactions)"
- Footer: "Please don't close the app"

---

## To-dos

- [ ] Create DataMigrationModal component with progress bar
- [ ] Create PairingConfirmationDialog component
- [ ] Add migrateUserTransactions function to pair.ts
- [ ] Add mergeCategoriesForGroup function to pair.ts
- [ ] Modify redeemPartnerCode to accept retainData parameter and handle both flows
- [ ] Add bulk migration helpers to transactions.ts
- [ ] Add category merging logic to categories.ts
- [ ] Update pairing screen to show confirmation dialog and progress modal
- [ ] Test complete migration flow with various data sizes


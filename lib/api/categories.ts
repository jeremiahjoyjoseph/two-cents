import { firestore } from '@/config/firebase';
import { Category } from '@/types/category';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    Unsubscribe,
    updateDoc,
    writeBatch,
} from 'firebase/firestore';

/**
 * Listen to user's custom categories
 */
export const listenToUserCategories = (
  userId: string,
  callback: (categories: Category[]) => void
): Unsubscribe => {
  const categoriesRef = collection(firestore, `users/${userId}/categories`);
  const q = query(categoriesRef, orderBy('name'));

  return onSnapshot(q, (snapshot) => {
    const categories = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      isCustom: true,
    })) as Category[];
    
    callback(categories);
  });
};

/**
 * Create a new custom category
 */
export const createCategory = async (
  userId: string,
  category: Omit<Category, 'id'>
): Promise<void> => {
  const categoriesRef = collection(firestore, `users/${userId}/categories`);
  
  await addDoc(categoriesRef, {
    name: category.name,
    icon: category.icon,
    color: category.color,
  });
};

/**
 * Update a custom category
 */
export const updateCategory = async (
  userId: string,
  categoryId: string,
  category: Omit<Category, 'id'>
): Promise<void> => {
  const categoryRef = doc(firestore, `users/${userId}/categories`, categoryId);
  await updateDoc(categoryRef, {
    name: category.name,
    icon: category.icon,
    color: category.color,
  });
};

/**
 * Delete a custom category
 */
export const deleteCategory = async (
  userId: string,
  categoryId: string
): Promise<void> => {
  const categoryRef = doc(firestore, `users/${userId}/categories`, categoryId);
  await deleteDoc(categoryRef);
};

/**
 * Initialize default categories for a new user
 */
export const initializeDefaultCategories = async (userId: string): Promise<void> => {
  const categoriesRef = collection(firestore, `users/${userId}/categories`);
  const batch = writeBatch(firestore);
  
  const defaultCategories = [
    { name: 'Rent', icon: 'home', color: '#F87171' },
    { name: 'Loan payment', icon: 'account-balance', color: '#FACC15' },
    { name: 'Food', icon: 'restaurant', color: '#34D399' },
    { name: 'Fuel', icon: 'local-gas-station', color: '#60A5FA' },
    { name: 'Shopping', icon: 'shopping-bag', color: '#A78BFA' },
    { name: 'Travel', icon: 'flight-takeoff', color: '#F472B6' },
    { name: 'Bills', icon: 'receipt-long', color: '#FBBF24' },
    { name: 'Groceries', icon: 'local-grocery-store', color: '#10B981' },
  ];
  
  for (const category of defaultCategories) {
    const docRef = doc(categoriesRef);
    batch.set(docRef, category);
  }
  
  await batch.commit();
};

/**
 * Delete all user categories
 */
export const deleteAllUserCategories = async (userId: string): Promise<void> => {
  const categoriesRef = collection(firestore, `users/${userId}/categories`);
  const snapshot = await getDocs(categoriesRef);

  // Create a batch to delete all categories
  const batch = writeBatch(firestore);
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
};

// ========================================
// GROUP CATEGORY FUNCTIONS
// ========================================

/**
 * Listen to group categories (shared between partners)
 */
export const listenToGroupCategories = (
  groupId: string,
  callback: (categories: Category[]) => void
): Unsubscribe => {
  const categoriesRef = collection(firestore, `groups/${groupId}/categories`);
  const q = query(categoriesRef, orderBy('name'));

  return onSnapshot(q, (snapshot) => {
    const categories = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      isCustom: true,
    })) as Category[];
    
    callback(categories);
  });
};

/**
 * Create a category in group collection
 */
export const createGroupCategory = async (
  groupId: string,
  category: Omit<Category, 'id'>
): Promise<void> => {
  const categoriesRef = collection(firestore, `groups/${groupId}/categories`);
  
  await addDoc(categoriesRef, {
    name: category.name,
    icon: category.icon,
    color: category.color,
  });
};

/**
 * Update a group category
 */
export const updateGroupCategory = async (
  groupId: string,
  categoryId: string,
  category: Omit<Category, 'id'>
): Promise<void> => {
  const categoryRef = doc(firestore, `groups/${groupId}/categories`, categoryId);
  await updateDoc(categoryRef, {
    name: category.name,
    icon: category.icon,
    color: category.color,
  });
};

/**
 * Delete a group category and clear from all group transactions
 */
export const deleteGroupCategory = async (
  groupId: string,
  categoryId: string
): Promise<void> => {
  const categoryRef = doc(firestore, `groups/${groupId}/categories`, categoryId);
  
  // Clear ALL category data from group transactions
  const { clearCategoryFromGroupTransactions } = await import('@/lib/api/transactions');
  await clearCategoryFromGroupTransactions(groupId, categoryId);
  
  // Delete the category
  await deleteDoc(categoryRef);
};

/**
 * Initialize default categories for a new group
 */
export const initializeGroupCategories = async (groupId: string): Promise<void> => {
  const categoriesRef = collection(firestore, `groups/${groupId}/categories`);
  const batch = writeBatch(firestore);
  
  const defaultCategories = [
    { name: 'Rent', icon: 'home', color: '#F87171' },
    { name: 'Loan payment', icon: 'account-balance', color: '#FACC15' },
    { name: 'Food', icon: 'restaurant', color: '#34D399' },
    { name: 'Fuel', icon: 'local-gas-station', color: '#60A5FA' },
    { name: 'Shopping', icon: 'shopping-bag', color: '#A78BFA' },
    { name: 'Travel', icon: 'flight-takeoff', color: '#F472B6' },
    { name: 'Bills', icon: 'receipt-long', color: '#FBBF24' },
    { name: 'Groceries', icon: 'local-grocery-store', color: '#10B981' },
  ];
  
  for (const category of defaultCategories) {
    const docRef = doc(categoriesRef);
    batch.set(docRef, category);
  }
  
  await batch.commit();
};

/**
 * Merge user categories into group when linking
 */
export const mergeUserCategoriesToGroup = async (
  userAId: string,
  userBId: string,
  groupId: string
): Promise<void> => {
  console.log('Merging user categories to group...');
  
  // Get both users' categories
  const [userACategories, userBCategories] = await Promise.all([
    getDocs(collection(firestore, `users/${userAId}/categories`)),
    getDocs(collection(firestore, `users/${userBId}/categories`)),
  ]);
  
  const batch = writeBatch(firestore);
  const groupCategoriesRef = collection(firestore, `groups/${groupId}/categories`);
  const addedNames = new Set<string>();
  
  // Add User A's categories
  userACategories.docs.forEach((docSnapshot) => {
    const data = docSnapshot.data();
    const docRef = doc(groupCategoriesRef);
    batch.set(docRef, {
      name: data.name,
      icon: data.icon,
      color: data.color,
    });
    addedNames.add(data.name.toLowerCase());
  });
  
  // Add User B's categories (skip duplicates by name)
  userBCategories.docs.forEach((docSnapshot) => {
    const data = docSnapshot.data();
    if (!addedNames.has(data.name.toLowerCase())) {
      const docRef = doc(groupCategoriesRef);
      batch.set(docRef, {
        name: data.name,
        icon: data.icon,
        color: data.color,
      });
    }
  });
  
  await batch.commit();
  console.log('✅ Categories merged to group');
};

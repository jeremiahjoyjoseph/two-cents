import { firestore } from '@/config/firebase';
import { Category } from '@/types/category';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    Unsubscribe,
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
 * Delete a custom category
 */
export const deleteCategory = async (
  userId: string,
  categoryId: string
): Promise<void> => {
  const categoryRef = doc(firestore, `users/${userId}/categories`, categoryId);
  await deleteDoc(categoryRef);
};

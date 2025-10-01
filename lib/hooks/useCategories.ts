import { DEFAULT_CATEGORIES } from '@/constants/categories';
import { createCategory, listenToUserCategories } from '@/lib/api/categories';
import { Category } from '@/types/category';
import { useEffect, useState } from 'react';

export const useCategories = (userId: string) => {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setCategories(DEFAULT_CATEGORIES);
      setLoading(false);
      return;
    }

    const unsubscribe = listenToUserCategories(userId, (customCategories) => {
      // Merge default categories with custom categories
      // Prevent duplicates by ID
      const mergedCategories = [...DEFAULT_CATEGORIES];
      
      customCategories.forEach(customCategory => {
        const existingIndex = mergedCategories.findIndex(
          cat => cat.id === customCategory.id
        );
        if (existingIndex >= 0) {
          // Replace default category with custom version
          mergedCategories[existingIndex] = customCategory;
        } else {
          // Add new custom category
          mergedCategories.push(customCategory);
        }
      });

      setCategories(mergedCategories);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [userId]);

  const createCustomCategory = async (category: Omit<Category, 'id'>) => {
    if (!userId) {
      throw new Error('User ID is required to create custom categories');
    }
    
    await createCategory(userId, category);
  };

  return {
    categories,
    loading,
    createCategory: createCustomCategory,
  };
};

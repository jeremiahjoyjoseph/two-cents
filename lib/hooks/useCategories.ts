import { 
  createCategory, 
  createGroupCategory,
  deleteCategory, 
  deleteGroupCategory,
  initializeDefaultCategories, 
  initializeGroupCategories,
  listenToGroupCategories,
  listenToUserCategories, 
  updateCategory,
  updateGroupCategory,
} from '@/lib/api/categories';
import { Category } from '@/types/category';
import { useEffect, useState } from 'react';

export const useCategories = (userId: string, groupId?: string | null) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setCategories([]);
      setLoading(false);
      return;
    }

    // If user is in a group, listen to group categories
    if (groupId) {
      const unsubscribe = listenToGroupCategories(groupId, async (groupCategories) => {
        // If group has no categories, initialize defaults
        if (groupCategories.length === 0) {
          await initializeGroupCategories(groupId);
          return;
        }
        
        setCategories(groupCategories);
        setLoading(false);
      });

      return () => unsubscribe();
    }

    // Otherwise, listen to personal categories
    const unsubscribe = listenToUserCategories(userId, async (userCategories) => {
      // If user has no categories, initialize defaults
      if (userCategories.length === 0) {
        await initializeDefaultCategories(userId);
        return;
      }
      
      setCategories(userCategories);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId, groupId]);

  const createCustomCategory = async (category: Omit<Category, 'id'>) => {
    if (!userId) {
      throw new Error('User ID is required to create custom categories');
    }
    
    // Create in group if user is linked
    if (groupId) {
      await createGroupCategory(groupId, category);
    } else {
      await createCategory(userId, category);
    }
  };

  const updateCustomCategory = async (categoryId: string, category: Omit<Category, 'id'>) => {
    if (!userId) {
      throw new Error('User ID is required to update custom categories');
    }
    
    // Update in group if user is linked
    if (groupId) {
      await updateGroupCategory(groupId, categoryId, category);
    } else {
      await updateCategory(userId, categoryId, category);
    }
  };

  const deleteCustomCategory = async (categoryId: string) => {
    if (!userId) {
      throw new Error('User ID is required to delete custom categories');
    }
    
    // Delete from group if user is linked
    if (groupId) {
      await deleteGroupCategory(groupId, categoryId);
    } else {
      await deleteCategory(userId, categoryId);
    }
  };

  return {
    categories,
    loading,
    createCategory: createCustomCategory,
    updateCategory: updateCustomCategory,
    deleteCategory: deleteCustomCategory,
  };
};

import { Category } from '@/types/category';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'rent', name: 'Rent', icon: 'home', color: '#F87171' },
  { id: 'loan', name: 'Loan payment', icon: 'account-balance', color: '#FACC15' },
  { id: 'food', name: 'Food', icon: 'restaurant', color: '#34D399' },
  { id: 'fuel', name: 'Fuel', icon: 'local-gas-station', color: '#60A5FA' },
  { id: 'shopping', name: 'Shopping', icon: 'shopping-bag', color: '#A78BFA' },
  { id: 'travel', name: 'Travel', icon: 'flight-takeoff', color: '#F472B6' },
  { id: 'bills', name: 'Bills', icon: 'receipt-long', color: '#FBBF24' },
  { id: 'groceries', name: 'Groceries', icon: 'local-grocery-store', color: '#10B981' },
];

// To extend icons/colors, update CATEGORY_ICON_OPTIONS and CATEGORY_COLOR_OPTIONS.
export const CATEGORY_ICON_OPTIONS = [
  'home',                 // Rent / Housing
  'local-grocery-store',  // Groceries
  'restaurant',           // Food / Dining
  'commute',              // Travel / Fuel
  'shopping-bag',         // Shopping
  'payments',             // Loan / EMI / Bills
  'pets',                 // Pets / Misc
  'favorite',             // Self-care / Luxuries
  'medical-services',     // Health
  'savings',              // Income / Savings
  'subscriptions',        // Subscriptions / OTT
  'category',             // Catch-all / Other
];

export const CATEGORY_COLOR_OPTIONS = [
  '#F9A8D4', // Blush Pink - Shopping / Self-care
  '#A5D8FF', // Sky Blue - Travel / Subscriptions
  '#B9FBC0', // Mint Green - Groceries / Health
  '#FFD6A5', // Peach Orange - Food / Snacks
  '#D8B4FE', // Lavender - Entertainment / Apps
  '#FEF08A', // Sun Yellow - Bills / EMI
  '#FCA5A5', // Coral Red - Rent / Urgent
  '#A5B4FC', // Periwinkle - Kids / Learning
  '#6EE7B7', // Sea Green - Fuel / Transport
  '#FBCFE8', // Bubblegum Pink - Gifts / Luxuries
  '#99F6E4', // Sky Teal - Utilities
  '#E9D5FF', // Lilac Purple - Miscellaneous
];

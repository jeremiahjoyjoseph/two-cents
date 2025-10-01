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
  'home', 
  'shopping-bag', 
  'receipt-long', 
  'local-gas-station', 
  'restaurant', 
  'flight-takeoff',
  'account-balance',
  'local-grocery-store',
  'work',
  'school',
  'health-and-safety',
  'sports',
  'music-note',
  'movie',
  'car-repair',
  'phone',
  'wifi',
  'electric-bolt',
  'water-drop',
  'cleaning-services'
];

export const CATEGORY_COLOR_OPTIONS = [
  '#F87171', // Red
  '#34D399', // Green
  '#60A5FA', // Blue
  '#FBBF24', // Yellow
  '#A78BFA', // Purple
  '#F472B6', // Pink
  '#10B981', // Emerald
  '#FACC15', // Amber
  '#EF4444', // Red-500
  '#8B5CF6', // Violet
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#EC4899', // Rose
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#F59E0B', // Amber-500
  '#DC2626', // Red-600
  '#7C3AED', // Violet-600
  '#059669'  // Emerald-600
];

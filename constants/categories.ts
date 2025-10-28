// DEFAULT_CATEGORIES removed - categories are now initialized in database during user registration
// See lib/api/categories.ts -> initializeDefaultCategories()

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

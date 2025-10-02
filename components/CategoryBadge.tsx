import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { IconSymbol } from './ui/IconSymbol';

// Utility function to ensure iOS-compatible color format
const normalizeColor = (color: string): string => {
  if (!color) return '#000000';
  
  // Remove any whitespace
  const cleanColor = color.trim();
  
  // If color is already a valid 6-digit hex, return it
  if (/^#[0-9A-Fa-f]{6}$/.test(cleanColor)) {
    return cleanColor;
  }
  
  // If color is a 3-digit hex, expand it
  if (/^#[0-9A-Fa-f]{3}$/.test(cleanColor)) {
    const r = cleanColor[1];
    const g = cleanColor[2];
    const b = cleanColor[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  
  // If color doesn't start with #, add it
  if (!cleanColor.startsWith('#')) {
    return `#${cleanColor}`;
  }
  
  // Default fallback
  return '#000000';
};

// Utility function to create iOS-compatible color with opacity
const createColorWithOpacity = (color: string, opacity: number = 0.2): string => {
  const normalizedColor = normalizeColor(color);
  
  // Convert hex to RGB
  const hex = normalizedColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Return rgba format for iOS compatibility
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

type CategoryBadgeProps = {
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  size?: 'small' | 'medium' | 'large';
  showName?: boolean;
};

export const CategoryBadge = ({ 
  categoryName, 
  categoryIcon, 
  categoryColor, 
  size = 'medium',
  showName = true 
}: CategoryBadgeProps) => {
  const iconSize = size === 'small' ? 16 : size === 'medium' ? 20 : 24;
  const containerSize = size === 'small' ? 32 : size === 'medium' ? 40 : 48;
  const fontSize = size === 'small' ? 12 : size === 'medium' ? 14 : 16;

  return (
    <View style={styles.container}>
      <View 
        style={[
          styles.iconContainer, 
          { 
            width: containerSize, 
            height: containerSize, 
            backgroundColor: createColorWithOpacity(categoryColor, 0.2)
          }
        ]}
      >
        <IconSymbol name={categoryIcon as any} size={iconSize} color={normalizeColor(categoryColor)} />
      </View>
      {showName && (
        <ThemedText 
          type="defaultSemiBold" 
          style={[styles.name, { fontSize }]}
          numberOfLines={1}
        >
          {categoryName}
        </ThemedText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  name: {
    flexShrink: 1,
  },
});

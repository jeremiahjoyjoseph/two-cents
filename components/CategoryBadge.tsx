import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { IconSymbol } from './ui/IconSymbol';

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
            backgroundColor: `${categoryColor}20` 
          }
        ]}
      >
        <IconSymbol name={categoryIcon as any} size={iconSize} color={categoryColor} />
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

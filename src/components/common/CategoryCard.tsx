import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import { Category } from '../../types/product';
import { Colors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';
import { Shadows } from '../../theme/shadows';
import { PressableScale } from './PressableScale';

interface CategoryCardProps {
  category: Category;
  horizontal?: boolean;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, horizontal = false }) => {
  const handlePress = () => {
    router.push({
      pathname: '/catalog',
      params: { categoryId: category.id, title: category.name },
    });
  };

  if (horizontal) {
    return (
      <PressableScale
        onPress={handlePress}
        activeScale={0.97}
        style={styles.horizontalCard}
      >
        <Image source={{ uri: category.imageUrl }} style={styles.horizontalImage} />
        <View style={styles.horizontalTextContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {category.name}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {category.regionalName || category.subtitle}
          </Text>
          <Text style={styles.itemCount}>{category.itemCount} Fresh Items</Text>
        </View>
      </PressableScale>
    );
  }

  return (
    <PressableScale
      onPress={handlePress}
      activeScale={0.97}
      style={styles.gridCard}
    >
      <View style={styles.gridImageContainer}>
        <Image source={{ uri: category.imageUrl }} style={styles.gridImage} />
        {category.tag && (
          <View style={styles.tagBadge}>
            <Text style={styles.tagText}>{category.tag}</Text>
          </View>
        )}
      </View>
      <View style={styles.gridTextContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {category.name}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {category.regionalName || category.subtitle}
        </Text>
        <Text style={styles.itemCount}>{category.itemCount} items</Text>
      </View>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  gridCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    ...Shadows.level1,
  },
  gridImageContainer: {
    height: 110,
    width: '100%',
    backgroundColor: '#F1F5F9',
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  tagBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(10, 74, 20, 0.92)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  gridTextContainer: {
    padding: Spacing.sm,
  },
  title: {
    fontSize: 13.5,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 11,
    color: Colors.primaryDark,
    marginTop: 2,
    fontWeight: '600',
  },
  itemCount: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 4,
    fontWeight: '600',
  },
  horizontalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    ...Shadows.level1,
  },
  horizontalImage: {
    width: 60,
    height: 60,
    borderRadius: Radius.md,
  },
  horizontalTextContainer: {
    marginLeft: Spacing.md,
    flex: 1,
  },
});

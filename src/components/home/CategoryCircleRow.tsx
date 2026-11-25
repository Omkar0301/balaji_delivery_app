import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { MOCK_CATEGORIES } from '../../data/mockData';
import { Colors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';
import { Shadows } from '../../theme/shadows';
import { ProgressiveImage } from '../feedback/ProgressiveImage';
import { PressableScale } from '../common/PressableScale';

export const CategoryCircleRow: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Shop by Category / કેટેગરી</Text>
          <Text style={styles.subtitle}>Direct farm produce, spices & dry fruits</Text>
        </View>
        <Pressable
          onPress={() => router.push('/(tabs)/categories')}
          style={styles.seeAllBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.seeAllText}>See All ({MOCK_CATEGORIES.length})</Text>
          <MaterialIcons name="chevron-right" size={16} color={Colors.primary} />
        </Pressable>
      </View>

      {/* Circular Horizontal Reel */}
      <ScrollView
        horizontal
        nestedScrollEnabled={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {MOCK_CATEGORIES.map((cat) => (
          <PressableScale
            key={cat.id}
            onPress={() =>
              router.push({
                pathname: '/catalog',
                params: { categoryId: cat.id, title: cat.name },
              })
            }
            activeScale={0.93}
            style={styles.categoryItem}
            accessibilityRole="button"
            accessibilityLabel={`Browse ${cat.name}`}
          >
            <View style={styles.circleWrapper}>
              <ProgressiveImage
                uri={cat.imageUrl}
                style={styles.circleImage}
                borderRadius={29}
                resizeMode="cover"
              />
              {cat.tag && (
                <View style={styles.tagBadge}>
                  <Text style={styles.tagText}>{cat.tag.split(' ')[0]}</Text>
                </View>
              )}
            </View>
            <Text style={styles.catName} numberOfLines={1}>
              {cat.name}
            </Text>
            <Text style={styles.catSubtitle} numberOfLines={1}>
              {cat.regionalName || cat.subtitle.split(',')[0]}
            </Text>
          </PressableScale>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  scrollContent: {
    paddingLeft: Spacing.md,
    paddingRight: Spacing.xs,
    paddingVertical: 6,
    gap: 14,
  },
  categoryItem: {
    alignItems: 'center',
    width: 76,
  },
  circleWrapper: {
    position: 'relative',
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: Colors.surface,
    padding: 2,
    ...Shadows.level1,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleImage: {
    width: '100%',
    height: '100%',
    borderRadius: 29,
  },
  tagBadge: {
    position: 'absolute',
    bottom: -4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.onPrimary,
  },
  tagText: {
    color: Colors.onPrimary,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  catName: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 6,
    textAlign: 'center',
  },
  catSubtitle: {
    fontSize: 9.5,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 1,
  },
});

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { ProductCard } from '../src/components/common/ProductCard';
import { EmptyState } from '../src/components/common/EmptyState';
import { FloatingCartBar } from '../src/components/common/FloatingCartBar';
import { useToast } from '../src/context/ToastContext';
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from '../src/data/mockData';
import { Colors } from '../src/theme/colors';
import { Typography } from '../src/theme/typography';
import { Spacing } from '../src/theme/spacing';
import { Radius } from '../src/theme/radius';

export default function CatalogScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ categoryId?: string; title?: string }>();
  const [prevParamCatId, setPrevParamCatId] = useState<string | undefined>(params.categoryId);
  const [selectedCatId, setSelectedCatId] = useState<string>(params.categoryId || 'all');
  const [selectedSubCatId, setSelectedSubCatId] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'price_desc'>('default');
  const [refreshing, setRefreshing] = useState(false);
  const { showSuccess } = useToast();

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      showSuccess('Catalog & morning stock updated');
    }, 600);
  }, [showSuccess]);

  if (params.categoryId !== prevParamCatId) {
    setPrevParamCatId(params.categoryId);
    setSelectedCatId(params.categoryId || 'all');
    setSelectedSubCatId('all');
  }

  const activeCategory = useMemo(
    () => MOCK_CATEGORIES.find((c) => c.id === selectedCatId),
    [selectedCatId]
  );

  const vegetableSubcategories = useMemo(
    () => MOCK_CATEGORIES.find((c) => c.id === 'cat-vegetables')?.subcategories || [],
    []
  );

  const filteredProducts = useMemo(() => {
    let result = [...MOCK_PRODUCTS];

    if (selectedCatId !== 'all') {
      result = result.filter((p) => p.categoryId === selectedCatId);
      if (selectedCatId === 'cat-vegetables' && selectedSubCatId !== 'all') {
        result = result.filter((p) => p.subCategoryId === selectedSubCatId);
      }
    }

    if (sortBy === 'price_asc') {
      result.sort((a, b) => a.basePrice - b.basePrice);
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.basePrice - a.basePrice);
    }

    return result;
  }, [selectedCatId, selectedSubCatId, sortBy]);

  const handleCategorySelect = (catId: string) => {
    setSelectedCatId(catId);
    setSelectedSubCatId('all');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <MaterialIcons name="arrow-back" size={20} color={Colors.primary} />
            <Text style={styles.backButtonText}>Back</Text>
          </View>
        </Pressable>

        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {activeCategory ? activeCategory.name : 'Product Catalog'}
          </Text>
          {activeCategory?.regionalName && (
            <Text style={styles.subRegionalTitle} numberOfLines={1}>
              {activeCategory.regionalName}
            </Text>
          )}
        </View>

        <Pressable
          onPress={() => router.push('/search')}
          style={styles.searchIcon}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="search" size={22} color={Colors.primary} />
        </Pressable>
      </View>

      {/* Main Category Pills Filter */}
      <View style={styles.pillsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsScroll}
        >
          <Pressable
            onPress={() => handleCategorySelect('all')}
            style={[styles.pill, selectedCatId === 'all' && styles.pillActive]}
          >
            <Text style={[styles.pillText, selectedCatId === 'all' && styles.pillTextActive]}>
              All ({MOCK_PRODUCTS.length})
            </Text>
          </Pressable>

          {MOCK_CATEGORIES.map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => handleCategorySelect(cat.id)}
              style={[styles.pill, selectedCatId === cat.id && styles.pillActive]}
            >
              <Text style={[styles.pillText, selectedCatId === cat.id && styles.pillTextActive]}>
                {cat.name} ({cat.itemCount})
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Secondary Subcategory Pills (when Vegetables is active) */}
      {selectedCatId === 'cat-vegetables' && vegetableSubcategories.length > 0 && (
        <View style={styles.subPillsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.subPillsScroll}
          >
            <Pressable
              onPress={() => setSelectedSubCatId('all')}
              style={[
                styles.subPill,
                selectedSubCatId === 'all' && styles.subPillActive,
              ]}
            >
              <Text
                style={[
                  styles.subPillText,
                  selectedSubCatId === 'all' && styles.subPillTextActive,
                ]}
              >
                All Veg
              </Text>
            </Pressable>
            {vegetableSubcategories.map((sub) => (
              <Pressable
                key={sub.id}
                onPress={() => setSelectedSubCatId(sub.id)}
                style={[
                  styles.subPill,
                  selectedSubCatId === sub.id && styles.subPillActive,
                ]}
              >
                <Text
                  style={[
                    styles.subPillText,
                    selectedSubCatId === sub.id && styles.subPillTextActive,
                  ]}
                >
                  {sub.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Sorting bar */}
      <View style={styles.sortRow}>
        <Text style={styles.itemCountText}>
          Showing {filteredProducts.length} items
        </Text>
        <View style={styles.sortButtons}>
          <Pressable
            onPress={() => setSortBy(sortBy === 'price_asc' ? 'default' : 'price_asc')}
            style={[styles.sortButton, sortBy === 'price_asc' && styles.sortButtonActive, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}
          >
            <MaterialIcons
              name="swap-vert"
              size={14}
              color={sortBy === 'price_asc' ? '#FFFFFF' : Colors.textSecondary}
            />
            <Text style={[styles.sortButtonText, sortBy === 'price_asc' && styles.sortButtonTextActive]}>
              Price: Low to High
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Product List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: 110 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
        renderItem={({ item }) => <ProductCard product={item} />}
        ListEmptyComponent={
          <EmptyState
            title="No products in this category"
            description="Please choose another category or browse all items."
            actionLabel="Show All Items"
            onAction={() => handleCategorySelect('all')}
          />
        }
      />

      {/* Floating Bottom Cart Bar */}
      <FloatingCartBar bottomOffset={12} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    paddingVertical: Spacing.xs,
  },
  backButtonText: {
    color: Colors.primary,
    fontSize: Typography.body.fontSize,
    fontWeight: '700',
  },
  titleContainer: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: Spacing.sm,
  },
  title: {
    fontSize: Typography.bodyLarge.fontSize,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subRegionalTitle: {
    fontSize: Typography.micro.fontSize,
    color: Colors.primaryDark,
    fontWeight: '700',
    marginTop: 1,
  },
  searchIcon: {
    padding: Spacing.xs,
  },
  pillsContainer: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pillsScroll: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillActive: {
    backgroundColor: Colors.primaryContainer,
    borderColor: Colors.primary,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  pillTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  subPillsContainer: {
    backgroundColor: '#F8FAF5',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  subPillsScroll: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    gap: 6,
  },
  subPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  subPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  subPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  subPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  sortRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  itemCountText: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  sortButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  sortButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  sortButtonText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  sortButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: 90,
  },
});

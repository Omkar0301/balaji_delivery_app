import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ScrollView, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { ProductCard } from '../src/components/common/ProductCard';
import { EmptyState } from '../src/components/common/EmptyState';
import { ErrorState } from '../src/components/common/ErrorState';
import { LoadingState } from '../src/components/common/LoadingState';
import { FloatingCartBar } from '../src/components/common/FloatingCartBar';
import { useToast } from '../src/context/ToastContext';
import { productService } from '../src/services/productService';
import { Category, Product } from '../src/types/product';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const { showSuccess } = useToast();

  const fetchCatalogData = useCallback(async () => {
    const [catRes, prodRes] = await Promise.all([
      productService.getCategories(),
      productService.getProducts({
        categoryId: selectedCatId !== 'all' ? selectedCatId : undefined,
        subCategoryId: selectedSubCatId !== 'all' ? selectedSubCatId : undefined,
        sortBy,
        limit: 50,
      }),
    ]);
    setCategories(catRes.data);
    setProducts(prodRes.data);
  }, [selectedCatId, selectedSubCatId, sortBy]);

  useEffect(() => {
    let mounted = true;
    productService
      .getCategories()
      .then((catRes) => {
        if (mounted) setCategories(catRes.data);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    productService
      .getProducts({
        categoryId: selectedCatId !== 'all' ? selectedCatId : undefined,
        subCategoryId: selectedSubCatId !== 'all' ? selectedSubCatId : undefined,
        sortBy,
        limit: 50,
      })
      .then((prodRes) => {
        if (mounted) {
          setProducts(prodRes.data);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (mounted) {
          const apiErr = err as { message?: string };
          setError(apiErr?.message || 'Unable to load catalog');
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [selectedCatId, selectedSubCatId, sortBy]);

  const handleRetry = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await fetchCatalogData();
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr?.message || 'Unable to load catalog');
    } finally {
      setLoading(false);
    }
  }, [fetchCatalogData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchCatalogData();
      showSuccess('Catalog & morning stock updated');
    } finally {
      setRefreshing(false);
    }
  }, [fetchCatalogData, showSuccess]);

  if (params.categoryId !== prevParamCatId) {
    setPrevParamCatId(params.categoryId);
    setSelectedCatId(params.categoryId || 'all');
    setSelectedSubCatId('all');
  }

  const activeCategory = useMemo(
    () => categories.find((c) => c.id === selectedCatId),
    [categories, selectedCatId]
  );

  const vegetableSubcategories = useMemo(
    () =>
      categories.find((c) => c.slug === 'vegetables' || c.id === 'cat-vegetables')
        ?.subcategories || [],
    [categories]
  );

  const filteredProducts = products;
  const totalCategoryProducts = useMemo(
    () => categories.reduce((sum, c) => sum + (c.itemCount ?? 0), 0),
    [categories]
  );

  const handleCategorySelect = (catId: string) => {
    setLoading(true);
    setError(null);
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
              All ({totalCategoryProducts || filteredProducts.length})
            </Text>
          </Pressable>

          {categories.map((cat) => (
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
      {(activeCategory?.slug === 'vegetables' || selectedCatId === 'cat-vegetables') &&
        vegetableSubcategories.length > 0 && (
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
      {loading && products.length === 0 ? (
        <LoadingState message="Loading fresh produce..." />
      ) : error && products.length === 0 ? (
        <ErrorState message={error} onRetry={() => void handleRetry()} />
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: 110 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
          initialNumToRender={8}
          maxToRenderPerBatch={6}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
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
      )}

      {/* Floating Bottom Cart Bar */}
      {(!loading || products.length > 0) && <FloatingCartBar bottomOffset={12} />}
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

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { HeaderBar } from '../../src/components/common/HeaderBar';
import { QualityTrustPledge } from '../../src/components/common/QualityTrustPledge';
import { ProductCard } from '../../src/components/common/ProductCard';
import { FloatingCartBar } from '../../src/components/common/FloatingCartBar';
import { HomeSearchBar } from '../../src/components/home/HomeSearchBar';
import { CategoryCircleRow } from '../../src/components/home/CategoryCircleRow';
import { ErrorState } from '../../src/components/common/ErrorState';
import { LoadingState } from '../../src/components/common/LoadingState';
import { useToast } from '../../src/context/ToastContext';
import { productService } from '../../src/services/productService';
import { Category, Product } from '../../src/types/product';
import { Colors } from '../../src/theme/colors';
import { Typography } from '../../src/theme/typography';
import { Spacing } from '../../src/theme/spacing';
import { Radius } from '../../src/theme/radius';
import { Shadows } from '../../src/theme/shadows';

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const { showSuccess } = useToast();

  const fetchHomeData = useCallback(async () => {
    const [homeRes, productsRes] = await Promise.all([
      productService.getHome(),
      productService.getProducts({ limit: 50 }),
    ]);
    setCategories(homeRes.data.categories);
    setProducts(productsRes.data);
  }, []);

  useEffect(() => {
    let mounted = true;
    Promise.all([productService.getHome(), productService.getProducts({ limit: 50 })])
      .then(([homeRes, productsRes]) => {
        if (mounted) {
          setCategories(homeRes.data.categories);
          setProducts(productsRes.data);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (mounted) {
          const apiErr = err as { message?: string };
          setError(apiErr?.message || 'Unable to load catalog. Check your connection.');
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleRetry = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await fetchHomeData();
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr?.message || 'Unable to load catalog. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, [fetchHomeData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchHomeData();
      showSuccess('Morning harvest catalog updated');
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr?.message || 'Unable to load catalog. Check your connection.');
    } finally {
      setRefreshing(false);
    }
  }, [fetchHomeData, showSuccess]);

  // Multi-Category Shelves:
  // 1. Fresh Vegetables
  const freshVegetables = useMemo(
    () =>
      products
        .filter((p) => p.categorySlug === 'vegetables' || p.categoryId === 'cat-vegetables')
        .slice(0, 4),
    [products]
  );

  // 2. Farm Fresh Fruits
  const freshFruits = useMemo(
    () => products.filter((p) => p.categorySlug === 'fruits' || p.categoryId === 'cat-fruits'),
    [products]
  );

  // 3. Black Pepper & Direct Spices
  const blackPepperProducts = useMemo(
    () =>
      products.filter(
        (p) => p.categorySlug === 'black-pepper' || p.categoryId === 'cat-black-pepper'
      ),
    [products]
  );

  // 4. Sukameva / Premium Dry Fruits & Nuts
  const sukamevaProducts = useMemo(
    () =>
      products
        .filter((p) => p.categorySlug === 'sukameva' || p.categoryId === 'cat-sukameva')
        .slice(0, 4),
    [products]
  );

  if (loading && products.length === 0) {
    return (
      <View style={styles.container}>
        <HeaderBar />
        <LoadingState message="Loading morning harvest..." />
      </View>
    );
  }

  if (error && products.length === 0) {
    return (
      <View style={styles.container}>
        <HeaderBar />
        <ErrorState message={error} onRetry={() => void handleRetry()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Header with Address & Profile */}
      <HeaderBar />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Search Bar Assist */}
        <View style={styles.searchWrapper}>
          <HomeSearchBar />
        </View>

        {/* Circular Story-Style Category Aisles (Vegetables, Fruits, Black Pepper, Sukameva) */}
        <CategoryCircleRow categories={categories} />

        {/* SECTION 1: Fresh Vegetables (2-Column Grid) */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Fresh Vegetables</Text>
            <Text style={styles.sectionSubtitle}>
              તાજી શાકભાજી • Direct harvest morning farm produce
            </Text>
          </View>
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/catalog',
                params: { categoryId: 'cat-vegetables', title: 'Vegetables' },
              })
            }
            style={styles.seeAllBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.seeAllText}>See All (10)</Text>
            <MaterialIcons name="chevron-right" size={16} color={Colors.primary} />
          </Pressable>
        </View>

        <View style={styles.gridTwoColumns}>
          {freshVegetables.map((product) => (
            <View key={product.id} style={styles.gridColumn}>
              <ProductCard product={product} />
            </View>
          ))}
        </View>

        {/* SECTION 2: Farm Fresh Fruits (Horizontal Reel) */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Fresh Fruits</Text>
            <Text style={styles.sectionSubtitle}>
              તાજાં ફળો • Naturally ripened apples, bananas, dadam
            </Text>
          </View>
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/catalog',
                params: { categoryId: 'cat-fruits', title: 'Fruits' },
              })
            }
            style={styles.seeAllBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.seeAllText}>See All (4)</Text>
            <MaterialIcons name="chevron-right" size={16} color={Colors.primary} />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          nestedScrollEnabled={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
          keyboardShouldPersistTaps="handled"
        >
          {freshFruits.map((product) => (
            <ProductCard key={product.id} product={product} compact />
          ))}
        </ScrollView>

        {/* SECTION 3: Black Pepper & Spices (Horizontal Reel) */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Black Pepper (Mari)</Text>
            <Text style={styles.sectionSubtitle}>
              કાળા મરી • Whole bold peppercorns & coarse powder
            </Text>
          </View>
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/catalog',
                params: { categoryId: 'cat-black-pepper', title: 'Black Pepper' },
              })
            }
            style={styles.seeAllBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.seeAllText}>See All (3)</Text>
            <MaterialIcons name="chevron-right" size={16} color={Colors.primary} />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          nestedScrollEnabled={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
          keyboardShouldPersistTaps="handled"
        >
          {blackPepperProducts.map((product) => (
            <ProductCard key={product.id} product={product} compact />
          ))}
        </ScrollView>

        {/* SECTION 4: Sukameva / Dry Fruits & Nuts (2-Column Grid) */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Sukameva & Dry Fruits</Text>
            <Text style={styles.sectionSubtitle}>
              સૂકામેવા • California Badam, Jumbo Kaju, Akhrot
            </Text>
          </View>
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/catalog',
                params: { categoryId: 'cat-sukameva', title: 'Sukameva' },
              })
            }
            style={styles.seeAllBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.seeAllText}>See All (5)</Text>
            <MaterialIcons name="chevron-right" size={16} color={Colors.primary} />
          </Pressable>
        </View>

        <View style={styles.gridTwoColumns}>
          {sukamevaProducts.map((product) => (
            <View key={product.id} style={styles.gridColumn}>
              <ProductCard product={product} />
            </View>
          ))}
        </View>

        {/* Bottom Catalog Discovery Card */}
        <View style={styles.discoveryCard}>
          <View style={styles.discoveryTextWrap}>
            <Text style={styles.discoveryTitle}>Explore All 4 Categories</Text>
            <Text style={styles.discoverySubtitle}>
              22+ fresh items: Vegetables, Fruits, Black Pepper & Dry Fruits direct from partner farms & vendors
            </Text>
          </View>
          <Pressable
            onPress={() => router.push('/catalog')}
            style={({ pressed }) => [styles.discoveryBtn, pressed && styles.discoveryBtnPressed]}
            accessibilityRole="button"
            accessibilityLabel="Explore complete multi-category catalog"
          >
            <Text style={styles.discoveryBtnText}>Browse Full Catalog (22 Items) →</Text>
          </Pressable>
        </View>

        {/* Freshness Guarantee & Trust Pledge */}
        <QualityTrustPledge />
      </ScrollView>

      {/* Floating Bottom Cart Bar (Appears whenever cart total > 0) */}
      <FloatingCartBar bottomOffset={12} inTabs={true} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 130,
  },
  searchWrapper: {
    paddingTop: Spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.h3.fontSize,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textMuted,
    marginTop: 2,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingBottom: 2,
  },
  seeAllText: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '700',
    color: Colors.primary,
  },
  horizontalScroll: {
    paddingLeft: Spacing.md,
    paddingRight: Spacing.xs,
    paddingBottom: Spacing.sm,
  },
  gridTwoColumns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
  },
  gridColumn: {
    width: '48.5%',
    marginBottom: Spacing.xs,
  },
  discoveryCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    alignItems: 'center',
    gap: 12,
  },
  discoveryTextWrap: {
    alignItems: 'center',
  },
  discoveryTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  discoverySubtitle: {
    fontSize: 11.5,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 3,
  },
  discoveryBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    borderRadius: Radius.md,
    ...Shadows.level1,
  },
  discoveryBtnPressed: {
    backgroundColor: Colors.primaryDark,
    transform: [{ scale: 0.98 }],
  },
  discoveryBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12.5,
    letterSpacing: 0.3,
  },
});

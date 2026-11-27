import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { CategoryCard } from '../../src/components/common/CategoryCard';
import { FloatingCartBar } from '../../src/components/common/FloatingCartBar';
import { ErrorState } from '../../src/components/common/ErrorState';
import { LoadingState } from '../../src/components/common/LoadingState';
import { useToast } from '../../src/context/ToastContext';
import { productService } from '../../src/services/productService';
import { Category } from '../../src/types/product';
import { Colors } from '../../src/theme/colors';
import { Typography } from '../../src/theme/typography';
import { Spacing } from '../../src/theme/spacing';
import { Radius } from '../../src/theme/radius';
import { PressableScale } from '../../src/components/common/PressableScale';

export default function CategoriesScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const { showSuccess } = useToast();

  const fetchCategories = useCallback(async () => {
    const res = await productService.getCategories();
    setCategories(res.data);
  }, []);

  useEffect(() => {
    let mounted = true;
    productService
      .getCategories()
      .then((res) => {
        if (mounted) {
          setCategories(res.data);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (mounted) {
          const apiErr = err as { message?: string };
          setError(apiErr?.message || 'Unable to load categories');
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
      await fetchCategories();
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr?.message || 'Unable to load categories');
    } finally {
      setLoading(false);
    }
  }, [fetchCategories]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchCategories();
      showSuccess('Categories directory updated');
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr?.message || 'Unable to load categories');
    } finally {
      setRefreshing(false);
    }
  }, [fetchCategories, showSuccess]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Search & Header */}
      <View style={styles.header}>
        <View style={styles.headerTextGroup}>
          <Text style={styles.title}>Categories Directory</Text>
          <Text style={styles.subtitle}>પ્રોડક્ટ કેટેગરી • Direct Wholesale Produce & Commodities</Text>
        </View>

        <PressableScale
          onPress={() => router.push('/search')}
          activeScale={0.9}
          style={styles.searchTrigger}
          accessibilityRole="button"
          accessibilityLabel="Search produce"
        >
          <MaterialIcons name="search" size={22} color={Colors.primary} />
        </PressableScale>
      </View>

      {loading && categories.length === 0 ? (
        <LoadingState message="Loading categories..." />
      ) : error && categories.length === 0 ? (
        <ErrorState message={error} onRetry={() => void handleRetry()} />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          refreshing={refreshing}
          onRefresh={onRefresh}
          renderItem={({ item }) => (
            <View style={styles.gridItem}>
              <CategoryCard category={item} />
            </View>
          )}
          ListFooterComponent={
            <View style={styles.footerNote}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <MaterialIcons name="eco" size={18} color={Colors.primary} />
                <Text style={styles.footerTitle}>100% Direct Farm & Vendor Sourced</Text>
              </View>
              <Text style={styles.footerText}>
                Vegetables, fresh fruits, graded Malabar black pepper, and premium dry fruits harvested and quality-sorted daily.
              </Text>
            </View>
          }
        />
      )}

      {/* Floating Bottom Cart Bar */}
      {(!loading || categories.length > 0) && (
        <FloatingCartBar bottomOffset={12} inTabs={true} />
      )}
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
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  headerTextGroup: {
    flex: 1,
  },
  title: {
    fontSize: Typography.h2.fontSize,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: Typography.caption.fontSize,
    color: Colors.primaryDark,
    fontWeight: '700',
    marginTop: 2,
  },
  searchTrigger: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  searchTriggerPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  listContent: {
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.bottomClearance + 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  gridItem: {
    flex: 1,
    padding: 5,
  },
  footerNote: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginHorizontal: 5,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  footerTitle: {
    fontSize: Typography.body.fontSize,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  footerText: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
});

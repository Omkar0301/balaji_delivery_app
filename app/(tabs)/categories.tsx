import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { CategoryCard } from '../../src/components/common/CategoryCard';
import { FloatingCartBar } from '../../src/components/common/FloatingCartBar';
import { useToast } from '../../src/context/ToastContext';
import { MOCK_CATEGORIES } from '../../src/data/mockData';
import { Colors } from '../../src/theme/colors';
import { Typography } from '../../src/theme/typography';
import { Spacing } from '../../src/theme/spacing';
import { Radius } from '../../src/theme/radius';
import { PressableScale } from '../../src/components/common/PressableScale';

export default function CategoriesScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { showSuccess } = useToast();

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      showSuccess('Categories directory updated');
    }, 500);
  }, [showSuccess]);
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

      {/* 2 Column Category Grid */}
      <FlatList
        data={MOCK_CATEGORIES}
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

      {/* Floating Bottom Cart Bar */}
      <FloatingCartBar bottomOffset={12} inTabs={true} />
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

import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { ProductCard } from '../src/components/common/ProductCard';
import { EmptyState } from '../src/components/common/EmptyState';
import { FloatingCartBar } from '../src/components/common/FloatingCartBar';
import { MOCK_PRODUCTS } from '../src/data/mockData';
import { Colors } from '../src/theme/colors';
import { Typography } from '../src/theme/typography';
import { Spacing } from '../src/theme/spacing';
import { Radius } from '../src/theme/radius';
import { PressableScale } from '../src/components/common/PressableScale';
import { LottieAssets } from '../src/assets/lottie';

const POPULAR_SEARCHES = ['Tomatoes', 'Apples', 'Black Pepper', 'Badam (Almonds)', 'Kaju', 'Bhindi', 'Palak', 'Bananas'];

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  const searchResults = useMemo(() => {
    const trimmed = debouncedQuery.trim().toLowerCase();
    return MOCK_PRODUCTS.filter((p) => {
      const matchQuery =
        !trimmed ||
        p.name.toLowerCase().includes(trimmed) ||
        p.regionalName.toLowerCase().includes(trimmed) ||
        p.categoryName.toLowerCase().includes(trimmed);

      const matchTag =
        !selectedTag ||
        (selectedTag === 'Under ₹50' && p.basePrice < 50) ||
        (selectedTag === 'A-Grade' && p.grade === 'A-Grade') ||
        (selectedTag === 'Fruits' && p.categoryId === 'cat-fruits') ||
        (selectedTag === 'Sukameva' && p.categoryId === 'cat-sukameva');

      return matchQuery && matchTag;
    });
  }, [debouncedQuery, selectedTag]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Search Input Bar */}
      <View style={styles.searchBarContainer}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
        </Pressable>

        <View style={styles.inputContainer}>
          <MaterialIcons name="search" size={20} color={Colors.primary} style={{ marginRight: 6 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search produce, fruits, pepper, sukameva..."
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
          />
          {query !== debouncedQuery ? (
            <ActivityIndicator size="small" color={Colors.primary} style={{ marginRight: 6 }} />
          ) : query.length > 0 ? (
            <PressableScale
              onPress={() => setQuery('')}
              activeScale={0.88}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialIcons name="close" size={18} color={Colors.textMuted} style={{ paddingHorizontal: 4 }} />
            </PressableScale>
          ) : null}
        </View>
      </View>

      {/* Filter Quick Tags */}
      <View style={styles.tagsRow}>
        {['Under ₹50', 'A-Grade', 'Fruits', 'Sukameva'].map((tag) => (
          <PressableScale
            key={tag}
            onPress={() => setSelectedTag(selectedTag === tag ? null : tag)}
            activeScale={0.94}
            style={[styles.tagChip, selectedTag === tag && styles.tagChipActive]}
          >
            <Text style={[styles.tagText, selectedTag === tag && styles.tagTextActive]}>
              {tag}
            </Text>
          </PressableScale>
        ))}
      </View>

      {/* Popular Chips (if query is empty) */}
      {!query && (
        <View style={styles.popularContainer}>
          <Text style={styles.popularTitle}>POPULAR SEARCHES</Text>
          <View style={styles.popularChipsWrap}>
            {POPULAR_SEARCHES.map((item) => (
              <PressableScale
                key={item}
                onPress={() => setQuery(item)}
                activeScale={0.94}
                style={styles.popularChip}
              >
                <Text style={styles.popularChipText}>{item}</Text>
              </PressableScale>
            ))}
          </View>
        </View>
      )}

      {/* Results Header */}
      {query.length > 0 && (
        <View style={styles.resultsInfoRow}>
          <Text style={styles.resultsCount}>
            Found {searchResults.length} matching {searchResults.length === 1 ? 'vegetable' : 'vegetables'}
          </Text>
        </View>
      )}

      {/* Results List */}
      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: 110 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <ProductCard product={item} />}
        ListEmptyComponent={
          <EmptyState
            lottieSource={LottieAssets.emptySearch}
            title="No vegetables found"
            description={`We couldn't find anything matching "${query}". Try searching for Gujarati names like "Batata" or "Bhindi".`}
            actionLabel="Clear Search"
            onAction={() => {
              setQuery('');
              setSelectedTag(null);
            }}
          />
        }
      />

      {/* Floating Bottom Cart Bar */}
      <FloatingCartBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: Spacing.xs,
  },
  backButtonText: {
    fontSize: 22,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  inputContainer: {
    flex: 1,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    marginRight: 6,
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.body.fontSize,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  clearText: {
    fontSize: 14,
    color: Colors.textMuted,
    paddingHorizontal: 4,
  },
  tagsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    gap: 8,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tagChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceMuted,
  },
  tagChipActive: {
    backgroundColor: Colors.primaryContainer,
    borderColor: Colors.primary,
  },
  tagText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  tagTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  popularContainer: {
    padding: Spacing.md,
  },
  popularTitle: {
    fontSize: Typography.micro.fontSize,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.6,
    marginBottom: Spacing.sm,
  },
  popularChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  popularChip: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  popularChipText: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  resultsInfoRow: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  resultsCount: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: 90,
  },
});

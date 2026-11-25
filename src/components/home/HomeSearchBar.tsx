import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Radius } from '../../theme/radius';
import { Spacing } from '../../theme/spacing';
import { Shadows } from '../../theme/shadows';
import { PressableScale } from '../common/PressableScale';

export const HomeSearchBar: React.FC = () => {
  return (
    <PressableScale
      onPress={() => router.push('/search')}
      activeScale={0.985}
      style={styles.container}
      accessibilityRole="button"
      accessibilityLabel="Search farm fresh produce, fruits and dry fruits"
    >
      <MaterialIcons name="search" size={22} color={Colors.primary} />
      <Text style={styles.placeholder} numberOfLines={1}>
        Search veggies, fruits, black pepper, sukameva...
      </Text>
      <View style={styles.filterIconCircle}>
        <MaterialIcons name="tune" size={18} color={Colors.textSecondary} />
      </View>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    height: 48,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
    ...Shadows.level1,
  },
  placeholder: {
    flex: 1,
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  filterIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

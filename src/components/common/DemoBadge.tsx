import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../theme/colors';
import { Radius } from '../../theme/radius';
import { Spacing } from '../../theme/spacing';
import { APP_CONSTANTS } from '../../constants/app';

interface DemoBadgeProps {
  style?: ViewStyle;
}

/**
 * Subtle prototype indicator badge controlled by APP_CONSTANTS.IS_DEMO.
 */
export const DemoBadge: React.FC<DemoBadgeProps> = ({ style }) => {
  if (!APP_CONSTANTS.IS_DEMO) {
    return null;
  }

  return (
    <View style={[styles.badge, style]} accessibilityLabel={APP_CONSTANTS.DEMO_LABEL}>
      <Text style={styles.text}>{APP_CONSTANTS.DEMO_LABEL}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainer,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    alignSelf: 'center',
  },
  text: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: Colors.textMuted,
  },
});

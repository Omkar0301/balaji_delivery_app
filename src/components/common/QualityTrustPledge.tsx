import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Radius } from '../../theme/radius';
import { Spacing } from '../../theme/spacing';

export const QualityTrustPledge: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="verified" size={18} color={Colors.primary} />
        <Text style={styles.headerTitle}>The Balaji Freshness Pledge</Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.item}>
          <MaterialIcons name="schedule" size={22} color={Colors.primary} />
          <Text style={styles.itemTitle}>Zero Cold Storage</Text>
          <Text style={styles.itemDesc}>Direct harvest</Text>
        </View>

        <View style={styles.item}>
          <MaterialIcons name="agriculture" size={22} color={Colors.primary} />
          <Text style={styles.itemTitle}>Direct Sourcing</Text>
          <Text style={styles.itemDesc}>Partner farm direct</Text>
        </View>

        <View style={styles.item}>
          <MaterialIcons name="scale" size={22} color={Colors.primary} />
          <Text style={styles.itemTitle}>Tare-Weighed</Text>
          <Text style={styles.itemDesc}>Digital scale check</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.xl,
    padding: Spacing.spaceMd,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.spaceSm,
    marginBottom: Spacing.spaceSm,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  grid: {
    flexDirection: 'row',
    gap: Spacing.spaceSm,
  },
  item: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg,
    padding: Spacing.spaceSm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.onSurface,
    textAlign: 'center',
    marginTop: 4,
  },
  itemDesc: {
    fontSize: 9,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 1,
  },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';

export interface OfflineBannerProps {
  isOffline: boolean;
  isRestored?: boolean;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ isOffline, isRestored }) => {
  if (!isOffline && !isRestored) {
    return null;
  }

  const isSuccess = isRestored && !isOffline;

  return (
    <View style={[styles.banner, isSuccess ? styles.bannerRestored : styles.bannerOffline]}>
      <View style={styles.bannerContent}>
        <MaterialIcons
          name={isSuccess ? 'wifi' : 'wifi-off'}
          size={14}
          color="#FFFFFF"
        />
        <Text style={styles.bannerText}>
          {isSuccess
            ? 'Internet connection restored'
            : 'Offline Mode • Showing morning cached harvest data'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    paddingVertical: 5,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bannerOffline: {
    backgroundColor: '#9A5B00', // Rich amber warning
  },
  bannerRestored: {
    backgroundColor: Colors.primary, // Botanical green
  },
  bannerText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});

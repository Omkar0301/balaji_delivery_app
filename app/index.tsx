import { useEffect, useState } from 'react';
import { router, useRootNavigationState } from 'expo-router';
import { View, StyleSheet, Text, Image, Animated } from 'react-native';
import { Colors } from '../src/theme/colors';
import { useAuthContext } from '../src/context/AuthContext';
import { Typography } from '../src/theme/typography';
import { Spacing } from '../src/theme/spacing';
import { Radius } from '../src/theme/radius';
import { Motion } from '../src/theme/motion';
import { AppLottie } from '../src/components/common/AppLottie';
import { LottieAssets } from '../src/assets/lottie';

export default function EntryScreen() {
  const { isLoggedIn, isHydrating } = useAuthContext();
  const rootNavigationState = useRootNavigationState();

  const [logoScale] = useState(() => new Animated.Value(0.85));
  const [logoOpacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        ...Motion.spring.bouncy,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, [logoScale, logoOpacity]);

  useEffect(() => {
    // Wait until session hydration and Expo Router root navigation state are ready
    if (isHydrating || !rootNavigationState?.key) return;

    try {
      if (isLoggedIn) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/welcome');
      }
    } catch (err) {
      console.error('Failed to navigate from entry screen:', err);
    }
  }, [isHydrating, isLoggedIn, rootNavigationState?.key]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={{
          opacity: logoOpacity,
          transform: [{ scale: logoScale }],
          alignItems: 'center',
        }}
      >
        <View style={styles.logoCircle}>
          <Image
            source={require('../assets/splash-icon.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.brandTitle}>Balaji Fresh</Text>
        <Text style={styles.brandSubtitle}>Direct Farm & Vendor • Fresh to Doorstep</Text>
      </Animated.View>
      <AppLottie source={LottieAssets.freshLoader} size={44} autoPlay loop style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: Radius.xl,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  logoImage: {
    width: 76,
    height: 76,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  loader: {
    marginTop: Spacing.xl,
  },
});

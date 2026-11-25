import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';
import { Typography } from '../../src/theme/typography';
import { Spacing } from '../../src/theme/spacing';
import { Radius } from '../../src/theme/radius';
import { Shadows } from '../../src/theme/shadows';
import { Motion } from '../../src/theme/motion';
import { PressableScale } from '../../src/components/common/PressableScale';

export default function WelcomeScreen() {
  const [lang, setLang] = useState<'en' | 'gu'>('en');

  const [cardsOpacity] = useState(() => new Animated.Value(0));
  const [cardsTranslateY] = useState(() => new Animated.Value(25));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardsOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(cardsTranslateY, {
        toValue: 0,
        ...Motion.spring.gentle,
      }),
    ]).start();
  }, [cardsOpacity, cardsTranslateY]);

  const content = {
    en: {
      subtitle: 'Fresh Farm-to-Doorstep Delivery',
      cta: 'Get Started with Mobile Number',
      explore: 'Explore Today’s Produce →',
      terms: 'By continuing, you agree to our ',
      termsLink: 'Terms of Service',
      and: ' & ',
      privacyLink: 'Privacy Policy',
      features: [
        {
          icon: 'wb-twilight',
          title: 'Direct Farm & Vendor Sourcing',
          desc: 'Fresh vegetables, fruits, pepper & dry fruits direct to your doorstep',
        },
        {
          icon: 'scale',
          title: '100% Exact Electronic Weighing',
          desc: 'Itemized digital invoice with zero weight deduction',
        },
        {
          icon: 'local-shipping',
          title: '8:00 AM – 12:00 PM Doorstep Delivery',
          desc: 'Delivered at your home every morning with guaranteed freshness',
        },
      ],
    },
    gu: {
      subtitle: 'સવારની તાજી શાકભાજી સીધા તમારા આંગણે',
      cta: 'મોબાઈલ નંબર સાથે શરૂ કરો',
      explore: 'શાકભાજીના આજના ભાવ જુઓ →',
      terms: 'આગળ વધીને, તમે અમારા ',
      termsLink: 'નિયમો અને શરતો',
      and: ' તેમજ ',
      privacyLink: 'ગોપનીયતા નીતિ',
      features: [
        {
          icon: 'wb-twilight',
          title: 'સીધી ખેતર અને વેન્ડર આવક',
          desc: 'વચેટિયા વગર શ્રેષ્ઠ ગુણવત્તાવાળો તાજો માલ સીધો તમારા આંગણે',
        },
        {
          icon: 'scale',
          title: 'ચોક્કસ ડિજિટલ ઇલેક્ટ્રોનિક વજન',
          desc: 'એક-એક ગ્રામનું પાકું બિલ, કોઈ વજન કાપ નહીં',
        },
        {
          icon: 'local-shipping',
          title: '૮:૦૦ થી ૧૨:૦૦ સવારે ડિલિવરી',
          desc: 'સવારની રસોઈ અને ચા પહેલાં તમારા દરવાજે ડિલિવરી',
        },
      ],
    },
  }[lang];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Ambient background decoration */}
      <View style={styles.ambientCircleLeft} />
      <View style={styles.ambientCircleRight} />

      {/* Top Utilities Bar: Language Switcher */}
      <View style={styles.topBar}>
        <Pressable
          onPress={() => setLang(lang === 'en' ? 'gu' : 'en')}
          style={({ pressed }) => [styles.langTogglePill, pressed && styles.langTogglePressed]}
          accessibilityRole="button"
          accessibilityLabel={`Current language ${lang === 'en' ? 'English' : 'Gujarati'}. Tap to toggle.`}
        >
          <MaterialIcons name="translate" size={18} color={Colors.secondary} />
          <Text style={[styles.langText, lang === 'en' ? styles.langActive : styles.langInactive]}>
            English
          </Text>
          <Text style={styles.langDivider}>|</Text>
          <Text style={[styles.langText, lang === 'gu' ? styles.langActive : styles.langInactive]}>
            ગુજરાતી
          </Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Emblem Header */}
        <View style={styles.header}>
          <View style={styles.logoCard}>
            <View style={styles.logoInner}>
              <MaterialIcons name="eco" size={32} color={Colors.primary} />
            </View>
          </View>
          <Text style={styles.brandTitle}>Balaji Enterprise</Text>
          <Text style={styles.brandSubtitle}>{content.subtitle}</Text>
        </View>

        {/* Value Highlights */}
        <Animated.View
          style={[
            styles.featuresList,
            {
              opacity: cardsOpacity,
              transform: [{ translateY: cardsTranslateY }],
            },
          ]}
        >
          {content.features.map((feat, idx) => (
            <View key={idx} style={styles.featureItem}>
              <View style={styles.featureIconBox}>
                <MaterialIcons name={feat.icon as any} size={22} color={Colors.primary} />
              </View>
              <View style={styles.featureTextBox}>
                <Text style={styles.featureTitle}>{feat.title}</Text>
                <Text style={styles.featureDesc}>{feat.desc}</Text>
              </View>
            </View>
          ))}
        </Animated.View>

        {/* CTA & Legal */}
        <View style={styles.ctaSection}>
          <PressableScale
            onPress={() => router.push('/(auth)/login')}
            activeScale={0.98}
            style={styles.primaryCta}
            accessibilityRole="button"
            accessibilityLabel={content.cta}
          >
            <MaterialIcons name="smartphone" size={22} color="#FFFFFF" />
            <Text style={styles.primaryCtaText}>{content.cta}</Text>
            <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
          </PressableScale>

          <PressableScale
            onPress={() => router.replace('/(tabs)')}
            activeScale={0.98}
            style={styles.secondaryCta}
            accessibilityRole="button"
            accessibilityLabel={content.explore}
          >
            <Text style={styles.secondaryCtaText}>{content.explore}</Text>
          </PressableScale>

          <Text style={styles.legalText}>
            {content.terms}
            <Text style={styles.legalLink}>{content.termsLink}</Text>
            {content.and}
            <Text style={styles.legalLink}>{content.privacyLink}</Text>.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  ambientCircleLeft: {
    position: 'absolute',
    top: -50,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(163, 246, 156, 0.25)',
  },
  ambientCircleRight: {
    position: 'absolute',
    top: 140,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(254, 166, 25, 0.15)',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
    zIndex: 10,
  },
  langTogglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    ...Shadows.level1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  langTogglePressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  langText: {
    fontSize: 13,
  },
  langActive: {
    fontWeight: '800',
    color: Colors.primary,
  },
  langInactive: {
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  langDivider: {
    color: Colors.border,
    fontSize: 12,
  },
  scrollContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  logoCard: {
    width: 64,
    height: 64,
    borderRadius: Radius.xl,
    backgroundColor: Colors.surface,
    ...Shadows.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  logoInner: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    backgroundColor: '#A3F69C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 280,
  },
  featuresList: {
    gap: 12,
    marginVertical: Spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: 12,
    ...Shadows.level1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  featureIconBox: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTextBox: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  featureDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  ctaSection: {
    gap: 10,
    marginTop: Spacing.sm,
  },
  primaryCta: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: Radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...Shadows.md,
  },
  primaryCtaText: {
    color: '#FFFFFF',
    fontSize: Typography.bodyLarge.fontSize,
    fontWeight: '800',
  },
  secondaryCta: {
    backgroundColor: Colors.surface,
    height: 46,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  secondaryCtaText: {
    color: Colors.primary,
    fontSize: Typography.body.fontSize,
    fontWeight: '700',
  },
  ctaPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  legalText: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 4,
  },
  legalLink: {
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
});

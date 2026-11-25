import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';
import { Typography } from '../../src/theme/typography';
import { Spacing } from '../../src/theme/spacing';
import { Radius } from '../../src/theme/radius';
import { Shadows } from '../../src/theme/shadows';
import { useAuthContext } from '../../src/context/AuthContext';
import { formatPhoneNumber, validateIndianPhone } from '../../src/utils/validation';
import { PressableScale } from '../../src/components/common/PressableScale';

export default function LoginScreen() {
  const { phone, login } = useAuthContext();
  const [phoneNumber, setPhoneNumber] = useState(phone || '');
  const [lang, setLang] = useState<'en' | 'gu'>('en');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const cleanDigits = phoneNumber.replace(/[^0-9]/g, '');
  const isValid = validateIndianPhone(cleanDigits);

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhoneNumber(formatted);
    if (error) setError(null);
  };

  const handleSendOtp = async (inputNum?: string) => {
    const numToSubmit = inputNum || cleanDigits;
    if (!validateIndianPhone(numToSubmit)) {
      setError(lang === 'en' ? 'Please enter a valid 10-digit mobile number' : 'કૃપા કરીને માન્ય ૧૦ આંકડાનો મોબાઈલ નંબર દાખલ કરો');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await login(numToSubmit);
      router.push('/(auth)/otp');
    } catch {
      setError(lang === 'en' ? 'Failed to send verification code. Please retry.' : 'ઓટીપી મોકલવામાં ભૂલ થઈ. ફરી પ્રયાસ કરો.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Minimal Top Utility Header */}
        <View style={styles.topHeader}>
          <Pressable
            onPress={() => router.back()}
            style={styles.brandRow}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <View style={styles.brandLogoCircle}>
              <MaterialIcons name="eco" size={20} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.brandName}>Balaji</Text>
              <Text style={styles.brandTag}>ENTERPRISE</Text>
            </View>
          </Pressable>

          {/* Language Switcher Pill */}
          <View style={styles.langPillContainer}>
            <Pressable
              onPress={() => setLang('en')}
              style={[styles.langOption, lang === 'en' && styles.langOptionActive]}
            >
              <Text style={[styles.langText, lang === 'en' && styles.langTextActive]}>
                English
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setLang('gu')}
              style={[styles.langOption, lang === 'gu' && styles.langOptionActive]}
            >
              <Text style={[styles.langText, lang === 'gu' && styles.langTextActive]}>
                ગુજરાતી
              </Text>
            </Pressable>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Warm Greeting */}
          <View style={styles.greetingSection}>
            <Text style={styles.greetingTitle}>
              {lang === 'en' ? 'Welcome Back' : 'ફરી સ્વાગત છે'}
            </Text>
            <Text style={styles.greetingSubtitle}>
              {lang === 'en'
                ? 'Enter your mobile number to get started.'
                : 'શરૂ કરવા માટે તમારો મોબાઈલ નંબર દાખલ કરો.'}
            </Text>
          </View>

          {/* Input Form Card */}
          <View style={styles.card}>
            <View style={styles.labelRow}>
              <MaterialIcons name="smartphone" size={18} color={Colors.primary} />
              <Text style={styles.inputLabel}>
                {lang === 'en' ? 'Mobile Number' : 'મોબાઈલ નંબર'}
              </Text>
            </View>

            {/* High-Contrast Phone Input Field */}
            <View
              style={[
                styles.phoneInputBox,
                isFocused && styles.phoneInputBoxFocused,
                error && styles.phoneInputBoxError,
              ]}
            >
              <View style={styles.countryCodePill}>
                <Text style={styles.flagEmoji}>🇮🇳</Text>
                <Text style={styles.countryCodeText}>+91</Text>
                <View style={styles.divider} />
              </View>

              <TextInput
                style={styles.textInput}
                placeholder="98765 43210"
                placeholderTextColor={Colors.textMuted}
                keyboardType="phone-pad"
                maxLength={11}
                value={phoneNumber}
                onChangeText={handlePhoneChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                autoFocus
              />

              {isValid && (
                <View style={styles.checkIcon}>
                  <MaterialIcons name="check-circle" size={24} color={Colors.primary} />
                </View>
              )}
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            {/* OTP Explainer */}
            <View style={styles.explainerRow}>
              <MaterialIcons
                name="verified-user"
                size={18}
                color={Colors.primary}
                style={styles.explainerIcon}
              />
              <Text style={styles.explainerText}>
                {lang === 'en'
                  ? 'We will send a 4-digit SMS OTP for secure & instant verification. No password required.'
                  : 'સુરક્ષિત અને ઝડપી ચકાસણી માટે ૪-આંકડાનો SMS ઓટીપી મોકલવામાં આવશે. કોઈ પાસવર્ડની જરૂર નથી.'}
              </Text>
            </View>

            {/* Continue Button */}
            <PressableScale
              onPress={() => handleSendOtp()}
              disabled={loading}
              activeScale={0.98}
              style={[
                styles.continueBtn,
                !isValid && styles.continueBtnDisabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Continue to OTP Verification"
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={styles.continueBtnText}>
                    {lang === 'en' ? 'Continue' : 'આગળ વધો'}
                  </Text>
                  <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
                </>
              )}
            </PressableScale>
          </View>

          {/* Footer Security Guarantee */}
          <View style={styles.footerNote}>
            <MaterialIcons name="lock" size={15} color={Colors.textMuted} />
            <Text style={styles.footerNoteText}>
              256-bit Encrypted • Balaji Enterprise Direct Deliveries
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandLogoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  brandTag: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 1.2,
  },
  langPillContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerHigh,
    padding: 3,
    borderRadius: Radius.full,
  },
  langOption: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  langOptionActive: {
    backgroundColor: Colors.surface,
    ...Shadows.level1,
  },
  langText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  langTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  scrollContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  greetingSection: {
    marginBottom: Spacing.lg,
  },
  greetingTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  greetingSubtitle: {
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    ...Shadows.level1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  phoneInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.lg,
    height: 56,
    paddingHorizontal: Spacing.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  phoneInputBoxFocused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
    ...Shadows.level1,
  },
  phoneInputBoxError: {
    borderColor: Colors.error,
    backgroundColor: '#FFF5F5',
  },
  countryCodePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 8,
  },
  flagEmoji: {
    fontSize: 20,
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  divider: {
    width: 1,
    height: 22,
    backgroundColor: '#CBD5E1',
    marginLeft: 4,
  },
  textInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: 1.5,
    paddingLeft: 8,
  },
  checkIcon: {
    paddingLeft: 6,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 6,
    fontWeight: '600',
  },
  explainerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  explainerIcon: {
    marginTop: 1,
  },
  explainerText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  continueBtn: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: Radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...Shadows.md,
  },
  continueBtnDisabled: {
    opacity: 0.6,
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  btnPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: Spacing.xl,
  },
  footerNoteText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
});

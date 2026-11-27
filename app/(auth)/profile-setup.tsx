import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
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
import { useToast } from '../../src/context/ToastContext';

export default function ProfileSetupScreen() {
  const { user, updateProfile } = useAuthContext();
  const { showSuccess } = useToast();
  const [fullName, setFullName] = useState(user?.fullName || 'Sunita Sharma');
  const [language, setLanguage] = useState<'en' | 'gu'>('en');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultAddr = user?.savedAddresses.find((a) => a.isDefault) || user?.savedAddresses[0];
  const displayAddress = defaultAddr
    ? `${defaultAddr.street || defaultAddr.flatNumber}, Surat`
    : 'Adajan Canal Road, Surat';

  const handleCompleteSetup = async () => {
    if (fullName.trim().length < 2) {
      setError('Full name must be at least 2 characters');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await updateProfile({
        fullName: fullName.trim(),
        preferredLanguage: language === 'en' ? 'en' : 'gu',
      });
      showSuccess(`Welcome to Balaji Fresh, ${fullName.trim()}!`);
      router.replace('/(tabs)');
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr?.message || 'Could not save your profile. Please retry.');
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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable
              onPress={() => router.back()}
              style={styles.backBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} />
            </Pressable>
            <View style={styles.brandBadge}>
              <MaterialIcons name="eco" size={18} color={Colors.primary} />
            </View>
            <Text style={styles.headerTitle}>Customer Profile Setup</Text>
          </View>

          <View style={styles.headerRight}>
            <Pressable style={styles.avatarCircle}>
              <MaterialIcons name="person" size={18} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Progress / Welcome Title */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Profile Setup</Text>
            <Text style={styles.subtitle}>
              Tell us where to deliver your fresh vegetables.
            </Text>
          </View>

          {/* Language Selector Card */}
          <View style={styles.languageCard}>
            <View style={styles.languageHeader}>
              <View style={styles.langHeaderLeft}>
                <MaterialIcons name="translate" size={18} color={Colors.primary} />
                <Text style={styles.langCardTitle}>Preferred App Language</Text>
              </View>
              <Text style={styles.langCardSubtitle}>ભાષા પસંદ કરો</Text>
            </View>

            <View style={styles.langOptionsGrid}>
              <Pressable
                onPress={() => setLanguage('en')}
                style={[
                  styles.langOptionBtn,
                  language === 'en' && styles.langOptionBtnActive,
                ]}
              >
                <MaterialIcons
                  name="check-circle"
                  size={18}
                  color={language === 'en' ? Colors.primary : 'transparent'}
                />
                <Text
                  style={[
                    styles.langOptionText,
                    language === 'en' && styles.langOptionTextActive,
                  ]}
                >
                  English
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setLanguage('gu')}
                style={[
                  styles.langOptionBtn,
                  language === 'gu' && styles.langOptionBtnActive,
                ]}
              >
                <MaterialIcons
                  name="check-circle"
                  size={18}
                  color={language === 'gu' ? Colors.primary : 'transparent'}
                />
                <Text
                  style={[
                    styles.langOptionText,
                    language === 'gu' && styles.langOptionTextActive,
                  ]}
                >
                  ગુજરાતી (Gujarati)
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Profile Details Card */}
          <View style={styles.detailsCard}>
            {/* Full Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>
                Full Name <Text style={styles.requiredAsterisk}>*</Text>
              </Text>
              <View style={[styles.inputBox, error && styles.inputBoxError]}>
                <MaterialIcons name="person" size={20} color={Colors.textSecondary} />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Sunita Sharma"
                  placeholderTextColor={Colors.textMuted}
                  value={fullName}
                  onChangeText={(t) => {
                    setFullName(t);
                    if (error) setError(null);
                  }}
                />
              </View>
              {error && <Text style={styles.fieldErrorText}>{error}</Text>}
            </View>

            {/* Delivery Address / Society */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>
                Delivery Address / Society <Text style={styles.requiredAsterisk}>*</Text>
              </Text>
              <View style={styles.addressBox}>
                <View style={styles.addressLeft}>
                  <MaterialIcons name="location-on" size={20} color={Colors.primary} />
                  <Text style={styles.addressText} numberOfLines={1}>
                    {displayAddress}
                  </Text>
                </View>
                <Pressable
                  onPress={() => router.push('/address/add')}
                  style={styles.changeAddressBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.changeAddressText}>CHANGE</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Complete Setup CTA */}
          <Pressable
            onPress={handleCompleteSetup}
            disabled={loading}
            style={({ pressed }) => [
              styles.completeBtn,
              pressed && styles.completeBtnPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Complete Profile Setup"
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text style={styles.completeBtnText}>Complete Setup</Text>
                <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
              </>
            )}
          </Pressable>
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
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backBtn: {
    padding: 4,
  },
  brandBadge: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  titleSection: {
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  languageCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  languageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  langHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  langCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  langCardSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  langOptionsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  langOptionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceContainerHighest,
  },
  langOptionBtnActive: {
    backgroundColor: Colors.surface,
    ...Shadows.level1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  langOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  langOptionTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  detailsCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.level1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: Spacing.md,
  },
  inputGroup: {},
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  requiredAsterisk: {
    color: Colors.error,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surfaceContainerLow,
    height: 50,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
  },
  inputBoxError: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: Colors.error,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  fieldErrorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  addressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceContainerLow,
    height: 50,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
  },
  addressLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  addressText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  changeAddressBtn: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.sm,
    ...Shadows.level1,
  },
  changeAddressText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
  },
  completeBtn: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: Radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...Shadows.md,
  },
  completeBtnPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  completeBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});

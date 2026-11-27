import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthContext } from '../../src/context/AuthContext';
import { useToast } from '../../src/context/ToastContext';
import { formatPhoneNumber, validateIndianPhone } from '../../src/utils/validation';
import { Colors } from '../../src/theme/colors';
import { Typography } from '../../src/theme/typography';
import { Spacing } from '../../src/theme/spacing';
import { Radius } from '../../src/theme/radius';
import { Shadows } from '../../src/theme/shadows';

export default function AddAddressScreen() {
  const insets = useSafeAreaInsets();
  const { addAddress, user } = useAuthContext();
  const { showSuccess, showError } = useToast();
  const [recipientName, setRecipientName] = useState(
    user?.fullName && user.fullName !== 'Guest User' ? user.fullName : ''
  );
  const [phone, setPhone] = useState(
    user?.phone && !user.phone.startsWith('guest_') ? formatPhoneNumber(user.phone) : ''
  );
  const [flatNumber, setFlatNumber] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('395009');
  const [city, setCity] = useState('Surat');
  const [tag, setTag] = useState<'HOME' | 'WORK' | 'PARENTS' | 'OTHER'>('HOME');
  const [isDefault, setIsDefault] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [saving, setSaving] = useState(false);

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateForm = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!flatNumber.trim()) errs.flatNumber = 'Flat / house number is required';
    if (!buildingName.trim()) errs.buildingName = 'Society / apartment name is required';
    if (!/^\d{6}$/.test(pincode.trim())) errs.pincode = 'Pincode must be a 6-digit number';
    if (city.trim().length < 2) errs.city = 'City must be at least 2 characters';
    if (recipientName.trim().length < 2) {
      errs.recipientName = 'Recipient name must be at least 2 characters';
    }
    if (!validateIndianPhone(phone)) {
      errs.recipientPhone = 'Please enter a valid 10-digit Indian mobile number';
    }
    return errs;
  };

  const handleSave = async () => {
    const errs = validateForm();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      const firstError = Object.values(errs)[0];
      if (firstError) showError(firstError);
      return;
    }

    setFieldErrors({});
    setSaving(true);
    try {
      await addAddress({
        recipientName: recipientName.trim(),
        recipientPhone: phone.replace(/\D/g, ''),
        flatNumber: flatNumber.trim(),
        buildingName: buildingName.trim(),
        street: street.trim() || 'Adajan Canal Road',
        landmark: landmark.trim() || undefined,
        pincode: pincode.trim(),
        city: city.trim(),
        tag,
        isDefault,
      });

      showSuccess('Morning delivery address saved successfully');
      router.back();
    } catch (err: unknown) {
      const apiErr = err as {
        message?: string;
        details?: { body?: Record<string, string[]> };
      };
      if (apiErr?.details?.body) {
        const mapped: Record<string, string> = {};
        for (const [key, msgs] of Object.entries(apiErr.details.body)) {
          if (Array.isArray(msgs) && msgs[0]) mapped[key] = msgs[0];
        }
        if (Object.keys(mapped).length > 0) setFieldErrors(mapped);
      }
      showError(apiErr?.message || 'Failed to save delivery address');
    } finally {
      setSaving(false);
    }
  };

  const isFormValid = !saving && flatNumber.trim().length > 0 && buildingName.trim().length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <MaterialIcons name="arrow-back" size={20} color={Colors.primary} />
              <Text style={styles.backButtonText}>Back</Text>
            </View>
          </Pressable>
          <Text style={styles.headerTitle}>Add Delivery Address</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + insets.bottom }]} keyboardShouldPersistTaps="handled">
          {/* Address Tag Selector */}
          <Text style={styles.label}>SAVE ADDRESS AS</Text>
          <View style={styles.tagRow}>
            {([
              { id: 'HOME', icon: 'home' },
              { id: 'WORK', icon: 'work' },
              { id: 'PARENTS', icon: 'people' },
              { id: 'OTHER', icon: 'location-on' },
            ] as const).map((item) => (
              <Pressable
                key={item.id}
                onPress={() => setTag(item.id)}
                style={[styles.tagButton, tag === item.id && styles.tagButtonActive, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }]}
              >
                <MaterialIcons
                  name={item.icon}
                  size={14}
                  color={tag === item.id ? '#FFFFFF' : Colors.textSecondary}
                />
                <Text style={[styles.tagText, tag === item.id && styles.tagTextActive]}>{item.id}</Text>
              </Pressable>
            ))}
          </View>

          {/* Form Fields */}
          <View style={styles.card}>
            <Text style={styles.label}>FLAT / HOUSE NO. / WING</Text>
            <TextInput
              style={[styles.input, fieldErrors.flatNumber && { borderColor: Colors.error }]}
              placeholder="e.g. Flat B-402, 4th Floor"
              placeholderTextColor={Colors.textMuted}
              value={flatNumber}
              onChangeText={(t) => {
                setFlatNumber(t);
                clearFieldError('flatNumber');
              }}
            />
            {fieldErrors.flatNumber && (
              <Text style={{ color: Colors.error, fontSize: 12, marginTop: -8, marginBottom: 8 }}>
                {fieldErrors.flatNumber}
              </Text>
            )}

            <Text style={styles.label}>SOCIETY / APARTMENT NAME</Text>
            <TextInput
              style={[styles.input, fieldErrors.buildingName && { borderColor: Colors.error }]}
              placeholder="e.g. Shivalik Greens Apartment"
              placeholderTextColor={Colors.textMuted}
              value={buildingName}
              onChangeText={(t) => {
                setBuildingName(t);
                clearFieldError('buildingName');
              }}
            />
            {fieldErrors.buildingName && (
              <Text style={{ color: Colors.error, fontSize: 12, marginTop: -8, marginBottom: 8 }}>
                {fieldErrors.buildingName}
              </Text>
            )}

            <Text style={styles.label}>STREET / ROAD / AREA</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Adajan Canal Rd, Gaurav Path"
              placeholderTextColor={Colors.textMuted}
              value={street}
              onChangeText={setStreet}
            />

            <Text style={styles.label}>LANDMARK (OPTIONAL)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Near Iscon Mall, Gaurav Path"
              placeholderTextColor={Colors.textMuted}
              value={landmark}
              onChangeText={setLandmark}
            />

            <View style={styles.twoColumnRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>PINCODE</Text>
                <TextInput
                  style={[styles.input, fieldErrors.pincode && { borderColor: Colors.error }]}
                  placeholder="395009"
                  placeholderTextColor={Colors.textMuted}
                  value={pincode}
                  maxLength={6}
                  onChangeText={(t) => {
                    setPincode(t.replace(/\D/g, '').slice(0, 6));
                    clearFieldError('pincode');
                  }}
                  keyboardType="numeric"
                />
                {fieldErrors.pincode && (
                  <Text style={{ color: Colors.error, fontSize: 12, marginTop: -8, marginBottom: 8 }}>
                    {fieldErrors.pincode}
                  </Text>
                )}
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.label}>CITY</Text>
                <TextInput
                  style={[styles.input, fieldErrors.city && { borderColor: Colors.error }]}
                  placeholder="Surat"
                  placeholderTextColor={Colors.textMuted}
                  value={city}
                  onChangeText={(t) => {
                    setCity(t);
                    clearFieldError('city');
                  }}
                />
                {fieldErrors.city && (
                  <Text style={{ color: Colors.error, fontSize: 12, marginTop: -8, marginBottom: 8 }}>
                    {fieldErrors.city}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Recipient Details */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>RECIPIENT CONTACT</Text>

            <Text style={styles.label}>CONTACT PERSON NAME</Text>
            <TextInput
              style={[styles.input, fieldErrors.recipientName && { borderColor: Colors.error }]}
              placeholder="e.g. Rajesh Patel"
              placeholderTextColor={Colors.textMuted}
              value={recipientName}
              onChangeText={(t) => {
                setRecipientName(t);
                clearFieldError('recipientName');
              }}
            />
            {fieldErrors.recipientName && (
              <Text style={{ color: Colors.error, fontSize: 12, marginTop: -8, marginBottom: 8 }}>
                {fieldErrors.recipientName}
              </Text>
            )}

            <Text style={styles.label}>PHONE NUMBER FOR MORNING CALL</Text>
            <TextInput
              style={[styles.input, fieldErrors.recipientPhone && { borderColor: Colors.error }]}
              placeholder="e.g. 98765 43210"
              placeholderTextColor={Colors.textMuted}
              value={phone}
              maxLength={11}
              onChangeText={(t) => {
                setPhone(formatPhoneNumber(t));
                clearFieldError('recipientPhone');
              }}
              keyboardType="phone-pad"
            />
            {fieldErrors.recipientPhone && (
              <Text style={{ color: Colors.error, fontSize: 12, marginTop: -8, marginBottom: 4 }}>
                {fieldErrors.recipientPhone}
              </Text>
            )}
          </View>

          {/* Set as Default Checkbox */}
          <Pressable onPress={() => setIsDefault(!isDefault)} style={styles.checkboxRow}>
            <View style={[styles.checkbox, isDefault && styles.checkboxActive]}>
              {isDefault && <MaterialIcons name="check" size={14} color="#FFFFFF" />}
            </View>
            <Text style={styles.checkboxLabel}>Make this my primary morning delivery address</Text>
          </Pressable>
        </ScrollView>

        {/* Save CTA */}
        <View style={[styles.footerBar, { paddingBottom: Math.max(Spacing.md, insets.bottom + 8) }]}>
          <Pressable
            onPress={handleSave}
            disabled={!isFormValid}
            style={({ pressed }) => [
              styles.saveButton,
              !isFormValid && styles.saveButtonDisabled,
              pressed && styles.btnPressed,
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.saveButtonText}>Save Address & Deliver Here</Text>
              <MaterialIcons name="arrow-forward" size={18} color="#FFFFFF" />
            </View>
          </Pressable>
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    paddingVertical: Spacing.xs,
  },
  backButtonText: {
    color: Colors.primary,
    fontSize: Typography.body.fontSize,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: Typography.bodyLarge.fontSize,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 110,
  },
  label: {
    fontSize: Typography.micro.fontSize,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 4,
    marginTop: Spacing.xs,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.md,
  },
  tagButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  tagButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryContainer,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  tagTextActive: {
    color: Colors.primary,
  },
  card: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  cardTitle: {
    fontSize: Typography.micro.fontSize,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.6,
    marginBottom: Spacing.xs,
  },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    fontSize: Typography.body.fontSize,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  twoColumnRow: {
    flexDirection: 'row',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: Spacing.xs,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
  },
  footerBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    ...Shadows.lg,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    height: 50,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: Colors.surfaceDim,
  },
  saveButtonText: {
    color: Colors.onPrimary,
    fontSize: Typography.bodyLarge.fontSize,
    fontWeight: '800',
  },
  btnPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
});

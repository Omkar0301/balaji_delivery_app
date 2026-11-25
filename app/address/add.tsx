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
import { Colors } from '../../src/theme/colors';
import { Typography } from '../../src/theme/typography';
import { Spacing } from '../../src/theme/spacing';
import { Radius } from '../../src/theme/radius';
import { Shadows } from '../../src/theme/shadows';

export default function AddAddressScreen() {
  const insets = useSafeAreaInsets();
  const { addAddress, user } = useAuthContext();
  const { showSuccess, showError } = useToast();
  const [recipientName, setRecipientName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [flatNumber, setFlatNumber] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('395009');
  const [city, setCity] = useState('Surat');
  const [tag, setTag] = useState<'HOME' | 'WORK' | 'PARENTS' | 'OTHER'>('HOME');
  const [isDefault, setIsDefault] = useState(true);

  const handleSave = () => {
    if (!flatNumber.trim() || !buildingName.trim()) {
      showError('Please enter flat/house number and society name');
      return;
    }

    addAddress({
      recipientName: recipientName || 'Valued Customer',
      recipientPhone: phone || '9876543210',
      flatNumber,
      buildingName,
      street: street || 'Adajan Canal Road',
      landmark,
      pincode,
      city,
      tag,
      isDefault,
    });

    showSuccess('Morning delivery address saved successfully');
    router.back();
  };

  const isFormValid = flatNumber.trim().length > 0 && buildingName.trim().length > 0;

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
              style={styles.input}
              placeholder="e.g. Flat B-402, 4th Floor"
              placeholderTextColor={Colors.textMuted}
              value={flatNumber}
              onChangeText={setFlatNumber}
            />

            <Text style={styles.label}>SOCIETY / APARTMENT NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Shivalik Greens Apartment"
              placeholderTextColor={Colors.textMuted}
              value={buildingName}
              onChangeText={setBuildingName}
            />

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
                  style={styles.input}
                  placeholder="395009"
                  placeholderTextColor={Colors.textMuted}
                  value={pincode}
                  onChangeText={setPincode}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.label}>CITY</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Surat"
                  placeholderTextColor={Colors.textMuted}
                  value={city}
                  onChangeText={setCity}
                />
              </View>
            </View>
          </View>

          {/* Recipient Details */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>RECIPIENT CONTACT</Text>

            <Text style={styles.label}>CONTACT PERSON NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Rajesh Patel"
              placeholderTextColor={Colors.textMuted}
              value={recipientName}
              onChangeText={setRecipientName}
            />

            <Text style={styles.label}>PHONE NUMBER FOR MORNING CALL</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 9876543210"
              placeholderTextColor={Colors.textMuted}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
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

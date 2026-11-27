import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
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

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, isLoggedIn, refreshProfile, updateProfile, setDefaultAddress, logout } =
    useAuthContext();
  const { showSuccess, showInfo, showError } = useToast();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    if (!isLoggedIn) return;
    setRefreshing(true);
    try {
      await refreshProfile();
      showSuccess('Profile & address book updated');
    } catch {
      showError('Could not refresh profile');
    } finally {
      setRefreshing(false);
    }
  }, [isLoggedIn, refreshProfile, showSuccess, showError]);

  const handleSetDefaultAddress = async (id: string) => {
    try {
      await setDefaultAddress(id);
      showSuccess('Default morning delivery address updated');
    } catch {
      showError('Failed to update default address');
    }
  };

  const handleUpdateLanguage = async (lang: 'gu' | 'en') => {
    if (!isLoggedIn) {
      router.push('/(auth)/login');
      return;
    }
    try {
      await updateProfile({ preferredLanguage: lang });
      showSuccess('App language updated');
    } catch {
      showError('Failed to update language');
    }
  };

  const handleLogout = async () => {
    await logout();
    showInfo('Signed out safely');
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Account & Preferences</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Spacing.bottomClearance + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {/* User Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {user?.fullName.split(' ').map((n) => n[0]).join('') || 'RP'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.fullName || 'Guest User'}</Text>
            <Text style={styles.userPhone}>
              {user?.phone?.startsWith('guest_')
                ? 'Guest Session'
                : `+91 ${user?.phone || '9876543210'}`}
            </Text>
            <View style={styles.badgeRow}>
              <View style={[styles.verifiedBadge, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                <MaterialIcons
                  name={user?.isVerified ? 'verified' : 'person-outline'}
                  size={12}
                  color={Colors.primary}
                />
                <Text style={styles.verifiedText}>
                  {user?.isVerified ? 'Verified Customer' : 'Guest Account'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Saved Delivery Addresses */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>SAVED MORNING ADDRESSES</Text>
          <Pressable onPress={() => router.push('/address/add')}>
            <Text style={styles.addAddressLink}>+ Add New</Text>
          </Pressable>
        </View>

        <View style={styles.addressList}>
          {user?.savedAddresses.map((addr) => (
            <Pressable
              key={addr.id}
              onPress={() => handleSetDefaultAddress(addr.id)}
              style={[styles.addressCard, addr.isDefault && styles.addressCardDefault]}
            >
              <View style={styles.addressHeader}>
                <View style={[styles.tagBadge, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                  <MaterialIcons
                    name={addr.tag === 'HOME' ? 'home' : addr.tag === 'WORK' ? 'work' : 'location-on'}
                    size={12}
                    color={Colors.primary}
                  />
                  <Text style={styles.tagText}>{addr.tag}</Text>
                </View>
                {addr.isDefault && (
                  <Text style={styles.defaultLabel}>PRIMARY MORNING ADDRESS</Text>
                )}
              </View>
              <Text style={styles.addressLine1}>
                {addr.flatNumber}, {addr.buildingName}
              </Text>
              <Text style={styles.addressLine2}>
                {addr.street}, {addr.city} - {addr.pincode}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Language Selection */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.sm, marginTop: Spacing.sm }}>
          <MaterialIcons name="translate" size={15} color={Colors.primary} />
          <Text style={[styles.sectionTitle, { marginBottom: 0, marginTop: 0 }]}>APP LANGUAGE / ભાષા</Text>
        </View>
        <View style={styles.langRow}>
          {[
            { id: 'gu', label: 'ગુજરાતી' },
            { id: 'en', label: 'English' },
          ].map((l) => {
            const isSelected = user?.preferredLanguage === l.id;
            return (
              <Pressable
                key={l.id}
                onPress={() => handleUpdateLanguage(l.id as 'gu' | 'en')}
                style={[styles.langChip, isSelected && styles.langChipActive]}
              >
                <Text style={[styles.langChipText, isSelected && styles.langChipTextActive]}>
                  {l.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Logout */}
        <Pressable
          onPress={handleLogout}
          style={[styles.logoutButton, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }]}
        >
          <MaterialIcons name="logout" size={18} color="#DC2626" />
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: Typography.h2.fontSize,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.bottomClearance,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  userName: {
    fontSize: Typography.bodyLarge.fontSize,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  userPhone: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  verifiedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedText: {
    color: '#15803D',
    fontSize: 10,
    fontWeight: '800',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: Typography.micro.fontSize,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.6,
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
  },
  addAddressLink: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '700',
    color: Colors.primary,
  },
  addressList: {
    gap: 8,
    marginBottom: Spacing.md,
  },
  addressCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  addressCardDefault: {
    borderColor: Colors.primary,
    backgroundColor: '#E8F5E9',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  tagBadge: {
    backgroundColor: Colors.surfaceMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  defaultLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
  addressLine1: {
    fontSize: Typography.body.fontSize,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  addressLine2: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  langRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.md,
  },
  langChip: {
    flex: 1,
    height: 42,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langChipActive: {
    backgroundColor: '#E8F5E9',
    borderColor: Colors.primary,
  },
  langChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  langChipTextActive: {
    color: Colors.primaryDark,
    fontWeight: '800',
  },
  logoutButton: {
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
    marginTop: Spacing.sm,
  },
  logoutText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: Typography.body.fontSize,
  },
});

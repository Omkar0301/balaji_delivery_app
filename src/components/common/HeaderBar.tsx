import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Radius } from '../../theme/radius';
import { Spacing } from '../../theme/spacing';
import { Typography } from '../../theme/typography';
import { Shadows } from '../../theme/shadows';
import { useAuthContext } from '../../context/AuthContext';
import { PressableScale } from './PressableScale';

export interface HeaderBarProps {
  locationLabel?: string;
  onPressLocation?: () => void;
  onPressProfile?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  locationLabel,
  onPressLocation,
  onPressProfile,
}) => {
  const insets = useSafeAreaInsets();
  const { user, setDefaultAddress } = useAuthContext();
  const [addressModalVisible, setAddressModalVisible] = useState(false);

  const activeAddress =
    user?.savedAddresses.find((a) => a.isDefault) || user?.savedAddresses[0];

  const displayLocation =
    locationLabel ||
    (activeAddress
      ? `${activeAddress.street || activeAddress.flatNumber}, Surat`
      : 'Adajan Canal Rd, Surat');

  const handleLocationPress = () => {
    if (onPressLocation) {
      onPressLocation();
    } else {
      setAddressModalVisible(true);
    }
  };

  const handleProfilePress = () => {
    if (onPressProfile) {
      onPressProfile();
    } else {
      router.push('/(tabs)/profile');
    }
  };

  const handleSelectAddress = (id: string) => {
    setDefaultAddress(id);
    setAddressModalVisible(false);
  };

  const handleAddNewAddress = () => {
    setAddressModalVisible(false);
    router.push('/address/add');
  };

  return (
    <>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Top Row: Brand, Location, Profile */}
        <View style={styles.topRow}>
          {/* Brand Logo & Name */}
          <PressableScale
            onPress={() => router.push('/(tabs)')}
            activeScale={0.96}
            style={styles.brandContainer}
          >
            <View style={styles.logoCircle}>
              <MaterialIcons name="eco" size={18} color="#FFFFFF" />
            </View>
            <Text style={styles.brandTitle}>Balaji Fresh</Text>
          </PressableScale>

          {/* Location / Address Trigger Pill */}
          <PressableScale
            onPress={handleLocationPress}
            activeScale={0.97}
            style={styles.locationChip}
            accessibilityRole="button"
            accessibilityLabel={`Delivering to ${displayLocation}. Tap to change address.`}
          >
            <MaterialIcons name="location-on" size={17} color={Colors.primary} />
            <View style={styles.locationTextContainer}>
              <Text style={styles.deliveringLabel}>DELIVERING TO</Text>
              <Text style={styles.locationValue} numberOfLines={1} ellipsizeMode="tail">
                {displayLocation}
              </Text>
            </View>
            <MaterialIcons name="expand-more" size={16} color={Colors.onSurfaceVariant} />
          </PressableScale>

          {/* Profile Button */}
          <PressableScale
            onPress={handleProfilePress}
            activeScale={0.92}
            style={styles.profileButton}
            accessibilityRole="button"
            accessibilityLabel="Open Account and Profile"
          >
            <View style={styles.avatarFallback}>
              {user ? (
                <Text style={styles.avatarText}>
                  {user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'RP'}
                </Text>
              ) : (
                <MaterialIcons name="person" size={20} color="#FFFFFF" />
              )}
            </View>
          </PressableScale>
        </View>
      </View>

      {/* Address Selection Modal */}
      <Modal
        visible={addressModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddressModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setAddressModalVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>

        <View style={[styles.bottomSheet, { paddingBottom: Math.max(Spacing.xl + 10, insets.bottom + Spacing.md) }]}>
          <View style={styles.sheetHandle} />

          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>Select Delivery Address</Text>
              <Text style={styles.sheetSubtitle}>
                Fresh produce & commodities delivered to your doorstep
              </Text>
            </View>
            <Pressable
              onPress={() => setAddressModalVisible(false)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialIcons name="close" size={22} color={Colors.textMuted} />
            </Pressable>
          </View>

          {/* List of saved addresses */}
          <FlatList
            data={user?.savedAddresses || []}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.addressListContent}
            renderItem={({ item }) => {
              const isSelected = item.id === activeAddress?.id;
              return (
                <Pressable
                  onPress={() => handleSelectAddress(item.id)}
                  style={({ pressed }) => [
                    styles.addressItem,
                    isSelected && styles.addressItemSelected,
                    pressed && styles.pressedFeedback,
                  ]}
                >
                  <View style={styles.addressLeft}>
                    <MaterialIcons
                      name={isSelected ? 'radio-button-checked' : 'radio-button-unchecked'}
                      size={20}
                      color={isSelected ? Colors.primary : Colors.textMuted}
                    />
                    <View style={styles.addressInfo}>
                      <View style={styles.tagRow}>
                        <View style={[styles.tagPill, isSelected && styles.tagPillSelected]}>
                          <Text
                            style={[styles.tagPillText, isSelected && styles.tagPillTextSelected]}
                          >
                            {item.tag}
                          </Text>
                        </View>
                        {isSelected && <Text style={styles.defaultBadge}>Active</Text>}
                      </View>
                      <Text style={styles.addressLine1} numberOfLines={1}>
                        {item.flatNumber}, {item.buildingName}
                      </Text>
                      <Text style={styles.addressLine2} numberOfLines={1}>
                        {item.street}, {item.landmark} • {item.pincode}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            }}
          />

          {/* Add New Address Button */}
          <PressableScale
            onPress={handleAddNewAddress}
            activeScale={0.98}
            style={styles.addNewBtn}
          >
            <MaterialIcons name="add-location-alt" size={20} color="#FFFFFF" />
            <Text style={styles.addNewBtnText}>+ Add New Address</Text>
          </PressableScale>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    ...Shadows.level1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    gap: 8,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  pressedFeedback: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.3,
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radius.full,
    flex: 1,
    minWidth: 110,
    maxWidth: 200,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  chipPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  locationTextContainer: {
    marginHorizontal: 4,
    flex: 1,
  },
  deliveringLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.4,
  },
  locationValue: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    flexShrink: 0,
    overflow: 'hidden',
  },
  profileButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.92 }],
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  bottomSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl + 10,
    maxHeight: '65%',
    ...Shadows.level3,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.outlineVariant,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  sheetTitle: {
    fontSize: Typography.bodyLarge.fontSize,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  sheetSubtitle: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textMuted,
    marginTop: 2,
  },
  addressListContent: {
    gap: 10,
    paddingBottom: Spacing.md,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  addressItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#E8F5E9',
  },
  addressLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  addressInfo: {
    flex: 1,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  tagPill: {
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  tagPillSelected: {
    backgroundColor: Colors.primary,
  },
  tagPillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  tagPillTextSelected: {
    color: '#FFFFFF',
  },
  defaultBadge: {
    fontSize: 10,
    fontWeight: '700',
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
    marginTop: 1,
  },
  addNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    height: 48,
    borderRadius: Radius.md,
    gap: 8,
    marginTop: Spacing.sm,
    elevation: 2,
  },
  addNewBtnPressed: {
    backgroundColor: Colors.primaryDark,
    transform: [{ scale: 0.98 }],
  },
  addNewBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: Typography.body.fontSize,
  },
});

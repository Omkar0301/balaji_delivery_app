import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';
import { Typography } from '../../src/theme/typography';
import { Spacing } from '../../src/theme/spacing';
import { Radius } from '../../src/theme/radius';
import { Shadows } from '../../src/theme/shadows';
import { PressableScale } from '../../src/components/common/PressableScale';
import { useAuthContext } from '../../src/context/AuthContext';
import { useToast } from '../../src/context/ToastContext';

export default function OtpScreen() {
  const insets = useSafeAreaInsets();
  const { phone, login, verifyOtp } = useAuthContext();
  const { showSuccess } = useToast();
  const [digits, setDigits] = useState(['', '', '', '']);
  const [countdown, setCountdown] = useState(28);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hiddenInputRef = useRef<React.ElementRef<typeof TextInput>>(null);
  const [shakeAnim] = useState(() => new Animated.Value(0));
  const [cursorOpacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, { toValue: 0.2, duration: 450, useNativeDriver: true }),
        Animated.timing(cursorOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [cursorOpacity]);

  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 4, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => {
    if (countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  const fullOtp = digits.join('');
  const isComplete = fullOtp.length === 4;

  const handleKeyPress = (num: string) => {
    const nextIndex = digits.findIndex((d) => d === '');
    if (nextIndex !== -1) {
      const newDigits = [...digits];
      newDigits[nextIndex] = num;
      setDigits(newDigits);
      if (error) setError(null);
    }
  };

  const handleBackspace = () => {
    // Find last filled index
    let lastFilled = -1;
    for (let i = 3; i >= 0; i--) {
      if (digits[i] !== '') {
        lastFilled = i;
        break;
      }
    }
    if (lastFilled !== -1) {
      const newDigits = [...digits];
      newDigits[lastFilled] = '';
      setDigits(newDigits);
      if (error) setError(null);
    }
  };

  const handleAutofillDemo = () => {
    setDigits(['1', '2', '3', '4']);
    if (error) setError(null);
  };

  const handleHiddenInputChange = (text: string) => {
    const clean = text.replace(/[^0-9]/g, '').slice(0, 4);
    const newDigits = ['', '', '', ''];
    for (let i = 0; i < clean.length; i++) {
      newDigits[i] = clean[i];
    }
    setDigits(newDigits);
    if (error) setError(null);
  };

  const handleVerify = async () => {
    if (!isComplete) {
      setError('Please enter all 4 digits');
      triggerShake();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { ok, isNewUser } = await verifyOtp(fullOtp);
      if (ok) {
        if (isNewUser) {
          router.replace('/(auth)/profile-setup');
        } else {
          router.replace('/(tabs)');
        }
      } else {
        setError('Invalid OTP code. Please check and retry.');
        triggerShake();
      }
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr?.message || 'Verification failed. Please retry.');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setCountdown(28);
    setDigits(['', '', '', '']);
    setError(null);
    try {
      await login(phone);
      showSuccess(`Fresh verification code sent to ${phone || 'your mobile'}`);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr?.message || 'Failed to resend code. Please wait a moment.');
    }
  };

  const activeIndex = digits.findIndex((d) => d === '');

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Verify OTP</Text>
        </View>

        <Pressable
          onPress={() => Alert.alert('Demo OTP', 'Use code 1234 to verify instantly.')}
          style={styles.helpBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialIcons name="help-outline" size={22} color={Colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: Math.max(Spacing.md, insets.bottom + 8) },
        ]}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Title Group */}
        <View style={styles.titleGroup}>
          <Text style={styles.title}>Verification Code</Text>
          <View style={styles.subtitleRow}>
            <Text style={styles.subtitleText}>Code sent to </Text>
            <Text style={styles.phoneBold}>+91 {phone || '98765 43210'}</Text>
            <Pressable
              onPress={() => router.back()}
              style={styles.editBtn}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Text style={styles.editText}>Edit</Text>
              <MaterialIcons name="edit" size={14} color={Colors.primary} />
            </Pressable>
          </View>
        </View>

        {/* Hidden TextInput for native keyboard / clipboard paste */}
        <TextInput
          ref={hiddenInputRef}
          style={styles.hiddenInput}
          value={fullOtp}
          onChangeText={handleHiddenInputChange}
          keyboardType="number-pad"
          maxLength={4}
        />

        {/* 4 Digit OTP Boxes */}
        <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
          <Pressable
            onPress={() => hiddenInputRef.current?.focus()}
            style={styles.otpGrid}
          >
            {[0, 1, 2, 3].map((index) => {
              const digit = digits[index];
              const isActive = (activeIndex === index) || (activeIndex === -1 && index === 3);
              return (
                <View
                  key={index}
                  style={[
                    styles.otpBox,
                    isActive && styles.otpBoxActive,
                    digit ? styles.otpBoxFilled : null,
                  ]}
                >
                  {digit ? (
                    <Text style={styles.otpDigitText}>{digit}</Text>
                  ) : isActive ? (
                    <Animated.View style={[styles.cursor, { opacity: cursorOpacity }]} />
                  ) : null}
                </View>
              );
            })}
          </Pressable>
        </Animated.View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        {/* Resend Timer Pill Card */}
        <View style={styles.timerCard}>
          <View style={styles.timerLeft}>
            <MaterialIcons name="timer" size={18} color={Colors.textSecondary} />
            <Text style={styles.timerText}>Resend code in</Text>
          </View>
          {countdown > 0 ? (
            <Text style={styles.countdownText}>
              0:{countdown < 10 ? `0${countdown}` : countdown}s
            </Text>
          ) : (
            <Pressable onPress={handleResend}>
              <Text style={styles.resendActiveText}>Resend Now</Text>
            </Pressable>
          )}
        </View>

        {/* Verify & Continue Button */}
        <PressableScale
          onPress={handleVerify}
          disabled={loading || !isComplete}
          activeScale={0.97}
          style={[
            styles.verifyBtn,
            !isComplete && styles.verifyBtnDisabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Verify and continue"
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Text style={styles.verifyBtnText}>Verify & Continue</Text>
              <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
            </>
          )}
        </PressableScale>

        {/* Custom Senior-Friendly Number Keypad */}
        <View style={styles.keypadContainer}>
          {[
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9'],
          ].map((row, rIdx) => (
            <View key={rIdx} style={styles.keypadRow}>
              {row.map((num) => (
                <Pressable
                  key={num}
                  onPress={() => handleKeyPress(num)}
                  style={({ pressed }) => [
                    styles.keypadBtn,
                    pressed && styles.keypadBtnPressed,
                  ]}
                >
                  <Text style={styles.keypadBtnText}>{num}</Text>
                </Pressable>
              ))}
            </View>
          ))}
          {/* Bottom Keypad Row: Demo Autofill, 0, Backspace */}
          <View style={styles.keypadRow}>
            <Pressable
              onPress={handleAutofillDemo}
              style={({ pressed }) => [
                styles.keypadBtnSpecial,
                pressed && styles.keypadBtnPressed,
              ]}
              accessibilityLabel="Autofill test code 1234"
            >
              <MaterialIcons name="fingerprint" size={22} color={Colors.primary} />
            </Pressable>
            <Pressable
              onPress={() => handleKeyPress('0')}
              style={({ pressed }) => [
                styles.keypadBtn,
                pressed && styles.keypadBtnPressed,
              ]}
            >
              <Text style={styles.keypadBtnText}>0</Text>
            </Pressable>
            <Pressable
              onPress={handleBackspace}
              style={({ pressed }) => [
                styles.keypadBtnSpecial,
                pressed && styles.keypadBtnPressed,
              ]}
              accessibilityLabel="Backspace"
            >
              <MaterialIcons name="backspace" size={22} color={Colors.textSecondary} />
            </Pressable>
          </View>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  helpBtn: {
    padding: 6,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    justifyContent: 'space-between',
  },
  titleGroup: {
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  subtitleText: {
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
  },
  phoneBold: {
    fontSize: Typography.body.fontSize,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: 6,
  },
  editText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  hiddenInput: {
    position: 'absolute',
    width: 0,
    height: 0,
    opacity: 0,
  },
  otpGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginVertical: Spacing.sm,
  },
  otpBox: {
    flex: 1,
    height: 64,
    borderRadius: Radius.xl,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.level1,
  },
  otpBoxActive: {
    borderColor: Colors.primary,
    ...Shadows.md,
  },
  otpBoxFilled: {
    borderColor: Colors.primary,
  },
  otpDigitText: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  cursor: {
    width: 2,
    height: 28,
    backgroundColor: Colors.primary,
    borderRadius: 1,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  timerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    marginVertical: Spacing.xs,
  },
  timerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timerText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  countdownText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
  resendActiveText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  verifyBtn: {
    backgroundColor: Colors.primary,
    height: 50,
    borderRadius: Radius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...Shadows.md,
    marginVertical: Spacing.xs,
  },
  verifyBtnDisabled: {
    opacity: 0.6,
  },
  verifyBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  keypadContainer: {
    gap: 8,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  keypadRow: {
    flexDirection: 'row',
    gap: 8,
  },
  keypadBtn: {
    flex: 1,
    height: 48,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  keypadBtnSpecial: {
    flex: 1,
    height: 48,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  keypadBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  keypadBtnPressed: {
    backgroundColor: Colors.surfaceContainerHigh,
    transform: [{ scale: 0.97 }],
  },
  btnPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
});

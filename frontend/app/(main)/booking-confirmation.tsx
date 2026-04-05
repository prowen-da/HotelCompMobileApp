import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  withTiming,
  withRepeat,
  Easing,
  FadeInDown,
  FadeInUp,
  ZoomIn,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function BookingConfirmationScreen() {
  const insets = useSafeAreaInsets();
  const checkScale = useSharedValue(0);
  const ringScale = useSharedValue(0);
  const ring2Scale = useSharedValue(0);
  const confettiY = [useSharedValue(-20), useSharedValue(-20), useSharedValue(-20)];
  const confettiX = [useSharedValue(0), useSharedValue(0), useSharedValue(0)];
  const confettiRotate = [useSharedValue(0), useSharedValue(0), useSharedValue(0)];

  useEffect(() => {
    ringScale.value = withDelay(200, withSpring(1, { damping: 8 }));
    ring2Scale.value = withDelay(400, withSpring(1, { damping: 10 }));
    checkScale.value = withDelay(600, withSpring(1, { damping: 12 }));

    confettiY.forEach((y, i) => {
      y.value = withDelay(
        800 + i * 200,
        withRepeat(
          withSequence(
            withTiming(80, { duration: 1500, easing: Easing.out(Easing.ease) }),
            withTiming(-20, { duration: 0 })
          ),
          -1
        )
      );
      confettiX[i].value = withDelay(
        800 + i * 200,
        withRepeat(
          withSequence(
            withTiming((i - 1) * 60, { duration: 1500 }),
            withTiming(0, { duration: 0 })
          ),
          -1
        )
      );
      confettiRotate[i].value = withDelay(
        800 + i * 200,
        withRepeat(withTiming(360, { duration: 1500 }), -1)
      );
    });
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringScale.value,
  }));

  const ring2Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring2Scale.value }],
    opacity: ring2Scale.value * 0.5,
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const confettiStyles = confettiY.map((y, i) =>
    useAnimatedStyle(() => ({
      transform: [
        { translateY: y.value },
        { translateX: confettiX[i].value },
        { rotate: `${confettiRotate[i].value}deg` },
      ],
      opacity: 0.8,
    }))
  );

  const confettiColors = ['#FFD700', '#FF6B6B', '#4ECDC4'];

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={[styles.content, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 30 }]}>
        {/* Success Animation */}
        <View style={styles.successSection}>
          {/* Confetti */}
          {confettiColors.map((color, i) => (
            <Animated.View
              key={i}
              style={[styles.confetti, { backgroundColor: color }, confettiStyles[i]]}
            />
          ))}

          <Animated.View style={[styles.ring2, ring2Style]} />
          <Animated.View style={[styles.ring1, ringStyle]} />
          <Animated.View style={[styles.checkCircle, checkStyle]}>
            <Ionicons name="checkmark" size={50} color="#fff" />
          </Animated.View>

          <Animated.Text entering={FadeInUp.delay(800)} style={styles.successTitle}>
            Booking Confirmed!
          </Animated.Text>
          <Animated.Text entering={FadeInUp.delay(950)} style={styles.successSubtitle}>
            Your reservation has been successfully placed
          </Animated.Text>
        </View>

        {/* Booking Details Card */}
        <Animated.View entering={FadeInDown.delay(1100).springify()} style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Ionicons name="bed-outline" size={18} color="#667eea" />
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Hotel</Text>
              <Text style={styles.detailValue}>The Grand Palace Hotel</Text>
            </View>
          </View>
          <View style={styles.cardDivider} />
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={18} color="#667eea" />
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Dates</Text>
              <Text style={styles.detailValue}>14 Feb - 17 Feb 2026 (3 nights)</Text>
            </View>
          </View>
          <View style={styles.cardDivider} />
          <View style={styles.detailRow}>
            <Ionicons name="people-outline" size={18} color="#667eea" />
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Guests</Text>
              <Text style={styles.detailValue}>2 Adults, Deluxe Suite</Text>
            </View>
          </View>
          <View style={styles.cardDivider} />
          <View style={styles.detailRow}>
            <Ionicons name="receipt-outline" size={18} color="#667eea" />
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Booking ID</Text>
              <Text style={styles.detailValue}>#BK-2026-FEB-0847</Text>
            </View>
          </View>
          <View style={styles.cardDivider} />
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalAmount}>$838</Text>
          </View>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View entering={FadeInUp.delay(1300)} style={styles.actions}>
          <AnimatedTouchable
            style={styles.primaryBtn}
            onPress={() => router.push('/(main)/home')}
            activeOpacity={0.9}
          >
            <View style={styles.primaryBtnInner}>
              <Ionicons name="home-outline" size={20} color="#667eea" />
              <Text style={styles.primaryBtnText}>Back to Home</Text>
            </View>
          </AnimatedTouchable>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push('/(main)/home')}
          >
            <Text style={styles.secondaryBtnText}>View My Bookings</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'space-between' },
  successSection: { alignItems: 'center', marginTop: 20 },
  ring2: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  ring1: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  checkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  confetti: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 2,
    top: 30,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  detailsCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 14,
  },
  detailInfo: { flex: 1 },
  detailLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 2 },
  detailValue: { fontSize: 14, fontWeight: '600', color: '#fff' },
  cardDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    marginTop: 4,
  },
  totalLabel: { fontSize: 14, color: 'rgba(255,255,255,0.7)' },
  totalAmount: { fontSize: 26, fontWeight: '800', color: '#FFD700' },
  actions: { gap: 12 },
  primaryBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  primaryBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 10,
  },
  primaryBtnText: { fontSize: 16, fontWeight: '700', color: '#667eea' },
  secondaryBtn: {
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  secondaryBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  FadeInDown,
  FadeInUp,
  SlideInRight,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const bookingSummary = {
  hotel: 'The Grand Palace Hotel',
  location: 'Downtown, New York',
  checkIn: '14 Feb 2026',
  checkOut: '17 Feb 2026',
  nights: 3,
  guests: 2,
  roomType: 'Deluxe Suite',
  pricePerNight: 245,
  taxes: 73,
  serviceFee: 30,
};

const paymentMethods = [
  { id: 'card', icon: 'card', label: 'Credit Card' },
  { id: 'apple', icon: 'logo-apple', label: 'Apple Pay' },
  { id: 'google', icon: 'logo-google', label: 'Google Pay' },
];

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const [selectedPayment, setSelectedPayment] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const payBtnScale = useSharedValue(1);

  const total = bookingSummary.pricePerNight * bookingSummary.nights + bookingSummary.taxes + bookingSummary.serviceFee;

  const payBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: payBtnScale.value }],
  }));

  const handlePay = () => {
    payBtnScale.value = withSequence(withTiming(0.95, { duration: 100 }), withSpring(1));
    setTimeout(() => router.push('/(main)/booking-confirmation'), 200);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#11998e', '#38ef7d']}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View entering={FadeInDown.springify()} style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <BlurView intensity={30} style={styles.backBtnBlur}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </BlurView>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={{ width: 45 }} />
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.body}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Booking Summary */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.summaryThumb}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="bed" size={24} color="#fff" />
            </LinearGradient>
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryName}>{bookingSummary.hotel}</Text>
              <Text style={styles.summaryLocation}>{bookingSummary.location}</Text>
            </View>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryDates}>
            <View style={styles.dateCol}>
              <Text style={styles.dateLabel}>Check-in</Text>
              <Text style={styles.dateValue}>{bookingSummary.checkIn}</Text>
            </View>
            <Ionicons name="arrow-forward" size={16} color="#ccc" />
            <View style={styles.dateCol}>
              <Text style={styles.dateLabel}>Check-out</Text>
              <Text style={styles.dateValue}>{bookingSummary.checkOut}</Text>
            </View>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{bookingSummary.roomType}</Text>
            <Text style={styles.summaryVal}>{bookingSummary.nights} nights, {bookingSummary.guests} guests</Text>
          </View>
        </Animated.View>

        {/* Payment Method */}
        <Animated.View entering={FadeInDown.delay(350)}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentRow}>
            {paymentMethods.map((pm, i) => (
              <Animated.View key={pm.id} entering={SlideInRight.delay(400 + i * 80)}>
                <TouchableOpacity
                  style={[
                    styles.paymentOption,
                    selectedPayment === pm.id && styles.paymentOptionActive,
                  ]}
                  onPress={() => setSelectedPayment(pm.id)}
                >
                  <Ionicons
                    name={pm.icon as any}
                    size={22}
                    color={selectedPayment === pm.id ? '#11998e' : '#999'}
                  />
                  <Text
                    style={[
                      styles.paymentLabel,
                      selectedPayment === pm.id && styles.paymentLabelActive,
                    ]}
                  >
                    {pm.label}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Card Form */}
        {selectedPayment === 'card' && (
          <Animated.View entering={FadeInUp.delay(200)} style={styles.cardForm}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Card Number</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="card-outline" size={20} color="#999" />
                <TextInput
                  style={styles.input}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor="#bbb"
                  value={cardNumber}
                  onChangeText={setCardNumber}
                  keyboardType="numeric"
                  maxLength={19}
                />
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Cardholder Name</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="person-outline" size={20} color="#999" />
                <TextInput
                  style={styles.input}
                  placeholder="Alex Johnson"
                  placeholderTextColor="#bbb"
                  value={cardName}
                  onChangeText={setCardName}
                />
              </View>
            </View>
            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Expiry</Text>
                <View style={styles.inputWrap}>
                  <TextInput
                    style={styles.input}
                    placeholder="MM/YY"
                    placeholderTextColor="#bbb"
                    value={expiry}
                    onChangeText={setExpiry}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
              </View>
              <View style={{ width: 12 }} />
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>CVV</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="lock-closed-outline" size={18} color="#999" />
                  <TextInput
                    style={styles.input}
                    placeholder="123"
                    placeholderTextColor="#bbb"
                    value={cvv}
                    onChangeText={setCvv}
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                  />
                </View>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Price Breakdown */}
        <Animated.View entering={FadeInDown.delay(500)} style={styles.priceCard}>
          <Text style={styles.sectionTitle}>Price Details</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>${bookingSummary.pricePerNight} x {bookingSummary.nights} nights</Text>
            <Text style={styles.priceVal}>${bookingSummary.pricePerNight * bookingSummary.nights}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Taxes & fees</Text>
            <Text style={styles.priceVal}>${bookingSummary.taxes}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Service fee</Text>
            <Text style={styles.priceVal}>${bookingSummary.serviceFee}</Text>
          </View>
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalVal}>${total}</Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Pay Button */}
      <Animated.View
        entering={FadeInUp.delay(600)}
        style={[styles.payBar, { paddingBottom: insets.bottom + 15 }]}
      >
        <View style={styles.payInfo}>
          <Text style={styles.payTotal}>${total}</Text>
          <Text style={styles.payDesc}>Total amount</Text>
        </View>
        <AnimatedTouchable
          style={[styles.payBtn, payBtnStyle]}
          onPress={handlePay}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#11998e', '#38ef7d']}
            style={styles.payGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="lock-closed" size={18} color="#fff" />
            <Text style={styles.payText}>Pay Now</Text>
          </LinearGradient>
        </AnimatedTouchable>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { paddingBottom: 18, paddingHorizontal: 15 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { width: 45, height: 45, borderRadius: 15, overflow: 'hidden' },
  backBtnBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  summaryThumb: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  summaryInfo: { flex: 1 },
  summaryName: { fontSize: 16, fontWeight: '700', color: '#333' },
  summaryLocation: { fontSize: 13, color: '#999', marginTop: 3 },
  summaryDivider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 12 },
  summaryDates: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateCol: { alignItems: 'center' },
  dateLabel: { fontSize: 11, color: '#999', marginBottom: 4 },
  dateValue: { fontSize: 14, fontWeight: '600', color: '#333' },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: { fontSize: 13, fontWeight: '600', color: '#667eea' },
  summaryVal: { fontSize: 13, color: '#666' },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  paymentRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  paymentOption: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
  },
  paymentOptionActive: { borderColor: '#11998e', backgroundColor: 'rgba(17,153,142,0.05)' },
  paymentLabel: { fontSize: 11, fontWeight: '600', color: '#999' },
  paymentLabelActive: { color: '#11998e' },
  cardForm: { marginBottom: 20 },
  inputGroup: { marginBottom: 14 },
  inputLabel: { fontSize: 12, fontWeight: '600', color: '#666', marginBottom: 6 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    height: 50,
    gap: 10,
  },
  input: { flex: 1, fontSize: 15, color: '#333' },
  inputRow: { flexDirection: 'row' },
  priceCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  priceLabel: { fontSize: 14, color: '#666' },
  priceVal: { fontSize: 14, fontWeight: '600', color: '#333' },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    marginTop: 4,
    marginBottom: 0,
  },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#333' },
  totalVal: { fontSize: 20, fontWeight: '800', color: '#11998e' },
  payBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  payInfo: { flex: 1 },
  payTotal: { fontSize: 22, fontWeight: '800', color: '#333' },
  payDesc: { fontSize: 12, color: '#999' },
  payBtn: { borderRadius: 14, overflow: 'hidden' },
  payGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 16,
    gap: 8,
  },
  payText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

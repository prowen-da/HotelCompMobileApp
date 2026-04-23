import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeInUp,
  ZoomIn,
  SlideInRight,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { fetchCitySuggestions } from '../../src/services/api';

const { width } = Dimensions.get('window');
const STEPS = ['City', 'Hotels', 'Dates', 'Review'];

interface HotelEntry {
  id: string;
  hotelName: string;
  hotelAddress: string;
}

interface CityResult {
  id: number;
  city: string;
  state: string;
  country: string;
  latitude: string;
  longitude: string;
}

export default function CreateCompsetScreen() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: City
  const [cityQuery, setCityQuery] = useState('');
  const [citySuggestions, setCitySuggestions] = useState<CityResult[]>([]);
  const [selectedCity, setSelectedCity] = useState<CityResult | null>(null);
  const [cityLoading, setCityLoading] = useState(false);

  // Step 2: Hotels
  const [hotels, setHotels] = useState<HotelEntry[]>([]);
  const [hotelName, setHotelName] = useState('');
  const [hotelAddress, setHotelAddress] = useState('');

  // Step 3: Dates
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  const glowOpacity = useSharedValue(0.3);
  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(withTiming(0.5, { duration: 2500 }), withTiming(0.3, { duration: 2500 })),
      -1, true
    );
  }, []);
  const glowStyle = useAnimatedStyle(() => ({ opacity: glowOpacity.value }));

  // City search debounce
  useEffect(() => {
    if (cityQuery.length < 2) {
      setCitySuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setCityLoading(true);
      const results = await fetchCitySuggestions(cityQuery);
      setCitySuggestions(results.slice(0, 8));
      setCityLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [cityQuery]);

  const handleSelectCity = (city: CityResult) => {
    setSelectedCity(city);
    setCityQuery(city.city);
    setCitySuggestions([]);
  };

  const handleAddHotel = () => {
    if (!hotelName.trim()) return;
    const addr = hotelAddress.trim() || (selectedCity ? `${selectedCity.city}, ${selectedCity.state}, ${selectedCity.country}` : '');
    setHotels([...hotels, {
      id: Date.now().toString(),
      hotelName: hotelName.trim(),
      hotelAddress: addr,
    }]);
    setHotelName('');
    setHotelAddress('');
  };

  const handleRemoveHotel = (id: string) => {
    setHotels(hotels.filter(h => h.id !== id));
  };

  const canProceed = () => {
    if (step === 0) return !!selectedCity;
    if (step === 1) return hotels.length >= 2;
    if (step === 2) return !!checkIn && !!checkOut;
    return true;
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';
      const payload = {
        data: {
          start_date: checkIn,
          end_date: checkOut,
          allHotels: hotels.map(h => ({
            hotelName: h.hotelName,
            hotelAddress: h.hotelAddress,
            placeId: '',
            addressComponents: [],
          })),
        },
      };

      const res = await fetch(`${BACKEND_URL}/api/comp_create/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (res.ok && json.rateshopId) {
        Alert.alert(
          'Compset Created!',
          `Your hotel comparison "${json.rateshopName}" is ready.\nRateshop ID: ${json.rateshopId}`,
          [{ text: 'View Results', onPress: () => router.replace('/(main)/comparison-detail') }]
        );
      } else {
        Alert.alert('Info', json.error || json.message || 'Compset creation initiated. Data may take a few minutes to process.', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (err) {
      Alert.alert('Network Error', 'Could not connect to the server. Please try again.', [{ text: 'OK' }]);
    }
    setIsSubmitting(false);
  };

  // Set default dates
  useEffect(() => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const weekAfter = new Date(nextWeek);
    weekAfter.setDate(nextWeek.getDate() + 2);
    setCheckIn(nextWeek.toISOString().split('T')[0]);
    setCheckOut(weekAfter.toISOString().split('T')[0]);
  }, []);

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
      <Animated.View style={[styles.orb, styles.orb1, glowStyle]} />
      <Animated.View style={[styles.orb, styles.orb2, glowStyle]} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Animated.View entering={FadeInDown.springify()} style={styles.headerRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => step > 0 ? setStep(step - 1) : router.back()}>
              <BlurView intensity={25} style={styles.backBtnBlur} tint="dark">
                <Ionicons name="arrow-back" size={22} color="#fff" />
              </BlurView>
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Create Compset</Text>
              <Text style={styles.headerSub}>Step {step + 1} of {STEPS.length}</Text>
            </View>
          </Animated.View>

          {/* Progress Steps */}
          <View style={styles.stepsRow}>
            {STEPS.map((s, i) => (
              <View key={s} style={styles.stepItem}>
                <View style={[styles.stepDot, i <= step && styles.stepDotActive, i < step && styles.stepDotDone]}>
                  {i < step ? (
                    <Ionicons name="checkmark" size={12} color="#fff" />
                  ) : (
                    <Text style={[styles.stepNum, i <= step && styles.stepNumActive]}>{i + 1}</Text>
                  )}
                </View>
                <Text style={[styles.stepLabel, i <= step && styles.stepLabelActive]}>{s}</Text>
                {i < STEPS.length - 1 && <View style={[styles.stepLine, i < step && styles.stepLineActive]} />}
              </View>
            ))}
          </View>
        </View>

        <ScrollView style={styles.body} contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 100 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* STEP 0: CITY */}
          {step === 0 && (
            <Animated.View entering={FadeInUp.springify()}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Ionicons name="location" size={22} color="#667eea" />
                  <Text style={styles.cardTitle}>Select City</Text>
                </View>
                <Text style={styles.cardSub}>Search for the city where you want to compare hotels</Text>

                <View style={styles.searchBox}>
                  <Ionicons name="search" size={18} color="rgba(255,255,255,0.4)" />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Type city name..."
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={cityQuery}
                    onChangeText={(t) => { setCityQuery(t); if (selectedCity && t !== selectedCity.city) setSelectedCity(null); }}
                    autoFocus
                  />
                  {cityLoading && <ActivityIndicator size="small" color="#667eea" />}
                  {cityQuery.length > 0 && !cityLoading && (
                    <TouchableOpacity onPress={() => { setCityQuery(''); setSelectedCity(null); setCitySuggestions([]); }}>
                      <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.4)" />
                    </TouchableOpacity>
                  )}
                </View>

                {citySuggestions.length > 0 && (
                  <View style={styles.suggestList}>
                    {citySuggestions.map((c, i) => (
                      <Animated.View key={c.id} entering={FadeInDown.delay(i * 50)}>
                        <TouchableOpacity style={styles.suggestItem} onPress={() => handleSelectCity(c)}>
                          <Ionicons name="location-outline" size={16} color="#667eea" />
                          <View style={{ flex: 1, marginLeft: 10 }}>
                            <Text style={styles.suggestCity}>{c.city}</Text>
                            <Text style={styles.suggestMeta}>{c.state}, {c.country}</Text>
                          </View>
                          <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.2)" />
                        </TouchableOpacity>
                      </Animated.View>
                    ))}
                  </View>
                )}

                {selectedCity && (
                  <Animated.View entering={ZoomIn} style={styles.selectedPill}>
                    <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                    <Text style={styles.selectedText}>{selectedCity.city}, {selectedCity.state}, {selectedCity.country}</Text>
                  </Animated.View>
                )}
              </View>
            </Animated.View>
          )}

          {/* STEP 1: HOTELS */}
          {step === 1 && (
            <Animated.View entering={FadeInUp.springify()}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Ionicons name="business" size={22} color="#a78bfa" />
                  <Text style={styles.cardTitle}>Add Hotels</Text>
                </View>
                <Text style={styles.cardSub}>Add at least 2 hotels to compare (in {selectedCity?.city || 'selected city'})</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Hotel Name *</Text>
                  <View style={styles.inputBox}>
                    <Ionicons name="bed-outline" size={16} color="rgba(255,255,255,0.4)" />
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. The Residency Towers"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      value={hotelName}
                      onChangeText={setHotelName}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Address (optional)</Text>
                  <View style={styles.inputBox}>
                    <Ionicons name="map-outline" size={16} color="rgba(255,255,255,0.4)" />
                    <TextInput
                      style={styles.textInput}
                      placeholder={`Address in ${selectedCity?.city || 'city'}...`}
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      value={hotelAddress}
                      onChangeText={setHotelAddress}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.addBtn, !hotelName.trim() && styles.addBtnDisabled]}
                  onPress={handleAddHotel}
                  disabled={!hotelName.trim()}
                >
                  <Ionicons name="add-circle" size={20} color={hotelName.trim() ? '#667eea' : 'rgba(255,255,255,0.2)'} />
                  <Text style={[styles.addBtnText, !hotelName.trim() && { color: 'rgba(255,255,255,0.2)' }]}>Add Hotel</Text>
                </TouchableOpacity>
              </View>

              {/* Added Hotels */}
              {hotels.length > 0 && (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Ionicons name="list" size={18} color="#10b981" />
                    <Text style={styles.cardTitle}>Selected Hotels ({hotels.length})</Text>
                  </View>
                  {hotels.map((h, i) => (
                    <Animated.View key={h.id} entering={SlideInRight.delay(i * 80)} style={styles.hotelItem}>
                      <View style={[styles.hotelNum, { backgroundColor: ['#667eea', '#a78bfa', '#11998e', '#2193b0', '#F5A623'][i % 5] + '30' }]}>
                        <Text style={[styles.hotelNumText, { color: ['#667eea', '#a78bfa', '#11998e', '#2193b0', '#F5A623'][i % 5] }]}>{i + 1}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.hotelItemName}>{h.hotelName}</Text>
                        <Text style={styles.hotelItemAddr} numberOfLines={1}>{h.hotelAddress}</Text>
                      </View>
                      <TouchableOpacity onPress={() => handleRemoveHotel(h.id)} style={styles.removeBtn}>
                        <Ionicons name="trash-outline" size={16} color="#ef4444" />
                      </TouchableOpacity>
                    </Animated.View>
                  ))}
                </View>
              )}
            </Animated.View>
          )}

          {/* STEP 2: DATES */}
          {step === 2 && (
            <Animated.View entering={FadeInUp.springify()}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Ionicons name="calendar" size={22} color="#F5A623" />
                  <Text style={styles.cardTitle}>Select Dates</Text>
                </View>
                <Text style={styles.cardSub}>Choose your check-in and check-out dates</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Check-in Date</Text>
                  <View style={styles.inputBox}>
                    <Ionicons name="calendar-outline" size={16} color="#667eea" />
                    <TextInput
                      style={styles.textInput}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      value={checkIn}
                      onChangeText={setCheckIn}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Check-out Date</Text>
                  <View style={styles.inputBox}>
                    <Ionicons name="calendar-outline" size={16} color="#a78bfa" />
                    <TextInput
                      style={styles.textInput}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      value={checkOut}
                      onChangeText={setCheckOut}
                    />
                  </View>
                </View>

                {checkIn && checkOut && (
                  <Animated.View entering={ZoomIn} style={styles.datePreview}>
                    <Ionicons name="moon-outline" size={16} color="#667eea" />
                    <Text style={styles.datePreviewText}>
                      {Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)))} night(s) stay
                    </Text>
                  </Animated.View>
                )}
              </View>
            </Animated.View>
          )}

          {/* STEP 3: REVIEW */}
          {step === 3 && (
            <Animated.View entering={FadeInUp.springify()}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Ionicons name="checkmark-done-circle" size={22} color="#10b981" />
                  <Text style={styles.cardTitle}>Review & Create</Text>
                </View>
                <Text style={styles.cardSub}>Confirm your hotel comparison set</Text>

                {/* City */}
                <View style={styles.reviewSection}>
                  <View style={styles.reviewLabel}>
                    <Ionicons name="location" size={14} color="#667eea" />
                    <Text style={styles.reviewLabelText}>City</Text>
                  </View>
                  <Text style={styles.reviewValue}>{selectedCity?.city}, {selectedCity?.state}, {selectedCity?.country}</Text>
                </View>

                {/* Dates */}
                <View style={styles.reviewSection}>
                  <View style={styles.reviewLabel}>
                    <Ionicons name="calendar" size={14} color="#F5A623" />
                    <Text style={styles.reviewLabelText}>Dates</Text>
                  </View>
                  <Text style={styles.reviewValue}>{checkIn} to {checkOut}</Text>
                </View>

                {/* Hotels */}
                <View style={styles.reviewSection}>
                  <View style={styles.reviewLabel}>
                    <Ionicons name="business" size={14} color="#a78bfa" />
                    <Text style={styles.reviewLabelText}>Hotels ({hotels.length})</Text>
                  </View>
                  {hotels.map((h, i) => (
                    <View key={h.id} style={styles.reviewHotel}>
                      <View style={[styles.reviewDot, { backgroundColor: ['#667eea', '#a78bfa', '#11998e', '#2193b0', '#F5A623'][i % 5] }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.reviewHotelName}>{h.hotelName}</Text>
                        <Text style={styles.reviewHotelAddr}>{h.hotelAddress}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* Info note */}
              <View style={styles.infoNote}>
                <Ionicons name="information-circle" size={18} color="#667eea" />
                <Text style={styles.infoNoteText}>
                  After creation, the system will scrape real pricing data from OTAs and generate comparison analytics. This may take a few minutes.
                </Text>
              </View>
            </Animated.View>
          )}
        </ScrollView>

        {/* Bottom Action Bar */}
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
          {step > 0 && (
            <TouchableOpacity style={styles.backStepBtn} onPress={() => setStep(step - 1)}>
              <Ionicons name="arrow-back" size={18} color="rgba(255,255,255,0.6)" />
              <Text style={styles.backStepText}>Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.nextBtn, !canProceed() && styles.nextBtnDisabled]}
            onPress={handleNext}
            disabled={!canProceed() || isSubmitting}
          >
            <LinearGradient
              colors={canProceed() ? ['#667eea', '#764ba2'] : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
              style={styles.nextGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Text style={styles.nextText}>{step === 3 ? 'Create Compset' : 'Continue'}</Text>
                  <Ionicons name={step === 3 ? 'rocket' : 'arrow-forward'} size={18} color={canProceed() ? '#fff' : 'rgba(255,255,255,0.3)'} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  orb: { position: 'absolute', borderRadius: 999 },
  orb1: { width: 180, height: 180, top: -40, right: -50, backgroundColor: '#667eea' },
  orb2: { width: 120, height: 120, bottom: 100, left: -30, backgroundColor: '#764ba2' },
  header: { paddingHorizontal: 16, paddingBottom: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backBtn: { width: 42, height: 42, borderRadius: 14, overflow: 'hidden' },
  backBtnBlur: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)' },
  headerInfo: { flex: 1, marginLeft: 12 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 },

  // Steps
  stepsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  stepItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stepDot: { width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  stepDotActive: { borderColor: '#667eea', backgroundColor: 'rgba(102,126,234,0.15)' },
  stepDotDone: { backgroundColor: '#667eea', borderColor: '#667eea' },
  stepNum: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.3)' },
  stepNumActive: { color: '#667eea' },
  stepLabel: { fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: '600' },
  stepLabelActive: { color: 'rgba(255,255,255,0.7)' },
  stepLine: { width: 16, height: 2, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 1, marginHorizontal: 2 },
  stepLineActive: { backgroundColor: '#667eea' },

  body: { flex: 1 },

  // Card
  card: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 20, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  cardSub: { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 18, lineHeight: 20 },

  // Search
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, paddingHorizontal: 14, height: 50, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  searchInput: { flex: 1, color: '#fff', fontSize: 15 },

  // Suggestions
  suggestList: { marginTop: 10, borderRadius: 14, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  suggestItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  suggestCity: { fontSize: 15, fontWeight: '700', color: '#fff' },
  suggestMeta: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 },

  selectedPill: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: 'rgba(16,185,129,0.1)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)' },
  selectedText: { fontSize: 14, fontWeight: '700', color: '#10b981' },

  // Inputs
  inputGroup: { marginBottom: 14 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginBottom: 8 },
  inputBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, paddingHorizontal: 14, height: 50, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  textInput: { flex: 1, color: '#fff', fontSize: 15 },

  // Add Button
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: 'rgba(102,126,234,0.4)', borderStyle: 'dashed' },
  addBtnDisabled: { borderColor: 'rgba(255,255,255,0.08)' },
  addBtnText: { fontSize: 14, fontWeight: '700', color: '#667eea' },

  // Hotel items
  hotelItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  hotelNum: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  hotelNumText: { fontSize: 14, fontWeight: '800' },
  hotelItemName: { fontSize: 15, fontWeight: '700', color: '#fff' },
  hotelItemAddr: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  removeBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(239,68,68,0.1)', justifyContent: 'center', alignItems: 'center' },

  // Date preview
  datePreview: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: 'rgba(102,126,234,0.1)', borderWidth: 1, borderColor: 'rgba(102,126,234,0.2)' },
  datePreviewText: { fontSize: 14, fontWeight: '700', color: '#667eea' },

  // Review
  reviewSection: { marginBottom: 18 },
  reviewLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  reviewLabelText: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1 },
  reviewValue: { fontSize: 16, fontWeight: '700', color: '#fff', paddingLeft: 22 },
  reviewHotel: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, paddingLeft: 22 },
  reviewDot: { width: 8, height: 8, borderRadius: 4 },
  reviewHotelName: { fontSize: 15, fontWeight: '700', color: '#fff' },
  reviewHotelAddr: { fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 1 },

  // Info note
  infoNote: { flexDirection: 'row', gap: 10, padding: 14, borderRadius: 14, backgroundColor: 'rgba(102,126,234,0.08)', borderWidth: 1, borderColor: 'rgba(102,126,234,0.15)' },
  infoNoteText: { flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 20 },

  // Bottom bar
  bottomBar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', backgroundColor: 'rgba(15,12,41,0.95)' },
  backStepBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 14, paddingHorizontal: 16 },
  backStepText: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.6)' },
  nextBtn: { flex: 1, borderRadius: 14, overflow: 'hidden' },
  nextBtnDisabled: { opacity: 0.7 },
  nextGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  nextText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});

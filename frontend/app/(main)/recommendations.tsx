import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
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
  withDelay,
  withTiming,
  withSequence,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  ZoomIn,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const tripTypes = [
  { id: 'family', label: 'Family', icon: 'people', gradient: ['#fc4a1a', '#f7b733'] },
  { id: 'business', label: 'Business', icon: 'briefcase', gradient: ['#2193b0', '#6dd5ed'] },
  { id: 'friends', label: 'Friends', icon: 'beer', gradient: ['#ee0979', '#ff6a00'] },
  { id: 'solo', label: 'Solo', icon: 'person', gradient: ['#667eea', '#764ba2'] },
];

const allHotels = [
  {
    id: 1, name: 'Lakeview Family Resort', location: 'Downtown, New York', gradient: ['#11998e', '#38ef7d'],
    price: 95, rating: 4.5, reviews: 1856, petFriendly: true,
    scores: { cleanliness: 7.8, service: 8.0, location: 7.5, value: 9.2, comfort: 7.9 },
    matchReasons: { family: ['Kids play area', 'Family rooms', 'Babysitting service'], business: ['Far from business district'], friends: ['Pool parties', 'Lake activities'], solo: ['Scenic walks'] },
    match: { family: 95, business: 40, friends: 82, solo: 68 },
    highlights: ['Pool', 'Kids Club', 'Lake View', 'Pet Friendly'],
  },
  {
    id: 2, name: 'The Grand Palace Hotel', location: 'Financial District, New York', gradient: ['#667eea', '#764ba2'],
    price: 145, rating: 4.6, reviews: 2340, petFriendly: false,
    scores: { cleanliness: 9.1, service: 9.0, location: 9.5, value: 8.5, comfort: 9.2 },
    matchReasons: { family: ['No kids facilities'], business: ['Conference rooms', 'Fast WiFi', 'Business center'], friends: ['Upscale bar', 'Rooftop lounge'], solo: ['Great workspace', 'Central location'] },
    match: { family: 55, business: 96, friends: 78, solo: 90 },
    highlights: ['Business Center', 'Rooftop Bar', 'Premium WiFi', 'Gym'],
  },
  {
    id: 3, name: 'Urban Nest Suites', location: 'East Village, New York', gradient: ['#ee0979', '#ff6a00'],
    price: 120, rating: 4.2, reviews: 3210, petFriendly: true,
    scores: { cleanliness: 8.4, service: 7.5, location: 8.8, value: 8.0, comfort: 8.0 },
    matchReasons: { family: ['Small rooms'], business: ['Good location', 'Meeting rooms'], friends: ['Bar crawl area', 'Group discounts', 'Party vibe'], solo: ['Hip neighborhood', 'Coworking space'] },
    match: { family: 45, business: 72, friends: 94, solo: 92 },
    highlights: ['Rooftop Terrace', 'Bar', 'Pet Friendly', 'Group Rooms'],
  },
  {
    id: 4, name: 'Royal Orchid Central', location: 'Midtown, New York', gradient: ['#2193b0', '#6dd5ed'],
    price: 110, rating: 4.0, reviews: 1567, petFriendly: false,
    scores: { cleanliness: 8.0, service: 8.5, location: 8.0, value: 7.8, comfort: 8.1 },
    matchReasons: { family: ['Connecting rooms', 'Kids menu'], business: ['Boardroom', 'Executive lounge'], friends: ['Central nightlife'], solo: ['Quiet rooms', 'Good value'] },
    match: { family: 78, business: 85, friends: 70, solo: 80 },
    highlights: ['Restaurant', 'Executive Lounge', 'Central Location'],
  },
  {
    id: 5, name: 'Bloom Boutique Inn', location: 'Chelsea, New York', gradient: ['#1D976C', '#93F9B9'],
    price: 88, rating: 4.3, reviews: 987, petFriendly: true,
    scores: { cleanliness: 8.2, service: 7.8, location: 8.5, value: 9.0, comfort: 8.0 },
    matchReasons: { family: ['Garden play area', 'Pet friendly'], business: ['Limited facilities'], friends: ['Cozy lounge', 'Garden BBQ'], solo: ['Quiet retreat', 'Best value'] },
    match: { family: 85, business: 35, friends: 75, solo: 88 },
    highlights: ['Garden', 'Pet Friendly', 'Boutique Style', 'Best Value'],
  },
];

// Animated circular progress
const MatchCircle = ({ percentage, color, size = 52, delay = 0 }: { percentage: number; color: string; size?: number; delay?: number }) => {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(delay, withSpring(percentage, { damping: 14 }));
  }, [percentage]);
  const textStyle = useAnimatedStyle(() => ({ opacity: progress.value > 0 ? 1 : 0 }));

  // Create a visual ring using border
  const ringWidth = 4;
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{
        width: size, height: size, borderRadius: size / 2,
        borderWidth: ringWidth, borderColor: '#f0f0f0',
        justifyContent: 'center', alignItems: 'center',
      }}>
        <View style={{
          position: 'absolute', width: size, height: size, borderRadius: size / 2,
          borderWidth: ringWidth, borderColor: color,
          borderTopColor: percentage > 25 ? color : 'transparent',
          borderRightColor: percentage > 50 ? color : 'transparent',
          borderBottomColor: percentage > 75 ? color : 'transparent',
          borderLeftColor: percentage > 0 ? color : 'transparent',
          transform: [{ rotate: '-45deg' }],
        }} />
        <Animated.Text style={[{ fontSize: size * 0.28, fontWeight: '800', color }, textStyle]}>
          {percentage}%
        </Animated.Text>
      </View>
    </View>
  );
};

// Animated bar
const AnimBar = ({ value, max, color, delay }: { value: number; max: number; color: string; delay: number }) => {
  const w = useSharedValue(0);
  useEffect(() => { w.value = withDelay(delay, withSpring((value / max) * 100, { damping: 14 })); }, [value]);
  const s = useAnimatedStyle(() => ({ width: `${w.value}%` }));
  return (
    <View style={{ height: 6, borderRadius: 3, backgroundColor: '#f0f0f0', flex: 1 }}>
      <Animated.View style={[{ height: 6, borderRadius: 3, backgroundColor: color }, s]} />
    </View>
  );
};

export default function RecommendationsScreen() {
  const insets = useSafeAreaInsets();
  const [selectedTrip, setSelectedTrip] = useState('family');
  const [petFilter, setPetFilter] = useState(false);

  const sorted = [...allHotels]
    .filter((h) => !petFilter || h.petFriendly)
    .sort((a, b) => (b.match as any)[selectedTrip] - (a.match as any)[selectedTrip]);

  const tripGradient = tripTypes.find((t) => t.id === selectedTrip)?.gradient || ['#667eea', '#764ba2'];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={tripGradient}
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
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Smart Recommendations</Text>
            <Text style={styles.headerSub}>Hotels ranked for your trip type</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="options" size={24} color="#fff" />
          </TouchableOpacity>
        </Animated.View>

        {/* Trip Type Selector */}
        <Animated.View entering={FadeInUp.delay(200)} style={styles.tripSelector}>
          {tripTypes.map((t, i) => {
            const isActive = selectedTrip === t.id;
            return (
              <Animated.View key={t.id} entering={ZoomIn.delay(300 + i * 80)}>
                <TouchableOpacity
                  style={[styles.tripBtn, isActive && styles.tripBtnActive]}
                  onPress={() => setSelectedTrip(t.id)}
                >
                  <Ionicons name={t.icon as any} size={20} color={isActive ? tripGradient[0] : 'rgba(255,255,255,0.7)'} />
                  <Text style={[styles.tripBtnText, isActive && { color: tripGradient[0] }]}>{t.label}</Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </Animated.View>

        {/* Pet Filter */}
        <Animated.View entering={FadeInUp.delay(400)} style={styles.petRow}>
          <TouchableOpacity
            style={[styles.petBtn, petFilter && styles.petBtnActive]}
            onPress={() => setPetFilter(!petFilter)}
          >
            <Ionicons name="paw" size={18} color={petFilter ? '#fff' : 'rgba(255,255,255,0.7)'} />
            <Text style={[styles.petText, petFilter && styles.petTextActive]}>Travelling with pets</Text>
            {petFilter && <Ionicons name="checkmark-circle" size={16} color="#fff" />}
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.body}
        contentContainerStyle={{ padding: 15, paddingBottom: insets.bottom + 30 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.Text entering={FadeInDown.delay(300)} style={styles.resultCount}>
          {sorted.length} hotels ranked for {tripTypes.find(t => t.id === selectedTrip)?.label} trip
        </Animated.Text>

        {sorted.map((hotel, hIdx) => {
          const matchVal = (hotel.match as any)[selectedTrip];
          const reasons = (hotel.matchReasons as any)[selectedTrip] || [];
          const isTop = hIdx === 0;
          return (
            <Animated.View key={hotel.id} entering={SlideInRight.delay(400 + hIdx * 120)}>
              <AnimatedTouchable
                style={[styles.hotelCard, isTop && styles.topCard]}
                activeOpacity={0.9}
                onPress={() => router.push(`/(main)/hotel-details?id=${hotel.id}`)}
              >
                {isTop && (
                  <LinearGradient colors={tripGradient} style={styles.topBadge} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    <Ionicons name="trophy" size={12} color="#fff" />
                    <Text style={styles.topBadgeText}>BEST MATCH</Text>
                  </LinearGradient>
                )}

                <View style={styles.cardTop}>
                  <View style={styles.cardImageBox}>
                    <LinearGradient colors={hotel.gradient} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
                    <Text style={styles.cardRank}>#{hIdx + 1}</Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardName} numberOfLines={1}>{hotel.name}</Text>
                    <View style={styles.cardLocRow}>
                      <Ionicons name="location-outline" size={12} color="#999" />
                      <Text style={styles.cardLoc}>{hotel.location}</Text>
                    </View>
                    <View style={styles.cardMeta}>
                      <View style={styles.ratingPill}>
                        <Ionicons name="star" size={11} color="#FFD700" />
                        <Text style={styles.ratingVal}>{hotel.rating}</Text>
                      </View>
                      <Text style={styles.reviewCount}>{hotel.reviews.toLocaleString()} reviews</Text>
                      {hotel.petFriendly && (
                        <View style={styles.petBadge}>
                          <Ionicons name="paw" size={11} color="#1D976C" />
                        </View>
                      )}
                    </View>
                  </View>
                  <MatchCircle percentage={matchVal} color={hotel.gradient[0]} delay={500 + hIdx * 120} />
                </View>

                {/* Price */}
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Lowest price from</Text>
                  <Text style={[styles.priceVal, { color: hotel.gradient[0] }]}>${hotel.price}<Text style={styles.perNight}>/night</Text></Text>
                </View>

                {/* Why recommended */}
                <View style={styles.reasonsBox}>
                  <Text style={styles.reasonsTitle}>Why recommended</Text>
                  {reasons.map((r: string, rIdx: number) => (
                    <View key={rIdx} style={styles.reasonRow}>
                      <Ionicons name="checkmark-circle" size={14} color={hotel.gradient[0]} />
                      <Text style={styles.reasonText}>{r}</Text>
                    </View>
                  ))}
                </View>

                {/* Highlights */}
                <View style={styles.highlightRow}>
                  {hotel.highlights.map((h) => (
                    <View key={h} style={[styles.highlightPill, { backgroundColor: hotel.gradient[0] + '12' }]}>
                      <Text style={[styles.highlightText, { color: hotel.gradient[0] }]}>{h}</Text>
                    </View>
                  ))}
                </View>

                {/* Mini score bars */}
                <View style={styles.miniScores}>
                  {Object.entries(hotel.scores).map(([key, val], sIdx) => (
                    <View key={key} style={styles.miniScoreRow}>
                      <Text style={styles.miniScoreLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                      <AnimBar value={val} max={10} color={hotel.gradient[0]} delay={600 + hIdx * 120 + sIdx * 40} />
                      <Text style={[styles.miniScoreVal, { color: hotel.gradient[0] }]}>{val}</Text>
                    </View>
                  ))}
                </View>
              </AnimatedTouchable>
            </Animated.View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { paddingBottom: 18, paddingHorizontal: 15 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  backBtn: { width: 45, height: 45, borderRadius: 15, overflow: 'hidden' },
  backBtnBlur: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)' },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  tripSelector: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  tripBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)' },
  tripBtnActive: { backgroundColor: '#fff' },
  tripBtnText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.9)' },
  petRow: { flexDirection: 'row' },
  petBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  petBtnActive: { backgroundColor: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.6)' },
  petText: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  petTextActive: { color: '#fff', fontWeight: '600' },
  body: { flex: 1 },
  resultCount: { fontSize: 13, fontWeight: '600', color: '#999', marginBottom: 14 },
  hotelCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 4,
  },
  topCard: { borderWidth: 2, borderColor: '#FFD700' },
  topBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginBottom: 10 },
  topBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardImageBox: { width: 56, height: 56, borderRadius: 14, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  cardRank: { fontSize: 20, fontWeight: '800', color: 'rgba(255,255,255,0.9)' },
  cardInfo: { flex: 1, gap: 3 },
  cardName: { fontSize: 15, fontWeight: '700', color: '#333' },
  cardLocRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  cardLoc: { fontSize: 12, color: '#999' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  ratingPill: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#FFF9E6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  ratingVal: { fontSize: 12, fontWeight: '700', color: '#333' },
  reviewCount: { fontSize: 11, color: '#bbb' },
  petBadge: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#1D976C15', justifyContent: 'center', alignItems: 'center' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f5f5f5' },
  priceLabel: { fontSize: 12, color: '#999' },
  priceVal: { fontSize: 20, fontWeight: '800' },
  perNight: { fontSize: 12, fontWeight: '400', color: '#999' },
  reasonsBox: { marginTop: 12, backgroundColor: '#f9f9f9', borderRadius: 12, padding: 12 },
  reasonsTitle: { fontSize: 12, fontWeight: '700', color: '#333', marginBottom: 6 },
  reasonRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  reasonText: { fontSize: 12, color: '#666' },
  highlightRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  highlightPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  highlightText: { fontSize: 11, fontWeight: '600' },
  miniScores: { marginTop: 12, gap: 6 },
  miniScoreRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  miniScoreLabel: { fontSize: 11, color: '#999', width: 65 },
  miniScoreVal: { fontSize: 12, fontWeight: '700', width: 28, textAlign: 'right' },
});

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
  withRepeat,
  Easing,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  ZoomIn,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const tripTypes = [
  { id: 'family', label: 'Family', icon: 'people', emoji: '👨‍👩‍👧‍👦', gradient: ['#fc4a1a', '#f7b733'] as [string, string] },
  { id: 'business', label: 'Business', icon: 'briefcase', emoji: '💼', gradient: ['#2193b0', '#6dd5ed'] as [string, string] },
  { id: 'friends', label: 'Friends', icon: 'beer', emoji: '🍻', gradient: ['#ee0979', '#ff6a00'] as [string, string] },
  { id: 'solo', label: 'Solo', icon: 'person', emoji: '🧳', gradient: ['#667eea', '#764ba2'] as [string, string] },
];

const allHotels = [
  {
    id: 1, name: 'Lakeview Family Resort', location: 'Downtown, New York', gradient: ['#11998e', '#38ef7d'] as [string, string],
    price: 95, rating: 4.5, reviews: 1856, petFriendly: true,
    scores: { cleanliness: 7.8, service: 8.0, location: 7.5, value: 9.2, comfort: 7.9 },
    matchReasons: { family: ['Kids play area', 'Family rooms', 'Babysitting service'], business: ['Far from business district'], friends: ['Pool parties', 'Lake activities'], solo: ['Scenic walks'] },
    match: { family: 95, business: 40, friends: 82, solo: 68 },
    highlights: ['Pool', 'Kids Club', 'Lake View', 'Pet Friendly'],
  },
  {
    id: 2, name: 'The Grand Palace Hotel', location: 'Financial District, New York', gradient: ['#667eea', '#764ba2'] as [string, string],
    price: 145, rating: 4.6, reviews: 2340, petFriendly: false,
    scores: { cleanliness: 9.1, service: 9.0, location: 9.5, value: 8.5, comfort: 9.2 },
    matchReasons: { family: ['No kids facilities'], business: ['Conference rooms', 'Fast WiFi', 'Business center'], friends: ['Upscale bar', 'Rooftop lounge'], solo: ['Great workspace', 'Central location'] },
    match: { family: 55, business: 96, friends: 78, solo: 90 },
    highlights: ['Business Center', 'Rooftop Bar', 'Premium WiFi', 'Gym'],
  },
  {
    id: 3, name: 'Urban Nest Suites', location: 'East Village, New York', gradient: ['#ee0979', '#ff6a00'] as [string, string],
    price: 120, rating: 4.2, reviews: 3210, petFriendly: true,
    scores: { cleanliness: 8.4, service: 7.5, location: 8.8, value: 8.0, comfort: 8.0 },
    matchReasons: { family: ['Small rooms'], business: ['Good location', 'Meeting rooms'], friends: ['Bar crawl area', 'Group discounts', 'Party vibe'], solo: ['Hip neighborhood', 'Coworking space'] },
    match: { family: 45, business: 72, friends: 94, solo: 92 },
    highlights: ['Rooftop Terrace', 'Bar', 'Pet Friendly', 'Group Rooms'],
  },
  {
    id: 4, name: 'Royal Orchid Central', location: 'Midtown, New York', gradient: ['#2193b0', '#6dd5ed'] as [string, string],
    price: 110, rating: 4.0, reviews: 1567, petFriendly: false,
    scores: { cleanliness: 8.0, service: 8.5, location: 8.0, value: 7.8, comfort: 8.1 },
    matchReasons: { family: ['Connecting rooms', 'Kids menu'], business: ['Boardroom', 'Executive lounge'], friends: ['Central nightlife'], solo: ['Quiet rooms', 'Good value'] },
    match: { family: 78, business: 85, friends: 70, solo: 80 },
    highlights: ['Restaurant', 'Executive Lounge', 'Central Location'],
  },
  {
    id: 5, name: 'Bloom Boutique Inn', location: 'Chelsea, New York', gradient: ['#1D976C', '#93F9B9'] as [string, string],
    price: 88, rating: 4.3, reviews: 987, petFriendly: true,
    scores: { cleanliness: 8.2, service: 7.8, location: 8.5, value: 9.0, comfort: 8.0 },
    matchReasons: { family: ['Garden play area', 'Pet friendly'], business: ['Limited facilities'], friends: ['Cozy lounge', 'Garden BBQ'], solo: ['Quiet retreat', 'Best value'] },
    match: { family: 85, business: 35, friends: 75, solo: 88 },
    highlights: ['Garden', 'Pet Friendly', 'Boutique Style', 'Best Value'],
  },
];

// Animated bar
const AnimBar = ({ value, max, color, delay }: { value: number; max: number; color: string; delay: number }) => {
  const w = useSharedValue(0);
  useEffect(() => { w.value = withDelay(delay, withSpring((value / max) * 100, { damping: 14 })); }, [value]);
  const s = useAnimatedStyle(() => ({ width: `${w.value}%` }));
  return (
    <View style={{ height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.08)', flex: 1 }}>
      <Animated.View style={[{ height: 5, borderRadius: 3, backgroundColor: color }, s]} />
    </View>
  );
};

export default function RecommendationsScreen() {
  const insets = useSafeAreaInsets();
  const [selectedTrip, setSelectedTrip] = useState('family');
  const [petFilter, setPetFilter] = useState(false);

  const glowOpacity = useSharedValue(0.3);
  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(withTiming(0.5, { duration: 2500 }), withTiming(0.3, { duration: 2500 })),
      -1, true
    );
  }, []);
  const glowStyle = useAnimatedStyle(() => ({ opacity: glowOpacity.value }));

  const sorted = [...allHotels]
    .filter((h) => !petFilter || h.petFriendly)
    .sort((a, b) => (b.match as any)[selectedTrip] - (a.match as any)[selectedTrip]);

  const tripInfo = tripTypes.find((t) => t.id === selectedTrip)!;

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
      <Animated.View style={[styles.orb, styles.orb1, glowStyle]} />
      <Animated.View style={[styles.orb, styles.orb2, glowStyle]} />

      {/* Header */}
      <Animated.View
        entering={FadeInDown.springify()}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <BlurView intensity={30} style={styles.backBtnBlur} tint="dark">
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </BlurView>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Smart Picks</Text>
            <Text style={styles.headerSub}>AI-ranked for your trip type</Text>
          </View>
          <TouchableOpacity
            style={styles.listBtn}
            onPress={() => router.push('/(main)/hotel-listing')}
          >
            <Ionicons name="list" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Trip Type Cards */}
        <Animated.View entering={FadeInUp.delay(200)} style={styles.tripGrid}>
          {tripTypes.map((t, i) => {
            const isActive = selectedTrip === t.id;
            return (
              <Animated.View key={t.id} entering={ZoomIn.delay(300 + i * 80)} style={{ flex: 1 }}>
                <TouchableOpacity
                  style={[styles.tripCard, isActive && styles.tripCardActive]}
                  onPress={() => setSelectedTrip(t.id)}
                  activeOpacity={0.8}
                >
                  {isActive && (
                    <LinearGradient
                      colors={t.gradient}
                      style={StyleSheet.absoluteFill}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    />
                  )}
                  <Ionicons
                    name={t.icon as any}
                    size={22}
                    color={isActive ? '#fff' : 'rgba(255,255,255,0.5)'}
                  />
                  <Text style={[styles.tripLabel, isActive && styles.tripLabelActive]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </Animated.View>

        {/* Pet toggle */}
        <Animated.View entering={FadeInUp.delay(400)}>
          <TouchableOpacity
            style={[styles.petToggle, petFilter && styles.petToggleOn]}
            onPress={() => setPetFilter(!petFilter)}
          >
            <Ionicons name="paw" size={16} color={petFilter ? '#1D976C' : 'rgba(255,255,255,0.4)'} />
            <Text style={[styles.petToggleText, petFilter && styles.petToggleTextOn]}>
              Travelling with pets
            </Text>
            <View style={[styles.petSwitch, petFilter && styles.petSwitchOn]}>
              <View style={[styles.petSwitchDot, petFilter && styles.petSwitchDotOn]} />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      {/* Result count */}
      <Animated.View entering={FadeInDown.delay(450)} style={styles.resultBar}>
        <Text style={styles.resultText}>
          {sorted.length} hotels for <Text style={{ color: tripInfo.gradient[0], fontWeight: '700' }}>{tripInfo.label}</Text> trip
        </Text>
      </Animated.View>

      {/* Hotel Cards */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {sorted.map((hotel, hIdx) => {
          const matchVal = (hotel.match as any)[selectedTrip];
          const reasons = (hotel.matchReasons as any)[selectedTrip] || [];
          const isTop = hIdx === 0;
          const color = hotel.gradient[0];
          const avgScore = Object.values(hotel.scores).reduce((a, b) => a + b, 0) / 5;

          return (
            <Animated.View key={hotel.id} entering={SlideInRight.delay(500 + hIdx * 100).springify()}>
              <AnimatedTouchable
                style={[styles.hotelCard, isTop && { borderColor: tripInfo.gradient[0], borderWidth: 1.5 }]}
                activeOpacity={0.95}
                onPress={() => router.push(`/(main)/hotel-details?id=${hotel.id}`)}
              >
                {/* Rank + Gradient strip */}
                <View style={styles.cardStrip}>
                  <LinearGradient colors={hotel.gradient} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
                  <View style={styles.stripContent}>
                    <View style={styles.rankBadge}>
                      <Text style={styles.rankText}>#{hIdx + 1}</Text>
                    </View>
                    {isTop && (
                      <View style={styles.bestBadge}>
                        <Ionicons name="trophy" size={11} color="#FFD700" />
                        <Text style={styles.bestBadgeText}>BEST MATCH</Text>
                      </View>
                    )}
                    {hotel.petFriendly && (
                      <View style={styles.petIcon}>
                        <Ionicons name="paw" size={12} color="#fff" />
                      </View>
                    )}
                    {/* Match circle */}
                    <View style={styles.matchCircle}>
                      <Text style={styles.matchPercent}>{matchVal}%</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  {/* Hotel info */}
                  <View style={styles.cardInfoRow}>
                    <View style={styles.cardInfoCol}>
                      <Text style={styles.cardName} numberOfLines={1}>{hotel.name}</Text>
                      <View style={styles.cardLocRow}>
                        <Ionicons name="location" size={12} color={color} />
                        <Text style={styles.cardLoc}>{hotel.location}</Text>
                      </View>
                    </View>
                    <View>
                      <Text style={[styles.cardPrice, { color }]}>${hotel.price}</Text>
                      <Text style={styles.cardPerNight}>/night</Text>
                    </View>
                  </View>

                  {/* Rating row */}
                  <View style={styles.cardMeta}>
                    <View style={styles.starPill}>
                      <Ionicons name="star" size={11} color="#FFD700" />
                      <Text style={styles.starVal}>{hotel.rating}</Text>
                    </View>
                    <Text style={styles.reviewText}>{hotel.reviews.toLocaleString()} reviews</Text>
                    <View style={[styles.scorePill, { borderColor: color }]}>
                      <Text style={[styles.scoreVal, { color }]}>{avgScore.toFixed(1)}</Text>
                    </View>
                  </View>

                  {/* Why recommended */}
                  <View style={styles.reasonsBlock}>
                    <Text style={styles.reasonsLabel}>Why recommended</Text>
                    <View style={styles.reasonsList}>
                      {reasons.slice(0, 3).map((r: string, rIdx: number) => (
                        <View key={rIdx} style={styles.reasonItem}>
                          <Ionicons
                            name={matchVal > 50 ? 'checkmark-circle' : 'close-circle'}
                            size={13}
                            color={matchVal > 50 ? color : 'rgba(255,255,255,0.2)'}
                          />
                          <Text style={[styles.reasonText, matchVal <= 50 && { color: 'rgba(255,255,255,0.25)' }]}>
                            {r}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Highlights */}
                  <View style={styles.highlightRow}>
                    {hotel.highlights.slice(0, 4).map((h) => (
                      <View key={h} style={[styles.highlightPill, { backgroundColor: color + '18' }]}>
                        <Text style={[styles.highlightText, { color }]}>{h}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Mini scores */}
                  <View style={styles.miniScores}>
                    {Object.entries(hotel.scores).slice(0, 3).map(([key, val], sIdx) => (
                      <View key={key} style={styles.miniRow}>
                        <Text style={styles.miniLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                        <AnimBar value={val} max={10} color={color} delay={600 + hIdx * 100 + sIdx * 30} />
                        <Text style={[styles.miniVal, { color }]}>{val}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </AnimatedTouchable>
            </Animated.View>
          );
        })}

        {sorted.length === 0 && (
          <Animated.View entering={FadeInDown} style={styles.empty}>
            <Ionicons name="paw" size={40} color="rgba(255,255,255,0.15)" />
            <Text style={styles.emptyTitle}>No pet-friendly hotels</Text>
            <Text style={styles.emptySub}>Try disabling the pet filter</Text>
          </Animated.View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  orb: { position: 'absolute', borderRadius: 999 },
  orb1: { width: 180, height: 180, top: -40, right: -50, backgroundColor: '#667eea' },
  orb2: { width: 120, height: 120, bottom: 100, left: -30, backgroundColor: '#764ba2' },
  header: { paddingHorizontal: 16, paddingBottom: 12 },
  headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backBtn: { width: 42, height: 42, borderRadius: 14, overflow: 'hidden' },
  backBtnBlur: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)' },
  headerInfo: { flex: 1, marginLeft: 12 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 },
  listBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center' },
  // Trip cards
  tripGrid: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  tripCard: {
    borderRadius: 14, paddingVertical: 14, alignItems: 'center', gap: 6, overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  tripCardActive: { borderColor: 'transparent' },
  tripLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.4)' },
  tripLabelActive: { color: '#fff' },
  // Pet toggle
  petToggle: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  petToggleOn: { borderColor: 'rgba(29,151,108,0.4)', backgroundColor: 'rgba(29,151,108,0.1)' },
  petToggleText: { flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.4)' },
  petToggleTextOn: { color: '#1D976C', fontWeight: '600' },
  petSwitch: { width: 36, height: 20, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', paddingHorizontal: 2 },
  petSwitchOn: { backgroundColor: '#1D976C' },
  petSwitchDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.3)' },
  petSwitchDotOn: { backgroundColor: '#fff', alignSelf: 'flex-end' },
  // Result bar
  resultBar: { paddingHorizontal: 16, marginBottom: 4, marginTop: 4 },
  resultText: { fontSize: 13, color: 'rgba(255,255,255,0.45)' },
  list: { flex: 1 },
  // Hotel card
  hotelCard: {
    borderRadius: 18, overflow: 'hidden', marginBottom: 14,
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  cardStrip: { height: 40 },
  stripContent: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 8 },
  rankBadge: { backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  rankText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  bestBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  bestBadgeText: { color: '#FFD700', fontSize: 9, fontWeight: '800', letterSpacing: 0.3 },
  petIcon: { width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center' },
  matchCircle: {
    marginLeft: 'auto',
    width: 40, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center',
  },
  matchPercent: { color: '#fff', fontSize: 13, fontWeight: '800' },
  cardBody: { padding: 14 },
  cardInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardInfoCol: { flex: 1, marginRight: 10 },
  cardName: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 3 },
  cardLocRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardLoc: { fontSize: 12, color: 'rgba(255,255,255,0.45)' },
  cardPrice: { fontSize: 22, fontWeight: '800', textAlign: 'right' },
  cardPerNight: { fontSize: 11, color: 'rgba(255,255,255,0.35)', textAlign: 'right' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  starPill: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(255,215,0,0.12)', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  starVal: { fontSize: 12, fontWeight: '700', color: '#FFD700' },
  reviewText: { fontSize: 11, color: 'rgba(255,255,255,0.35)' },
  scorePill: { borderWidth: 1.5, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  scoreVal: { fontSize: 11, fontWeight: '800' },
  // Reasons
  reasonsBlock: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 10, marginBottom: 10 },
  reasonsLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.5)', marginBottom: 6 },
  reasonsList: { gap: 4 },
  reasonItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  reasonText: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  // Highlights
  highlightRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  highlightPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  highlightText: { fontSize: 10, fontWeight: '700' },
  // Mini scores
  miniScores: { gap: 5 },
  miniRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  miniLabel: { fontSize: 10, color: 'rgba(255,255,255,0.35)', width: 60 },
  miniVal: { fontSize: 11, fontWeight: '700', width: 24, textAlign: 'right' },
  // Empty
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: 'rgba(255,255,255,0.3)' },
  emptySub: { fontSize: 13, color: 'rgba(255,255,255,0.2)' },
});

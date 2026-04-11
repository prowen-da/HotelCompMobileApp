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

const tripTypes = [
  { id: 'family', label: 'Family', icon: 'people', gradient: ['#F5A623', '#FFD700'] as [string, string] },
  { id: 'business', label: 'Business', icon: 'briefcase', gradient: ['#2193b0', '#6dd5ed'] as [string, string] },
  { id: 'friends', label: 'Friends', icon: 'beer', gradient: ['#a78bfa', '#c084fc'] as [string, string] },
  { id: 'solo', label: 'Solo', icon: 'person', gradient: ['#667eea', '#764ba2'] as [string, string] },
];

const allHotels = [
  {
    id: 1, name: 'Lakeview Resort', short: 'Lakeview', color: '#11998e',
    gradient: ['#11998e', '#38ef7d'] as [string, string],
    price: 95, rating: 4.5, reviews: 1856, petFriendly: true,
    scores: { cleanliness: 7.8, service: 8.0, location: 7.5, value: 9.2, comfort: 7.9 },
    features: { wifi: true, pool: true, gym: false, spa: false, parking: true, restaurant: true, petFriendly: true, bar: false },
    match: { family: 95, business: 40, friends: 82, solo: 68 },
  },
  {
    id: 2, name: 'Grand Palace', short: 'Palace', color: '#667eea',
    gradient: ['#667eea', '#764ba2'] as [string, string],
    price: 145, rating: 4.6, reviews: 2340, petFriendly: false,
    scores: { cleanliness: 9.1, service: 9.0, location: 9.5, value: 8.5, comfort: 9.2 },
    features: { wifi: true, pool: true, gym: true, spa: true, parking: true, restaurant: true, petFriendly: false, bar: true },
    match: { family: 55, business: 96, friends: 78, solo: 90 },
  },
  {
    id: 3, name: 'Urban Nest', short: 'Urban', color: '#a78bfa',
    gradient: ['#a78bfa', '#c084fc'] as [string, string],
    price: 120, rating: 4.2, reviews: 3210, petFriendly: true,
    scores: { cleanliness: 8.4, service: 7.5, location: 8.8, value: 8.0, comfort: 8.0 },
    features: { wifi: true, pool: false, gym: true, spa: false, parking: false, restaurant: true, petFriendly: true, bar: true },
    match: { family: 45, business: 72, friends: 94, solo: 92 },
  },
  {
    id: 4, name: 'Royal Orchid', short: 'Orchid', color: '#2193b0',
    gradient: ['#2193b0', '#6dd5ed'] as [string, string],
    price: 110, rating: 4.0, reviews: 1567, petFriendly: false,
    scores: { cleanliness: 8.0, service: 8.5, location: 8.0, value: 7.8, comfort: 8.1 },
    features: { wifi: true, pool: false, gym: true, spa: false, parking: true, restaurant: true, petFriendly: false, bar: true },
    match: { family: 78, business: 85, friends: 70, solo: 80 },
  },
  {
    id: 5, name: 'Bloom Inn', short: 'Bloom', color: '#1D976C',
    gradient: ['#1D976C', '#93F9B9'] as [string, string],
    price: 88, rating: 4.3, reviews: 987, petFriendly: true,
    scores: { cleanliness: 8.2, service: 7.8, location: 8.5, value: 9.0, comfort: 8.0 },
    features: { wifi: true, pool: false, gym: false, spa: false, parking: true, restaurant: false, petFriendly: true, bar: false },
    match: { family: 85, business: 35, friends: 75, solo: 88 },
  },
];

const featureList = [
  { key: 'wifi', label: 'WiFi', icon: 'wifi' },
  { key: 'pool', label: 'Pool', icon: 'water' },
  { key: 'gym', label: 'Gym', icon: 'fitness' },
  { key: 'spa', label: 'Spa', icon: 'leaf' },
  { key: 'parking', label: 'Parking', icon: 'car' },
  { key: 'restaurant', label: 'Dining', icon: 'restaurant' },
  { key: 'petFriendly', label: 'Pets', icon: 'paw' },
  { key: 'bar', label: 'Bar', icon: 'wine' },
];

const scoreLabels = ['Cleanliness', 'Service', 'Location', 'Value', 'Comfort'];
const scoreKeys = ['cleanliness', 'service', 'location', 'value', 'comfort'] as const;

// Animated horizontal bar
const HBar = ({ value, maxValue, color, delay, showLabel }: { value: number; maxValue: number; color: string; delay: number; showLabel?: string }) => {
  const w = useSharedValue(0);
  useEffect(() => {
    w.value = withDelay(delay, withSpring((value / maxValue) * 100, { damping: 14 }));
  }, [value]);
  const s = useAnimatedStyle(() => ({ width: `${w.value}%` }));
  return (
    <View style={barS.row}>
      <View style={barS.track}>
        <Animated.View style={[barS.fill, { backgroundColor: color }, s]}>
          {showLabel && <Text style={barS.barLabel}>{showLabel}</Text>}
        </Animated.View>
      </View>
    </View>
  );
};
const barS = StyleSheet.create({
  row: { flex: 1 },
  track: { height: 22, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' },
  fill: { height: 22, borderRadius: 6, justifyContent: 'center', paddingHorizontal: 8, minWidth: 30 },
  barLabel: { color: '#fff', fontSize: 10, fontWeight: '700' },
});

// Vertical bar for price chart
const VBar = ({ value, maxValue, color, delay, label, price }: { value: number; maxValue: number; color: string; delay: number; label: string; price: number }) => {
  const h = useSharedValue(0);
  useEffect(() => {
    h.value = withDelay(delay, withSpring((value / maxValue) * 100, { damping: 14 }));
  }, [value]);
  const s = useAnimatedStyle(() => ({ height: `${h.value}%` }));
  return (
    <View style={vbarS.col}>
      <Text style={[vbarS.priceLabel, { color }]}>${price}</Text>
      <View style={vbarS.barWrap}>
        <Animated.View style={[vbarS.bar, { backgroundColor: color }, s]} />
      </View>
      <Text style={vbarS.name}>{label}</Text>
    </View>
  );
};
const vbarS = StyleSheet.create({
  col: { flex: 1, alignItems: 'center', gap: 6 },
  priceLabel: { fontSize: 12, fontWeight: '800' },
  barWrap: { width: '70%', height: 120, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'flex-end', overflow: 'hidden' },
  bar: { borderRadius: 8, width: '100%' },
  name: { fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: '600', textAlign: 'center' },
});

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
  const maxPrice = Math.max(...sorted.map((h) => h.price));
  const bestHotel = sorted[0];

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
      <Animated.View style={[styles.orb, styles.orb1, glowStyle]} />
      <Animated.View style={[styles.orb, styles.orb2, glowStyle]} />

      {/* Header */}
      <Animated.View entering={FadeInDown.springify()} style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <BlurView intensity={30} style={styles.backBtnBlur} tint="dark">
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </BlurView>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Smart Picks</Text>
            <Text style={styles.headerSub}>Comparative analysis across hotels</Text>
          </View>
          <TouchableOpacity style={styles.listBtn} onPress={() => router.push('/(main)/hotel-listing')}>
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
                  {isActive && <LinearGradient colors={t.gradient} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />}
                  <Ionicons name={t.icon as any} size={22} color={isActive ? '#fff' : 'rgba(255,255,255,0.5)'} />
                  <Text style={[styles.tripLabel, isActive && styles.tripLabelActive]}>{t.label}</Text>
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
            <Text style={[styles.petToggleText, petFilter && styles.petToggleTextOn]}>Travelling with pets</Text>
            <View style={[styles.petSwitch, petFilter && styles.petSwitchOn]}>
              <View style={[styles.petSwitchDot, petFilter && styles.petSwitchDotOn]} />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      {/* Charts */}
      <ScrollView
        style={styles.body}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 30 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ===== 1. TRIP MATCH RANKING CHART ===== */}
        <Animated.View entering={FadeInDown.delay(500)} style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartTitle}>Trip Match Ranking</Text>
              <Text style={styles.chartSub}>Best hotels for {tripInfo.label.toLowerCase()} trip</Text>
            </View>
            <View style={[styles.bestPill, { backgroundColor: tripInfo.gradient[0] + '25' }]}>
              <Ionicons name="trophy" size={12} color={tripInfo.gradient[0]} />
              <Text style={[styles.bestPillText, { color: tripInfo.gradient[0] }]}>Best: {bestHotel?.short}</Text>
            </View>
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            {sorted.map((h) => (
              <View key={h.id} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: h.color }]} />
                <Text style={styles.legendText}>{h.short}</Text>
              </View>
            ))}
          </View>

          {sorted.map((h, i) => {
            const matchVal = (h.match as any)[selectedTrip];
            return (
              <Animated.View key={h.id} entering={SlideInRight.delay(600 + i * 80)} style={styles.rankRow}>
                <Text style={styles.rankNum}>#{i + 1}</Text>
                <View style={[styles.rankDot, { backgroundColor: h.color }]} />
                <Text style={styles.rankName}>{h.short}</Text>
                <View style={styles.rankBarWrap}>
                  <HBar value={matchVal} maxValue={100} color={h.color} delay={600 + i * 80} showLabel={`${matchVal}%`} />
                </View>
              </Animated.View>
            );
          })}
        </Animated.View>

        {/* ===== 2. PRICE COMPARISON CHART ===== */}
        <Animated.View entering={FadeInDown.delay(700)} style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartTitle}>Price Comparison</Text>
              <Text style={styles.chartSub}>Lowest room price per night</Text>
            </View>
            <View style={[styles.bestPill, { backgroundColor: '#10B98125' }]}>
              <Ionicons name="trending-down" size={12} color="#10B981" />
              <Text style={[styles.bestPillText, { color: '#10B981' }]}>
                Best: ${Math.min(...sorted.map((h) => h.price))}
              </Text>
            </View>
          </View>

          <View style={styles.priceChart}>
            {sorted.map((h, i) => (
              <VBar
                key={h.id}
                value={h.price}
                maxValue={maxPrice * 1.2}
                color={h.color}
                delay={800 + i * 100}
                label={h.short}
                price={h.price}
              />
            ))}
          </View>
        </Animated.View>

        {/* ===== 3. AMENITY RATINGS CHART ===== */}
        <Animated.View entering={FadeInDown.delay(900)} style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartTitle}>Amenity Ratings</Text>
              <Text style={styles.chartSub}>Guest scores across categories</Text>
            </View>
          </View>

          <View style={styles.legend}>
            {sorted.map((h) => (
              <View key={h.id} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: h.color }]} />
                <Text style={styles.legendText}>{h.short}</Text>
              </View>
            ))}
          </View>

          {scoreKeys.map((key, sIdx) => (
            <Animated.View key={key} entering={FadeInDown.delay(1000 + sIdx * 60)} style={styles.scoreBlock}>
              <Text style={styles.scoreLabel}>{scoreLabels[sIdx]}</Text>
              {sorted.map((h, hIdx) => (
                <View key={h.id} style={styles.scoreBarRow}>
                  <View style={[styles.scoreDot, { backgroundColor: h.color }]} />
                  <View style={styles.scoreBarWrap}>
                    <HBar
                      value={h.scores[key]}
                      maxValue={10}
                      color={h.color}
                      delay={1000 + sIdx * 60 + hIdx * 40}
                      showLabel={h.scores[key].toFixed(1)}
                    />
                  </View>
                </View>
              ))}
            </Animated.View>
          ))}
        </Animated.View>

        {/* ===== 4. OVERALL RATINGS COMPARISON ===== */}
        <Animated.View entering={FadeInDown.delay(1100)} style={styles.chartCard}>
          <Text style={styles.chartTitle}>Overall Score</Text>
          <Text style={[styles.chartSub, { marginBottom: 14 }]}>Average across all categories</Text>

          <View style={styles.overallGrid}>
            {sorted.map((h, i) => {
              const avg = Object.values(h.scores).reduce((a, b) => a + b, 0) / 5;
              return (
                <Animated.View key={h.id} entering={ZoomIn.delay(1200 + i * 100)} style={styles.overallItem}>
                  <View style={[styles.overallCircle, { borderColor: h.color }]}>
                    <Text style={[styles.overallVal, { color: h.color }]}>{avg.toFixed(1)}</Text>
                  </View>
                  <Text style={styles.overallName}>{h.short}</Text>
                  <View style={styles.overallStars}>
                    <Ionicons name="star" size={10} color="#FFD700" />
                    <Text style={styles.overallRating}>{h.rating}</Text>
                  </View>
                  <Text style={styles.overallReviews}>{(h.reviews / 1000).toFixed(1)}k</Text>
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>

        {/* ===== 5. FEATURE MATRIX ===== */}
        <Animated.View entering={FadeInDown.delay(1300)} style={styles.chartCard}>
          <Text style={styles.chartTitle}>Feature Matrix</Text>
          <Text style={[styles.chartSub, { marginBottom: 14 }]}>Side-by-side amenity comparison</Text>

          {/* Matrix Header */}
          <View style={styles.matrixHeader}>
            <View style={styles.matrixLabelCol} />
            {sorted.map((h) => (
              <View key={h.id} style={styles.matrixHotelCol}>
                <View style={[styles.matrixDot, { backgroundColor: h.color }]} />
                <Text style={styles.matrixHotelName}>{h.short}</Text>
              </View>
            ))}
          </View>

          {featureList.map((f, fIdx) => (
            <Animated.View
              key={f.key}
              entering={SlideInRight.delay(1400 + fIdx * 50)}
              style={[styles.matrixRow, fIdx % 2 === 0 && styles.matrixRowAlt]}
            >
              <View style={styles.matrixLabelCol}>
                <Ionicons name={f.icon as any} size={14} color="rgba(255,255,255,0.4)" />
                <Text style={styles.matrixLabel}>{f.label}</Text>
              </View>
              {sorted.map((h) => (
                <View key={h.id} style={styles.matrixHotelCol}>
                  {(h.features as any)[f.key] ? (
                    <Ionicons name="checkmark-circle" size={20} color={h.color} />
                  ) : (
                    <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.1)" />
                  )}
                </View>
              ))}
            </Animated.View>
          ))}

          {/* Feature count */}
          <View style={styles.featureCountRow}>
            {sorted.map((h) => {
              const count = Object.values(h.features).filter(Boolean).length;
              return (
                <View key={h.id} style={styles.featureCountCol}>
                  <Text style={[styles.featureCountVal, { color: h.color }]}>{count}/{Object.keys(h.features).length}</Text>
                </View>
              );
            })}
          </View>
        </Animated.View>

        {/* ===== 6. WINNER SUMMARY ===== */}
        <Animated.View entering={FadeInUp.delay(1500)} style={styles.winnerCard}>
          <LinearGradient colors={tripInfo.gradient} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
          <Ionicons name="trophy" size={24} color="#FFD700" />
          <Text style={styles.winnerTitle}>Best for {tripInfo.label} Trip</Text>
          <View style={styles.winnerRow}>
            {sorted.slice(0, 3).map((h, i) => {
              const matchVal = (h.match as any)[selectedTrip];
              return (
                <TouchableOpacity
                  key={h.id}
                  style={[styles.winnerItem, i === 0 && styles.winnerItemTop]}
                  onPress={() => router.push(`/(main)/hotel-details?id=${h.id}`)}
                >
                  <Text style={styles.winnerRank}>{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</Text>
                  <Text style={styles.winnerName}>{h.short}</Text>
                  <Text style={styles.winnerMatch}>{matchVal}%</Text>
                  <Text style={styles.winnerPrice}>${h.price}/n</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
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
  tripGrid: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  tripCard: { borderRadius: 14, paddingVertical: 14, alignItems: 'center', gap: 6, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  tripCardActive: { borderColor: 'transparent' },
  tripLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.4)' },
  tripLabelActive: { color: '#fff' },
  petToggle: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  petToggleOn: { borderColor: 'rgba(29,151,108,0.4)', backgroundColor: 'rgba(29,151,108,0.1)' },
  petToggleText: { flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.4)' },
  petToggleTextOn: { color: '#1D976C', fontWeight: '600' },
  petSwitch: { width: 36, height: 20, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', paddingHorizontal: 2 },
  petSwitchOn: { backgroundColor: '#1D976C' },
  petSwitchDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.3)' },
  petSwitchDotOn: { backgroundColor: '#fff', alignSelf: 'flex-end' },
  body: { flex: 1 },
  // Chart cards
  chartCard: {
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 20, padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  chartTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  chartSub: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  bestPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  bestPillText: { fontSize: 11, fontWeight: '700' },
  // Legend
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: 'rgba(255,255,255,0.5)' },
  // Rank chart
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  rankNum: { fontSize: 12, fontWeight: '800', color: 'rgba(255,255,255,0.3)', width: 20 },
  rankDot: { width: 8, height: 8, borderRadius: 4 },
  rankName: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.6)', width: 50 },
  rankBarWrap: { flex: 1 },
  // Price chart
  priceChart: { flexDirection: 'row', gap: 6, paddingTop: 8 },
  // Score chart
  scoreBlock: { marginBottom: 14 },
  scoreLabel: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.6)', marginBottom: 6 },
  scoreBarRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  scoreDot: { width: 6, height: 6, borderRadius: 3 },
  scoreBarWrap: { flex: 1 },
  // Overall
  overallGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  overallItem: { alignItems: 'center', gap: 4 },
  overallCircle: { width: 52, height: 52, borderRadius: 26, borderWidth: 2.5, justifyContent: 'center', alignItems: 'center' },
  overallVal: { fontSize: 16, fontWeight: '800' },
  overallName: { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.5)' },
  overallStars: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  overallRating: { fontSize: 10, fontWeight: '700', color: '#FFD700' },
  overallReviews: { fontSize: 9, color: 'rgba(255,255,255,0.3)' },
  // Feature matrix
  matrixHeader: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)', paddingBottom: 8, marginBottom: 4 },
  matrixLabelCol: { flex: 1.2, flexDirection: 'row', alignItems: 'center', gap: 6 },
  matrixHotelCol: { flex: 1, alignItems: 'center', gap: 2 },
  matrixDot: { width: 8, height: 8, borderRadius: 4 },
  matrixHotelName: { fontSize: 9, fontWeight: '600', color: 'rgba(255,255,255,0.4)' },
  matrixRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)' },
  matrixRowAlt: { backgroundColor: 'rgba(255,255,255,0.02)' },
  matrixLabel: { fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: '500' },
  featureCountRow: { flexDirection: 'row', paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', marginTop: 4 },
  featureCountCol: { flex: 1, alignItems: 'center', marginLeft: 50 },
  featureCountVal: { fontSize: 14, fontWeight: '800' },
  // Winner
  winnerCard: { borderRadius: 20, padding: 18, alignItems: 'center', overflow: 'hidden', gap: 8, marginBottom: 14 },
  winnerTitle: { fontSize: 17, fontWeight: '800', color: '#fff' },
  winnerRow: { flexDirection: 'row', gap: 10, marginTop: 6 },
  winnerItem: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 14, padding: 12, alignItems: 'center', gap: 4 },
  winnerItemTop: { borderWidth: 1.5, borderColor: '#FFD700' },
  winnerRank: { fontSize: 18 },
  winnerName: { fontSize: 13, fontWeight: '700', color: '#fff' },
  winnerMatch: { fontSize: 16, fontWeight: '800', color: '#FFD700' },
  winnerPrice: { fontSize: 11, color: 'rgba(255,255,255,0.6)' },
});

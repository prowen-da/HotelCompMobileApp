import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
  FadeInDown,
  FadeInUp,
  FadeIn,
  ZoomIn,
  interpolate,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// ── Color Palette ──────────────────────────────
const C = {
  bg1: '#f4f0ff',
  bg2: '#eae4ff',
  bg3: '#f0ecff',
  card: 'rgba(255,255,255,0.72)',
  cardBorder: 'rgba(255,255,255,0.85)',
  indigo: '#6366f1',
  indigoDark: '#4338ca',
  indigoLight: '#a5b4fc',
  emerald: '#10b981',
  amber: '#f59e0b',
  cyan: '#06b6d4',
  rose: '#f43f5e',
  textDark: '#1e1b4b',
  textMedium: '#475569',
  textLight: '#94a3b8',
  textMuted: '#cbd5e1',
};

// ── Data ───────────────────────────────────────
const quickStats = [
  { label: 'Avg. Price', value: '$142', icon: 'cash-outline', color: C.emerald, delta: '-12%', deltaColor: C.emerald },
  { label: 'Top Rated', value: '9.3', icon: 'star', color: C.amber, delta: 'Palace', deltaColor: C.amber },
  { label: 'Best Value', value: '8.7', icon: 'diamond-outline', color: C.cyan, delta: 'Bloom', deltaColor: C.cyan },
];

const travelTypes = [
  { id: 'all', label: 'All', icon: 'grid-outline' },
  { id: 'family', label: 'Family', icon: 'people-outline' },
  { id: 'business', label: 'Business', icon: 'briefcase-outline' },
  { id: 'couple', label: 'Couple', icon: 'heart-outline' },
  { id: 'solo', label: 'Solo', icon: 'person-outline' },
];

const hotels = [
  {
    name: 'The Grand Palace',
    location: 'Downtown, New York',
    score: 9.1,
    price: 245,
    reviews: 2340,
    category: 'Luxury',
    platforms: 4,
    ratings: { clean: 9.2, service: 9.0, location: 9.5, value: 8.5 },
    color: C.indigo,
  },
  {
    name: 'Bloom Garden Hotel',
    location: 'Chelsea, New York',
    score: 8.8,
    price: 88,
    reviews: 1450,
    category: 'Best Value',
    platforms: 3,
    ratings: { clean: 8.5, service: 8.8, location: 8.0, value: 9.5 },
    color: C.emerald,
  },
  {
    name: 'Orchid Boutique',
    location: 'SoHo, New York',
    score: 8.6,
    price: 110,
    reviews: 980,
    category: 'Trending',
    platforms: 5,
    ratings: { clean: 8.7, service: 8.4, location: 9.0, value: 8.2 },
    color: C.amber,
  },
];

const priceData = [
  { name: 'Palace', price: 245, height: 0.95 },
  { name: 'Orchid', price: 110, height: 0.45 },
  { name: 'Bloom', price: 88, height: 0.35 },
];

// ── AnimatedBar (extracted for hooks rules) ────
function AnimatedStatBar({ targetWidth, color, delay }: { targetWidth: number; color: string; delay: number }) {
  const barWidth = useSharedValue(0);
  useEffect(() => {
    barWidth.value = withDelay(delay, withTiming(targetWidth, { duration: 900, easing: Easing.out(Easing.cubic) }));
  }, []);
  const barStyle = useAnimatedStyle(() => ({ width: barWidth.value }));
  return (
    <Animated.View style={[styles.ratingBar, { backgroundColor: color }, barStyle]} />
  );
}

function AnimatedPriceBar({ targetHeight, color, delay }: { targetHeight: number; color: string; delay: number }) {
  const barH = useSharedValue(0);
  useEffect(() => {
    barH.value = withDelay(delay, withSpring(targetHeight, { damping: 14 }));
  }, []);
  const barStyle = useAnimatedStyle(() => ({ height: barH.value }));
  return (
    <Animated.View style={[styles.priceBar, barStyle]}>
      <LinearGradient
        colors={[color, color + '40']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
    </Animated.View>
  );
}

// ── Glass Card wrapper ─────────────────────────
function GlassCard({ children, style, entering }: any) {
  return (
    <Animated.View entering={entering} style={[styles.glassCard, style]}>
      {Platform.OS === 'web' ? (
        <View style={styles.glassInner}>{children}</View>
      ) : (
        <BlurView intensity={60} tint="light" style={styles.glassInner}>
          {children}
        </BlurView>
      )}
    </Animated.View>
  );
}

// ── Main Screen ────────────────────────────────
export default function PrototypeScreen() {
  const insets = useSafeAreaInsets();
  const [selectedType, setSelectedType] = React.useState('all');
  const orbFloat = useSharedValue(0);

  useEffect(() => {
    orbFloat.value = withRepeat(
      withSequence(
        withTiming(15, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-15, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const orbStyle1 = useAnimatedStyle(() => ({
    transform: [{ translateY: orbFloat.value }],
  }));
  const orbStyle2 = useAnimatedStyle(() => ({
    transform: [{ translateY: -orbFloat.value * 0.7 }],
  }));

  const scoreColor = (s: number) => (s >= 9 ? C.emerald : s >= 8.5 ? C.indigo : C.amber);

  return (
    <View style={styles.container}>
      {/* ── Gradient Mesh Background ── */}
      <LinearGradient
        colors={[C.bg1, C.bg2, C.bg3, '#fff']}
        style={StyleSheet.absoluteFill}
        locations={[0, 0.3, 0.6, 1]}
      />

      {/* Floating gradient orbs */}
      <Animated.View style={[styles.orb, styles.orbIndigo, orbStyle1]} />
      <Animated.View style={[styles.orb, styles.orbPurple, orbStyle2]} />
      <Animated.View style={[styles.orb, styles.orbCyan, orbStyle1]} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 30 }]}
      >
        {/* ── Header ── */}
        <Animated.View entering={FadeInDown.springify()} style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning</Text>
            <Text style={styles.headerTitle}>StayCompare</Text>
          </View>
          <TouchableOpacity style={styles.avatarBtn}>
            <LinearGradient colors={[C.indigo, C.indigoDark]} style={styles.avatarGradient}>
              <Ionicons name="person" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Search Glass Card ── */}
        <GlassCard entering={FadeInDown.delay(100).springify()} style={styles.searchCard}>
          <TouchableOpacity style={styles.searchRow} activeOpacity={0.7}>
            <View style={styles.searchIconWrap}>
              <Ionicons name="search" size={18} color={C.indigo} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.searchLabel}>Where to?</Text>
              <Text style={styles.searchValue}>New York · Jul 15–18 · 2 guests</Text>
            </View>
            <TouchableOpacity style={styles.filterBtn}>
              <Ionicons name="options-outline" size={18} color={C.indigo} />
            </TouchableOpacity>
          </TouchableOpacity>
        </GlassCard>

        {/* ── Quick Stats (Data-First) ── */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.statsRow}>
          {quickStats.map((stat, i) => (
            <Animated.View key={stat.label} entering={ZoomIn.delay(300 + i * 100)} style={styles.statCardWrap}>
              <View style={styles.statCard}>
                <View style={[styles.statIconWrap, { backgroundColor: stat.color + '15' }]}>
                  <Ionicons name={stat.icon as any} size={16} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <View style={[styles.deltaBadge, { backgroundColor: stat.deltaColor + '15' }]}>
                  <Text style={[styles.deltaText, { color: stat.deltaColor }]}>{stat.delta}</Text>
                </View>
              </View>
            </Animated.View>
          ))}
        </Animated.View>

        {/* ── Travel Type Pills ── */}
        <Animated.View entering={FadeInDown.delay(350)}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsScroll} contentContainerStyle={styles.pillsContent}>
            {travelTypes.map((t) => {
              const active = selectedType === t.id;
              return (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.pill, active && styles.pillActive]}
                  onPress={() => setSelectedType(t.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons name={t.icon as any} size={16} color={active ? '#fff' : C.textMedium} />
                  <Text style={[styles.pillLabel, active && styles.pillLabelActive]}>{t.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* ── Price Comparison Chart (Data-First) ── */}
        <GlassCard entering={FadeInDown.delay(450).springify()} style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.sectionTitle}>Price Overview</Text>
              <Text style={styles.sectionSub}>Lowest nightly rate across platforms</Text>
            </View>
            <View style={styles.chartBadge}>
              <Text style={styles.chartBadgeText}>3 hotels</Text>
            </View>
          </View>
          <View style={styles.chartArea}>
            {priceData.map((d, i) => (
              <View key={d.name} style={styles.chartCol}>
                <Text style={styles.chartPrice}>${d.price}</Text>
                <View style={styles.chartBarWrap}>
                  <AnimatedPriceBar
                    targetHeight={d.height * 110}
                    color={i === 0 ? C.indigo : i === 1 ? C.amber : C.emerald}
                    delay={500 + i * 150}
                  />
                </View>
                <Text style={styles.chartLabel}>{d.name}</Text>
              </View>
            ))}
          </View>
        </GlassCard>

        {/* ── Hotel Comparison Cards (Data-First) ── */}
        <Animated.View entering={FadeInDown.delay(600)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Compare Hotels</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {hotels.map((hotel, idx) => (
          <Animated.View key={hotel.name} entering={FadeInUp.delay(700 + idx * 120).springify()}>
            <TouchableOpacity activeOpacity={0.85} style={styles.hotelCardOuter}>
              <View style={styles.hotelCard}>
                {/* Image placeholder */}
                <View style={[styles.hotelImgPlaceholder, { backgroundColor: hotel.color + '12' }]}>
                  <Ionicons name="image-outline" size={28} color={hotel.color + '50'} />
                  <View style={[styles.categoryBadge, { backgroundColor: hotel.color + '18' }]}>
                    <Text style={[styles.categoryText, { color: hotel.color }]}>{hotel.category}</Text>
                  </View>
                </View>

                {/* Data Section */}
                <View style={styles.hotelData}>
                  <View style={styles.hotelTopRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.hotelName} numberOfLines={1}>{hotel.name}</Text>
                      <View style={styles.locationRow}>
                        <Ionicons name="location-outline" size={12} color={C.textLight} />
                        <Text style={styles.locationText}>{hotel.location}</Text>
                      </View>
                    </View>
                    {/* Score Circle */}
                    <View style={[styles.scoreCircle, { borderColor: scoreColor(hotel.score) }]}>
                      <Text style={[styles.scoreText, { color: scoreColor(hotel.score) }]}>{hotel.score}</Text>
                    </View>
                  </View>

                  {/* Rating Bars */}
                  <View style={styles.ratingsGrid}>
                    {Object.entries(hotel.ratings).map(([key, val], ri) => (
                      <View key={key} style={styles.ratingRow}>
                        <Text style={styles.ratingLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                        <View style={styles.ratingTrack}>
                          <AnimatedStatBar
                            targetWidth={(val / 10) * (width - 185)}
                            color={val >= 9 ? C.emerald : val >= 8.5 ? C.indigo : C.amber}
                            delay={800 + idx * 120 + ri * 80}
                          />
                        </View>
                        <Text style={[styles.ratingValue, { color: val >= 9 ? C.emerald : val >= 8.5 ? C.indigo : C.amber }]}>{val}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Bottom Meta */}
                  <View style={styles.hotelBottom}>
                    <View style={styles.priceWrap}>
                      <Text style={styles.priceValue}>${hotel.price}</Text>
                      <Text style={styles.priceUnit}>/night</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <View style={styles.metaPill}>
                        <Ionicons name="star" size={11} color={C.amber} />
                        <Text style={styles.metaText}>{hotel.reviews.toLocaleString()}</Text>
                      </View>
                      <View style={styles.metaPill}>
                        <Ionicons name="globe-outline" size={11} color={C.cyan} />
                        <Text style={styles.metaText}>{hotel.platforms} sites</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}

        {/* ── Compare CTA ── */}
        <Animated.View entering={FadeInUp.delay(1000).springify()} style={styles.ctaWrap}>
          <TouchableOpacity activeOpacity={0.85}>
            <LinearGradient
              colors={[C.indigo, C.indigoDark]}
              style={styles.ctaBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="git-compare-outline" size={20} color="#fff" />
              <Text style={styles.ctaText}>Compare All 3 Hotels</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ── Styles ──────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f6ff' },

  // Orbs
  orb: { position: 'absolute', borderRadius: 999 },
  orbIndigo: { width: 220, height: 220, top: -40, right: -60, backgroundColor: '#c7d2fe', opacity: 0.5 },
  orbPurple: { width: 180, height: 180, top: 250, left: -70, backgroundColor: '#ddd6fe', opacity: 0.45 },
  orbCyan: { width: 120, height: 120, bottom: 180, right: -30, backgroundColor: '#a5f3fc', opacity: 0.35 },

  scroll: { paddingHorizontal: 20 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 13, color: C.textLight, fontWeight: '500' },
  headerTitle: { fontSize: 26, fontWeight: '800', color: C.textDark, letterSpacing: -0.5 },
  avatarBtn: { width: 42, height: 42, borderRadius: 14, overflow: 'hidden' },
  avatarGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Glass Card base
  glassCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    backgroundColor: Platform.OS === 'web' ? 'rgba(255,255,255,0.72)' : 'transparent',
  },
  glassInner: { overflow: 'hidden' },

  // Search
  searchCard: { marginBottom: 18 },
  searchRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  searchIconWrap: {
    width: 42, height: 42, borderRadius: 14,
    backgroundColor: C.indigo + '10',
    justifyContent: 'center', alignItems: 'center',
  },
  searchLabel: { fontSize: 11, color: C.textLight, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.8 },
  searchValue: { fontSize: 14, color: C.textDark, fontWeight: '600', marginTop: 2 },
  filterBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: C.indigo + '08',
    justifyContent: 'center', alignItems: 'center',
  },

  // Quick Stats
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCardWrap: { flex: 1 },
  statCard: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 18, padding: 14, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
  },
  statIconWrap: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statValue: { fontSize: 22, fontWeight: '800', color: C.textDark },
  statLabel: { fontSize: 11, color: C.textLight, fontWeight: '500', marginTop: 2 },
  deltaBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 6 },
  deltaText: { fontSize: 11, fontWeight: '700' },

  // Pills
  pillsScroll: { marginBottom: 20 },
  pillsContent: { gap: 8 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
  },
  pillActive: { backgroundColor: C.indigo, borderColor: C.indigo },
  pillLabel: { fontSize: 13, fontWeight: '600', color: C.textMedium },
  pillLabelActive: { color: '#fff' },

  // Chart Card
  chartCard: { marginBottom: 22, padding: 0 },
  chartHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 18, paddingBottom: 6,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: C.textDark },
  sectionSub: { fontSize: 12, color: C.textLight, marginTop: 2 },
  chartBadge: { backgroundColor: C.indigo + '10', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  chartBadgeText: { fontSize: 11, fontWeight: '700', color: C.indigo },
  chartArea: {
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end',
    paddingHorizontal: 20, paddingBottom: 18, paddingTop: 10, height: 180,
  },
  chartCol: { alignItems: 'center', flex: 1 },
  chartPrice: { fontSize: 13, fontWeight: '700', color: C.textDark, marginBottom: 6 },
  chartBarWrap: { width: 40, justifyContent: 'flex-end' },
  priceBar: { width: 40, borderRadius: 10, minHeight: 4 },
  chartLabel: { fontSize: 11, color: C.textLight, fontWeight: '500', marginTop: 8 },

  // Section Header
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  seeAll: { fontSize: 13, fontWeight: '600', color: C.indigo },

  // Hotel Card
  hotelCardOuter: { marginBottom: 14 },
  hotelCard: {
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
  },
  hotelImgPlaceholder: {
    height: 100, justifyContent: 'center', alignItems: 'center',
  },
  categoryBadge: {
    position: 'absolute', top: 12, left: 12,
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4,
  },
  categoryText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  hotelData: { padding: 16 },
  hotelTopRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  hotelName: { fontSize: 17, fontWeight: '700', color: C.textDark },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  locationText: { fontSize: 12, color: C.textLight },
  scoreCircle: {
    width: 46, height: 46, borderRadius: 23,
    borderWidth: 2.5, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    marginLeft: 10,
  },
  scoreText: { fontSize: 16, fontWeight: '800' },

  // Rating Bars
  ratingsGrid: { gap: 8 },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  ratingLabel: { fontSize: 12, color: C.textLight, width: 62, fontWeight: '500' },
  ratingTrack: { flex: 1, height: 6, borderRadius: 3, backgroundColor: '#f1f5f9', marginHorizontal: 8 },
  ratingBar: { height: 6, borderRadius: 3 },
  ratingValue: { fontSize: 12, fontWeight: '700', width: 28, textAlign: 'right' },

  // Hotel Bottom
  hotelBottom: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9',
  },
  priceWrap: { flexDirection: 'row', alignItems: 'baseline' },
  priceValue: { fontSize: 22, fontWeight: '800', color: C.textDark },
  priceUnit: { fontSize: 13, color: C.textLight, fontWeight: '500' },
  metaRow: { flexDirection: 'row', gap: 8 },
  metaPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#f8fafc', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4,
  },
  metaText: { fontSize: 11, color: C.textMedium, fontWeight: '500' },

  // CTA
  ctaWrap: { marginTop: 6 },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    paddingVertical: 18, borderRadius: 18,
  },
  ctaText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});

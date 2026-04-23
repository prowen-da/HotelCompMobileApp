import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
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

import Svg, { Polygon, Line, Circle as SvgCircle, Text as SvgText } from 'react-native-svg';
import { fetchHotelComparisonV2 } from '../../src/services/api';

const { width } = Dimensions.get('window');
const BAR_MAX = width - 150;

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

const scoreCategories = [
  { key: 'cleanliness', label: 'Cleanliness', icon: 'sparkles' },
  { key: 'service', label: 'Service', icon: 'hand-left' },
  { key: 'location', label: 'Location', icon: 'location' },
  { key: 'value', label: 'Value', icon: 'cash' },
  { key: 'comfort', label: 'Comfort', icon: 'bed' },
] as const;

// ── Helpers ────────────────────────────────────
const qualityColor = (v: number) => v >= 9 ? '#10b981' : v >= 8 ? '#667eea' : v >= 7 ? '#F5A623' : '#ef4444';
const qualityLabel = (v: number) => v >= 9 ? 'Excellent' : v >= 8 ? 'Great' : v >= 7 ? 'Good' : 'Fair';
const qualityGradient = (v: number): [string, string] =>
  v >= 9 ? ['#10b981', '#34d399'] : v >= 8 ? ['#667eea', '#818cf8'] : v >= 7 ? ['#F5A623', '#fbbf24'] : ['#ef4444', '#f87171'];

// ── Animated Components (outside render for hooks rules) ──

function GradientBar({ value, maxValue, gradient, delay, label }: {
  value: number; maxValue: number; gradient: [string, string]; delay: number; label: string;
}) {
  const w = useSharedValue(0);
  useEffect(() => { w.value = withDelay(delay, withSpring((value / maxValue) * BAR_MAX, { damping: 14 })); }, [value]);
  const s = useAnimatedStyle(() => ({ width: w.value }));
  return (
    <View style={bs.track}>
      <Animated.View style={[bs.fill, s]}>
        <LinearGradient colors={gradient} style={[StyleSheet.absoluteFill, { borderRadius: 8 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
        <Text style={bs.label}>{label}</Text>
      </Animated.View>
    </View>
  );
}
const bs = StyleSheet.create({
  track: { height: 28, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.04)', overflow: 'hidden' },
  fill: { height: 28, borderRadius: 8, justifyContent: 'center', minWidth: 36 },
  label: { color: '#fff', fontSize: 11, fontWeight: '800', paddingLeft: 10, textShadow: '0px 1px 2px rgba(0,0,0,0.3)' },
});

function VBarAnimated({ value, maxValue, color, gradient, delay }: {
  value: number; maxValue: number; color: string; gradient: [string, string]; delay: number;
}) {
  const h = useSharedValue(0);
  useEffect(() => { h.value = withDelay(delay, withSpring((value / maxValue) * 140, { damping: 14 })); }, [value]);
  const s = useAnimatedStyle(() => ({ height: h.value }));
  return (
    <Animated.View style={[{ width: '80%', borderRadius: 10, overflow: 'hidden', minHeight: 4 }, s]}>
      <LinearGradient colors={gradient} style={StyleSheet.absoluteFill} start={{ x: 0, y: 1 }} end={{ x: 0, y: 0 }} />
    </Animated.View>
  );
}

function ProgressRing({ value, maxValue, color, size }: { value: number; maxValue: number; color: string; size: number }) {
  const progress = (value / maxValue) * 100;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{
        width: size, height: size, borderRadius: size / 2,
        borderWidth: strokeWidth, borderColor: 'rgba(255,255,255,0.06)',
        position: 'absolute',
      }} />
      <View style={{
        width: size, height: size, borderRadius: size / 2,
        borderWidth: strokeWidth, borderColor: color,
        borderTopColor: progress > 75 ? color : 'rgba(255,255,255,0.06)',
        borderRightColor: progress > 50 ? color : 'rgba(255,255,255,0.06)',
        borderBottomColor: progress > 25 ? color : 'rgba(255,255,255,0.06)',
        position: 'absolute',
        transform: [{ rotate: '-90deg' }],
      }} />
    </View>
  );
}

// ── Main Screen ───────────────────────────────
export default function RecommendationsScreen() {
  const insets = useSafeAreaInsets();
  const { travelType, checkIn, checkOut, pets } = useLocalSearchParams<{
    travelType?: string; checkIn?: string; checkOut?: string; pets?: string;
  }>();
  const [selectedTrip, setSelectedTrip] = useState(travelType || 'family');
  const [petFilter, setPetFilter] = useState(pets === '1');
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'api' | 'mock'>('mock');
  const [hotels, setHotels] = useState(allHotels);
  const [searchInfo, setSearchInfo] = useState('');
  const glowOpacity = useSharedValue(0.3);

  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(withTiming(0.5, { duration: 2500 }), withTiming(0.3, { duration: 2500 })),
      -1, true
    );
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    if (checkIn) setSearchInfo(`${checkIn}${checkOut ? ' → ' + checkOut : ''}`);
    try {
      const apiData = await fetchHotelComparisonV2(checkIn, undefined);
      if (apiData && apiData.length > 0) {
        // Transform API data to match our local format
        const transformed = apiData.map((h, i) => {
          // Convert category-based scores to flat amenity scores
          // Use the first available category's scores, or defaults
          const categoryScores = h.scores || {};
          const firstCategory = Object.values(categoryScores).find(c => c && Object.keys(c).length > 0) || {};
          const scoreKeys = Object.keys(firstCategory).slice(0, 5);
          
          const scores: Record<string, number> = {};
          scoreKeys.forEach(k => {
            scores[k] = (firstCategory as any)[k] || 0;
          });
          
          // If no scores, create defaults from value_score
          if (scoreKeys.length === 0) {
            scores['value'] = h.value_score?.business || h.value_score?.family || 50;
            scores['quality'] = h.rating ? h.rating * 20 : 50;
            scores['price'] = Math.max(10, 100 - (h.price / 100));
            scores['location'] = 70;
            scores['service'] = 70;
          }

          return {
            id: h.id,
            name: h.name,
            short: h.short || h.name.split(' ')[0],
            color: h.color,
            gradient: h.gradient,
            price: h.price,
            rating: h.rating || 0,
            reviews: h.reviews || 0,
            petFriendly: h.petFriendly || false,
            scores,
            features: h.features || { wifi: false, pool: false, gym: false, spa: false, parking: false, restaurant: false, petFriendly: false, bar: false },
            match: h.match || { family: 50, business: 50, friends: 50, solo: 50 },
          };
        });
        setHotels(transformed);
        setDataSource('api');
      } else {
        setDataSource('mock');
      }
    } catch (e) {
      console.log('[Recommendations] API failed, using mock data');
      setDataSource('mock');
    }
    setIsLoading(false);
  };
  const glowStyle = useAnimatedStyle(() => ({ opacity: glowOpacity.value }));

  // Dynamic score categories from first hotel's scores
  const dynamicScoreCategories = hotels.length > 0
    ? Object.keys(hotels[0].scores).map(key => ({
        key,
        label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
        icon: key === 'cleanliness' ? 'sparkles' : key === 'service' ? 'hand-left' : key === 'location' ? 'location' : key === 'value' ? 'cash' : key === 'comfort' ? 'bed' : key === 'quality' ? 'star' : key === 'price' ? 'cash' : 'ellipse',
      }))
    : scoreCategories.map(c => ({ ...c }));

  const sorted = [...hotels]
    .filter((h) => !petFilter || h.petFriendly)
    .sort((a, b) => ((b.match as any)[selectedTrip] || 0) - ((a.match as any)[selectedTrip] || 0));

  const tripInfo = tripTypes.find((t) => t.id === selectedTrip)!;
  const maxPrice = Math.max(...sorted.map((h) => h.price));
  const minPrice = Math.min(...sorted.map((h) => h.price));
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
                <TouchableOpacity style={[styles.tripCard, isActive && styles.tripCardActive]} onPress={() => setSelectedTrip(t.id)} activeOpacity={0.8}>
                  {isActive && <LinearGradient colors={t.gradient} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />}
                  <Ionicons name={t.icon as any} size={22} color={isActive ? '#fff' : 'rgba(255,255,255,0.5)'} />
                  <Text style={[styles.tripLbl, isActive && styles.tripLblActive]}>{t.label}</Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </Animated.View>

        {/* Pet toggle */}
        <Animated.View entering={FadeInUp.delay(400)}>
          <TouchableOpacity style={[styles.petToggle, petFilter && styles.petToggleOn]} onPress={() => setPetFilter(!petFilter)}>
            <Ionicons name="paw" size={16} color={petFilter ? '#1D976C' : 'rgba(255,255,255,0.4)'} />
            <Text style={[styles.petToggleText, petFilter && styles.petToggleTextOn]}>Travelling with pets</Text>
            <View style={[styles.petSwitch, petFilter && styles.petSwitchOn]}>
              <View style={[styles.petSwitchDot, petFilter && styles.petSwitchDotOn]} />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Data source indicator */}
        {!isLoading && (
          <Animated.View entering={FadeInUp.delay(500)} style={styles.dataSourceBadge}>
            <Ionicons name={dataSource === 'api' ? 'cloud-done' : 'desktop'} size={12} color={dataSource === 'api' ? '#10b981' : '#F5A623'} />
            <Text style={[styles.dataSourceText, { color: dataSource === 'api' ? '#10b981' : '#F5A623' }]}>
              {dataSource === 'api' ? 'Live Data' : 'Sample Data'}
            </Text>
            {searchInfo ? (
              <>
                <View style={{ width: 1, height: 10, backgroundColor: 'rgba(255,255,255,0.15)', marginHorizontal: 4 }} />
                <Ionicons name="calendar-outline" size={10} color="rgba(255,255,255,0.4)" />
                <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{searchInfo}</Text>
              </>
            ) : null}
          </Animated.View>
        )}
      </Animated.View>

      {/* Loading State */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Fetching hotel data...</Text>
        </View>
      ) : (
      /* Charts */
      <ScrollView style={styles.body} contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 30 }} showsVerticalScrollIndicator={false}>

        {/* ===== 1. TRIP MATCH RANKING ===== */}
        <Animated.View entering={FadeInDown.delay(500)} style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View style={styles.chartTitleRow}>
              <Ionicons name="podium" size={18} color={tripInfo.gradient[0]} />
              <Text style={styles.chartTitle}>Trip Match Ranking</Text>
            </View>
            <Text style={styles.chartSub}>Best hotels for {tripInfo.label.toLowerCase()} trip</Text>
          </View>
          <View style={[styles.bestBadge, { backgroundColor: tripInfo.gradient[0] + '20' }]}>
            <Ionicons name="trophy" size={14} color="#FFD700" />
            <Text style={[styles.bestBadgeText, { color: tripInfo.gradient[0] }]}>#{1} {bestHotel?.short}</Text>
          </View>

          {sorted.map((h, i) => {
            const matchVal = (h.match as any)[selectedTrip];
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
            return (
              <Animated.View key={h.id} entering={SlideInRight.delay(600 + i * 100)} style={styles.rankRow}>
                <Text style={styles.rankMedal}>{medal || `#${i + 1}`}</Text>
                <View style={[styles.hotelDot, { backgroundColor: h.color }]} />
                <Text style={styles.rankName}>{h.short}</Text>
                <View style={{ flex: 1 }}>
                  <GradientBar
                    value={matchVal} maxValue={100}
                    gradient={h.gradient} delay={600 + i * 100}
                    label={`${matchVal}%`}
                  />
                </View>
              </Animated.View>
            );
          })}
        </Animated.View>

        {/* ===== 2. PRICE COMPARISON — RADAR CHART ===== */}
        <Animated.View entering={FadeInDown.delay(700)} style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View style={styles.chartTitleRow}>
              <Ionicons name="cash" size={18} color="#10b981" />
              <Text style={styles.chartTitle}>Price Comparison</Text>
            </View>
            <Text style={styles.chartSub}>Lowest room price per night</Text>
          </View>

          <View style={styles.priceInsightRow}>
            <View style={[styles.insightPill, { backgroundColor: '#10b98120' }]}>
              <Ionicons name="arrow-down" size={12} color="#10b981" />
              <Text style={[styles.insightText, { color: '#10b981' }]}>Cheapest: ${minPrice}</Text>
            </View>
            <View style={[styles.insightPill, { backgroundColor: '#ef444420' }]}>
              <Ionicons name="arrow-up" size={12} color="#ef4444" />
              <Text style={[styles.insightText, { color: '#ef4444' }]}>Priciest: ${maxPrice}</Text>
            </View>
            <View style={[styles.insightPill, { backgroundColor: '#667eea20' }]}>
              <Text style={[styles.insightText, { color: '#667eea' }]}>Spread: ${maxPrice - minPrice}</Text>
            </View>
          </View>

          {/* Radar Chart */}
          {(() => {
            const radarSize = Math.max(Math.min(width - 80, 260), 200);
            const cx = radarSize / 2;
            const cy = radarSize / 2;
            const maxR = radarSize / 2 - 30;
            const categories = scoreCategories;
            const n = categories.length;
            const angleStep = (2 * Math.PI) / n;

            const getPoint = (val: number, maxVal: number, idx: number) => {
              const r = (val / maxVal) * maxR;
              const angle = idx * angleStep - Math.PI / 2;
              return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
            };

            const gridLevels = [0.25, 0.5, 0.75, 1.0];

            return (
              <View style={styles.radarWrap}>
                <Svg width={radarSize} height={radarSize}>
                  {/* Grid circles */}
                  {gridLevels.map((lvl, li) => (
                    <SvgCircle
                      key={lvl}
                      cx={cx} cy={cy} r={maxR * lvl}
                      fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={1}
                      strokeDasharray={li < gridLevels.length - 1 ? "4 4" : undefined}
                    />
                  ))}
                  {/* Axis lines + labels */}
                  {categories.map((cat, i) => {
                    const outer = getPoint(10, 10, i);
                    const labelPt = getPoint(12, 10, i);
                    return (
                      <React.Fragment key={cat.key}>
                        <Line x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke="rgba(255,255,255,0.25)" strokeWidth={1} />
                        <SvgText
                          x={labelPt.x} y={labelPt.y}
                          fill="rgba(255,255,255,0.85)" fontSize={11} fontWeight="700"
                          textAnchor="middle" alignmentBaseline="middle"
                        >
                          {cat.label}
                        </SvgText>
                      </React.Fragment>
                    );
                  })}
                  {/* Hotel polygons */}
                  {sorted.map((h) => {
                    const points = categories.map((cat, i) => {
                      const pt = getPoint(h.scores[cat.key], 10, i);
                      return `${pt.x},${pt.y}`;
                    }).join(' ');
                    return (
                      <React.Fragment key={h.id}>
                        <Polygon
                          points={points}
                          fill={h.color + '50'}
                          stroke={h.color}
                          strokeWidth={3}
                        />
                        {categories.map((cat, i) => {
                          const pt = getPoint(h.scores[cat.key], 10, i);
                          return (
                            <SvgCircle key={`${h.id}-${cat.key}`} cx={pt.x} cy={pt.y} r={4.5} fill={h.color} stroke="#fff" strokeWidth={1} />
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </Svg>

                {/* Hotel Legend */}
                <View style={styles.radarLegend}>
                  {sorted.map((h) => (
                    <View key={h.id} style={styles.radarLegendItem}>
                      <View style={[styles.radarLegendDot, { backgroundColor: h.color }]} />
                      <Text style={styles.radarLegendText}>{h.short}</Text>
                      <Text style={[styles.radarLegendPrice, { color: h.price === minPrice ? '#10b981' : h.color }]}>
                        ${h.price}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          })()}
        </Animated.View>

        {/* ===== 3. AMENITY RATINGS — HEATMAP ===== */}
        <Animated.View entering={FadeInDown.delay(900)} style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View style={styles.chartTitleRow}>
              <Ionicons name="star" size={18} color="#FFD700" />
              <Text style={styles.chartTitle}>Amenity Ratings</Text>
            </View>
            <Text style={styles.chartSub}>Guest scores heatmap (out of 10)</Text>
          </View>

          {/* Color Legend */}
          <View style={styles.qualityLegend}>
            {[
              { label: 'Excellent (9+)', color: '#10b981' },
              { label: 'Great (8+)', color: '#667eea' },
              { label: 'Good (7+)', color: '#F5A623' },
              { label: 'Fair (<7)', color: '#ef4444' },
            ].map((q) => (
              <View key={q.label} style={styles.qualityLegendItem}>
                <View style={[styles.qualityLegendDot, { backgroundColor: q.color }]} />
                <Text style={styles.qualityLegendText}>{q.label}</Text>
              </View>
            ))}
          </View>

          {/* Heatmap Header */}
          <View style={styles.heatHeader}>
            <View style={styles.heatLabelCol} />
            {sorted.map((h) => (
              <View key={h.id} style={styles.heatHotelCol}>
                <View style={[styles.heatHotelDot, { backgroundColor: h.color }]} />
                <Text style={styles.heatHotelName} numberOfLines={1}>{h.short}</Text>
              </View>
            ))}
          </View>

          {/* Heatmap Rows */}
          {dynamicScoreCategories.map((cat, cIdx) => {
            const scores = sorted.map((h) => (h.scores as any)[cat.key] || 0);
            const best = Math.max(...scores);
            return (
              <Animated.View key={cat.key} entering={FadeInDown.delay(1000 + cIdx * 80)} style={[styles.heatRow, cIdx % 2 === 0 && styles.heatRowAlt]}>
                <View style={styles.heatLabelCol}>
                  <Ionicons name={cat.icon as any} size={13} color="rgba(255,255,255,0.4)" />
                  <Text style={styles.heatLabel}>{cat.label}</Text>
                </View>
                {sorted.map((h) => {
                  const val = (h.scores as any)[cat.key] || 0;
                  const isBest = val === best;
                  const color = qualityColor(val);
                  const intensity = Math.min(0.85, 0.2 + (val / 10) * 0.65);
                  return (
                    <View key={h.id} style={styles.heatHotelCol}>
                      <View style={[
                        styles.heatCell,
                        { backgroundColor: color, opacity: intensity },
                        isBest && styles.heatCellBest,
                      ]}>
                        <Text style={styles.heatCellText}>{val.toFixed(1)}</Text>
                      </View>
                      {isBest && (
                        <View style={styles.heatBestDot}>
                          <Ionicons name="trophy" size={8} color="#FFD700" />
                        </View>
                      )}
                    </View>
                  );
                })}
              </Animated.View>
            );
          })}

          {/* Average Row */}
          <View style={[styles.heatRow, styles.heatAvgRow]}>
            <View style={styles.heatLabelCol}>
              <Ionicons name="stats-chart" size={13} color="rgba(255,255,255,0.6)" />
              <Text style={[styles.heatLabel, { color: 'rgba(255,255,255,0.7)', fontWeight: '800' }]}>Avg</Text>
            </View>
            {sorted.map((h) => {
              const avg = Object.values(h.scores).reduce((a, b) => a + b, 0) / 5;
              const color = qualityColor(avg);
              return (
                <View key={h.id} style={styles.heatHotelCol}>
                  <View style={[styles.heatCell, styles.heatCellAvg, { borderColor: color }]}>
                    <Text style={[styles.heatCellAvgText, { color }]}>{avg.toFixed(1)}</Text>
                  </View>
                  <Text style={[styles.heatQLabel, { color }]}>{qualityLabel(avg)}</Text>
                </View>
              );
            })}
          </View>
        </Animated.View>

        {/* ===== 4. OVERALL SCORE ===== */}
        <Animated.View entering={FadeInDown.delay(1100)} style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View style={styles.chartTitleRow}>
              <Ionicons name="ribbon" size={18} color="#a78bfa" />
              <Text style={styles.chartTitle}>Overall Score</Text>
            </View>
            <Text style={styles.chartSub}>Average across all categories</Text>
          </View>

          <View style={styles.overallGrid}>
            {sorted.map((h, i) => {
              const avg = Object.values(h.scores).reduce((a, b) => a + b, 0) / 5;
              const color = qualityColor(avg);
              return (
                <Animated.View key={h.id} entering={ZoomIn.delay(1200 + i * 120)} style={styles.overallItem}>
                  <ProgressRing value={avg} maxValue={10} color={color} size={68} />
                  <View style={styles.overallCenter}>
                    <Text style={[styles.overallVal, { color }]}>{avg.toFixed(1)}</Text>
                    <Text style={[styles.overallQuality, { color }]}>{qualityLabel(avg)}</Text>
                  </View>
                  <Text style={styles.overallName}>{h.short}</Text>
                  <View style={styles.overallMeta}>
                    <Ionicons name="star" size={10} color="#FFD700" />
                    <Text style={styles.overallRating}>{h.rating}</Text>
                    <Text style={styles.overallReviews}> · {(h.reviews / 1000).toFixed(1)}k</Text>
                  </View>
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>

        {/* ===== 5. FEATURE MATRIX ===== */}
        <Animated.View entering={FadeInDown.delay(1300)} style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View style={styles.chartTitleRow}>
              <Ionicons name="checkmark-done" size={18} color="#6dd5ed" />
              <Text style={styles.chartTitle}>Feature Matrix</Text>
            </View>
            <Text style={styles.chartSub}>Side-by-side amenity comparison</Text>
          </View>

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
            <Animated.View key={f.key} entering={SlideInRight.delay(1400 + fIdx * 60)} style={[styles.matrixRow, fIdx % 2 === 0 && styles.matrixRowAlt]}>
              <View style={styles.matrixLabelCol}>
                <Ionicons name={f.icon as any} size={15} color="rgba(255,255,255,0.45)" />
                <Text style={styles.matrixLabel}>{f.label}</Text>
              </View>
              {sorted.map((h) => (
                <View key={h.id} style={styles.matrixHotelCol}>
                  {(h.features as any)[f.key] ? (
                    <View style={[styles.checkCircle, { backgroundColor: h.color + '20' }]}>
                      <Ionicons name="checkmark" size={14} color={h.color} />
                    </View>
                  ) : (
                    <View style={styles.xCircle}>
                      <Ionicons name="close" size={12} color="rgba(255,255,255,0.15)" />
                    </View>
                  )}
                </View>
              ))}
            </Animated.View>
          ))}

          {/* Feature count bar */}
          <View style={styles.featureCountBar}>
            {sorted.map((h) => {
              const count = Object.values(h.features).filter(Boolean).length;
              const total = Object.keys(h.features).length;
              return (
                <View key={h.id} style={styles.featureCountItem}>
                  <View style={styles.featureCountRing}>
                    <ProgressRing value={count} maxValue={total} color={h.color} size={44} />
                    <Text style={[styles.featureCountVal, { color: h.color }]}>{count}</Text>
                  </View>
                  <Text style={styles.featureCountTotal}>of {total}</Text>
                </View>
              );
            })}
          </View>
        </Animated.View>

        {/* ===== 6. WINNER PODIUM ===== */}
        <Animated.View entering={FadeInUp.delay(1500)} style={styles.winnerCard}>
          <LinearGradient colors={tripInfo.gradient} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
          <Ionicons name="trophy" size={28} color="#FFD700" />
          <Text style={styles.winnerTitle}>Best for {tripInfo.label} Trip</Text>

          <View style={styles.podium}>
            {sorted.slice(0, 3).map((h, i) => {
              const matchVal = (h.match as any)[selectedTrip];
              const heights = [100, 72, 56];
              const medals = ['🥇', '🥈', '🥉'];
              const order = [1, 0, 2]; // visual order: silver, gold, bronze
              const idx = order[i];
              return (
                <TouchableOpacity key={h.id} style={[styles.podiumCol, { order: idx }]} onPress={() => router.push(`/(main)/hotel-details?id=${h.id}`)} activeOpacity={0.8}>
                  <Text style={styles.podiumMedal}>{medals[i]}</Text>
                  <Text style={styles.podiumName}>{h.short}</Text>
                  <Text style={styles.podiumMatch}>{matchVal}%</Text>
                  <View style={[styles.podiumBar, { height: heights[i], backgroundColor: 'rgba(0,0,0,0.25)' }]}>
                    <Text style={styles.podiumPrice}>${h.price}/n</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </ScrollView>
      )}
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
  tripLbl: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.4)' },
  tripLblActive: { color: '#fff' },
  petToggle: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  petToggleOn: { borderColor: 'rgba(29,151,108,0.4)', backgroundColor: 'rgba(29,151,108,0.1)' },
  petToggleText: { flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.4)' },
  petToggleTextOn: { color: '#1D976C', fontWeight: '600' },
  petSwitch: { width: 36, height: 20, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', paddingHorizontal: 2 },
  dataSourceBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center', marginTop: 8, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)' },
  dataSourceText: { fontSize: 11, fontWeight: '700' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingText: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
  petSwitchOn: { backgroundColor: '#1D976C' },
  petSwitchDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.3)' },
  petSwitchDotOn: { backgroundColor: '#fff', alignSelf: 'flex-end' },
  body: { flex: 1 },

  // Chart Cards
  chartCard: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 20, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  chartHeader: { marginBottom: 14 },
  chartTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  chartTitle: { fontSize: 17, fontWeight: '800', color: '#fff' },
  chartSub: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginLeft: 26, marginTop: 2 },
  bestBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignSelf: 'flex-start', marginBottom: 14 },
  bestBadgeText: { fontSize: 12, fontWeight: '800' },

  // Rank
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  rankMedal: { fontSize: 16, width: 28, textAlign: 'center' },
  hotelDot: { width: 8, height: 8, borderRadius: 4 },
  rankName: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.6)', width: 55 },

  // Price Chart
  priceInsightRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  insightPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  insightText: { fontSize: 11, fontWeight: '700' },
  priceChart: { flexDirection: 'row', gap: 4, paddingTop: 4 },
  priceCol: { flex: 1, alignItems: 'center', gap: 4 },
  priceLabel: { fontSize: 13, fontWeight: '800' },
  cheapBadge: { backgroundColor: '#10b981', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  cheapBadgeText: { color: '#fff', fontSize: 8, fontWeight: '900', letterSpacing: 0.5 },
  priceBarWrap: { width: '100%', height: 140, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.04)', justifyContent: 'flex-end', alignItems: 'center', overflow: 'hidden' },
  priceNameDot: { width: 6, height: 6, borderRadius: 3, marginTop: 4 },
  priceName: { fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: '600' },

  // Radar Chart
  radarWrap: { alignItems: 'center', marginTop: 4 },
  radarLegend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 12 },
  radarLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  radarLegendDot: { width: 10, height: 10, borderRadius: 5 },
  radarLegendText: { fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: '500' },
  radarLegendPrice: { fontSize: 12, fontWeight: '800' },

  // Heatmap
  heatHeader: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)', paddingBottom: 8, marginBottom: 4 },
  heatLabelCol: { flex: 1.2, flexDirection: 'row', alignItems: 'center', gap: 5 },
  heatHotelCol: { flex: 1, alignItems: 'center', gap: 2 },
  heatHotelDot: { width: 8, height: 8, borderRadius: 4 },
  heatHotelName: { fontSize: 9, fontWeight: '600', color: 'rgba(255,255,255,0.4)' },
  heatRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  heatRowAlt: { backgroundColor: 'rgba(255,255,255,0.015)' },
  heatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: '500' },
  heatCell: { width: 40, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  heatCellBest: { borderWidth: 1.5, borderColor: 'rgba(255,215,0,0.5)' },
  heatCellText: { color: '#fff', fontSize: 11, fontWeight: '800', textShadow: '0px 1px 2px rgba(0,0,0,0.4)' },
  heatBestDot: { position: 'absolute', top: -2, right: 2 },
  heatAvgRow: { marginTop: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  heatCellAvg: { width: 40, height: 32, borderRadius: 8, borderWidth: 2, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' },
  heatCellAvgText: { fontSize: 12, fontWeight: '900' },
  heatQLabel: { fontSize: 8, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },

  // Quality Legend
  qualityLegend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 10 },
  qualityLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  qualityLegendDot: { width: 8, height: 8, borderRadius: 2 },
  qualityLegendText: { fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: '500' },

  // Hotel Legend
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: 'rgba(255,255,255,0.5)' },

  // Score Block
  scoreBlock: { marginBottom: 16 },
  scoreLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  scoreLabel: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.7)' },
  scoreBarRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  scoreDot: { width: 6, height: 6, borderRadius: 3 },
  qualityBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, minWidth: 60, alignItems: 'center' },
  qualityBadgeText: { fontSize: 9, fontWeight: '800' },

  // Overall
  overallGrid: { flexDirection: 'row', justifyContent: 'space-around', flexWrap: 'wrap', gap: 12 },
  overallItem: { alignItems: 'center', width: (width - 80) / 3, gap: 3, marginBottom: 8 },
  overallCenter: { position: 'absolute', top: 16, alignItems: 'center' },
  overallVal: { fontSize: 18, fontWeight: '900' },
  overallQuality: { fontSize: 8, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  overallName: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  overallMeta: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  overallRating: { fontSize: 10, fontWeight: '700', color: '#FFD700' },
  overallReviews: { fontSize: 9, color: 'rgba(255,255,255,0.3)' },

  // Feature Matrix
  matrixHeader: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)', paddingBottom: 8, marginBottom: 4 },
  matrixLabelCol: { flex: 1.2, flexDirection: 'row', alignItems: 'center', gap: 6 },
  matrixHotelCol: { flex: 1, alignItems: 'center', gap: 2 },
  matrixDot: { width: 8, height: 8, borderRadius: 4 },
  matrixHotelName: { fontSize: 9, fontWeight: '600', color: 'rgba(255,255,255,0.4)' },
  matrixRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)' },
  matrixRowAlt: { backgroundColor: 'rgba(255,255,255,0.02)' },
  matrixLabel: { fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: '500' },
  checkCircle: { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  xCircle: { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)' },
  featureCountBar: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  featureCountItem: { alignItems: 'center', gap: 4 },
  featureCountRing: { justifyContent: 'center', alignItems: 'center' },
  featureCountVal: { position: 'absolute', fontSize: 14, fontWeight: '900' },
  featureCountTotal: { fontSize: 9, color: 'rgba(255,255,255,0.35)' },

  // Winner Podium
  winnerCard: { borderRadius: 20, padding: 20, alignItems: 'center', overflow: 'hidden', gap: 6, marginBottom: 14 },
  winnerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  podium: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 10, width: '100%' },
  podiumCol: { flex: 1, alignItems: 'center', gap: 4 },
  podiumMedal: { fontSize: 24 },
  podiumName: { fontSize: 13, fontWeight: '700', color: '#fff' },
  podiumMatch: { fontSize: 18, fontWeight: '900', color: '#FFD700' },
  podiumBar: { width: '100%', borderRadius: 12, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 8 },
  podiumPrice: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
});

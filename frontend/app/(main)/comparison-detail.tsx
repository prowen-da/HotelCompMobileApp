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
import { getHotelsByIds, featureLabels, Hotel } from '../../src/data/hotels';
import { fetchHotelComparisonV2, fetchOtaPrices } from '../../src/services/api';

const { width } = Dimensions.get('window');
const BAR_MAX = width - 165;
const defaultIds = [1, 2, 3];

const amenityData = [
  { key: 'cleanliness', label: 'Cleanliness', icon: 'sparkles' },
  { key: 'service', label: 'Service', icon: 'hand-left' },
  { key: 'location', label: 'Location', icon: 'location' },
  { key: 'value', label: 'Value', icon: 'cash' },
  { key: 'comfort', label: 'Comfort', icon: 'bed' },
] as const;

const tabData = [
  { label: 'Ratings', icon: 'star' },
  { label: 'Prices', icon: 'cash' },
  { label: 'Features', icon: 'checkmark-done' },
  { label: 'Trip Match', icon: 'people' },
];

const tripTypes = [
  { key: 'family', label: 'Family Trip', icon: 'people', color: '#F5A623', gradient: ['#F5A623', '#FFD700'] as [string, string] },
  { key: 'business', label: 'Business', icon: 'briefcase', color: '#2193b0', gradient: ['#2193b0', '#6dd5ed'] as [string, string] },
  { key: 'friends', label: 'Friends', icon: 'beer', color: '#a78bfa', gradient: ['#a78bfa', '#c084fc'] as [string, string] },
  { key: 'solo', label: 'Solo Travel', icon: 'person', color: '#667eea', gradient: ['#667eea', '#764ba2'] as [string, string] },
  { key: 'pets', label: 'Pet Friendly', icon: 'paw', color: '#1D976C', gradient: ['#1D976C', '#93F9B9'] as [string, string] },
];

// ── Helpers ────────────────────────────────────
const qColor = (v: number) => (v >= 9 ? '#10b981' : v >= 8 ? '#667eea' : v >= 7 ? '#F5A623' : '#ef4444');
const qLabel = (v: number) => (v >= 9 ? 'Excellent' : v >= 8 ? 'Great' : v >= 7 ? 'Good' : 'Fair');
const qGradient = (v: number): [string, string] =>
  v >= 9 ? ['#10b981', '#34d399'] : v >= 8 ? ['#667eea', '#818cf8'] : v >= 7 ? ['#F5A623', '#fbbf24'] : ['#ef4444', '#f87171'];

// ── Animated Components ────────────────────────

function GradientBar({ value, maxValue, gradient, delay, label, barMax }: {
  value: number; maxValue: number; gradient: [string, string]; delay: number; label: string; barMax?: number;
}) {
  const bw = useSharedValue(0);
  const max = barMax ?? BAR_MAX;
  useEffect(() => { bw.value = withDelay(delay, withSpring((value / maxValue) * max, { damping: 14 })); }, [value]);
  const s = useAnimatedStyle(() => ({ width: bw.value }));
  return (
    <View style={gb.track}>
      <Animated.View style={[gb.fill, s]}>
        <LinearGradient colors={gradient} style={[StyleSheet.absoluteFill, { borderRadius: 8 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
        <Text style={gb.label}>{label}</Text>
      </Animated.View>
    </View>
  );
}
const gb = StyleSheet.create({
  track: { height: 28, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.04)', overflow: 'hidden', flex: 1 },
  fill: { height: 28, borderRadius: 8, justifyContent: 'center', minWidth: 36 },
  label: { color: '#fff', fontSize: 11, fontWeight: '800', paddingLeft: 10, textShadow: '0px 1px 2px rgba(0,0,0,0.3)' },
});

function ProgressRing({ value, maxValue, color, size }: { value: number; maxValue: number; color: string; size: number }) {
  const pct = (value / maxValue) * 100;
  const sw = size > 50 ? 5 : 4;
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ position: 'absolute', width: size, height: size, borderRadius: size / 2, borderWidth: sw, borderColor: 'rgba(255,255,255,0.06)' }} />
      <View style={{
        position: 'absolute', width: size, height: size, borderRadius: size / 2, borderWidth: sw,
        borderColor: color,
        borderTopColor: pct > 75 ? color : 'rgba(255,255,255,0.06)',
        borderRightColor: pct > 50 ? color : 'rgba(255,255,255,0.06)',
        borderBottomColor: pct > 25 ? color : 'rgba(255,255,255,0.06)',
        transform: [{ rotate: '-90deg' }],
      }} />
    </View>
  );
}

function VBarAnimated({ value, maxValue, gradient, delay }: {
  value: number; maxValue: number; gradient: [string, string]; delay: number;
}) {
  const h = useSharedValue(0);
  useEffect(() => { h.value = withDelay(delay, withSpring((value / maxValue) * 130, { damping: 14 })); }, [value]);
  const s = useAnimatedStyle(() => ({ height: h.value }));
  return (
    <Animated.View style={[{ width: '75%', borderRadius: 10, overflow: 'hidden', minHeight: 4 }, s]}>
      <LinearGradient colors={gradient} style={StyleSheet.absoluteFill} start={{ x: 0, y: 1 }} end={{ x: 0, y: 0 }} />
    </Animated.View>
  );
}

// ── Main Screen ────────────────────────────────
export default function ComparisonDetailScreen() {
  const insets = useSafeAreaInsets();
  const { ids, travelType, checkIn, checkOut } = useLocalSearchParams<{
    ids?: string; travelType?: string; checkIn?: string; checkOut?: string;
  }>();
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'api' | 'mock'>('mock');
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const glowOpacity = useSharedValue(0.3);

  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(withTiming(0.5, { duration: 2500 }), withTiming(0.3, { duration: 2500 })), -1, true
    );
    loadData();
  }, []);
  const glowStyle = useAnimatedStyle(() => ({ opacity: glowOpacity.value }));

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Fetch from API with params from home screen
      const [apiHotels, otaPrices] = await Promise.all([
        fetchHotelComparisonV2(checkIn, undefined),
        fetchOtaPrices(checkIn, undefined),
      ]);

      if (apiHotels && apiHotels.length > 0) {
        // Transform API data to Hotel type with OTA prices
        const transformed: Hotel[] = apiHotels.map((h, i) => {
          // Build amenity scores from the scores object
          const categoryScores = h.scores || {};
          const firstCategory = Object.values(categoryScores).find(c => c && Object.keys(c).length > 0) || {};
          const amenityScores: any = {};
          const keys = Object.keys(firstCategory).slice(0, 5);
          keys.forEach(k => { amenityScores[k] = ((firstCategory as any)[k] || 0) / 10; });
          // Fill defaults if empty
          if (keys.length === 0) {
            amenityScores.value = h.value_score?.business ? h.value_score.business / 10 : 5;
            amenityScores.quality = h.rating || 5;
            amenityScores.price = Math.max(3, 10 - (h.price / 200));
            amenityScores.location = 7;
            amenityScores.service = 7;
          }

          // Find OTA prices for this hotel
          const hotelOtaPrices = otaPrices.prices.find(
            (p) => p.hotel_id === h.id || p.hotel_name === h.name
          );
          const platformPrices = hotelOtaPrices?.ota_list?.map((o) => ({
            platform: o.ota_name,
            price: o.ota_price,
          })) || [{ platform: 'Direct', price: h.price }];

          return {
            id: h.id,
            name: h.name,
            location: '',
            price: h.price,
            rating: h.rating || 0,
            reviews: h.reviews || 0,
            amenities: [],
            image: '',
            category: 'business',
            petFriendly: h.petFriendly || false,
            gradient: h.gradient,
            accent: h.color,
            amenityScores,
            features: h.features || { wifi: false, pool: false, gym: false, spa: false, parking: false, restaurant: false, bar: false, petFriendly: false },
            tripMatch: {
              family: h.match?.family || 50,
              business: h.match?.business || 50,
              friends: h.match?.friends || 50,
              solo: h.match?.leisure || 50,
              pets: h.petFriendly ? 80 : 10,
            },
            platformPrices,
          } as Hotel;
        });
        setHotels(transformed);
        setDataSource('api');
      } else {
        // Fallback to mock data
        const selectedIds = ids ? ids.split(',').map(Number).filter(Boolean) : defaultIds;
        setHotels(getHotelsByIds(selectedIds));
        setDataSource('mock');
      }
    } catch (e) {
      console.log('[ComparisonDetail] API failed, using mock data');
      const selectedIds = ids ? ids.split(',').map(Number).filter(Boolean) : defaultIds;
      setHotels(getHotelsByIds(selectedIds));
      setDataSource('mock');
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 }}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Loading comparison data...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (hotels.length === 0) {
    return (
      <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, paddingHorizontal: 24 }}>
          <Ionicons name="analytics-outline" size={48} color="rgba(255,255,255,0.3)" />
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, textAlign: 'center' }}>No hotel comparison data available</Text>
          <TouchableOpacity onPress={() => router.back()} style={{ paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, backgroundColor: 'rgba(102,126,234,0.2)' }}>
            <Text style={{ color: '#667eea', fontWeight: '700' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  // Compute aggregates
  const allLowest = hotels.map((h) => Math.min(...h.platformPrices.map((p) => p.price)));
  const minPrice = Math.min(...allLowest);
  const maxPrice = Math.max(...allLowest);

  // Dynamic amenity categories from actual hotel data
  const dynamicAmenityData = (() => {
    if (hotels.length === 0) return amenityData.map(a => ({ ...a }));
    const firstHotel = hotels[0];
    const keys = Object.keys(firstHotel.amenityScores || {});
    if (keys.length === 0) return amenityData.map(a => ({ ...a }));
    const iconMap: Record<string, string> = {
      cleanliness: 'sparkles', service: 'hand-left', location: 'location',
      value: 'cash', comfort: 'bed', parking: 'car', breakfast: 'restaurant',
      business: 'briefcase', safety: 'shield-checkmark', family: 'people',
      quality: 'star', price: 'pricetag', 'wi-fi': 'wifi', wifi: 'wifi',
      gym: 'fitness', atmosphere: 'sunny', bar: 'wine', dining: 'restaurant',
      restaurant: 'restaurant', transport: 'bus', pool: 'water', spa: 'leaf',
    };
    return keys.map(k => ({
      key: k,
      label: k.charAt(0).toUpperCase() + k.slice(1).replace(/_/g, ' ').replace(/-/g, ' '),
      icon: iconMap[k.toLowerCase()] || 'ellipse',
    }));
  })();

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
      <Animated.View style={[styles.orb, styles.orb1, glowStyle]} />
      <Animated.View style={[styles.orb, styles.orb2, glowStyle]} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Animated.View entering={FadeInDown.springify()} style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <BlurView intensity={25} style={styles.backBtnBlur} tint="dark">
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </BlurView>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Side-by-Side</Text>
            <Text style={styles.headerSub}>{hotels.length} hotels compared</Text>
          </View>
          <TouchableOpacity style={styles.addBtn}>
            <Ionicons name="add-circle-outline" size={24} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
        </Animated.View>

        {/* Data source badge */}
        <Animated.View entering={FadeInDown.delay(150)} style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 3, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)' }}>
            <Ionicons name={dataSource === 'api' ? 'cloud-done' : 'desktop'} size={11} color={dataSource === 'api' ? '#10b981' : '#F5A623'} />
            <Text style={{ fontSize: 10, fontWeight: '700', color: dataSource === 'api' ? '#10b981' : '#F5A623' }}>
              {dataSource === 'api' ? 'Live Data' : 'Sample Data'}
            </Text>
          </View>
        </Animated.View>

        {/* Hotel pills */}
        <Animated.View entering={FadeInUp.delay(200)} style={styles.hotelPills}>
          {hotels.map((h, i) => (
            <Animated.View key={h.id} entering={ZoomIn.delay(300 + i * 100)} style={[styles.pill, { borderColor: h.accent + '60' }]}>
              <View style={[styles.pillDot, { backgroundColor: h.accent }]} />
              <Text style={styles.pillText} numberOfLines={1}>{h.name.split(' ').slice(0, 2).join(' ')}</Text>
            </Animated.View>
          ))}
        </Animated.View>
      </View>

      {/* Tabs */}
      <Animated.View entering={FadeInDown.delay(300)} style={styles.tabBar}>
        {tabData.map((t, i) => (
          <TouchableOpacity
            key={t.label}
            style={[styles.tabBtn, activeTab === i && styles.tabBtnActive]}
            onPress={() => setActiveTab(i)}
            activeOpacity={0.7}
          >
            <Ionicons name={t.icon as any} size={15} color={activeTab === i ? '#fff' : 'rgba(255,255,255,0.35)'} />
            <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>

      <ScrollView style={styles.body} contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 30 }} showsVerticalScrollIndicator={false}>

        {/* ===== RATINGS TAB ===== */}
        {activeTab === 0 && (
          <View>
            {/* Quality Legend */}
            <Animated.View entering={FadeInDown.delay(100)} style={styles.legendRow}>
              {[{ l: 'Excellent 9+', c: '#10b981' }, { l: 'Great 8+', c: '#667eea' }, { l: 'Good 7+', c: '#F5A623' }, { l: 'Fair <7', c: '#ef4444' }].map((q) => (
                <View key={q.l} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: q.c }]} />
                  <Text style={styles.legendText}>{q.l}</Text>
                </View>
              ))}
            </Animated.View>

            {/* Hotel Legend */}
            <Animated.View entering={FadeInDown.delay(150)} style={styles.hotelLegendRow}>
              {hotels.map((h) => (
                <View key={h.id} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: h.accent, borderRadius: 4 }]} />
                  <Text style={styles.legendText}>{h.name.split(' ').slice(0, 2).join(' ')}</Text>
                </View>
              ))}
            </Animated.View>

            {dynamicAmenityData.map((cat, cIdx) => (
              <Animated.View key={cat.key} entering={FadeInDown.delay(200 + cIdx * 80)} style={styles.ratingBlock}>
                <View style={styles.catLabelRow}>
                  <Ionicons name={cat.icon as any} size={14} color="rgba(255,255,255,0.5)" />
                  <Text style={styles.catLabel}>{cat.label}</Text>
                  {/* Show who wins this category */}
                  {(() => {
                    const best = [...hotels].sort((a, b) => ((b.amenityScores as any)[cat.key] || 0) - ((a.amenityScores as any)[cat.key] || 0))[0];
                    return (
                      <View style={[styles.winsBadge, { backgroundColor: best.accent + '20' }]}>
                        <Ionicons name="trophy" size={10} color="#FFD700" />
                        <Text style={[styles.winsBadgeText, { color: best.accent }]}>
                          {best.name.split(' ')[0]}
                        </Text>
                      </View>
                    );
                  })()}
                </View>
                {hotels.map((h, hIdx) => {
                  const val = (h.amenityScores as any)[cat.key] || 0;
                  return (
                    <View key={h.id} style={styles.ratingBarRow}>
                      <View style={[styles.ratingDot, { backgroundColor: h.accent }]} />
                      <View style={{ flex: 1 }}>
                        <GradientBar
                          value={val} maxValue={10}
                          gradient={qGradient(val)}
                          delay={200 + cIdx * 80 + hIdx * 50}
                          label={typeof val === 'number' ? val.toFixed(1) : '0'}
                        />
                      </View>
                      <View style={[styles.qBadge, { backgroundColor: qColor(val) + '20' }]}>
                        <Text style={[styles.qBadgeText, { color: qColor(val) }]}>{qLabel(val)}</Text>
                      </View>
                    </View>
                  );
                })}
              </Animated.View>
            ))}

            {/* Overall Score Circles */}
            <Animated.View entering={FadeInUp.delay(700)} style={styles.overallCard}>
              <View style={styles.overallHeader}>
                <Ionicons name="ribbon" size={18} color="#a78bfa" />
                <Text style={styles.sectionTitle}>Overall Score</Text>
              </View>
              <View style={styles.overallGrid}>
                {hotels.map((h, i) => {
                  const scores = Object.values(h.amenityScores || {}).filter(v => typeof v === 'number');
                  const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
                  const color = qColor(avg);
                  return (
                    <Animated.View key={h.id} entering={ZoomIn.delay(800 + i * 120)} style={styles.overallItem}>
                      <ProgressRing value={avg} maxValue={10} color={color} size={72} />
                      <View style={styles.overallCenter}>
                        <Text style={[styles.overallVal, { color }]}>{avg.toFixed(1)}</Text>
                        <Text style={[styles.overallQLabel, { color }]}>{qLabel(avg)}</Text>
                      </View>
                      <Text style={[styles.overallName, { color: h.accent }]}>{h.name.split(' ').slice(0, 2).join(' ')}</Text>
                      <View style={styles.overallMeta}>
                        <Ionicons name="star" size={10} color="#FFD700" />
                        <Text style={styles.overallRating}>{h.rating}</Text>
                        <Text style={styles.overallReviews}>({(h.reviews / 1000).toFixed(1)}k)</Text>
                      </View>
                    </Animated.View>
                  );
                })}
              </View>
            </Animated.View>
          </View>
        )}

        {/* ===== PRICES TAB ===== */}
        {activeTab === 1 && (
          <View>
            {/* Insight Pills */}
            <Animated.View entering={FadeInDown.delay(100)} style={styles.insightRow}>
              <View style={[styles.insightPill, { backgroundColor: '#10b98120' }]}>
                <Ionicons name="arrow-down" size={12} color="#10b981" />
                <Text style={[styles.insightText, { color: '#10b981' }]}>Cheapest: ${minPrice}</Text>
              </View>
              <View style={[styles.insightPill, { backgroundColor: '#ef444420' }]}>
                <Ionicons name="arrow-up" size={12} color="#ef4444" />
                <Text style={[styles.insightText, { color: '#ef4444' }]}>Priciest: ${maxPrice}</Text>
              </View>
              <View style={[styles.insightPill, { backgroundColor: '#667eea20' }]}>
                <Text style={[styles.insightText, { color: '#667eea' }]}>Save up to ${maxPrice - minPrice}</Text>
              </View>
            </Animated.View>

            {/* Visual Price Chart */}
            <Animated.View entering={FadeInDown.delay(200)} style={styles.card}>
              <View style={styles.cardTitleRow}>
                <Ionicons name="bar-chart" size={16} color="#10b981" />
                <Text style={styles.sectionTitle}>Price Overview</Text>
              </View>
              <Text style={styles.cardSub}>Lowest room price per night</Text>
              <View style={styles.priceChartArea}>
                {hotels.map((h, i) => {
                  const lowest = Math.min(...h.platformPrices.map((p) => p.price));
                  const isCheapest = lowest === minPrice;
                  return (
                    <View key={h.id} style={styles.priceCol}>
                      <Text style={[styles.priceTopLabel, { color: isCheapest ? '#10b981' : h.accent }]}>${lowest}</Text>
                      {isCheapest && (
                        <View style={styles.bestDealBadge}>
                          <Text style={styles.bestDealText}>BEST</Text>
                        </View>
                      )}
                      <View style={styles.priceBarContainer}>
                        <VBarAnimated value={lowest} maxValue={maxPrice * 1.15} gradient={h.gradient} delay={300 + i * 120} />
                      </View>
                      <View style={[styles.priceNameDot, { backgroundColor: h.accent }]} />
                      <Text style={styles.priceNameLabel} numberOfLines={1}>{h.name.split(' ').slice(0, 2).join(' ')}</Text>
                    </View>
                  );
                })}
              </View>
            </Animated.View>

            {/* Platform Breakdown per Hotel */}
            {hotels.map((h, hIdx) => {
              const lowest = Math.min(...h.platformPrices.map((p) => p.price));
              return (
                <Animated.View key={h.id} entering={FadeInUp.delay(500 + hIdx * 150)} style={styles.card}>
                  <View style={styles.platformHeaderRow}>
                    <View style={[styles.platformColorBar, { backgroundColor: h.accent }]} />
                    <Text style={styles.sectionTitle}>{h.name.split(' ').slice(0, 3).join(' ')}</Text>
                  </View>
                  <View style={styles.platformGrid}>
                    {h.platformPrices.map((p, pIdx) => {
                      const isLowest = p.price === lowest;
                      const savings = p.price - lowest;
                      return (
                        <Animated.View
                          key={p.platform}
                          entering={ZoomIn.delay(600 + hIdx * 150 + pIdx * 80)}
                          style={[styles.platformCard, isLowest && { borderColor: h.accent, borderWidth: 2 }]}
                        >
                          {isLowest && (
                            <View style={[styles.lowestTag, { backgroundColor: h.accent }]}>
                              <Ionicons name="checkmark" size={10} color="#fff" />
                              <Text style={styles.lowestTagText}>LOWEST</Text>
                            </View>
                          )}
                          <Text style={styles.platformName}>{p.platform}</Text>
                          <Text style={[styles.platformPrice, isLowest && { color: h.accent }]}>${p.price}</Text>
                          <Text style={styles.platformPerNight}>/night</Text>
                          {!isLowest && savings > 0 && (
                            <Text style={styles.savingsText}>+${savings} more</Text>
                          )}
                        </Animated.View>
                      );
                    })}
                  </View>
                </Animated.View>
              );
            })}
          </View>
        )}

        {/* ===== FEATURES TAB ===== */}
        {activeTab === 2 && (
          <Animated.View entering={FadeInDown} style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="checkmark-done" size={16} color="#6dd5ed" />
              <Text style={styles.sectionTitle}>Feature Matrix</Text>
            </View>
            <Text style={styles.cardSub}>Side-by-side amenities</Text>

            {/* Matrix Header */}
            <View style={styles.matrixHeader}>
              <View style={styles.matrixLabelCol} />
              {hotels.map((h) => (
                <View key={h.id} style={styles.matrixHotelCol}>
                  <View style={[styles.matrixDot, { backgroundColor: h.accent }]} />
                  <Text style={styles.matrixHotelName} numberOfLines={1}>{h.name.split(' ')[0]}</Text>
                </View>
              ))}
            </View>

            {Object.entries(featureLabels).map(([key, val], fIdx) => (
              <Animated.View
                key={key}
                entering={SlideInRight.delay(fIdx * 60)}
                style={[styles.matrixRow, fIdx % 2 === 0 && styles.matrixRowAlt]}
              >
                <View style={styles.matrixLabelCol}>
                  <Ionicons name={val.icon as any} size={15} color="rgba(255,255,255,0.45)" />
                  <Text style={styles.matrixLabel}>{val.label}</Text>
                </View>
                {hotels.map((h) => (
                  <View key={h.id} style={styles.matrixHotelCol}>
                    {(h.features as any)[key] ? (
                      <View style={[styles.checkCircle, { backgroundColor: h.accent + '20' }]}>
                        <Ionicons name="checkmark" size={14} color={h.accent} />
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

            {/* Feature Count with Progress Rings */}
            <View style={styles.featureCountRow}>
              {hotels.map((h) => {
                const count = Object.values(h.features).filter(Boolean).length;
                const total = Object.keys(h.features).length;
                return (
                  <View key={h.id} style={styles.featureCountItem}>
                    <View style={styles.featureCountRing}>
                      <ProgressRing value={count} maxValue={total} color={h.accent} size={48} />
                      <Text style={[styles.featureCountVal, { color: h.accent }]}>{count}</Text>
                    </View>
                    <Text style={styles.featureCountTotal}>of {total}</Text>
                    <Text style={styles.featureCountName} numberOfLines={1}>{h.name.split(' ')[0]}</Text>
                  </View>
                );
              })}
            </View>
          </Animated.View>
        )}

        {/* ===== TRIP MATCH TAB ===== */}
        {activeTab === 3 && (
          <View>
            {tripTypes.map((trip, tIdx) => {
              const sorted = [...hotels].sort((a, b) => (b.tripMatch as any)[trip.key] - (a.tripMatch as any)[trip.key]);
              const winner = sorted[0];
              return (
                <Animated.View key={trip.key} entering={FadeInDown.delay(tIdx * 100)} style={styles.card}>
                  <View style={styles.tripHeaderRow}>
                    <View style={[styles.tripIconWrap, { backgroundColor: trip.color + '15' }]}>
                      <Ionicons name={trip.icon as any} size={20} color={trip.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.tripTypeLabel}>{trip.label}</Text>
                    </View>
                    <View style={[styles.winnerPill, { backgroundColor: winner.accent + '20' }]}>
                      <Ionicons name="trophy" size={11} color="#FFD700" />
                      <Text style={[styles.winnerPillText, { color: winner.accent }]}>{winner.name.split(' ')[0]}</Text>
                    </View>
                  </View>

                  {sorted.map((h, hIdx) => {
                    const matchVal = (h.tripMatch as any)[trip.key];
                    const medal = hIdx === 0 ? '🥇' : hIdx === 1 ? '🥈' : hIdx === 2 ? '🥉' : '';
                    return (
                      <View key={h.id} style={styles.tripBarRow}>
                        <Text style={styles.tripMedal}>{medal || `#${hIdx + 1}`}</Text>
                        <View style={[styles.tripDot, { backgroundColor: h.accent }]} />
                        <View style={{ flex: 1 }}>
                          <GradientBar
                            value={matchVal} maxValue={100}
                            gradient={h.gradient}
                            delay={100 + tIdx * 100 + hIdx * 60}
                            label={`${matchVal}%`}
                            barMax={width - 185}
                          />
                        </View>
                      </View>
                    );
                  })}
                </Animated.View>
              );
            })}

            {/* Grand Summary Card */}
            <Animated.View entering={FadeInUp.delay(600)} style={styles.summaryCardWrap}>
              <LinearGradient colors={['#667eea', '#764ba2']} style={styles.summaryCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <View style={styles.summaryHeader}>
                  <Ionicons name="trophy" size={22} color="#FFD700" />
                  <Text style={styles.summaryTitle}>Best Match Summary</Text>
                </View>

                {tripTypes.map((trip) => {
                  const best = [...hotels].sort((a, b) => (b.tripMatch as any)[trip.key] - (a.tripMatch as any)[trip.key])[0];
                  const bestScore = best ? (best.tripMatch as any)[trip.key] : 0;
                  return (
                    <View key={trip.key} style={styles.summaryRow}>
                      <View style={styles.summaryRowLeft}>
                        <View style={[styles.summaryIcon, { backgroundColor: trip.color + '30' }]}>
                          <Ionicons name={trip.icon as any} size={14} color={trip.color} />
                        </View>
                        <Text style={styles.summaryTrip}>{trip.label}</Text>
                      </View>
                      <View style={styles.summaryRowRight}>
                        <View style={[styles.summaryHotelDot, { backgroundColor: best.accent }]} />
                        <Text style={styles.summaryHotel}>{best?.name.split(' ').slice(0, 2).join(' ')}</Text>
                        <Text style={styles.summaryScore}>{bestScore}%</Text>
                      </View>
                    </View>
                  );
                })}
              </LinearGradient>
            </Animated.View>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  orb: { position: 'absolute', borderRadius: 999 },
  orb1: { width: 180, height: 180, top: -40, right: -60, backgroundColor: '#667eea' },
  orb2: { width: 120, height: 120, bottom: 100, left: -30, backgroundColor: '#764ba2' },

  header: { paddingHorizontal: 16, paddingBottom: 14 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  backBtn: { width: 42, height: 42, borderRadius: 14, overflow: 'hidden' },
  backBtnBlur: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)' },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 },
  addBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center' },
  hotelPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 7, gap: 6 },
  pillDot: { width: 8, height: 8, borderRadius: 4 },
  pillText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  tabBar: { flexDirection: 'row', paddingHorizontal: 16, gap: 6, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 10, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.04)' },
  tabBtnActive: { backgroundColor: '#667eea' },
  tabText: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.35)' },
  tabTextActive: { color: '#fff' },

  body: { flex: 1 },

  // Legends
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  hotelLegendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 2 },
  legendText: { fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: '500' },

  // Cards
  card: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 20, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#fff' },
  cardSub: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 14, marginLeft: 24 },

  // Ratings
  ratingBlock: { marginBottom: 16 },
  catLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  catLabel: { fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.7)', flex: 1 },
  winsBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  winsBadgeText: { fontSize: 10, fontWeight: '800' },
  ratingBarRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  ratingDot: { width: 6, height: 6, borderRadius: 3 },
  qBadge: { borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3, minWidth: 55, alignItems: 'center' },
  qBadgeText: { fontSize: 9, fontWeight: '800' },

  // Overall Score
  overallCard: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginTop: 4 },
  overallHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  overallGrid: { flexDirection: 'row', justifyContent: 'space-around', flexWrap: 'wrap' },
  overallItem: { alignItems: 'center', width: (width - 80) / 3, gap: 3, marginBottom: 8 },
  overallCenter: { position: 'absolute', top: 18, alignItems: 'center' },
  overallVal: { fontSize: 18, fontWeight: '900' },
  overallQLabel: { fontSize: 7, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  overallName: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  overallMeta: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  overallRating: { fontSize: 10, fontWeight: '700', color: '#FFD700' },
  overallReviews: { fontSize: 9, color: 'rgba(255,255,255,0.3)' },

  // Price Insights
  insightRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  insightPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  insightText: { fontSize: 11, fontWeight: '700' },

  // Price Chart
  priceChartArea: { flexDirection: 'row', gap: 6, paddingTop: 4 },
  priceCol: { flex: 1, alignItems: 'center', gap: 4 },
  priceTopLabel: { fontSize: 14, fontWeight: '800' },
  bestDealBadge: { backgroundColor: '#10b981', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  bestDealText: { color: '#fff', fontSize: 8, fontWeight: '900', letterSpacing: 0.5 },
  priceBarContainer: { width: '100%', height: 130, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.03)', justifyContent: 'flex-end', alignItems: 'center', overflow: 'hidden' },
  priceNameDot: { width: 6, height: 6, borderRadius: 3, marginTop: 4 },
  priceNameLabel: { fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: '600' },

  // Platform Breakdown
  platformHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  platformColorBar: { width: 4, height: 20, borderRadius: 2 },
  platformGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  platformCard: { width: (width - 78) / 2, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', alignItems: 'center' },
  lowestTag: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginBottom: 6 },
  lowestTagText: { color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  platformName: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 4 },
  platformPrice: { fontSize: 22, fontWeight: '800', color: '#fff' },
  platformPerNight: { fontSize: 11, color: 'rgba(255,255,255,0.3)' },
  savingsText: { fontSize: 10, color: '#ef4444', fontWeight: '600', marginTop: 4 },

  // Feature Matrix
  matrixHeader: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)', paddingBottom: 8, marginBottom: 4 },
  matrixLabelCol: { flex: 1.3, flexDirection: 'row', alignItems: 'center', gap: 6 },
  matrixHotelCol: { flex: 1, alignItems: 'center', gap: 2 },
  matrixDot: { width: 8, height: 8, borderRadius: 4 },
  matrixHotelName: { fontSize: 9, fontWeight: '600', color: 'rgba(255,255,255,0.4)' },
  matrixRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)' },
  matrixRowAlt: { backgroundColor: 'rgba(255,255,255,0.02)' },
  matrixLabel: { fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: '500' },
  checkCircle: { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  xCircle: { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)' },
  featureCountRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  featureCountItem: { alignItems: 'center', gap: 3 },
  featureCountRing: { justifyContent: 'center', alignItems: 'center' },
  featureCountVal: { position: 'absolute', fontSize: 14, fontWeight: '900' },
  featureCountTotal: { fontSize: 9, color: 'rgba(255,255,255,0.35)' },
  featureCountName: { fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: '600' },

  // Trip Match
  tripHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  tripIconWrap: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  tripTypeLabel: { fontSize: 15, fontWeight: '700', color: '#fff' },
  winnerPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  winnerPillText: { fontSize: 11, fontWeight: '800' },
  tripBarRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  tripMedal: { fontSize: 15, width: 26, textAlign: 'center' },
  tripDot: { width: 6, height: 6, borderRadius: 3 },

  // Summary
  summaryCardWrap: { borderRadius: 22, overflow: 'hidden', marginBottom: 14 },
  summaryCard: { padding: 20 },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  summaryTitle: { fontSize: 17, fontWeight: '800', color: '#fff' },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  summaryRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  summaryIcon: { width: 30, height: 30, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  summaryTrip: { fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },
  summaryRowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  summaryHotelDot: { width: 6, height: 6, borderRadius: 3 },
  summaryHotel: { fontSize: 13, fontWeight: '700', color: '#fff' },
  summaryScore: { fontSize: 14, fontWeight: '900', color: '#FFD700' },
});

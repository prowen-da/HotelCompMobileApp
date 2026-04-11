import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
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
  FadeInDown,
  FadeInUp,
  SlideInRight,
  ZoomIn,
} from 'react-native-reanimated';

import { getHotelsByIds, hotels as allHotels, featureLabels } from '../../src/data/hotels';

const { width } = Dimensions.get('window');

// Default hotel IDs if none selected
const defaultIds = [1, 2, 3];

const amenityLabels = ['Cleanliness', 'Service', 'Location', 'Value', 'Comfort'];
const amenityKeys = ['cleanliness', 'service', 'location', 'value', 'comfort'] as const;

// Animated horizontal bar
const AnimatedHBar = ({ value, maxValue, color, delay }: { value: number; maxValue: number; color: string; delay: number }) => {
  const barWidth = useSharedValue(0);
  useEffect(() => {
    barWidth.value = withDelay(delay, withSpring((value / maxValue) * 100, { damping: 14 }));
  }, []);
  const style = useAnimatedStyle(() => ({ width: `${barWidth.value}%` }));
  return (
    <View style={hbarStyles.track}>
      <Animated.View style={[hbarStyles.fill, { backgroundColor: color }, style]} />
    </View>
  );
};

const hbarStyles = StyleSheet.create({
  track: { height: 8, borderRadius: 4, backgroundColor: '#f0f0f0', flex: 1 },
  fill: { height: 8, borderRadius: 4 },
});

export default function ComparisonDetailScreen() {
  const insets = useSafeAreaInsets();
  const { ids } = useLocalSearchParams<{ ids?: string }>();
  const [activeSection, setActiveSection] = useState(0);
  const sections = ['Ratings', 'Prices', 'Features', 'Trip Match'];

  // Parse IDs from route params or use defaults
  const selectedIds = ids
    ? ids.split(',').map(Number).filter(Boolean)
    : defaultIds;

  const hotelsToCompare = getHotelsByIds(selectedIds);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
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
            <Text style={styles.headerTitle}>Side-by-Side Compare</Text>
            <Text style={styles.headerSub}>{hotelsToCompare.length} hotels selected</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="add-circle-outline" size={26} color="#fff" />
          </TouchableOpacity>
        </Animated.View>

        {/* Hotel pills */}
        <Animated.View entering={FadeInUp.delay(200)} style={styles.hotelPills}>
          {hotelsToCompare.map((h, i) => (
            <Animated.View key={h.id} entering={ZoomIn.delay(300 + i * 100)} style={[styles.pill, { borderColor: h.accent }]}>
              <View style={[styles.pillDot, { backgroundColor: h.accent }]} />
              <Text style={styles.pillText}>{h.name}</Text>
            </Animated.View>
          ))}
        </Animated.View>
      </LinearGradient>

      {/* Section Tabs */}
      <Animated.View entering={FadeInDown.delay(300)} style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {sections.map((s, i) => (
            <TouchableOpacity
              key={s}
              style={[styles.tabBtn, activeSection === i && styles.tabBtnActive]}
              onPress={() => setActiveSection(i)}
            >
              <Text style={[styles.tabText, activeSection === i && styles.tabTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ===== RATINGS SECTION ===== */}
        {activeSection === 0 && (
          <View>
            {amenityKeys.map((key, aIdx) => (
              <Animated.View
                key={key}
                entering={FadeInDown.delay(aIdx * 80)}
                style={styles.ratingBlock}
              >
                <Text style={styles.ratingLabel}>{amenityLabels[aIdx]}</Text>
                {hotelsToCompare.map((h, hIdx) => (
                  <View key={h.id} style={styles.ratingBarRow}>
                    <View style={[styles.ratingDot, { backgroundColor: h.accent }]} />
                    <AnimatedHBar
                      value={h.amenityScores[key]}
                      maxValue={10}
                      color={h.accent}
                      delay={aIdx * 80 + hIdx * 60}
                    />
                    <Text style={[styles.ratingScore, { color: h.accent }]}>
                      {h.amenityScores[key].toFixed(1)}
                    </Text>
                  </View>
                ))}
              </Animated.View>
            ))}

            {/* Overall Rating Summary */}
            <Animated.View entering={FadeInUp.delay(500)} style={styles.overallCard}>
              <Text style={styles.cardTitle}>Overall Rating</Text>
              <View style={styles.overallRow}>
                {hotelsToCompare.map((h) => {
                  const avg = Object.values(h.amenityScores).reduce((a, b) => a + b, 0) / Object.values(h.amenityScores).length;
                  return (
                    <View key={h.id} style={styles.overallItem}>
                      <View style={[styles.overallCircle, { borderColor: h.accent }]}>
                        <Text style={[styles.overallScore, { color: h.accent }]}>{avg.toFixed(1)}</Text>
                      </View>
                      <Text style={styles.overallName} numberOfLines={1}>{h.name}</Text>
                      <View style={styles.starRow}>
                        <Ionicons name="star" size={12} color="#FFD700" />
                        <Text style={styles.starText}>{h.rating}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </Animated.View>
          </View>
        )}

        {/* ===== PRICES SECTION ===== */}
        {activeSection === 1 && (
          <View>
            {/* Lowest Price Comparison */}
            <Animated.View entering={FadeInDown.delay(100)} style={styles.card}>
              <Text style={styles.cardTitle}>Lowest Room Price</Text>
              <Text style={styles.cardSub}>Comparing across all platforms</Text>
              {hotelsToCompare.map((h, hIdx) => {
                const lowest = Math.min(...h.platformPrices.map(p => p.price));
                const maxPrice = 200;
                return (
                  <Animated.View key={h.id} entering={SlideInRight.delay(hIdx * 120)} style={styles.priceCompRow}>
                    <View style={styles.priceCompInfo}>
                      <View style={[styles.ratingDot, { backgroundColor: h.accent }]} />
                      <Text style={styles.priceCompName} numberOfLines={1}>{h.name}</Text>
                    </View>
                    <View style={styles.priceBarWrap}>
                      <AnimatedHBar value={lowest} maxValue={maxPrice} color={h.accent} delay={hIdx * 120} />
                    </View>
                    <Text style={[styles.priceCompVal, { color: h.accent }]}>${lowest}</Text>
                  </Animated.View>
                );
              })}
            </Animated.View>

            {/* Platform Breakdown */}
            {hotelsToCompare.map((h, hIdx) => (
              <Animated.View key={h.id} entering={FadeInUp.delay(300 + hIdx * 150)} style={styles.card}>
                <View style={styles.platformHeader}>
                  <View style={[styles.platformDot, { backgroundColor: h.accent }]} />
                  <Text style={styles.cardTitle}>{h.name}</Text>
                </View>
                <View style={styles.platformGrid}>
                  {h.platformPrices.map((p, pIdx) => {
                    const isLowest = p.price === Math.min(...h.platformPrices.map(pp => pp.price));
                    return (
                      <Animated.View
                        key={p.platform}
                        entering={ZoomIn.delay(400 + hIdx * 150 + pIdx * 80)}
                        style={[styles.platformCard, isLowest && { borderColor: h.accent, borderWidth: 2 }]}
                      >
                        {isLowest && (
                          <View style={[styles.lowestBadge, { backgroundColor: h.accent }]}>
                            <Text style={styles.lowestText}>LOWEST</Text>
                          </View>
                        )}
                        <Text style={styles.platformName}>{p.platform}</Text>
                        <Text style={[styles.platformPrice, isLowest && { color: h.accent }]}>${p.price}</Text>
                        <Text style={styles.platformPerNight}>/night</Text>
                      </Animated.View>
                    );
                  })}
                </View>
              </Animated.View>
            ))}
          </View>
        )}

        {/* ===== FEATURES SECTION ===== */}
        {activeSection === 2 && (
          <Animated.View entering={FadeInDown} style={styles.card}>
            <Text style={styles.cardTitle}>Feature Comparison</Text>
            <Text style={styles.cardSub}>Side-by-side amenities & features</Text>

            {/* Feature Header */}
            <View style={styles.featureHeaderRow}>
              <View style={styles.featureLabelCol} />
              {hotelsToCompare.map((h) => (
                <View key={h.id} style={styles.featureHotelCol}>
                  <View style={[styles.featureHotelDot, { backgroundColor: h.accent }]} />
                  <Text style={styles.featureHotelName} numberOfLines={1}>{h.name.split(' ')[0]}</Text>
                </View>
              ))}
            </View>

            {Object.entries(featureLabels).map(([key, val], fIdx) => (
              <Animated.View
                key={key}
                entering={SlideInRight.delay(fIdx * 60)}
                style={[styles.featureRow, fIdx % 2 === 0 && styles.featureRowAlt]}
              >
                <View style={styles.featureLabelCol}>
                  <Ionicons name={val.icon as any} size={16} color="#666" />
                  <Text style={styles.featureLabel}>{val.label}</Text>
                </View>
                {hotelsToCompare.map((h) => (
                  <View key={h.id} style={styles.featureHotelCol}>
                    {(h.features as any)[key] ? (
                      <Ionicons name="checkmark-circle" size={22} color={h.accent} />
                    ) : (
                      <Ionicons name="close-circle" size={22} color="#ddd" />
                    )}
                  </View>
                ))}
              </Animated.View>
            ))}

            {/* Feature count summary */}
            <View style={styles.featureSummary}>
              {hotelsToCompare.map((h) => {
                const count = Object.values(h.features).filter(Boolean).length;
                return (
                  <View key={h.id} style={styles.featureSummaryItem}>
                    <Text style={[styles.featureSummaryCount, { color: h.accent }]}>{count}/{Object.keys(h.features).length}</Text>
                    <Text style={styles.featureSummaryLabel}>features</Text>
                  </View>
                );
              })}
            </View>
          </Animated.View>
        )}

        {/* ===== TRIP MATCH SECTION ===== */}
        {activeSection === 3 && (
          <View>
            {[
              { key: 'family', label: 'Family Trip', icon: 'people', color: '#fc4a1a' },
              { key: 'business', label: 'Business', icon: 'briefcase', color: '#2193b0' },
              { key: 'friends', label: 'Friends', icon: 'beer', color: '#ee0979' },
              { key: 'solo', label: 'Solo Travel', icon: 'person', color: '#667eea' },
              { key: 'pets', label: 'Pet Friendly', icon: 'paw', color: '#1D976C' },
            ].map((trip, tIdx) => (
              <Animated.View key={trip.key} entering={FadeInDown.delay(tIdx * 100)} style={styles.tripCard}>
                <View style={styles.tripHeader}>
                  <View style={[styles.tripIconWrap, { backgroundColor: trip.color + '15' }]}>
                    <Ionicons name={trip.icon as any} size={20} color={trip.color} />
                  </View>
                  <Text style={styles.tripLabel}>{trip.label}</Text>
                </View>
                {hotelsToCompare
                  .sort((a, b) => (b.tripMatch as any)[trip.key] - (a.tripMatch as any)[trip.key])
                  .map((h, hIdx) => {
                    const matchVal = (h.tripMatch as any)[trip.key];
                    return (
                      <View key={h.id} style={styles.tripRow}>
                        <View style={[styles.ratingDot, { backgroundColor: h.accent }]} />
                        <Text style={styles.tripHotelName} numberOfLines={1}>{h.name}</Text>
                        <View style={styles.tripBarWrap}>
                          <AnimatedHBar value={matchVal} maxValue={100} color={h.accent} delay={tIdx * 100 + hIdx * 60} />
                        </View>
                        <Text style={[styles.tripPercent, { color: h.accent }]}>{matchVal}%</Text>
                      </View>
                    );
                  })}
              </Animated.View>
            ))}

            {/* Best For Summary */}
            <Animated.View entering={FadeInUp.delay(600)} style={styles.bestForCard}>
              <LinearGradient colors={['#667eea', '#764ba2']} style={styles.bestForGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Ionicons name="trophy" size={22} color="#FFD700" />
                <Text style={styles.bestForTitle}>Best Match Summary</Text>
                {[
                  { trip: 'Family', key: 'family' },
                  { trip: 'Business', key: 'business' },
                  { trip: 'Friends', key: 'friends' },
                  { trip: 'Solo', key: 'solo' },
                  { trip: 'Pets', key: 'pets' },
                ].map((b) => {
                  const bestHotel = [...hotelsToCompare].sort((a, bb) => (bb.tripMatch as any)[b.key] - (a.tripMatch as any)[b.key])[0];
                  const bestScore = bestHotel ? (bestHotel.tripMatch as any)[b.key] : 0;
                  return (
                    <View key={b.trip} style={styles.bestForRow}>
                      <Text style={styles.bestForTrip}>{b.trip}</Text>
                      <Text style={styles.bestForHotel}>{bestHotel?.name || '-'}</Text>
                      <Text style={styles.bestForScore}>{bestScore}%</Text>
                    </View>
                  );
                })}
              </LinearGradient>
            </Animated.View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { paddingBottom: 15, paddingHorizontal: 15 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  backBtn: { width: 45, height: 45, borderRadius: 15, overflow: 'hidden' },
  backBtnBlur: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)' },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  hotelPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, gap: 6 },
  pillDot: { width: 8, height: 8, borderRadius: 4 },
  pillText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  tabBar: { backgroundColor: '#fff', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  tabScroll: { paddingHorizontal: 15, gap: 8 },
  tabBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, backgroundColor: '#f5f5f5' },
  tabBtnActive: { backgroundColor: '#667eea' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#666' },
  tabTextActive: { color: '#fff' },
  body: { flex: 1, padding: 15 },
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 14, boxShadow: '0px 2px 8px rgba(0,0,0,0.05)', elevation: 3 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 4 },
  cardSub: { fontSize: 12, color: '#999', marginBottom: 14 },
  // Ratings
  ratingBlock: { marginBottom: 16 },
  ratingLabel: { fontSize: 13, fontWeight: '700', color: '#333', marginBottom: 8 },
  ratingBarRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  ratingDot: { width: 8, height: 8, borderRadius: 4 },
  ratingScore: { fontSize: 13, fontWeight: '700', width: 32, textAlign: 'right' },
  overallCard: { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginTop: 4, boxShadow: '0px 2px 8px rgba(0,0,0,0.05)', elevation: 3 },
  overallRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
  overallItem: { alignItems: 'center', gap: 6 },
  overallCircle: { width: 60, height: 60, borderRadius: 30, borderWidth: 3, justifyContent: 'center', alignItems: 'center' },
  overallScore: { fontSize: 18, fontWeight: '800' },
  overallName: { fontSize: 11, fontWeight: '600', color: '#666', maxWidth: 80, textAlign: 'center' },
  starRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  starText: { fontSize: 12, fontWeight: '600', color: '#333' },
  // Prices
  priceCompRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  priceCompInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, width: 90 },
  priceCompName: { fontSize: 12, fontWeight: '600', color: '#333', flex: 1 },
  priceBarWrap: { flex: 1 },
  priceCompVal: { fontSize: 15, fontWeight: '800', width: 50, textAlign: 'right' },
  platformHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  platformDot: { width: 10, height: 10, borderRadius: 5 },
  platformGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  platformCard: { width: (width - 72) / 2, backgroundColor: '#f9f9f9', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#eee', alignItems: 'center' },
  lowestBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginBottom: 6 },
  lowestText: { color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  platformName: { fontSize: 12, color: '#999', marginBottom: 4 },
  platformPrice: { fontSize: 22, fontWeight: '800', color: '#333' },
  platformPerNight: { fontSize: 11, color: '#bbb' },
  // Features
  featureHeaderRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 10, marginBottom: 4 },
  featureLabelCol: { flex: 1.5, flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureHotelCol: { flex: 1, alignItems: 'center', gap: 2 },
  featureHotelDot: { width: 10, height: 10, borderRadius: 5 },
  featureHotelName: { fontSize: 10, fontWeight: '600', color: '#666' },
  featureRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  featureRowAlt: { backgroundColor: '#fafafa' },
  featureLabel: { fontSize: 13, color: '#333', fontWeight: '500' },
  featureSummary: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  featureSummaryItem: { alignItems: 'center' },
  featureSummaryCount: { fontSize: 18, fontWeight: '800' },
  featureSummaryLabel: { fontSize: 11, color: '#999' },
  // Trip Match
  tripCard: { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 12, boxShadow: '0px 2px 6px rgba(0,0,0,0.04)', elevation: 2 },
  tripHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  tripIconWrap: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  tripLabel: { fontSize: 15, fontWeight: '700', color: '#333' },
  tripRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  tripHotelName: { fontSize: 12, fontWeight: '500', color: '#666', width: 80 },
  tripBarWrap: { flex: 1 },
  tripPercent: { fontSize: 14, fontWeight: '800', width: 40, textAlign: 'right' },
  bestForCard: { borderRadius: 20, overflow: 'hidden', marginBottom: 14 },
  bestForGradient: { padding: 18, gap: 10 },
  bestForTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  bestForRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  bestForTrip: { fontSize: 13, color: 'rgba(255,255,255,0.7)', width: 70 },
  bestForHotel: { flex: 1, fontSize: 13, fontWeight: '600', color: '#fff' },
  bestForScore: { fontSize: 14, fontWeight: '800', color: '#FFD700' },
});

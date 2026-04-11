import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
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
  withSequence,
  withTiming,
  withRepeat,
  Easing,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  ZoomIn,
  Layout,
} from 'react-native-reanimated';
import { hotels, categories, categoryColors, Hotel } from '../../src/data/hotels';

const { width } = Dimensions.get('window');
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const amenityIcons: { [key: string]: string } = {
  wifi: 'wifi',
  restaurant: 'restaurant',
  'fitness-center': 'fitness',
  car: 'car',
  cafe: 'cafe',
};

const HotelCard = ({
  hotel,
  index,
  compareMode,
  isSelected,
  onToggleSelect,
}: {
  hotel: Hotel;
  index: number;
  compareMode: boolean;
  isSelected: boolean;
  onToggleSelect: (id: number) => void;
}) => {
  const cardScale = useSharedValue(1);
  const heartScale = useSharedValue(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const colors = categoryColors[hotel.category] || categoryColors.budget;

  const handlePress = () => {
    if (compareMode) {
      onToggleSelect(hotel.id);
      return;
    }
    cardScale.value = withSequence(
      withTiming(0.97, { duration: 100 }),
      withSpring(1)
    );
    setTimeout(() => router.push(`/(main)/hotel-details?id=${hotel.id}`), 150);
  };

  const handleFavorite = () => {
    heartScale.value = withSequence(withTiming(1.3, { duration: 150 }), withSpring(1));
    setIsFavorite(!isFavorite);
  };

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));
  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const lowestPrice = Math.min(...hotel.platformPrices.map((p) => p.price));
  const avgScore = Object.values(hotel.amenityScores).reduce((a, b) => a + b, 0) / 5;

  return (
    <Animated.View entering={FadeInDown.delay(index * 90).springify()} layout={Layout.springify()}>
      <AnimatedTouchable
        style={[styles.card, cardStyle, isSelected && { borderWidth: 2, borderColor: colors.accent }]}
        onPress={handlePress}
        activeOpacity={1}
      >
        {/* Top gradient strip */}
        <View style={styles.cardGradientBar}>
          <LinearGradient
            colors={colors.gradient}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
          <View style={styles.cardGradientContent}>
            <View style={styles.cardCategoryPill}>
              <Text style={styles.cardCategoryText}>{hotel.category.toUpperCase()}</Text>
            </View>
            <View style={styles.cardGradientRight}>
              {hotel.petFriendly && (
                <View style={styles.petDot}>
                  <Ionicons name="paw" size={10} color="#fff" />
                </View>
              )}
              {compareMode ? (
                <View style={[styles.selectCheck, isSelected && { backgroundColor: '#fff' }]}>
                  {isSelected && <Ionicons name="checkmark" size={14} color={colors.accent} />}
                </View>
              ) : (
                <AnimatedTouchable style={heartStyle} onPress={handleFavorite}>
                  <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={18} color={isFavorite ? '#ff4757' : '#fff'} />
                </AnimatedTouchable>
              )}
            </View>
          </View>
        </View>

        {/* Card body */}
        <View style={styles.cardBody}>
          <View style={styles.cardRow1}>
            <View style={styles.cardNameCol}>
              <Text style={styles.cardName} numberOfLines={1}>{hotel.name}</Text>
              <View style={styles.cardLocRow}>
                <Ionicons name="location" size={12} color={colors.accent} />
                <Text style={styles.cardLoc} numberOfLines={1}>{hotel.location}</Text>
              </View>
            </View>
            {/* Score circle */}
            <View style={[styles.scoreCircle, { borderColor: colors.accent }]}>
              <Text style={[styles.scoreVal, { color: colors.accent }]}>{avgScore.toFixed(1)}</Text>
            </View>
          </View>

          {/* Rating + Reviews */}
          <View style={styles.cardMeta}>
            <View style={styles.ratingPill}>
              <Ionicons name="star" size={11} color="#FFD700" />
              <Text style={styles.ratingVal}>{hotel.rating}</Text>
            </View>
            <Text style={styles.reviewCount}>{hotel.reviews.toLocaleString()} reviews</Text>
          </View>

          {/* Amenity dots */}
          <View style={styles.amenityRow}>
            {hotel.amenities.slice(0, 4).map((a, i) => (
              <Animated.View key={a} entering={ZoomIn.delay(index * 90 + i * 40)} style={[styles.amenityDot, { backgroundColor: colors.accent + '15' }]}>
                <Ionicons name={amenityIcons[a] as any} size={13} color={colors.accent} />
              </Animated.View>
            ))}
            {hotel.amenities.length > 4 && (
              <View style={[styles.amenityDot, { backgroundColor: '#1a1a2e' }]}>
                <Text style={styles.amenityMore}>+{hotel.amenities.length - 4}</Text>
              </View>
            )}
          </View>

          {/* Price bar */}
          <View style={styles.priceBar}>
            <View>
              <Text style={styles.priceFrom}>From</Text>
              <View style={styles.priceValRow}>
                <Text style={[styles.priceVal, { color: colors.accent }]}>${lowestPrice}</Text>
                <Text style={styles.priceNight}>/night</Text>
              </View>
            </View>
            <View style={styles.platformCount}>
              <Ionicons name="globe-outline" size={14} color="rgba(255,255,255,0.5)" />
              <Text style={styles.platformCountText}>{hotel.platformPrices.length} sites</Text>
            </View>
          </View>
        </View>
      </AnimatedTouchable>
    </Animated.View>
  );
};

export default function HotelListingScreen() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const insets = useSafeAreaInsets();

  const glowOpacity = useSharedValue(0.3);
  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(withTiming(0.5, { duration: 2500 }), withTiming(0.3, { duration: 2500 })),
      -1, true
    );
  }, []);
  const glowStyle = useAnimatedStyle(() => ({ opacity: glowOpacity.value }));

  let filteredHotels = activeFilter === 'all' ? hotels : hotels.filter((h) => h.category === activeFilter);
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredHotels = filteredHotels.filter(
      (h) => h.name.toLowerCase().includes(q) || h.location.toLowerCase().includes(q)
    );
  }

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const exitCompareMode = () => { setCompareMode(false); setSelectedIds([]); };

  const goToCompare = () => {
    if (selectedIds.length < 2) return;
    router.push(`/(main)/comparison-detail?ids=${selectedIds.join(',')}`);
  };

  const selectedHotels = hotels.filter((h) => selectedIds.includes(h.id));

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
      {/* Decorative orbs */}
      <Animated.View style={[styles.orb, styles.orb1, glowStyle]} />
      <Animated.View style={[styles.orb, styles.orb2, glowStyle]} />

      {/* Header */}
      <Animated.View
        entering={FadeInDown.springify()}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => compareMode ? exitCompareMode() : router.back()}>
            <BlurView intensity={30} style={styles.backBtnBlur} tint="dark">
              <Ionicons name={compareMode ? 'close' : 'arrow-back'} size={22} color="#fff" />
            </BlurView>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>
              {compareMode ? 'Select Hotels' : 'Find Hotels'}
            </Text>
            <Text style={styles.headerSub}>
              {compareMode
                ? `${selectedIds.length}/3 selected for compare`
                : `New York · ${filteredHotels.length} results`}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.compareToggle, compareMode && styles.compareToggleOn]}
            onPress={() => compareMode ? exitCompareMode() : setCompareMode(true)}
          >
            <Ionicons name="git-compare-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        {!compareMode && (
          <Animated.View entering={FadeInUp.delay(200)} style={styles.searchWrap}>
            <BlurView intensity={20} style={styles.searchBlur} tint="dark">
              <Ionicons name="search" size={18} color="rgba(255,255,255,0.5)" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search hotel or location..."
                placeholderTextColor="rgba(255,255,255,0.35)"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.4)" />
                </TouchableOpacity>
              )}
            </BlurView>
          </Animated.View>
        )}

        {compareMode && (
          <Animated.View entering={FadeInUp.delay(100)} style={styles.hintPill}>
            <Ionicons name="information-circle" size={14} color="rgba(255,255,255,0.7)" />
            <Text style={styles.hintText}>Tap 2–3 hotels to compare side-by-side</Text>
          </Animated.View>
        )}
      </Animated.View>

      {/* Category Filters */}
      <Animated.View entering={FadeInDown.delay(300)} style={styles.filtersBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {categories.map((cat, i) => {
            const isActive = activeFilter === cat.id;
            return (
              <Animated.View key={cat.id} entering={SlideInRight.delay(350 + i * 60)}>
                <TouchableOpacity
                  style={[styles.filterPill, isActive && { backgroundColor: cat.accent }]}
                  onPress={() => setActiveFilter(cat.id)}
                >
                  <Ionicons name={cat.icon as any} size={13} color={isActive ? '#fff' : cat.accent} />
                  <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{cat.name}</Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </ScrollView>
      </Animated.View>

      {/* Hotel list */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + (compareMode && selectedIds.length >= 1 ? 110 : 20),
        }}
        showsVerticalScrollIndicator={false}
      >
        {filteredHotels.map((hotel, index) => (
          <HotelCard
            key={hotel.id}
            hotel={hotel}
            index={index}
            compareMode={compareMode}
            isSelected={selectedIds.includes(hotel.id)}
            onToggleSelect={toggleSelect}
          />
        ))}
        {filteredHotels.length === 0 && (
          <Animated.View entering={FadeInDown} style={styles.empty}>
            <Ionicons name="search-outline" size={44} color="rgba(255,255,255,0.2)" />
            <Text style={styles.emptyTitle}>No hotels found</Text>
            <Text style={styles.emptySub}>Try a different search or category</Text>
          </Animated.View>
        )}
      </ScrollView>

      {/* Floating Compare Bar */}
      {compareMode && selectedIds.length >= 1 && (
        <Animated.View entering={FadeInUp.springify()} style={[styles.compareBar, { paddingBottom: insets.bottom + 14 }]}>
          <BlurView intensity={60} style={styles.compareBarBlur} tint="dark">
            <View style={styles.compareBarLeft}>
              <View style={styles.dotRow}>
                {selectedHotels.map((h) => (
                  <TouchableOpacity key={h.id} style={[styles.selDot, { backgroundColor: h.accent }]} onPress={() => toggleSelect(h.id)}>
                    <Text style={styles.selDotText}>{h.name.charAt(0)}</Text>
                  </TouchableOpacity>
                ))}
                {Array.from({ length: 3 - selectedIds.length }).map((_, i) => (
                  <View key={`e-${i}`} style={styles.emptyDot}>
                    <Ionicons name="add" size={12} color="rgba(255,255,255,0.3)" />
                  </View>
                ))}
              </View>
              <Text style={styles.compareBarLabel}>
                {selectedIds.length < 2 ? 'Select 1 more' : `${selectedIds.length} ready to compare`}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.compareBtn, selectedIds.length < 2 && { opacity: 0.4 }]}
              onPress={goToCompare}
              disabled={selectedIds.length < 2}
            >
              <LinearGradient colors={['#667eea', '#764ba2']} style={styles.compareBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Ionicons name="git-compare-outline" size={16} color="#fff" />
                <Text style={styles.compareBtnText}>Compare</Text>
              </LinearGradient>
            </TouchableOpacity>
          </BlurView>
        </Animated.View>
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
  headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  backBtn: { width: 42, height: 42, borderRadius: 14, overflow: 'hidden' },
  backBtnBlur: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)' },
  headerInfo: { flex: 1, marginLeft: 12 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  compareToggle: { width: 42, height: 42, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center' },
  compareToggleOn: { backgroundColor: 'rgba(102,126,234,0.4)' },
  searchWrap: { borderRadius: 14, overflow: 'hidden' },
  searchBlur: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, height: 48, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 14, gap: 10 },
  searchInput: { flex: 1, color: '#fff', fontSize: 14 },
  hintPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(102,126,234,0.2)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, alignSelf: 'flex-start' },
  hintText: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  filtersBar: { paddingVertical: 10 },
  filterScroll: { paddingHorizontal: 16, gap: 8 },
  filterPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  filterText: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.55)' },
  filterTextActive: { color: '#fff' },
  list: { flex: 1 },
  // Card
  card: { borderRadius: 18, overflow: 'hidden', marginBottom: 14, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  cardGradientBar: { height: 36 },
  cardGradientContent: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12 },
  cardCategoryPill: { backgroundColor: 'rgba(0,0,0,0.25)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  cardCategoryText: { color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  cardGradientRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  petDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center' },
  selectCheck: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  cardBody: { padding: 14 },
  cardRow1: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cardNameCol: { flex: 1, marginRight: 10 },
  cardName: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 3 },
  cardLocRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardLoc: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  scoreCircle: { width: 44, height: 44, borderRadius: 22, borderWidth: 2.5, justifyContent: 'center', alignItems: 'center' },
  scoreVal: { fontSize: 14, fontWeight: '800' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  ratingPill: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(255,215,0,0.15)', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  ratingVal: { fontSize: 12, fontWeight: '700', color: '#FFD700' },
  reviewCount: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
  amenityRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  amenityDot: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  amenityMore: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.5)' },
  priceBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', paddingTop: 10 },
  priceFrom: { fontSize: 10, color: 'rgba(255,255,255,0.4)' },
  priceValRow: { flexDirection: 'row', alignItems: 'baseline' },
  priceVal: { fontSize: 22, fontWeight: '800' },
  priceNight: { fontSize: 12, color: 'rgba(255,255,255,0.35)', marginLeft: 2 },
  platformCount: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  platformCountText: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
  // Empty
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: 'rgba(255,255,255,0.3)' },
  emptySub: { fontSize: 13, color: 'rgba(255,255,255,0.2)' },
  // Compare bar
  compareBar: { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopLeftRadius: 22, borderTopRightRadius: 22, overflow: 'hidden' },
  compareBarBlur: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 14, backgroundColor: 'rgba(15,12,41,0.85)' },
  compareBarLeft: { flex: 1, gap: 4 },
  dotRow: { flexDirection: 'row', gap: 8 },
  selDot: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  selDotText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  emptyDot: { width: 30, height: 30, borderRadius: 15, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
  compareBarLabel: { fontSize: 11, color: 'rgba(255,255,255,0.5)' },
  compareBtn: { borderRadius: 14, overflow: 'hidden' },
  compareBtnGrad: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingVertical: 13 },
  compareBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});

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
  withSequence,
  withTiming,
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
  const categoryInfo = categories.find((c) => c.id === hotel.category);

  const handlePress = () => {
    if (compareMode) {
      onToggleSelect(hotel.id);
      return;
    }
    cardScale.value = withSequence(
      withTiming(0.98, { duration: 100 }),
      withSpring(1)
    );
    setTimeout(() => {
      router.push(`/(main)/hotel-details?id=${hotel.id}`);
    }, 150);
  };

  const handleFavorite = () => {
    heartScale.value = withSequence(
      withTiming(1.3, { duration: 150 }),
      withSpring(1)
    );
    setIsFavorite(!isFavorite);
  };

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  return (
    <Animated.View entering={SlideInRight.delay(index * 100).springify()} layout={Layout.springify()}>
      <AnimatedTouchable
        style={[
          styles.hotelCard,
          cardStyle,
          isSelected && { borderWidth: 2.5, borderColor: colors.accent },
        ]}
        onPress={handlePress}
        activeOpacity={1}
      >
        <View style={styles.cardImageContainer}>
          <LinearGradient
            colors={colors.gradient}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image" size={40} color="rgba(255,255,255,0.3)" />
          </View>

          {/* Category Badge */}
          <View style={styles.categoryBadge}>
            <Ionicons name={categoryInfo?.icon as any || 'pricetag'} size={12} color="#fff" />
            <Text style={styles.categoryBadgeText}>{categoryInfo?.name}</Text>
          </View>

          {/* Compare Selection Checkbox */}
          {compareMode && (
            <View style={[styles.selectCircle, isSelected && { backgroundColor: colors.accent, borderColor: colors.accent }]}>
              {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
          )}

          {/* Favorite button - hidden in compare mode */}
          {!compareMode && (
            <AnimatedTouchable
              style={[styles.favoriteButton, heartStyle]}
              onPress={handleFavorite}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={22}
                color={isFavorite ? '#ff4757' : '#fff'}
              />
            </AnimatedTouchable>
          )}

          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingBadgeText}>{hotel.rating}</Text>
          </View>

          {/* Pet badge */}
          {hotel.petFriendly && (
            <View style={styles.petIndicator}>
              <Ionicons name="paw" size={12} color="#fff" />
            </View>
          )}
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.hotelName}>{hotel.name}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color="#999" />
            <Text style={styles.locationText}>{hotel.location}</Text>
          </View>

          <View style={styles.amenitiesRow}>
            {hotel.amenities.slice(0, 4).map((amenity, i) => (
              <Animated.View
                key={amenity}
                entering={ZoomIn.delay(index * 100 + i * 50)}
                style={[styles.amenityIcon, { backgroundColor: colors.accent + '15' }]}
              >
                <Ionicons
                  name={amenityIcons[amenity] as any}
                  size={14}
                  color={colors.accent}
                />
              </Animated.View>
            ))}
            {hotel.amenities.length > 4 && (
              <View style={styles.moreAmenities}>
                <Text style={styles.moreAmenitiesText}>+{hotel.amenities.length - 4}</Text>
              </View>
            )}
          </View>

          <View style={styles.priceRow}>
            <View>
              <Text style={styles.reviewsText}>{hotel.reviews.toLocaleString()} reviews</Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={[styles.priceValue, { color: colors.accent }]}>${hotel.price}</Text>
              <Text style={styles.priceNight}>/night</Text>
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
  const insets = useSafeAreaInsets();

  const filteredHotels = activeFilter === 'all'
    ? hotels
    : hotels.filter((h) => h.category === activeFilter);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev; // Max 3
      return [...prev, id];
    });
  };

  const exitCompareMode = () => {
    setCompareMode(false);
    setSelectedIds([]);
  };

  const goToCompare = () => {
    if (selectedIds.length < 2) return;
    router.push(`/(main)/comparison-detail?ids=${selectedIds.join(',')}`);
  };

  // Find selected hotel names for the floating bar
  const selectedHotels = hotels.filter((h) => selectedIds.includes(h.id));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#11998e', '#38ef7d']}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View
          style={styles.headerContent}
          entering={FadeInDown.springify()}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => compareMode ? exitCompareMode() : router.back()}
          >
            <BlurView intensity={30} style={styles.backButtonBlur}>
              <Ionicons name={compareMode ? 'close' : 'arrow-back'} size={24} color="#fff" />
            </BlurView>
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{compareMode ? 'SELECT TO COMPARE' : 'HOTEL COMPARE'}</Text>
            <Text style={styles.headerSubtitle}>
              {compareMode
                ? `${selectedIds.length}/3 hotels selected`
                : `${filteredHotels.length} hotels in New York`}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.compareToggle, compareMode && styles.compareToggleActive]}
            onPress={() => compareMode ? exitCompareMode() : setCompareMode(true)}
          >
            <Ionicons name="git-compare-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </Animated.View>

        {!compareMode && (
          <Animated.View
            style={styles.resultsInfo}
            entering={FadeInUp.delay(200).springify()}
          >
            <TouchableOpacity style={styles.resultsBack}>
              <Ionicons name="chevron-back" size={20} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.resultsText}>{filteredHotels.length} Hotels available</Text>
          </Animated.View>
        )}

        {compareMode && (
          <Animated.View
            entering={FadeInUp.delay(100)}
            style={styles.compareHint}
          >
            <Ionicons name="information-circle" size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.compareHintText}>Tap 2-3 hotels to compare side-by-side</Text>
          </Animated.View>
        )}
      </LinearGradient>

      {/* Category Filter Pills */}
      <Animated.View
        style={styles.filtersContainer}
        entering={FadeInDown.delay(300)}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        >
          <TouchableOpacity
            style={styles.mapButton}
            onPress={() => router.push('/(main)/map-view')}
          >
            <Ionicons name="map" size={18} color="#11998e" />
            <Text style={styles.mapButtonText}>Map</Text>
          </TouchableOpacity>

          {categories.map((cat, index) => {
            const isActive = activeFilter === cat.id;
            return (
              <Animated.View
                key={cat.id}
                entering={SlideInRight.delay(400 + index * 80)}
              >
                <TouchableOpacity
                  style={[
                    styles.filterButton,
                    isActive && { backgroundColor: cat.accent },
                  ]}
                  onPress={() => setActiveFilter(cat.id)}
                >
                  <View style={styles.filterPillContent}>
                    <Ionicons
                      name={cat.icon as any}
                      size={14}
                      color={isActive ? '#fff' : cat.accent}
                    />
                    <Text
                      style={[
                        styles.filterText,
                        isActive && styles.filterTextActive,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </ScrollView>
      </Animated.View>

      {/* Hotel List */}
      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + (compareMode && selectedIds.length >= 2 ? 100 : 20) },
        ]}
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
          <Animated.View entering={FadeInDown} style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>No hotels found</Text>
            <Text style={styles.emptyStateSubtext}>Try a different category</Text>
          </Animated.View>
        )}
      </ScrollView>

      {/* Floating Compare Bar */}
      {compareMode && selectedIds.length >= 1 && (
        <Animated.View
          entering={FadeInUp.springify()}
          style={[styles.compareBar, { paddingBottom: insets.bottom + 14 }]}
        >
          <BlurView intensity={90} tint="light" style={styles.compareBarBlur}>
            {/* Selected Hotel Dots */}
            <View style={styles.compareBarLeft}>
              <View style={styles.selectedDots}>
                {selectedHotels.map((h) => (
                  <TouchableOpacity
                    key={h.id}
                    style={[styles.selectedDot, { backgroundColor: h.accent }]}
                    onPress={() => toggleSelect(h.id)}
                  >
                    <Text style={styles.selectedDotText}>{h.name.charAt(0)}</Text>
                  </TouchableOpacity>
                ))}
                {Array.from({ length: 3 - selectedIds.length }).map((_, i) => (
                  <View key={`empty-${i}`} style={styles.emptyDot}>
                    <Ionicons name="add" size={14} color="#ccc" />
                  </View>
                ))}
              </View>
              <Text style={styles.compareBarCount}>
                {selectedIds.length < 2 ? 'Select 1 more' : `${selectedIds.length} ready`}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.compareBarBtn,
                selectedIds.length < 2 && styles.compareBarBtnDisabled,
              ]}
              onPress={goToCompare}
              disabled={selectedIds.length < 2}
            >
              <LinearGradient
                colors={selectedIds.length >= 2 ? ['#667eea', '#764ba2'] : ['#ccc', '#ddd']}
                style={styles.compareBarBtnGrad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="git-compare-outline" size={18} color="#fff" />
                <Text style={styles.compareBarBtnText}>Compare</Text>
              </LinearGradient>
            </TouchableOpacity>
          </BlurView>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { paddingBottom: 20 },
  headerContent: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, marginBottom: 15,
  },
  backButton: { width: 45, height: 45, borderRadius: 15, overflow: 'hidden' },
  backButtonBlur: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerInfo: { flex: 1, marginLeft: 15 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  compareToggle: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  compareToggleActive: { backgroundColor: 'rgba(255,255,255,0.4)' },
  resultsInfo: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15 },
  resultsBack: { marginRight: 10 },
  resultsText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  compareHint: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 15, paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10,
    marginHorizontal: 15, alignSelf: 'flex-start',
  },
  compareHintText: { fontSize: 12, color: 'rgba(255,255,255,0.9)' },
  filtersContainer: {
    backgroundColor: '#fff', paddingVertical: 15,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 3,
  },
  filtersScroll: { paddingHorizontal: 15, gap: 10 },
  mapButton: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10,
    borderRadius: 20, borderWidth: 1, borderColor: '#11998e', gap: 5,
  },
  mapButtonText: { fontSize: 14, fontWeight: '600', color: '#11998e' },
  filterButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#f5f5f5' },
  filterPillContent: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  filterText: { fontSize: 13, fontWeight: '600', color: '#666' },
  filterTextActive: { color: '#fff' },
  listContainer: { flex: 1 },
  listContent: { padding: 15 },
  hotelCard: {
    backgroundColor: '#fff', borderRadius: 20, marginBottom: 15, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5,
  },
  cardImageContainer: { height: 150, position: 'relative' },
  imagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  selectCircle: {
    position: 'absolute', top: 15, right: 15,
    width: 32, height: 32, borderRadius: 16,
    borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.8)',
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center', alignItems: 'center',
  },
  favoriteButton: {
    position: 'absolute', top: 15, right: 15,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center', alignItems: 'center',
  },
  ratingBadge: {
    position: 'absolute', bottom: 15, left: 15,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 15, gap: 4,
  },
  ratingBadgeText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  petIndicator: {
    position: 'absolute', bottom: 15, right: 15,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(29,151,108,0.7)',
    justifyContent: 'center', alignItems: 'center',
  },
  categoryBadge: {
    position: 'absolute', top: 15, left: 15,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, gap: 4,
  },
  categoryBadgeText: {
    color: '#fff', fontSize: 11, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  cardContent: { padding: 15 },
  hotelName: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 5 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 10 },
  locationText: { fontSize: 14, color: '#999' },
  amenitiesRow: { flexDirection: 'row', gap: 8, marginBottom: 15 },
  amenityIcon: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: 'rgba(17, 153, 142, 0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  moreAmenities: {
    width: 30, height: 30, borderRadius: 8, backgroundColor: '#f0f0f0',
    justifyContent: 'center', alignItems: 'center',
  },
  moreAmenitiesText: { fontSize: 10, fontWeight: '600', color: '#666' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewsText: { fontSize: 12, color: '#999' },
  priceContainer: { flexDirection: 'row', alignItems: 'baseline' },
  priceValue: { fontSize: 22, fontWeight: '800', color: '#11998e' },
  priceNight: { fontSize: 14, color: '#999', marginLeft: 2 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 10 },
  emptyStateText: { fontSize: 18, fontWeight: '700', color: '#999' },
  emptyStateSubtext: { fontSize: 14, color: '#bbb' },
  // Floating Compare Bar
  compareBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    borderTopLeftRadius: 22, borderTopRightRadius: 22, overflow: 'hidden',
  },
  compareBarBlur: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingTop: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  compareBarLeft: { flex: 1, gap: 6 },
  selectedDots: { flexDirection: 'row', gap: 8 },
  selectedDot: {
    width: 34, height: 34, borderRadius: 17,
    justifyContent: 'center', alignItems: 'center',
  },
  selectedDotText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  emptyDot: {
    width: 34, height: 34, borderRadius: 17,
    borderWidth: 2, borderColor: '#e0e0e0', borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center',
  },
  compareBarCount: { fontSize: 12, color: '#999', fontWeight: '500' },
  compareBarBtn: { borderRadius: 14, overflow: 'hidden' },
  compareBarBtnDisabled: { opacity: 0.5 },
  compareBarBtnGrad: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 22, paddingVertical: 14,
  },
  compareBarBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});

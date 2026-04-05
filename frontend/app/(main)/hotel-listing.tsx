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

const { width } = Dimensions.get('window');
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// Category definitions with colors
const categories = [
  { id: 'all', name: 'All', gradient: ['#333', '#666'], accent: '#333', icon: 'grid' },
  { id: 'luxury', name: 'Luxury', gradient: ['#667eea', '#764ba2'], accent: '#667eea', icon: 'diamond' },
  { id: 'budget', name: 'Budget', gradient: ['#11998e', '#38ef7d'], accent: '#11998e', icon: 'wallet' },
  { id: 'business', name: 'Business', gradient: ['#2193b0', '#6dd5ed'], accent: '#2193b0', icon: 'briefcase' },
  { id: 'romantic', name: 'Romantic', gradient: ['#ee0979', '#ff6a00'], accent: '#ee0979', icon: 'heart' },
  { id: 'family', name: 'Family', gradient: ['#fc4a1a', '#f7b733'], accent: '#fc4a1a', icon: 'people' },
  { id: 'adventure', name: 'Adventure', gradient: ['#FF416C', '#FF4B2B'], accent: '#FF416C', icon: 'compass' },
  { id: 'wellness', name: 'Wellness', gradient: ['#1D976C', '#93F9B9'], accent: '#1D976C', icon: 'leaf' },
];

// Unique color gradients for each hotel (mapped by category)
const hotelColors: { [key: string]: { gradient: string[], accent: string } } = {
  luxury: { gradient: ['#667eea', '#764ba2'], accent: '#667eea' },
  budget: { gradient: ['#11998e', '#38ef7d'], accent: '#11998e' },
  family: { gradient: ['#fc4a1a', '#f7b733'], accent: '#fc4a1a' },
  romantic: { gradient: ['#ee0979', '#ff6a00'], accent: '#ee0979' },
  business: { gradient: ['#2193b0', '#6dd5ed'], accent: '#2193b0' },
  adventure: { gradient: ['#FF416C', '#FF4B2B'], accent: '#FF416C' },
  wellness: { gradient: ['#1D976C', '#93F9B9'], accent: '#1D976C' },
};

const hotels = [
  {
    id: 1,
    name: 'The Grand Palace Hotel',
    location: 'Downtown, New York',
    price: 245,
    rating: 4.9,
    reviews: 2340,
    amenities: ['wifi', 'restaurant', 'fitness-center', 'car'],
    image: 'hotel1',
    category: 'luxury',
  },
  {
    id: 2,
    name: 'Budget Inn Express',
    location: 'Midtown, New York',
    price: 65,
    rating: 4.2,
    reviews: 1856,
    amenities: ['wifi', 'cafe'],
    image: 'hotel2',
    category: 'budget',
  },
  {
    id: 3,
    name: 'Family Fun Resort',
    location: 'Central Park, New York',
    price: 155,
    rating: 4.5,
    reviews: 3210,
    amenities: ['wifi', 'restaurant', 'fitness-center'],
    image: 'hotel3',
    category: 'family',
  },
  {
    id: 4,
    name: 'Royal Romance Suites',
    location: 'Times Square, New York',
    price: 195,
    rating: 4.8,
    reviews: 4521,
    amenities: ['wifi', 'restaurant', 'fitness-center', 'car', 'cafe'],
    image: 'hotel4',
    category: 'romantic',
  },
  {
    id: 5,
    name: 'Executive Tower Hotel',
    location: 'SoHo, New York',
    price: 185,
    rating: 4.6,
    reviews: 1245,
    amenities: ['wifi', 'cafe', 'restaurant'],
    image: 'hotel5',
    category: 'business',
  },
  {
    id: 6,
    name: 'Adventure Base Camp',
    location: 'Upper East Side, New York',
    price: 125,
    rating: 4.7,
    reviews: 2890,
    amenities: ['wifi', 'restaurant', 'fitness-center'],
    image: 'hotel6',
    category: 'adventure',
  },
  {
    id: 7,
    name: 'Serenity Spa Resort',
    location: 'Chelsea, New York',
    price: 175,
    rating: 4.4,
    reviews: 1678,
    amenities: ['wifi', 'restaurant', 'cafe', 'fitness-center'],
    image: 'hotel7',
    category: 'wellness',
  },
  {
    id: 8,
    name: 'The Ritz Platinum',
    location: 'Battery Park, New York',
    price: 320,
    rating: 4.9,
    reviews: 5234,
    amenities: ['wifi', 'restaurant', 'fitness-center', 'car', 'cafe'],
    image: 'hotel8',
    category: 'luxury',
  },
  {
    id: 9,
    name: 'Thrifty Stay Motel',
    location: 'Greenwich Village, New York',
    price: 55,
    rating: 4.0,
    reviews: 2156,
    amenities: ['wifi'],
    image: 'hotel9',
    category: 'budget',
  },
  {
    id: 10,
    name: 'Kids Paradise Hotel',
    location: 'Upper West Side, New York',
    price: 145,
    rating: 4.3,
    reviews: 1432,
    amenities: ['wifi', 'cafe', 'restaurant'],
    image: 'hotel10',
    category: 'family',
  },
  {
    id: 11,
    name: 'Corporate Suites NYC',
    location: 'Financial District, New York',
    price: 195,
    rating: 4.6,
    reviews: 3567,
    amenities: ['wifi', 'restaurant', 'fitness-center', 'car'],
    image: 'hotel11',
    category: 'business',
  },
  {
    id: 12,
    name: 'Honeymoon Haven',
    location: 'Tribeca, New York',
    price: 225,
    rating: 4.8,
    reviews: 4123,
    amenities: ['wifi', 'restaurant', 'fitness-center', 'car', 'cafe'],
    image: 'hotel12',
    category: 'romantic',
  },
  {
    id: 13,
    name: 'Extreme Sports Lodge',
    location: 'East Village, New York',
    price: 115,
    rating: 4.5,
    reviews: 987,
    amenities: ['wifi', 'cafe', 'fitness-center'],
    image: 'hotel13',
    category: 'adventure',
  },
  {
    id: 14,
    name: 'Zen Garden Retreat',
    location: 'Hell\'s Kitchen, New York',
    price: 165,
    rating: 4.7,
    reviews: 2345,
    amenities: ['wifi', 'restaurant', 'fitness-center'],
    image: 'hotel14',
    category: 'wellness',
  },
  {
    id: 15,
    name: 'Value Stay Plus',
    location: 'Brooklyn Heights, New York',
    price: 75,
    rating: 4.1,
    reviews: 1876,
    amenities: ['wifi', 'cafe'],
    image: 'hotel15',
    category: 'budget',
  },
  {
    id: 16,
    name: 'Imperial Luxury Palace',
    location: 'Williamsburg, New York',
    price: 285,
    rating: 4.8,
    reviews: 1234,
    amenities: ['wifi', 'restaurant', 'fitness-center', 'car', 'cafe'],
    image: 'hotel16',
    category: 'luxury',
  },
];

const HotelCard = ({ hotel, index }: { hotel: typeof hotels[0]; index: number }) => {
  const cardScale = useSharedValue(1);
  const heartScale = useSharedValue(1);
  const [isFavorite, setIsFavorite] = useState(false);

  // Get colors based on category
  const colors = hotelColors[hotel.category] || hotelColors.budget;

  const handlePress = () => {
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

  const amenityIcons: { [key: string]: string } = {
    wifi: 'wifi',
    restaurant: 'restaurant',
    'fitness-center': 'fitness',
    car: 'car',
    cafe: 'cafe',
  };

  // Get category info for badge
  const categoryInfo = categories.find(c => c.id === hotel.category);

  return (
    <Animated.View
      entering={SlideInRight.delay(index * 100).springify()}
    >
      <AnimatedTouchable
        style={[styles.hotelCard, cardStyle]}
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
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingBadgeText}>{hotel.rating}</Text>
          </View>
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
  const insets = useSafeAreaInsets();

  const filteredHotels = activeFilter === 'all'
    ? hotels
    : hotels.filter((h) => h.category === activeFilter);

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
            onPress={() => router.back()}
          >
            <BlurView intensity={30} style={styles.backButtonBlur}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </BlurView>
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>HOTEL BOOKING</Text>
            <Text style={styles.headerSubtitle}>3 nights (14 Feb - 17 Feb)</Text>
          </View>

          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={styles.resultsInfo}
          entering={FadeInUp.delay(200).springify()}
        >
          <TouchableOpacity style={styles.resultsBack}>
            <Ionicons name="chevron-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.resultsText}>{filteredHotels.length} Hotels available</Text>
        </Animated.View>
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
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {filteredHotels.map((hotel, index) => (
          <HotelCard key={hotel.id} hotel={hotel} index={index} />
        ))}

        {filteredHotels.length === 0 && (
          <Animated.View entering={FadeInDown} style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>No hotels found</Text>
            <Text style={styles.emptyStateSubtext}>Try a different category</Text>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  backButton: {
    width: 45,
    height: 45,
    borderRadius: 15,
    overflow: 'hidden',
  },
  backButtonBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  menuButton: {
    padding: 10,
  },
  resultsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  resultsBack: {
    marginRight: 10,
  },
  resultsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  filtersScroll: {
    paddingHorizontal: 15,
    gap: 10,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#11998e',
    gap: 5,
  },
  mapButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#11998e',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  filterPillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 15,
  },
  hotelCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
  },
  cardImageContainer: {
    height: 150,
    position: 'relative',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    gap: 4,
  },
  ratingBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  cardContent: {
    padding: 15,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 5,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 10,
  },
  locationText: {
    fontSize: 14,
    color: '#999',
  },
  amenitiesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 15,
  },
  amenityIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(17, 153, 142, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreAmenities: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreAmenitiesText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewsText: {
    fontSize: 12,
    color: '#999',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#11998e',
  },
  priceNight: {
    fontSize: 14,
    color: '#999',
    marginLeft: 2,
  },
  categoryBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  categoryBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: 10,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#999',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#bbb',
  },
});

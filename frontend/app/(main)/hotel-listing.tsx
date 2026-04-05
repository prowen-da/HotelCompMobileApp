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
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// Unique color gradients for each hotel
const hotelColors = [
  { gradient: ['#667eea', '#764ba2'], accent: '#667eea' },  // Purple/Indigo
  { gradient: ['#11998e', '#38ef7d'], accent: '#11998e' },  // Teal/Green
  { gradient: ['#fc4a1a', '#f7b733'], accent: '#fc4a1a' },  // Orange/Yellow
  { gradient: ['#ee0979', '#ff6a00'], accent: '#ee0979' },  // Pink/Orange
  { gradient: ['#4776E6', '#8E54E9'], accent: '#4776E6' },  // Blue/Purple
  { gradient: ['#00c6ff', '#0072ff'], accent: '#0072ff' },  // Cyan/Blue
  { gradient: ['#f953c6', '#b91d73'], accent: '#b91d73' },  // Magenta/Pink
  { gradient: ['#1D976C', '#93F9B9'], accent: '#1D976C' },  // Green/Mint
  { gradient: ['#FF416C', '#FF4B2B'], accent: '#FF416C' },  // Red/Coral
  { gradient: ['#654ea3', '#eaafc8'], accent: '#654ea3' },  // Lavender/Pink
  { gradient: ['#2193b0', '#6dd5ed'], accent: '#2193b0' },  // Ocean Blue
  { gradient: ['#cc2b5e', '#753a88'], accent: '#753a88' },  // Wine/Purple
  { gradient: ['#42275a', '#734b6d'], accent: '#734b6d' },  // Dark Purple
  { gradient: ['#de6262', '#ffb88c'], accent: '#de6262' },  // Peach/Salmon
  { gradient: ['#06beb6', '#48b1bf'], accent: '#06beb6' },  // Aqua/Teal
  { gradient: ['#eb3349', '#f45c43'], accent: '#eb3349' },  // Cherry Red
];

const hotels = [
  {
    id: 1,
    name: 'The Grand Palace Hotel',
    location: 'Downtown, New York',
    price: 145,
    rating: 4.6,
    reviews: 2340,
    amenities: ['wifi', 'restaurant', 'fitness-center', 'car'],
    image: 'hotel1',
    colorIndex: 0,
  },
  {
    id: 2,
    name: 'Urban Nest Suites',
    location: 'Midtown, New York',
    price: 120,
    rating: 4.2,
    reviews: 1856,
    amenities: ['wifi', 'restaurant', 'cafe'],
    image: 'hotel2',
    colorIndex: 1,
  },
  {
    id: 3,
    name: 'Lakeview Residency',
    location: 'Central Park, New York',
    price: 95,
    rating: 4.5,
    reviews: 3210,
    amenities: ['wifi', 'restaurant', 'fitness-center'],
    image: 'hotel3',
    colorIndex: 2,
  },
  {
    id: 4,
    name: 'Royal Orchid Central',
    location: 'Times Square, New York',
    price: 180,
    rating: 4.8,
    reviews: 4521,
    amenities: ['wifi', 'restaurant', 'fitness-center', 'car', 'cafe'],
    image: 'hotel4',
    colorIndex: 3,
  },
  {
    id: 5,
    name: 'Bloom Boutique Hotel',
    location: 'SoHo, New York',
    price: 110,
    rating: 4.3,
    reviews: 1245,
    amenities: ['wifi', 'cafe'],
    image: 'hotel5',
    colorIndex: 4,
  },
  {
    id: 6,
    name: 'Skyline Tower Inn',
    location: 'Upper East Side, New York',
    price: 165,
    rating: 4.7,
    reviews: 2890,
    amenities: ['wifi', 'restaurant', 'fitness-center', 'car'],
    image: 'hotel6',
    colorIndex: 5,
  },
  {
    id: 7,
    name: 'The Velvet Rose Hotel',
    location: 'Chelsea, New York',
    price: 135,
    rating: 4.4,
    reviews: 1678,
    amenities: ['wifi', 'restaurant', 'cafe'],
    image: 'hotel7',
    colorIndex: 6,
  },
  {
    id: 8,
    name: 'Harbor View Resort',
    location: 'Battery Park, New York',
    price: 210,
    rating: 4.9,
    reviews: 5234,
    amenities: ['wifi', 'restaurant', 'fitness-center', 'car', 'cafe'],
    image: 'hotel8',
    colorIndex: 7,
  },
  {
    id: 9,
    name: 'Crimson Peak Lodge',
    location: 'Greenwich Village, New York',
    price: 155,
    rating: 4.5,
    reviews: 2156,
    amenities: ['wifi', 'restaurant', 'fitness-center'],
    image: 'hotel9',
    colorIndex: 8,
  },
  {
    id: 10,
    name: 'Lavender Dreams Inn',
    location: 'Upper West Side, New York',
    price: 125,
    rating: 4.3,
    reviews: 1432,
    amenities: ['wifi', 'cafe', 'restaurant'],
    image: 'hotel10',
    colorIndex: 9,
  },
  {
    id: 11,
    name: 'Ocean Breeze Suites',
    location: 'Financial District, New York',
    price: 175,
    rating: 4.6,
    reviews: 3567,
    amenities: ['wifi', 'restaurant', 'fitness-center', 'car'],
    image: 'hotel11',
    colorIndex: 10,
  },
  {
    id: 12,
    name: 'The Burgundy Hotel',
    location: 'Tribeca, New York',
    price: 195,
    rating: 4.8,
    reviews: 4123,
    amenities: ['wifi', 'restaurant', 'fitness-center', 'car', 'cafe'],
    image: 'hotel12',
    colorIndex: 11,
  },
  {
    id: 13,
    name: 'Midnight Star Hotel',
    location: 'East Village, New York',
    price: 88,
    rating: 4.1,
    reviews: 987,
    amenities: ['wifi', 'cafe'],
    image: 'hotel13',
    colorIndex: 12,
  },
  {
    id: 14,
    name: 'Sunset Glow Resort',
    location: 'Hell\'s Kitchen, New York',
    price: 142,
    rating: 4.4,
    reviews: 2345,
    amenities: ['wifi', 'restaurant', 'fitness-center'],
    image: 'hotel14',
    colorIndex: 13,
  },
  {
    id: 15,
    name: 'Aqua Marine Hotel',
    location: 'Brooklyn Heights, New York',
    price: 115,
    rating: 4.2,
    reviews: 1876,
    amenities: ['wifi', 'restaurant', 'cafe'],
    image: 'hotel15',
    colorIndex: 14,
  },
  {
    id: 16,
    name: 'Cherry Blossom Inn',
    location: 'Williamsburg, New York',
    price: 99,
    rating: 4.0,
    reviews: 1234,
    amenities: ['wifi', 'cafe'],
    image: 'hotel16',
    colorIndex: 15,
  },
];

const filters = ['All', 'Price', 'Rating', 'Distance', 'Amenities'];

const HotelCard = ({ hotel, index }: { hotel: typeof hotels[0]; index: number }) => {
  const cardScale = useSharedValue(1);
  const heartScale = useSharedValue(1);
  const [isFavorite, setIsFavorite] = useState(false);

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
            colors={hotelColors[hotel.colorIndex % hotelColors.length].gradient}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image" size={40} color="rgba(255,255,255,0.3)" />
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
                style={[styles.amenityIcon, { backgroundColor: hotelColors[hotel.colorIndex % hotelColors.length].accent + '15' }]}
              >
                <Ionicons
                  name={amenityIcons[amenity] as any}
                  size={14}
                  color={hotelColors[hotel.colorIndex % hotelColors.length].accent}
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
              <Text style={[styles.priceValue, { color: hotelColors[hotel.colorIndex % hotelColors.length].accent }]}>${hotel.price}</Text>
              <Text style={styles.priceNight}>/night</Text>
            </View>
          </View>
        </View>
      </AnimatedTouchable>
    </Animated.View>
  );
};

export default function HotelListingScreen() {
  const [activeFilter, setActiveFilter] = useState('All');
  const insets = useSafeAreaInsets();

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
          <Text style={styles.resultsText}>{hotels.length} Hotels available</Text>
        </Animated.View>
      </LinearGradient>

      {/* Filters */}
      <Animated.View
        style={styles.filtersContainer}
        entering={FadeInDown.delay(300)}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        >
          <TouchableOpacity style={styles.filterIconButton}>
            <Ionicons name="filter" size={18} color="#11998e" />
            <Text style={styles.filterIconText}>Filter</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mapButton}
            onPress={() => router.push('/(main)/map-view')}
          >
            <Ionicons name="map" size={18} color="#11998e" />
            <Text style={styles.mapButtonText}>Map</Text>
          </TouchableOpacity>

          {filters.map((filter, index) => (
            <Animated.View
              key={filter}
              entering={SlideInRight.delay(400 + index * 80)}
            >
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  activeFilter === filter && styles.filterButtonActive,
                ]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text
                  style={[
                    styles.filterText,
                    activeFilter === filter && styles.filterTextActive,
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Hotel List */}
      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {hotels.map((hotel, index) => (
          <HotelCard key={hotel.id} hotel={hotel} index={index} />
        ))}
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
  filterIconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#11998e',
    gap: 5,
  },
  filterIconText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#11998e',
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
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  filterButtonActive: {
    backgroundColor: '#11998e',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
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
});

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
  withSequence,
  withTiming,
  withRepeat,
  Easing,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  ZoomIn,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const hotelData = {
  id: 1,
  name: 'The Grand Palace Hotel',
  location: 'Downtown, New York',
  address: '123 Broadway, New York, NY 10001',
  price: 145,
  rating: 4.6,
  reviews: 2340,
  description:
    'Experience luxury at its finest in the heart of New York City. Our hotel offers stunning views of the skyline, world-class amenities, and exceptional service that will make your stay unforgettable.',
  amenities: [
    { icon: 'wifi', label: 'Free WiFi' },
    { icon: 'restaurant', label: 'Restaurant' },
    { icon: 'fitness', label: 'Gym' },
    { icon: 'car', label: 'Parking' },
    { icon: 'water', label: 'Pool' },
    { icon: 'cafe', label: 'Café' },
    { icon: 'business', label: 'Business Center' },
    { icon: 'snow', label: 'AC' },
  ],
  images: ['img1', 'img2', 'img3', 'img4'],
  reviewHighlights: [
    { category: 'Cleanliness', score: 9.2 },
    { category: 'Service', score: 9.0 },
    { category: 'Location', score: 8.8 },
    { category: 'Value', score: 8.5 },
  ],
};

export default function HotelDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const insets = useSafeAreaInsets();

  const heartScale = useSharedValue(1);
  const bookButtonScale = useSharedValue(1);
  const imageSlide = useSharedValue(0);

  useEffect(() => {
    // Auto-slide images
    const interval = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % hotelData.images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleFavorite = () => {
    heartScale.value = withSequence(
      withTiming(1.4, { duration: 150 }),
      withSpring(1)
    );
    setIsFavorite(!isFavorite);
  };

  const handleBookNow = () => {
    bookButtonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1)
    );
    setTimeout(() => router.push('/(main)/checkout'), 200);
  };

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const bookButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bookButtonScale.value }],
  }));

  const getScoreColor = (score: number) => {
    if (score >= 9) return '#10B981';
    if (score >= 8) return '#6EE7B7';
    return '#FCD34D';
  };

  return (
    <View style={styles.container}>
      {/* Image Carousel */}
      <View style={styles.imageContainer}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.imagePlaceholder}>
          <Ionicons name="image" size={60} color="rgba(255,255,255,0.3)" />
        </View>

        {/* Gradient Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={styles.imageOverlay}
        />

        {/* Header */}
        <Animated.View
          style={[styles.header, { paddingTop: insets.top + 10 }]}
          entering={FadeInDown.springify()}
        >
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <BlurView intensity={80} style={styles.headerButtonBlur} tint="dark">
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </BlurView>
          </TouchableOpacity>

          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerButton}>
              <BlurView intensity={80} style={styles.headerButtonBlur} tint="dark">
                <Ionicons name="share-outline" size={24} color="#fff" />
              </BlurView>
            </TouchableOpacity>
            <AnimatedTouchable
              style={[styles.headerButton, heartStyle]}
              onPress={handleFavorite}
            >
              <BlurView intensity={80} style={styles.headerButtonBlur} tint="dark">
                <Ionicons
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={24}
                  color={isFavorite ? '#ff4757' : '#fff'}
                />
              </BlurView>
            </AnimatedTouchable>
          </View>
        </Animated.View>

        {/* Image Indicators */}
        <View style={styles.imageIndicators}>
          {hotelData.images.map((_, index) => (
            <Animated.View
              key={index}
              entering={ZoomIn.delay(index * 100)}
              style={[
                styles.indicator,
                activeImageIndex === index && styles.indicatorActive,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hotel Info */}
        <Animated.View
          style={styles.infoSection}
          entering={FadeInUp.delay(200).springify()}
        >
          <View style={styles.titleRow}>
            <View style={styles.titleContainer}>
              <Text style={styles.hotelName}>{hotelData.name}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={16} color="#11998e" />
                <Text style={styles.locationText}>{hotelData.location}</Text>
              </View>
            </View>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{hotelData.rating}</Text>
            </View>
          </View>

          <Text style={styles.addressText}>{hotelData.address}</Text>
        </Animated.View>

        {/* Review Scores */}
        <Animated.View
          style={styles.scoresSection}
          entering={FadeInUp.delay(300).springify()}
        >
          <Text style={styles.sectionTitle}>Guest Reviews</Text>
          <Text style={styles.reviewCount}>
            Based on {hotelData.reviews.toLocaleString()} reviews
          </Text>
          <View style={styles.scoresGrid}>
            {hotelData.reviewHighlights.map((item, index) => (
              <Animated.View
                key={item.category}
                entering={ZoomIn.delay(400 + index * 100)}
                style={styles.scoreCard}
              >
                <Text style={styles.scoreCategory}>{item.category}</Text>
                <View
                  style={[
                    styles.scoreBadge,
                    { backgroundColor: getScoreColor(item.score) + '30' },
                  ]}
                >
                  <Text
                    style={[styles.scoreValue, { color: getScoreColor(item.score) }]}
                  >
                    {item.score}
                  </Text>
                </View>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Amenities */}
        <Animated.View
          style={styles.amenitiesSection}
          entering={FadeInUp.delay(400).springify()}
        >
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenitiesGrid}>
            {hotelData.amenities.map((amenity, index) => (
              <Animated.View
                key={amenity.label}
                entering={SlideInRight.delay(500 + index * 80)}
                style={styles.amenityItem}
              >
                <View style={styles.amenityIcon}>
                  <Ionicons name={amenity.icon as any} size={22} color="#11998e" />
                </View>
                <Text style={styles.amenityLabel}>{amenity.label}</Text>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Description */}
        <Animated.View
          style={styles.descriptionSection}
          entering={FadeInUp.delay(500).springify()}
        >
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.descriptionText}>{hotelData.description}</Text>
        </Animated.View>
      </ScrollView>

      {/* Bottom Bar */}
      <Animated.View
        style={[styles.bottomBar, { paddingBottom: insets.bottom + 15 }]}
        entering={FadeInUp.delay(600)}
      >
        <BlurView intensity={90} style={styles.bottomBarBlur} tint="light">
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>From</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceValue}>${hotelData.price}</Text>
              <Text style={styles.priceNight}>/night</Text>
            </View>
          </View>

          <AnimatedTouchable
            style={[styles.bookButton, bookButtonStyle]}
            onPress={handleBookNow}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#11998e', '#38ef7d']}
              style={styles.bookButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.bookButtonText}>Book Now</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </AnimatedTouchable>
        </BlurView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  imageContainer: {
    height: height * 0.35,
    position: 'relative',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  headerButton: {
    width: 45,
    height: 45,
    borderRadius: 15,
    overflow: 'hidden',
  },
  headerButtonBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 10,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  indicatorActive: {
    width: 24,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: '#f5f5f5',
    paddingTop: 30,
  },
  infoSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  titleContainer: {
    flex: 1,
    marginRight: 15,
  },
  hotelName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#333',
    marginBottom: 5,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  locationText: {
    fontSize: 14,
    color: '#11998e',
    fontWeight: '500',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  addressText: {
    fontSize: 14,
    color: '#999',
  },
  scoresSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 5,
  },
  reviewCount: {
    fontSize: 14,
    color: '#999',
    marginBottom: 15,
  },
  scoresGrid: {
    marginTop: 10,
  },
  scoreCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  scoreCategory: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  amenitiesSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 10,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  amenityIcon: {
    width: 35,
    height: 35,
    borderRadius: 10,
    backgroundColor: 'rgba(17, 153, 142, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  amenityLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  descriptionSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 24,
    marginTop: 10,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
  },
  bottomBarBlur: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  priceContainer: {},
  priceLabel: {
    fontSize: 12,
    color: '#999',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#11998e',
  },
  priceNight: {
    fontSize: 14,
    color: '#999',
    marginLeft: 2,
  },
  bookButton: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  bookButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 18,
    gap: 10,
  },
  bookButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
});

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
  rating: 4.6,
  reviews: 2340,
  gradient: ['#667eea', '#764ba2'],
  accent: '#667eea',
  category: 'Luxury',
  description:
    'Experience luxury at its finest in the heart of New York City. Our hotel offers stunning views of the skyline, world-class amenities, and exceptional service.',
  amenities: [
    { icon: 'wifi', label: 'Free WiFi' },
    { icon: 'restaurant', label: 'Restaurant' },
    { icon: 'fitness', label: 'Gym' },
    { icon: 'car', label: 'Parking' },
    { icon: 'water', label: 'Pool' },
    { icon: 'cafe', label: 'Cafe' },
    { icon: 'business', label: 'Business Center' },
    { icon: 'snow', label: 'AC' },
  ],
  images: ['img1', 'img2', 'img3', 'img4'],
  // Amenity rating scores (out of 10)
  amenityRatings: [
    { category: 'Cleanliness', score: 9.2, icon: 'sparkles' },
    { category: 'Service', score: 9.0, icon: 'people' },
    { category: 'Location', score: 9.5, icon: 'location' },
    { category: 'Value', score: 8.5, icon: 'cash' },
    { category: 'Comfort', score: 9.2, icon: 'bed' },
    { category: 'Facilities', score: 8.8, icon: 'business' },
  ],
  // Price comparison across platforms
  platformPrices: [
    { platform: 'Agoda', price: 145, logo: 'globe' },
    { platform: 'Booking.com', price: 150, logo: 'globe' },
    { platform: 'MakeMyTrip', price: 155, logo: 'globe' },
    { platform: 'Expedia', price: 152, logo: 'globe' },
    { platform: 'Hotels.com', price: 148, logo: 'globe' },
  ],
  // Trip type match scores
  tripMatch: [
    { type: 'Business', icon: 'briefcase', score: 95, color: '#2193b0', reasons: ['Conference rooms', 'Fast WiFi', 'Business center'] },
    { type: 'Solo', icon: 'person', score: 88, color: '#667eea', reasons: ['Central location', 'Great workspace'] },
    { type: 'Friends', icon: 'beer', score: 80, color: '#ee0979', reasons: ['Rooftop bar', 'Pool area'] },
    { type: 'Family', icon: 'people', score: 72, color: '#fc4a1a', reasons: ['Spacious rooms', 'Restaurant'] },
    { type: 'Pets', icon: 'paw', score: 20, color: '#1D976C', reasons: ['Not pet friendly'] },
  ],
};

// Animated horizontal bar
const RatingBar = ({ score, maxScore = 10, color, delay }: { score: number; maxScore?: number; color: string; delay: number }) => {
  const barWidth = useSharedValue(0);
  useEffect(() => {
    barWidth.value = withDelay(delay, withSpring((score / maxScore) * 100, { damping: 14 }));
  }, []);
  const barStyle = useAnimatedStyle(() => ({ width: `${barWidth.value}%` }));
  return (
    <View style={barStyles.track}>
      <Animated.View style={[barStyles.fill, { backgroundColor: color }, barStyle]} />
    </View>
  );
};

const barStyles = StyleSheet.create({
  track: { height: 8, borderRadius: 4, backgroundColor: '#f0f0f0', flex: 1 },
  fill: { height: 8, borderRadius: 4 },
});

const getScoreColor = (score: number) => {
  if (score >= 9) return '#10B981';
  if (score >= 8) return '#6EE7B7';
  if (score >= 7) return '#FCD34D';
  return '#F87171';
};

export default function HotelDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const insets = useSafeAreaInsets();

  const heartScale = useSharedValue(1);
  const compareButtonScale = useSharedValue(1);

  useEffect(() => {
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

  const handleCompare = () => {
    compareButtonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1)
    );
    setTimeout(() => router.push('/(main)/comparison-detail'), 200);
  };

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const compareButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: compareButtonScale.value }],
  }));

  const lowestPrice = Math.min(...hotelData.platformPrices.map((p) => p.price));
  const highestPrice = Math.max(...hotelData.platformPrices.map((p) => p.price));
  const avgRating = hotelData.amenityRatings.reduce((acc, r) => acc + r.score, 0) / hotelData.amenityRatings.length;

  return (
    <View style={styles.container}>
      {/* Image Carousel */}
      <View style={styles.imageContainer}>
        <LinearGradient
          colors={hotelData.gradient}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.imagePlaceholder}>
          <Ionicons name="image" size={60} color="rgba(255,255,255,0.3)" />
        </View>

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={styles.imageOverlay}
        />

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
              <View style={styles.categoryRow}>
                <View style={[styles.categoryBadge, { backgroundColor: hotelData.accent + '15' }]}>
                  <Text style={[styles.categoryText, { color: hotelData.accent }]}>{hotelData.category}</Text>
                </View>
                <View style={styles.petBadge}>
                  <Ionicons name="paw" size={12} color="#ccc" />
                  <Text style={styles.petText}>Not pet friendly</Text>
                </View>
              </View>
              <Text style={styles.hotelName}>{hotelData.name}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={16} color={hotelData.accent} />
                <Text style={[styles.locationText, { color: hotelData.accent }]}>{hotelData.location}</Text>
              </View>
            </View>
            <View style={styles.ratingCircle}>
              <Text style={styles.ratingBig}>{avgRating.toFixed(1)}</Text>
              <Text style={styles.ratingSmall}>/ 10</Text>
            </View>
          </View>
          <Text style={styles.addressText}>{hotelData.address}</Text>
          <Text style={styles.reviewCountText}>
            {hotelData.reviews.toLocaleString()} reviews
          </Text>
        </Animated.View>

        {/* ===== AMENITY RATING BARS ===== */}
        <Animated.View
          style={styles.section}
          entering={FadeInUp.delay(300).springify()}
        >
          <Text style={styles.sectionTitle}>Amenity Ratings</Text>
          <Text style={styles.sectionSub}>Guest scores across key categories</Text>
          {hotelData.amenityRatings.map((item, index) => (
            <Animated.View
              key={item.category}
              entering={SlideInRight.delay(400 + index * 80)}
              style={styles.ratingRow}
            >
              <View style={styles.ratingLabelCol}>
                <View style={[styles.ratingIconWrap, { backgroundColor: getScoreColor(item.score) + '20' }]}>
                  <Ionicons name={item.icon as any} size={14} color={getScoreColor(item.score)} />
                </View>
                <Text style={styles.ratingLabel}>{item.category}</Text>
              </View>
              <RatingBar score={item.score} color={getScoreColor(item.score)} delay={400 + index * 80} />
              <View style={[styles.ratingScoreBadge, { backgroundColor: getScoreColor(item.score) + '20' }]}>
                <Text style={[styles.ratingScoreText, { color: getScoreColor(item.score) }]}>
                  {item.score.toFixed(1)}
                </Text>
              </View>
            </Animated.View>
          ))}
        </Animated.View>

        {/* ===== PRICE COMPARISON ===== */}
        <Animated.View
          style={styles.section}
          entering={FadeInUp.delay(500).springify()}
        >
          <Text style={styles.sectionTitle}>Lowest Room Prices</Text>
          <Text style={styles.sectionSub}>Compared across booking platforms</Text>

          <View style={styles.priceHighlight}>
            <View>
              <Text style={styles.priceHighlightLabel}>Best Price</Text>
              <Text style={[styles.priceHighlightVal, { color: hotelData.accent }]}>${lowestPrice}<Text style={styles.perNightSmall}>/night</Text></Text>
            </View>
            <View style={styles.priceSavings}>
              <Ionicons name="trending-down" size={16} color="#10B981" />
              <Text style={styles.savingsText}>Save ${highestPrice - lowestPrice} vs highest</Text>
            </View>
          </View>

          {hotelData.platformPrices
            .sort((a, b) => a.price - b.price)
            .map((p, index) => {
              const isLowest = p.price === lowestPrice;
              return (
                <Animated.View
                  key={p.platform}
                  entering={SlideInRight.delay(600 + index * 80)}
                  style={[styles.platformRow, isLowest && { borderLeftWidth: 3, borderLeftColor: hotelData.accent }]}
                >
                  <View style={styles.platformInfo}>
                    <Ionicons name={p.logo as any} size={18} color="#666" />
                    <Text style={styles.platformName}>{p.platform}</Text>
                    {isLowest && (
                      <View style={[styles.lowestTag, { backgroundColor: hotelData.accent }]}>
                        <Text style={styles.lowestTagText}>LOWEST</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.platformPriceCol}>
                    <Text style={[styles.platformPrice, isLowest && { color: hotelData.accent, fontWeight: '800' }]}>
                      ${p.price}
                    </Text>
                    <Text style={styles.platformPerNight}>/night</Text>
                  </View>
                </Animated.View>
              );
            })}
        </Animated.View>

        {/* ===== TRIP TYPE MATCH ===== */}
        <Animated.View
          style={styles.section}
          entering={FadeInUp.delay(700).springify()}
        >
          <Text style={styles.sectionTitle}>Trip Type Match</Text>
          <Text style={styles.sectionSub}>How well this hotel suits your trip</Text>

          {hotelData.tripMatch.map((trip, index) => (
            <Animated.View
              key={trip.type}
              entering={FadeInDown.delay(800 + index * 100)}
              style={styles.tripCard}
            >
              <View style={styles.tripHeader}>
                <View style={[styles.tripIconBox, { backgroundColor: trip.color + '15' }]}>
                  <Ionicons name={trip.icon as any} size={18} color={trip.color} />
                </View>
                <Text style={styles.tripType}>{trip.type}</Text>
                <Text style={[styles.tripScore, { color: trip.color }]}>{trip.score}%</Text>
              </View>
              <RatingBar score={trip.score} maxScore={100} color={trip.color} delay={800 + index * 100} />
              <View style={styles.tripReasons}>
                {trip.reasons.map((r, rIdx) => (
                  <View key={rIdx} style={styles.tripReasonRow}>
                    <Ionicons
                      name={trip.score > 50 ? 'checkmark-circle' : 'close-circle'}
                      size={14}
                      color={trip.score > 50 ? trip.color : '#ccc'}
                    />
                    <Text style={[styles.tripReasonText, trip.score <= 50 && { color: '#bbb' }]}>{r}</Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          ))}
        </Animated.View>

        {/* ===== AMENITIES ===== */}
        <Animated.View
          style={styles.section}
          entering={FadeInUp.delay(900).springify()}
        >
          <Text style={styles.sectionTitle}>Amenities & Features</Text>
          <View style={styles.amenitiesGrid}>
            {hotelData.amenities.map((amenity, index) => (
              <Animated.View
                key={amenity.label}
                entering={ZoomIn.delay(1000 + index * 60)}
                style={styles.amenityChip}
              >
                <View style={[styles.amenityIconWrap, { backgroundColor: hotelData.accent + '12' }]}>
                  <Ionicons name={amenity.icon as any} size={18} color={hotelData.accent} />
                </View>
                <Text style={styles.amenityLabel}>{amenity.label}</Text>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* ===== DESCRIPTION ===== */}
        <Animated.View
          style={styles.section}
          entering={FadeInUp.delay(1000).springify()}
        >
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.descriptionText}>{hotelData.description}</Text>
        </Animated.View>
      </ScrollView>

      {/* Bottom Bar — Compare */}
      <Animated.View
        style={[styles.bottomBar, { paddingBottom: insets.bottom + 15 }]}
        entering={FadeInUp.delay(600)}
      >
        <BlurView intensity={90} style={styles.bottomBarBlur} tint="light">
          <View style={styles.bottomPriceCol}>
            <Text style={styles.bottomPriceLabel}>From</Text>
            <View style={styles.bottomPriceRow}>
              <Text style={[styles.bottomPriceVal, { color: hotelData.accent }]}>${lowestPrice}</Text>
              <Text style={styles.bottomPerNight}>/night</Text>
            </View>
          </View>

          <AnimatedTouchable
            style={[styles.compareBtn, compareButtonStyle]}
            onPress={handleCompare}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={hotelData.gradient}
              style={styles.compareBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="git-compare-outline" size={20} color="#fff" />
              <Text style={styles.compareBtnText}>Compare Hotels</Text>
            </LinearGradient>
          </AnimatedTouchable>
        </BlurView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  imageContainer: { height: height * 0.3, position: 'relative' },
  imagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imageOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 100 },
  header: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15,
  },
  headerButton: { width: 45, height: 45, borderRadius: 15, overflow: 'hidden' },
  headerButtonBlur: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  headerRight: { flexDirection: 'row', gap: 10 },
  imageIndicators: {
    position: 'absolute', bottom: 20, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', gap: 8,
  },
  indicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.5)' },
  indicatorActive: { width: 24, backgroundColor: '#fff' },
  content: {
    flex: 1, marginTop: -30,
    borderTopLeftRadius: 30, borderTopRightRadius: 30,
    backgroundColor: '#f5f5f5', paddingTop: 25,
  },
  // Info Section
  infoSection: { paddingHorizontal: 20, marginBottom: 16 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  titleContainer: { flex: 1, marginRight: 14 },
  categoryRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  categoryBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  categoryText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  petBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  petText: { fontSize: 11, color: '#bbb' },
  hotelName: { fontSize: 22, fontWeight: '800', color: '#333', marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 14, fontWeight: '500' },
  ratingCircle: {
    width: 60, height: 60, borderRadius: 30,
    borderWidth: 3, borderColor: '#10B981',
    justifyContent: 'center', alignItems: 'center',
  },
  ratingBig: { fontSize: 18, fontWeight: '800', color: '#10B981' },
  ratingSmall: { fontSize: 9, color: '#999' },
  addressText: { fontSize: 13, color: '#999', marginBottom: 2 },
  reviewCountText: { fontSize: 13, color: '#bbb' },
  // Sections
  section: {
    backgroundColor: '#fff', borderRadius: 20, padding: 18, marginHorizontal: 15,
    marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#333', marginBottom: 3 },
  sectionSub: { fontSize: 12, color: '#999', marginBottom: 14 },
  // Rating Bars
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  ratingLabelCol: { flexDirection: 'row', alignItems: 'center', gap: 8, width: 110 },
  ratingIconWrap: { width: 26, height: 26, borderRadius: 7, justifyContent: 'center', alignItems: 'center' },
  ratingLabel: { fontSize: 13, fontWeight: '500', color: '#555' },
  ratingScoreBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, minWidth: 40, alignItems: 'center' },
  ratingScoreText: { fontSize: 13, fontWeight: '700' },
  // Price Comparison
  priceHighlight: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#f9f9f9', borderRadius: 14, padding: 14, marginBottom: 14,
  },
  priceHighlightLabel: { fontSize: 12, color: '#999', marginBottom: 2 },
  priceHighlightVal: { fontSize: 24, fontWeight: '800' },
  perNightSmall: { fontSize: 13, fontWeight: '400', color: '#999' },
  priceSavings: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#10B98115', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  savingsText: { fontSize: 12, fontWeight: '600', color: '#10B981' },
  platformRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#f5f5f5',
    borderRadius: 8, marginBottom: 2,
  },
  platformInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  platformName: { fontSize: 14, fontWeight: '500', color: '#333' },
  lowestTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  lowestTagText: { color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 0.3 },
  platformPriceCol: { flexDirection: 'row', alignItems: 'baseline' },
  platformPrice: { fontSize: 18, fontWeight: '600', color: '#333' },
  platformPerNight: { fontSize: 12, color: '#bbb', marginLeft: 2 },
  // Trip Match
  tripCard: {
    backgroundColor: '#f9f9f9', borderRadius: 14, padding: 14, marginBottom: 10,
  },
  tripHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  tripIconBox: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  tripType: { flex: 1, fontSize: 14, fontWeight: '700', color: '#333' },
  tripScore: { fontSize: 18, fontWeight: '800' },
  tripReasons: { marginTop: 8, gap: 4 },
  tripReasonRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tripReasonText: { fontSize: 12, color: '#666' },
  // Amenities
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  amenityChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#f9f9f9', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12,
  },
  amenityIconWrap: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  amenityLabel: { fontSize: 13, color: '#333', fontWeight: '500' },
  // Description
  descriptionText: { fontSize: 14, color: '#666', lineHeight: 22, marginTop: 6 },
  // Bottom Bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    borderTopLeftRadius: 25, borderTopRightRadius: 25, overflow: 'hidden',
  },
  bottomBarBlur: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 18, backgroundColor: 'rgba(255,255,255,0.92)',
  },
  bottomPriceCol: {},
  bottomPriceLabel: { fontSize: 11, color: '#999' },
  bottomPriceRow: { flexDirection: 'row', alignItems: 'baseline' },
  bottomPriceVal: { fontSize: 26, fontWeight: '800' },
  bottomPerNight: { fontSize: 13, color: '#999', marginLeft: 2 },
  compareBtn: { borderRadius: 15, overflow: 'hidden' },
  compareBtnGradient: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, gap: 8,
  },
  compareBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});

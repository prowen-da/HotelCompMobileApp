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
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInLeft,
  SlideInRight,
  ZoomIn,
  Layout,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const tabs = ['Overview', 'Scores', 'Prices'];

const hotels = [
  { id: 1, name: 'The Grand Palace Hotel', rating: 4.6, price: 120, score: 91 },
  { id: 2, name: 'Urban Nest Suites', rating: 4.2, price: 100, score: 85 },
  { id: 3, name: 'Lakeview Residency', rating: 4.5, price: 95, score: 97 },
  { id: 4, name: 'Royal Orchid Central', rating: 4.0, price: 110, score: 68 },
  { id: 5, name: 'Bloom Boutique', rating: 4.3, price: 88, score: 72 },
];

const scoreData = [
  { hotel: 'The Grand Palace', scores: [9.1, 9, 9.5, 8.5, 9.2] },
  { hotel: 'Urban Nest Suites', scores: [8.4, 7.5, 8.8, 9.2, 8.0] },
  { hotel: 'Lakeview Resort', scores: [7.8, 8, 7.5, 8, 7.9] },
  { hotel: 'Royal Orchid Hotel', scores: [8, 8.5, 8, 7.8, 8.1] },
  { hotel: 'Bloom Boutique', scores: [8.2, 7.8, 8.5, 8.2, 8.0] },
];

const priceData = [
  { hotel: 'The Grand Palace Hotel', prices: [{ platform: 'Agoda', price: 145 }, { platform: 'Booking.com', price: 150 }, { platform: 'MakeMyTrip', price: 155 }, { platform: 'Expedia', price: 152 }] },
  { hotel: 'Urban Nest Suites', prices: [{ platform: 'Agoda', price: 125 }, { platform: 'Booking.com', price: 118 }, { platform: 'MakeMyTrip', price: 130 }, { platform: 'Expedia', price: 128 }] },
];

const getScoreColor = (score: number) => {
  if (score >= 9) return '#10B981';
  if (score >= 8) return '#6EE7B7';
  if (score >= 7) return '#FCD34D';
  return '#F87171';
};

// Animated Bar Component
const AnimatedBar = ({ hotel, index, maxScore = 100 }: { hotel: typeof hotels[0]; index: number; maxScore?: number }) => {
  const barHeight = useSharedValue(0);

  useEffect(() => {
    barHeight.value = withDelay(
      index * 100,
      withSpring(hotel.score * 1.8, { damping: 12 })
    );
  }, []);

  const barStyle = useAnimatedStyle(() => ({
    height: barHeight.value,
  }));

  return (
    <View style={styles.barContainer}>
      <Animated.View style={[styles.bar, barStyle]} />
      <Text style={styles.barLabel} numberOfLines={1}>
        {hotel.name.split(' ')[0]}...
      </Text>
    </View>
  );
};

// Animated Sentiment Bar
const AnimatedSentimentBar = ({ hotel, index }: { hotel: typeof hotels[0]; index: number }) => {
  const barWidth = useSharedValue(0);

  useEffect(() => {
    barWidth.value = withDelay(index * 150, withTiming(1, { duration: 800 }));
  }, []);

  const sentimentStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: barWidth.value }],
  }));

  return (
    <Animated.View 
      style={styles.sentimentRow}
      entering={FadeInDown.delay(index * 100)}
    >
      <View style={styles.sentimentHeader}>
        <Text style={styles.sentimentHotel}>{hotel.name}</Text>
        <Text style={styles.sentimentReviews}>
          {(Math.random() * 2 + 1).toFixed(1)}k reviews
        </Text>
      </View>
      <Animated.View style={[styles.sentimentBar, sentimentStyle]}>
        <View style={[styles.sentimentSegment, { flex: 7, backgroundColor: '#10B981' }]} />
        <View style={[styles.sentimentSegment, { flex: 2, backgroundColor: '#9CA3AF' }]} />
        <View style={[styles.sentimentSegment, { flex: 1, backgroundColor: '#EF4444' }]} />
      </Animated.View>
    </Animated.View>
  );
};

export default function ComparisonScreen() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedPlatform, setSelectedPlatform] = useState('All Platforms');
  const insets = useSafeAreaInsets();

  const tabIndicatorX = useSharedValue(0);
  const bookButtonScale = useSharedValue(1);

  const bestHotel = hotels.reduce((prev, current) =>
    prev.score > current.score ? prev : current
  );

  useEffect(() => {
    tabIndicatorX.value = withSpring(activeTab * (width - 40) / 3, { damping: 15 });
  }, [activeTab]);

  const tabIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tabIndicatorX.value }],
  }));

  const handleBookPress = () => {
    bookButtonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1)
    );
  };

  const bookButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bookButtonScale.value }],
  }));

  const renderOverviewTab = () => (
    <>
      <Animated.View 
        style={styles.bestChoiceCard}
        entering={FadeInDown.delay(200).springify()}
      >
        <LinearGradient
          colors={['#0d665c', '#11998e']}
          style={styles.bestChoiceGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.bestChoiceHeader}>
            <Animated.View entering={ZoomIn.delay(400)}>
              <Ionicons name="trophy" size={24} color="#FFD700" />
            </Animated.View>
            <Text style={styles.bestChoiceLabel}>Best Overall Choice</Text>
          </View>
          <Text style={styles.bestChoiceTitle}>{bestHotel.name.toUpperCase()}</Text>
          <Text style={styles.bestChoiceDescription}>
            This hotel stands out as the best overall choice after comparing price,
            guest reviews, location, and overall value across all your selected hotels.
          </Text>
          <View style={styles.bestChoiceFooter}>
            <View style={styles.tagContainer}>
              <Animated.View 
                style={styles.tag}
                entering={SlideInLeft.delay(500)}
              >
                <Text style={styles.tagText}>Luxury</Text>
              </Animated.View>
              <Animated.View 
                style={styles.tag}
                entering={SlideInLeft.delay(600)}
              >
                <Text style={styles.tagText}>Business</Text>
              </Animated.View>
            </View>
            <Animated.View 
              style={styles.scoreContainer}
              entering={ZoomIn.delay(700)}
            >
              <Text style={styles.scoreValue}>9.1</Text>
              <Text style={styles.scoreLabel}>Composite score</Text>
            </Animated.View>
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.View 
        style={styles.sectionContainer}
        entering={FadeInUp.delay(300).springify()}
      >
        <Text style={styles.sectionTitle}>QUICK COMPARISON</Text>
        <View style={styles.quickCompareRow}>
          {hotels.slice(0, 2).map((hotel, index) => (
            <Animated.View 
              key={hotel.id} 
              style={styles.quickCompareCard}
              entering={SlideInRight.delay(400 + index * 150)}
            >
              <Text style={styles.pickLabel}># {index + 1} Pick</Text>
              <Text style={styles.hotelName}>{hotel.name}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>{hotel.rating}</Text>
                <Text style={styles.priceText}>${hotel.price}/night</Text>
              </View>
            </Animated.View>
          ))}
        </View>
      </Animated.View>

      <Animated.View 
        style={styles.sectionContainer}
        entering={FadeInUp.delay(500).springify()}
      >
        <Text style={styles.sectionTitle}>OVERALL SCORE COMPARISON</Text>
        <Text style={styles.sectionSubtitle}>
          Higher score indicates better overall performance
        </Text>
        <View style={styles.chartContainer}>
          {hotels.map((hotel, index) => (
            <AnimatedBar key={hotel.id} hotel={hotel} index={index} />
          ))}
        </View>
      </Animated.View>

      <Animated.View 
        style={styles.sectionContainer}
        entering={FadeInUp.delay(700).springify()}
      >
        <Text style={styles.sectionTitle}>SENTIMENT DISTRIBUTION</Text>
        {hotels.map((hotel, index) => (
          <AnimatedSentimentBar key={hotel.id} hotel={hotel} index={index} />
        ))}
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.legendText}>Positive</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#9CA3AF' }]} />
            <Text style={styles.legendText}>Neutral</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.legendText}>Negative</Text>
          </View>
        </View>
      </Animated.View>
    </>
  );

  const renderScoresTab = () => (
    <Animated.View 
      style={styles.sectionContainer}
      entering={FadeIn.duration(300)}
      layout={Layout}
    >
      <Text style={styles.sectionTitle}>DETAILED SCORE BREAKDOWN</Text>
      <Text style={styles.sectionSubtitle}>Tap any score to see details</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.scoreTable}>
          <View style={styles.scoreHeaderRow}>
            <View style={styles.scoreHeaderCell}>
              <Text style={styles.scoreHeaderText}>Hotel</Text>
            </View>
            {['Clean', 'Service', 'Location', 'Value', 'Comfort'].map((header) => (
              <View key={header} style={styles.scoreHeaderCell}>
                <Ionicons name="star" size={12} color="#666" />
              </View>
            ))}
          </View>
          {scoreData.map((row, rowIndex) => (
            <Animated.View 
              key={row.hotel} 
              style={styles.scoreRow}
              entering={SlideInRight.delay(rowIndex * 100)}
            >
              <View style={styles.scoreNameCell}>
                <Text style={styles.scoreHotelName}>{row.hotel}</Text>
              </View>
              {row.scores.map((score, index) => (
                <Animated.View 
                  key={index} 
                  style={styles.scoreCell}
                  entering={ZoomIn.delay(rowIndex * 100 + index * 50)}
                >
                  <View
                    style={[
                      styles.scoreBadge,
                      { backgroundColor: getScoreColor(score) + '30' },
                    ]}
                  >
                    <Text style={[styles.scoreText, { color: getScoreColor(score) }]}>
                      {score}
                    </Text>
                  </View>
                </Animated.View>
              ))}
            </Animated.View>
          ))}
        </View>
      </ScrollView>
      <View style={styles.scoreLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendText}>Excellent (9+)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#6EE7B7' }]} />
          <Text style={styles.legendText}>Good (8-9)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FCD34D' }]} />
          <Text style={styles.legendText}>Average (7-8)</Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderPricesTab = () => (
    <Animated.View 
      style={styles.sectionContainer}
      entering={FadeIn.duration(300)}
      layout={Layout}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.platformFilter}
      >
        {['All Platforms', 'Agoda', 'MakeMyTrip', 'Booking.com', 'Expedia'].map(
          (platform, index) => (
            <Animated.View
              key={platform}
              entering={SlideInRight.delay(index * 80)}
            >
              <TouchableOpacity
                style={[
                  styles.platformButton,
                  selectedPlatform === platform && styles.platformButtonActive,
                ]}
                onPress={() => setSelectedPlatform(platform)}
              >
                <Text
                  style={[
                    styles.platformText,
                    selectedPlatform === platform && styles.platformTextActive,
                  ]}
                >
                  {platform}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )
        )}
      </ScrollView>

      {priceData.map((hotel, hotelIndex) => (
        <Animated.View 
          key={hotel.hotel} 
          style={styles.priceCard}
          entering={FadeInUp.delay(200 + hotelIndex * 150)}
        >
          <Text style={styles.priceHotelName}>{hotel.hotel}</Text>
          <View style={styles.priceGrid}>
            {hotel.prices.map((item, priceIndex) => (
              <Animated.View 
                key={item.platform} 
                style={styles.priceItem}
                entering={ZoomIn.delay(300 + hotelIndex * 150 + priceIndex * 80)}
              >
                <Text style={styles.pricePlatform}>{item.platform}</Text>
                <Text style={styles.priceValue}>${item.price}</Text>
                <AnimatedTouchable 
                  style={[styles.bookButton, bookButtonStyle]} 
                  onPress={handleBookPress}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={['#11998e', '#38ef7d']}
                    style={styles.bookGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.bookText}>Book</Text>
                    <Ionicons name="open-outline" size={14} color="#fff" />
                  </LinearGradient>
                </AnimatedTouchable>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      ))}
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#11998e', '#38ef7d']}
        style={[styles.headerGradient, { paddingTop: insets.top + 10 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View 
          style={styles.header}
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
          <Text style={styles.headerTitle}>Hotel Comparison</Text>
          <View style={{ width: 45 }} />
        </Animated.View>
      </LinearGradient>

      <Animated.View 
        style={styles.tabContainer}
        entering={FadeInUp.delay(200).springify()}
      >
        <Animated.View style={[styles.tabIndicator, tabIndicatorStyle]} />
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={tab}
            style={styles.tabButton}
            onPress={() => setActiveTab(index)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === index && styles.tabTextActive,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 0 && renderOverviewTab()}
        {activeTab === 1 && renderScoresTab()}
        {activeTab === 2 && renderPricesTab()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerGradient: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: -10,
    borderRadius: 15,
    padding: 5,
    boxShadow: '0px 2px 10px rgba(0,0,0,0.1)',
    elevation: 5,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    left: 5,
    top: 5,
    bottom: 5,
    width: (width - 50) / 3,
    backgroundColor: '#10B981',
    borderRadius: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    zIndex: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  bestChoiceCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  bestChoiceGradient: {
    padding: 20,
  },
  bestChoiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  bestChoiceLabel: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '600',
  },
  bestChoiceTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 10,
  },
  bestChoiceDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 22,
    marginBottom: 15,
  },
  bestChoiceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  tagContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
  },
  scoreLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  sectionContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#999',
    marginBottom: 15,
  },
  quickCompareRow: {
    flexDirection: 'row',
    gap: 15,
  },
  quickCompareCard: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  pickLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  hotelName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  ratingText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginRight: 'auto',
  },
  priceText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '700',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 200,
    paddingTop: 20,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 30,
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: '#10B981',
  },
  barLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  sentimentRow: {
    marginBottom: 15,
  },
  sentimentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sentimentHotel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  sentimentReviews: {
    fontSize: 12,
    color: '#999',
  },
  sentimentBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  sentimentSegment: {
    height: '100%',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 15,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  scoreTable: {
    minWidth: width - 40,
  },
  scoreHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
    marginBottom: 10,
  },
  scoreHeaderCell: {
    width: 60,
    alignItems: 'center',
  },
  scoreHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  scoreNameCell: {
    width: 120,
  },
  scoreHotelName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  scoreCell: {
    width: 60,
    alignItems: 'center',
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  scoreText: {
    fontSize: 13,
    fontWeight: '700',
  },
  scoreLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginTop: 20,
    flexWrap: 'wrap',
  },
  platformFilter: {
    marginBottom: 15,
  },
  platformButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  platformButtonActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  platformText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  platformTextActive: {
    color: '#fff',
  },
  priceCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  priceHotelName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 15,
  },
  priceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  priceItem: {
    width: (width - 90) / 2,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    padding: 12,
  },
  pricePlatform: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#333',
    marginBottom: 10,
  },
  bookButton: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  bookGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 5,
  },
  bookText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

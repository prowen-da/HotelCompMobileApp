import React, { useState } from 'react';
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

const savedHotels = [
  { id: 1, name: 'The Grand Palace Hotel', location: 'Downtown, New York', price: 245, rating: 4.9, category: 'luxury', gradient: ['#667eea', '#764ba2'] },
  { id: 4, name: 'Royal Romance Suites', location: 'Times Square, New York', price: 195, rating: 4.8, category: 'romantic', gradient: ['#ee0979', '#ff6a00'] },
  { id: 7, name: 'Serenity Spa Resort', location: 'Chelsea, New York', price: 175, rating: 4.4, category: 'wellness', gradient: ['#1D976C', '#93F9B9'] },
  { id: 8, name: 'The Ritz Platinum', location: 'Battery Park, New York', price: 320, rating: 4.9, category: 'luxury', gradient: ['#667eea', '#764ba2'] },
  { id: 6, name: 'Adventure Base Camp', location: 'Upper East Side, New York', price: 125, rating: 4.7, category: 'adventure', gradient: ['#FF416C', '#FF4B2B'] },
];

const FavoriteCard = ({ hotel, index }: { hotel: typeof savedHotels[0]; index: number }) => {
  const cardScale = useSharedValue(1);
  const [removed, setRemoved] = useState(false);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  if (removed) return null;

  return (
    <Animated.View
      entering={SlideInRight.delay(index * 100).springify()}
      layout={Layout.springify()}
    >
      <AnimatedTouchable
        style={[styles.card, cardStyle]}
        activeOpacity={1}
        onPress={() => {
          cardScale.value = withSequence(withTiming(0.97, { duration: 100 }), withSpring(1));
          setTimeout(() => router.push(`/(main)/hotel-details?id=${hotel.id}`), 150);
        }}
      >
        <View style={styles.cardImage}>
          <LinearGradient
            colors={hotel.gradient}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <Ionicons name="image" size={30} color="rgba(255,255,255,0.3)" />
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => setRemoved(true)}
          >
            <Ionicons name="heart" size={20} color="#ff4757" />
          </TouchableOpacity>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryTagText}>{hotel.category.toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardName} numberOfLines={1}>{hotel.name}</Text>
          <View style={styles.cardLocationRow}>
            <Ionicons name="location-outline" size={13} color="#999" />
            <Text style={styles.cardLocation}>{hotel.location}</Text>
          </View>
          <View style={styles.cardFooter}>
            <View style={styles.ratingPill}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={styles.ratingText}>{hotel.rating}</Text>
            </View>
            <Text style={[styles.cardPrice, { color: hotel.gradient[0] }]}>${hotel.price}<Text style={styles.perNight}>/night</Text></Text>
          </View>
        </View>
      </AnimatedTouchable>
    </Animated.View>
  );
};

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#ee0979', '#ff6a00']}
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
            <Text style={styles.headerTitle}>My Favorites</Text>
            <Text style={styles.headerSub}>{savedHotels.length} hotels saved</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="filter" size={22} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.list}
        contentContainerStyle={{ padding: 15, paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {savedHotels.map((hotel, i) => (
          <FavoriteCard key={hotel.id} hotel={hotel} index={i} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { paddingBottom: 20, paddingHorizontal: 15 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: { width: 45, height: 45, borderRadius: 15, overflow: 'hidden' },
  backBtnBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  list: { flex: 1 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardImage: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTag: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  categoryTagText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  cardBody: { padding: 14 },
  cardName: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 4 },
  cardLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 },
  cardLocation: { fontSize: 13, color: '#999' },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  ratingText: { fontSize: 13, fontWeight: '700', color: '#333' },
  cardPrice: { fontSize: 20, fontWeight: '800' },
  perNight: { fontSize: 13, fontWeight: '400', color: '#999' },
});

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
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
  withTiming,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  ZoomIn,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const hotels = [
  { id: 1, name: 'The Grand Palace Hotel', price: 145, rating: 4.6, lat: 40.7128, lng: -74.006 },
  { id: 2, name: 'Urban Nest Suites', price: 120, rating: 4.2, lat: 40.7580, lng: -73.9855 },
  { id: 3, name: 'Lakeview Residency', price: 95, rating: 4.5, lat: 40.7484, lng: -73.9857 },
  { id: 4, name: 'Royal Orchid Central', price: 180, rating: 4.8, lat: 40.7614, lng: -73.9776 },
];

export default function MapViewScreen() {
  const [selectedHotel, setSelectedHotel] = useState<typeof hotels[0] | null>(null);
  const insets = useSafeAreaInsets();
  const cardScale = useSharedValue(0);

  useEffect(() => {
    if (selectedHotel) {
      cardScale.value = withSpring(1, { damping: 12 });
    } else {
      cardScale.value = withTiming(0, { duration: 200 });
    }
  }, [selectedHotel]);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardScale.value,
  }));

  const handleMarkerPress = (hotel: typeof hotels[0]) => {
    setSelectedHotel(hotel);
  };

  const handleViewDetails = () => {
    if (selectedHotel) {
      router.push(`/(main)/hotel-details?id=${selectedHotel.id}`);
    }
  };

  return (
    <View style={styles.container}>
      {/* Map Background (Simulated) */}
      <View style={styles.mapContainer}>
        <LinearGradient
          colors={['#e8f5e9', '#c8e6c9', '#a5d6a7']}
          style={StyleSheet.absoluteFill}
        />
        
        {/* Grid lines to simulate map */}
        <View style={styles.mapGrid}>
          {[...Array(10)].map((_, i) => (
            <View key={`h-${i}`} style={[styles.gridLineH, { top: `${i * 10}%` }]} />
          ))}
          {[...Array(10)].map((_, i) => (
            <View key={`v-${i}`} style={[styles.gridLineV, { left: `${i * 10}%` }]} />
          ))}
        </View>

        {/* Simulated roads */}
        <View style={[styles.road, { top: '30%', width: '100%', height: 20 }]} />
        <View style={[styles.road, { top: '60%', width: '100%', height: 15 }]} />
        <View style={[styles.roadVertical, { left: '25%', height: '100%', width: 15 }]} />
        <View style={[styles.roadVertical, { left: '70%', height: '100%', width: 20 }]} />

        {/* Hotel Markers */}
        {hotels.map((hotel, index) => (
          <Animated.View
            key={hotel.id}
            entering={ZoomIn.delay(300 + index * 150).springify()}
            style={[
              styles.markerContainer,
              {
                top: `${20 + index * 18}%`,
                left: `${15 + index * 20}%`,
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => handleMarkerPress(hotel)}
              style={[
                styles.marker,
                selectedHotel?.id === hotel.id && styles.markerSelected,
              ]}
            >
              <Ionicons
                name="bed"
                size={16}
                color={selectedHotel?.id === hotel.id ? '#fff' : '#11998e'}
              />
            </TouchableOpacity>
            <View style={styles.markerTail} />
            <Animated.View
              entering={FadeInDown.delay(500 + index * 150)}
              style={styles.priceTag}
            >
              <Text style={styles.priceTagText}>${hotel.price}</Text>
            </Animated.View>
          </Animated.View>
        ))}
      </View>

      {/* Header */}
      <Animated.View
        style={[styles.header, { paddingTop: insets.top + 10 }]}
        entering={FadeInDown.springify()}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <BlurView intensity={80} style={styles.backButtonBlur} tint="light">
            <Ionicons name="arrow-back" size={24} color="#333" />
          </BlurView>
        </TouchableOpacity>
        
        <View style={styles.searchBar}>
          <BlurView intensity={80} style={styles.searchBarBlur} tint="light">
            <Ionicons name="search" size={20} color="#666" />
            <Text style={styles.searchText}>New York, USA</Text>
          </BlurView>
        </View>

        <TouchableOpacity style={styles.filterButton}>
          <BlurView intensity={80} style={styles.filterButtonBlur} tint="light">
            <Ionicons name="options" size={24} color="#333" />
          </BlurView>
        </TouchableOpacity>
      </Animated.View>

      {/* View Toggle */}
      <Animated.View
        style={styles.viewToggle}
        entering={SlideInRight.delay(400)}
      >
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => router.push('/(main)/hotel-listing')}
        >
          <BlurView intensity={80} style={styles.toggleButtonBlur} tint="light">
            <Ionicons name="list" size={20} color="#11998e" />
            <Text style={styles.toggleText}>List</Text>
          </BlurView>
        </TouchableOpacity>
      </Animated.View>

      {/* Selected Hotel Card */}
      {selectedHotel && (
        <Animated.View
          style={[styles.hotelCard, { bottom: insets.bottom + 20 }, cardAnimatedStyle]}
        >
          <BlurView intensity={90} style={styles.hotelCardBlur} tint="light">
            <View style={styles.hotelCardContent}>
              <View style={styles.hotelImagePlaceholder}>
                <LinearGradient
                  colors={['#11998e', '#38ef7d']}
                  style={StyleSheet.absoluteFill}
                />
                <Ionicons name="image" size={30} color="rgba(255,255,255,0.5)" />
              </View>
              <View style={styles.hotelInfo}>
                <Text style={styles.hotelName}>{selectedHotel.name}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <Text style={styles.ratingText}>{selectedHotel.rating}</Text>
                  <Text style={styles.reviewsText}>(2.3k reviews)</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>From</Text>
                  <Text style={styles.priceValue}>${selectedHotel.price}</Text>
                  <Text style={styles.priceNight}>/night</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.viewButton}
                onPress={handleViewDetails}
              >
                <LinearGradient
                  colors={['#11998e', '#38ef7d']}
                  style={styles.viewButtonGradient}
                >
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </BlurView>
        </Animated.View>
      )}

      {/* Hotel Count Badge */}
      <Animated.View
        style={[styles.countBadge, { bottom: selectedHotel ? insets.bottom + 140 : insets.bottom + 20 }]}
        entering={FadeInUp.delay(600)}
      >
        <BlurView intensity={80} style={styles.countBadgeBlur} tint="light">
          <Text style={styles.countText}>{hotels.length} hotels in this area</Text>
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
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapGrid: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  road: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  roadVertical: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  markerContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#11998e',
  },
  markerSelected: {
    backgroundColor: '#11998e',
    borderColor: '#0d7a70',
    transform: [{ scale: 1.2 }],
  },
  markerTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#11998e',
    marginTop: -2,
  },
  priceTag: {
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  priceTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#11998e',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    gap: 10,
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
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  searchBar: {
    flex: 1,
    height: 45,
    borderRadius: 15,
    overflow: 'hidden',
  },
  searchBarBlur: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  searchText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  filterButton: {
    width: 45,
    height: 45,
    borderRadius: 15,
    overflow: 'hidden',
  },
  filterButtonBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  viewToggle: {
    position: 'absolute',
    top: 120,
    right: 15,
  },
  toggleButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  toggleButtonBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#11998e',
  },
  hotelCard: {
    position: 'absolute',
    left: 15,
    right: 15,
    borderRadius: 20,
    overflow: 'hidden',
  },
  hotelCardBlur: {
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  hotelCardContent: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
  },
  hotelImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 15,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hotelInfo: {
    flex: 1,
    marginLeft: 15,
  },
  hotelName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 5,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 5,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  reviewsText: {
    fontSize: 12,
    color: '#999',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  priceLabel: {
    fontSize: 12,
    color: '#999',
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#11998e',
  },
  priceNight: {
    fontSize: 12,
    color: '#999',
  },
  viewButton: {
    width: 50,
    height: 50,
    borderRadius: 15,
    overflow: 'hidden',
  },
  viewButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countBadge: {
    position: 'absolute',
    left: 15,
    borderRadius: 20,
    overflow: 'hidden',
  },
  countBadgeBlur: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  countText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});

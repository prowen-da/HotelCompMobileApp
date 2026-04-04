import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Switch,
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
  withRepeat,
  Easing,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  ZoomIn,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const travelTypes = [
  { id: 'business', label: 'Business', icon: 'briefcase' },
  { id: 'family', label: 'Family', icon: 'people' },
  { id: 'couple', label: 'Couple', icon: 'heart' },
  { id: 'solo', label: 'Solo', icon: 'person' },
];

export default function HomeScreen() {
  const [selectedTravelType, setSelectedTravelType] = useState('business');
  const [travelWithPets, setTravelWithPets] = useState(false);
  const [checkIn] = useState('2026-07-15');
  const [checkOut] = useState('2026-07-18');
  const insets = useSafeAreaInsets();

  const buttonScale = useSharedValue(1);
  const pinBounce = useSharedValue(0);
  const buildingHeights = [
    useSharedValue(0),
    useSharedValue(0),
    useSharedValue(0),
    useSharedValue(0),
    useSharedValue(0),
  ];

  useEffect(() => {
    // Pin bounce animation
    pinBounce.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Animate buildings
    buildingHeights.forEach((height, index) => {
      const randomHeight = 30 + Math.random() * 40;
      height.value = withDelay(
        index * 100,
        withSpring(randomHeight, { damping: 10 })
      );
    });
  }, []);

  const pinAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pinBounce.value }],
  }));

  const handleSearch = () => {
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1)
    );
    setTimeout(() => {
      router.push('/(main)/comparison');
    }, 200);
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleTravelTypePress = (typeId: string) => {
    setSelectedTravelType(typeId);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#11998e', '#38ef7d']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={[styles.headerContent, { paddingTop: insets.top + 10 }]}>
          <Animated.View 
            style={styles.headerTop}
            entering={FadeInDown.delay(200).springify()}
          >
            <TouchableOpacity style={styles.menuButton}>
              <Ionicons name="menu" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>StayCompare</Text>
            <TouchableOpacity style={styles.profileButton}>
              <Ionicons name="person-circle-outline" size={28} color="#fff" />
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.cityIllustration}>
            <View style={styles.buildingGroup}>
              {buildingHeights.map((height, index) => {
                const buildingStyle = useAnimatedStyle(() => ({
                  height: height.value,
                  width: 20 + index * 3,
                }));
                return (
                  <Animated.View
                    key={index}
                    style={[styles.building, buildingStyle]}
                  />
                );
              })}
            </View>
            <Animated.View style={[styles.pinContainer, pinAnimatedStyle]}>
              <Ionicons name="location" size={40} color="#FFD700" />
            </Animated.View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={styles.searchCard}
          entering={FadeInUp.delay(300).springify()}
        >
          <BlurView intensity={80} style={styles.cardBlur} tint="light">
            <View style={styles.cardContent}>
              <TouchableOpacity
                style={styles.inputRow}
                onPress={() => router.push('/(main)/search-location')}
              >
                <View style={styles.inputIcon}>
                  <Ionicons name="location-outline" size={24} color="#11998e" />
                </View>
                <View style={styles.inputTextContainer}>
                  <Text style={styles.inputLabel}>Where To?</Text>
                  <Text style={styles.inputValue}>Search for location</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>

              <View style={styles.divider} />

              <View style={styles.dateRow}>
                <TouchableOpacity style={styles.dateItem}>
                  <View style={styles.inputIcon}>
                    <Ionicons name="calendar-outline" size={22} color="#11998e" />
                  </View>
                  <View style={styles.inputTextContainer}>
                    <Text style={styles.inputLabel}>Check-in</Text>
                    <Text style={styles.inputValue}>{checkIn}</Text>
                  </View>
                </TouchableOpacity>

                <View style={styles.dateArrow}>
                  <Ionicons name="arrow-forward" size={16} color="#ccc" />
                </View>

                <TouchableOpacity style={styles.dateItem}>
                  <View style={styles.inputTextContainer}>
                    <Text style={styles.inputLabel}>Check-out</Text>
                    <Text style={styles.inputValue}>{checkOut}</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              <View style={styles.travelTypeSection}>
                <View style={styles.travelTypeHeader}>
                  <Ionicons name="airplane-outline" size={20} color="#11998e" />
                  <Text style={styles.travelTypeLabel}>Travel Type</Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.travelTypeGrid}
                >
                  {travelTypes.map((type, index) => {
                    const isSelected = selectedTravelType === type.id;
                    return (
                      <Animated.View
                        key={type.id}
                        entering={ZoomIn.delay(400 + index * 100).springify()}
                      >
                        <TouchableOpacity
                          style={[
                            styles.travelTypeButton,
                            isSelected && styles.travelTypeButtonActive,
                          ]}
                          onPress={() => handleTravelTypePress(type.id)}
                        >
                          <View
                            style={[
                              styles.travelTypeIcon,
                              isSelected && styles.travelTypeIconActive,
                            ]}
                          >
                            <Ionicons
                              name={type.icon as any}
                              size={24}
                              color={isSelected ? '#fff' : '#11998e'}
                            />
                          </View>
                          <Text
                            style={[
                              styles.travelTypeText,
                              isSelected && styles.travelTypeTextActive,
                            ]}
                          >
                            {type.label}
                          </Text>
                        </TouchableOpacity>
                      </Animated.View>
                    );
                  })}
                </ScrollView>
              </View>

              <View style={styles.petsRow}>
                <View style={styles.petsInfo}>
                  <Ionicons name="paw-outline" size={20} color="#11998e" />
                  <Text style={styles.petsLabel}>Travelling with pets</Text>
                </View>
                <Switch
                  value={travelWithPets}
                  onValueChange={setTravelWithPets}
                  trackColor={{ false: '#e0e0e0', true: '#a0e7d5' }}
                  thumbColor={travelWithPets ? '#11998e' : '#fff'}
                />
              </View>

              <AnimatedTouchable 
                style={[styles.searchButton, buttonAnimatedStyle]} 
                onPress={handleSearch}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#11998e', '#38ef7d']}
                  style={styles.searchGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="search" size={20} color="#fff" />
                  <Text style={styles.searchButtonText}>Search Hotels</Text>
                </LinearGradient>
              </AnimatedTouchable>
            </View>
          </BlurView>
        </Animated.View>

        <View style={[styles.bottomPadding, { paddingBottom: insets.bottom + 20 }]} />
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
    paddingBottom: 80,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  profileButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cityIllustration: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: 80,
  },
  buildingGroup: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  building: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  pinContainer: {
    position: 'absolute',
    top: 0,
    right: width * 0.25,
  },
  scrollView: {
    flex: 1,
    marginTop: -60,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  searchCard: {
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  cardBlur: {
    borderRadius: 25,
  },
  cardContent: {
    padding: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  inputIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: 'rgba(17, 153, 142, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  inputTextContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  inputValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 5,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  dateItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateArrow: {
    paddingHorizontal: 10,
  },
  travelTypeSection: {
    paddingVertical: 15,
  },
  travelTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
  },
  travelTypeLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  travelTypeGrid: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 10,
  },
  travelTypeButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 15,
    width: 80,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  travelTypeButtonActive: {
    borderColor: '#11998e',
    backgroundColor: 'rgba(17, 153, 142, 0.05)',
  },
  travelTypeIcon: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: 'rgba(17, 153, 142, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  travelTypeIconActive: {
    backgroundColor: '#11998e',
  },
  travelTypeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  travelTypeTextActive: {
    color: '#11998e',
    fontWeight: '600',
  },
  petsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 10,
  },
  petsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  petsLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  searchButton: {
    borderRadius: 15,
    overflow: 'hidden',
    marginTop: 20,
  },
  searchGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  bottomPadding: {
    height: 20,
  },
});

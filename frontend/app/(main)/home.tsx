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
  { id: 'business', label: 'Business', icon: 'briefcase', gradient: ['#2193b0', '#6dd5ed'] },
  { id: 'family', label: 'Family', icon: 'people', gradient: ['#fc4a1a', '#f7b733'] },
  { id: 'couple', label: 'Couple', icon: 'heart', gradient: ['#ee0979', '#ff6a00'] },
  { id: 'friends', label: 'Friends', icon: 'beer', gradient: ['#667eea', '#764ba2'] },
  { id: 'solo', label: 'Solo', icon: 'person', gradient: ['#1D976C', '#93F9B9'] },
];

export default function HomeScreen() {
  const [selectedTravelType, setSelectedTravelType] = useState('business');
  const [travelWithPets, setTravelWithPets] = useState(false);
  const [checkIn] = useState('2026-07-15');
  const [checkOut] = useState('2026-07-18');
  const insets = useSafeAreaInsets();

  const buttonScale = useSharedValue(1);
  const pinBounce = useSharedValue(0);
  const glowOpacity = useSharedValue(0.3);
  const barHeights = [useSharedValue(0), useSharedValue(0), useSharedValue(0), useSharedValue(0), useSharedValue(0)];

  useEffect(() => {
    pinBounce.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1, true
    );
    glowOpacity.value = withRepeat(
      withSequence(withTiming(0.5, { duration: 2500 }), withTiming(0.25, { duration: 2500 })),
      -1, true
    );
    barHeights.forEach((h, i) => {
      const target = 25 + Math.random() * 45;
      h.value = withDelay(i * 120, withSpring(target, { damping: 10 }));
    });
  }, []);

  const pinStyle = useAnimatedStyle(() => ({ transform: [{ translateY: pinBounce.value }] }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glowOpacity.value }));
  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: buttonScale.value }] }));

  const handleSearch = () => {
    buttonScale.value = withSequence(withTiming(0.95, { duration: 100 }), withSpring(1));
    setTimeout(() => router.push('/(main)/recommendations'), 200);
  };

  const selectedTrip = travelTypes.find((t) => t.id === selectedTravelType)!;

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
      {/* Decorative orbs */}
      <Animated.View style={[styles.orb, styles.orb1, glowStyle]} />
      <Animated.View style={[styles.orb, styles.orb2, glowStyle]} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 30 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.headerRow}>
          <TouchableOpacity style={styles.menuBtn}>
            <BlurView intensity={25} style={styles.menuBtnBlur} tint="dark">
              <Ionicons name="menu" size={22} color="#fff" />
            </BlurView>
          </TouchableOpacity>
          <Text style={styles.brandName}>StayCompare</Text>
          <TouchableOpacity style={styles.profileBtn} onPress={() => router.push('/(main)/profile')}>
            <BlurView intensity={25} style={styles.menuBtnBlur} tint="dark">
              <Ionicons name="person" size={18} color="#fff" />
            </BlurView>
          </TouchableOpacity>
        </Animated.View>

        {/* City Illustration */}
        <Animated.View entering={FadeInUp.delay(200)} style={styles.illustration}>
          <View style={styles.barsGroup}>
            {barHeights.map((h, i) => {
              const s = useAnimatedStyle(() => ({
                height: h.value,
                width: 18 + i * 4,
              }));
              return (
                <Animated.View key={i} style={[styles.bar, s]}>
                  <LinearGradient
                    colors={['rgba(102,126,234,0.5)', 'rgba(102,126,234,0.15)']}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                  />
                </Animated.View>
              );
            })}
          </View>
          <Animated.View style={[styles.pin, pinStyle]}>
            <Ionicons name="location" size={36} color="#FFD700" />
          </Animated.View>
        </Animated.View>

        {/* ===== Main Card ===== */}
        <Animated.View entering={FadeInUp.delay(350).springify()} style={styles.card}>
          {/* Where To? */}
          <TouchableOpacity
            style={styles.inputRow}
            onPress={() => router.push('/(main)/search-location')}
            activeOpacity={0.7}
          >
            <View style={styles.inputIcon}>
              <Ionicons name="location-outline" size={22} color="#667eea" />
            </View>
            <View style={styles.inputInfo}>
              <Text style={styles.inputLabel}>Where To?</Text>
              <Text style={styles.inputValue}>Search for location</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Dates */}
          <View style={styles.dateRow}>
            <TouchableOpacity style={styles.dateItem}>
              <View style={styles.inputIcon}>
                <Ionicons name="calendar-outline" size={20} color="#667eea" />
              </View>
              <View style={styles.inputInfo}>
                <Text style={styles.inputLabel}>Check-in</Text>
                <Text style={styles.inputValue}>{checkIn}</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.dateArrowWrap}>
              <Ionicons name="arrow-forward" size={14} color="rgba(255,255,255,0.2)" />
            </View>

            <TouchableOpacity style={styles.dateItem}>
              <View style={styles.inputInfo}>
                <Text style={styles.inputLabel}>Check-out</Text>
                <Text style={styles.inputValue}>{checkOut}</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Travel Type */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="airplane-outline" size={18} color="#667eea" />
              <Text style={styles.sectionLabel}>Travel Type</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.travelGrid}
            >
              {travelTypes.map((type, index) => {
                const isActive = selectedTravelType === type.id;
                return (
                  <Animated.View key={type.id} entering={ZoomIn.delay(450 + index * 80).springify()}>
                    <TouchableOpacity
                      style={[styles.travelBtn, isActive && styles.travelBtnActive]}
                      onPress={() => setSelectedTravelType(type.id)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.travelIconWrap, isActive && { backgroundColor: 'transparent' }]}>
                        {isActive && (
                          <LinearGradient
                            colors={type.gradient as [string, string]}
                            style={[StyleSheet.absoluteFill, { borderRadius: 12 }]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                          />
                        )}
                        <Ionicons
                          name={type.icon as any}
                          size={22}
                          color={isActive ? '#fff' : 'rgba(255,255,255,0.5)'}
                        />
                      </View>
                      <Text style={[styles.travelLabel, isActive && styles.travelLabelActive]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.divider} />

          {/* Pets Toggle */}
          <View style={styles.petsRow}>
            <View style={styles.petsInfo}>
              <View style={[styles.inputIcon, { width: 36, height: 36 }]}>
                <Ionicons name="paw" size={18} color={travelWithPets ? '#1D976C' : 'rgba(255,255,255,0.4)'} />
              </View>
              <Text style={[styles.petsLabel, travelWithPets && { color: '#1D976C' }]}>
                Travelling with pets
              </Text>
            </View>
            <Switch
              value={travelWithPets}
              onValueChange={setTravelWithPets}
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: 'rgba(29,151,108,0.5)' }}
              thumbColor={travelWithPets ? '#1D976C' : 'rgba(255,255,255,0.5)'}
            />
          </View>
        </Animated.View>

        {/* Search Button */}
        <Animated.View entering={FadeInUp.delay(600).springify()}>
          <AnimatedTouchable
            style={[styles.searchBtn, btnStyle]}
            onPress={handleSearch}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={selectedTrip.gradient as [string, string]}
              style={styles.searchGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="search" size={20} color="#fff" />
              <Text style={styles.searchText}>Find & Compare Hotels</Text>
            </LinearGradient>
          </AnimatedTouchable>
        </Animated.View>

        {/* Quick links */}
        <Animated.View entering={FadeInUp.delay(700)} style={styles.quickLinks}>
          <TouchableOpacity style={styles.quickLink} onPress={() => router.push('/(main)/hotel-listing')}>
            <View style={[styles.quickIcon, { backgroundColor: 'rgba(102,126,234,0.15)' }]}>
              <Ionicons name="grid-outline" size={18} color="#667eea" />
            </View>
            <Text style={styles.quickText}>All Hotels</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickLink} onPress={() => router.push('/(main)/map-view')}>
            <View style={[styles.quickIcon, { backgroundColor: 'rgba(17,153,142,0.15)' }]}>
              <Ionicons name="map-outline" size={18} color="#11998e" />
            </View>
            <Text style={styles.quickText}>Map View</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickLink} onPress={() => router.push('/(main)/comparison')}>
            <View style={[styles.quickIcon, { backgroundColor: 'rgba(238,9,121,0.15)' }]}>
              <Ionicons name="bar-chart-outline" size={18} color="#ee0979" />
            </View>
            <Text style={styles.quickText}>Compare</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickLink} onPress={() => router.push('/(main)/favorites')}>
            <View style={[styles.quickIcon, { backgroundColor: 'rgba(255,65,108,0.15)' }]}>
              <Ionicons name="heart-outline" size={18} color="#FF416C" />
            </View>
            <Text style={styles.quickText}>Saved</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  orb: { position: 'absolute', borderRadius: 999 },
  orb1: { width: 200, height: 200, top: -50, right: -60, backgroundColor: '#667eea' },
  orb2: { width: 140, height: 140, bottom: 120, left: -40, backgroundColor: '#764ba2' },
  scrollContent: { paddingHorizontal: 20 },
  // Header
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  menuBtn: { width: 42, height: 42, borderRadius: 14, overflow: 'hidden' },
  menuBtnBlur: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)' },
  brandName: { fontSize: 24, fontWeight: '800', color: '#fff', fontStyle: 'italic', letterSpacing: -0.5 },
  profileBtn: { width: 42, height: 42, borderRadius: 14, overflow: 'hidden' },
  // Illustration
  illustration: { height: 90, justifyContent: 'flex-end', alignItems: 'center', marginBottom: 16 },
  barsGroup: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  bar: { borderTopLeftRadius: 5, borderTopRightRadius: 5, overflow: 'hidden' },
  pin: { position: 'absolute', top: 0, right: width * 0.18 },
  // Card
  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 18,
    marginBottom: 18,
  },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 4 },
  // Input rows
  inputRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  inputIcon: {
    width: 42, height: 42, borderRadius: 13,
    backgroundColor: 'rgba(102,126,234,0.12)',
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  inputInfo: { flex: 1 },
  inputLabel: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 3, fontWeight: '500' },
  inputValue: { fontSize: 16, color: '#fff', fontWeight: '600' },
  // Date
  dateRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  dateItem: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  dateArrowWrap: { paddingHorizontal: 8 },
  // Travel type
  section: { paddingVertical: 14 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionLabel: { fontSize: 14, color: '#fff', fontWeight: '700' },
  travelGrid: { flexDirection: 'row', gap: 10 },
  travelBtn: {
    alignItems: 'center', padding: 10, borderRadius: 16, width: 72,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  travelBtnActive: { borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.08)' },
  travelIconWrap: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 6,
  },
  travelLabel: { fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: '500' },
  travelLabelActive: { color: '#fff', fontWeight: '700' },
  // Pets
  petsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  petsInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  petsLabel: { fontSize: 14, color: 'rgba(255,255,255,0.5)', fontWeight: '500' },
  // Search button
  searchBtn: { borderRadius: 16, overflow: 'hidden', marginBottom: 24 },
  searchGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 10 },
  searchText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  // Quick links
  quickLinks: { flexDirection: 'row', justifyContent: 'space-between' },
  quickLink: { alignItems: 'center', gap: 8, flex: 1 },
  quickIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  quickText: { fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: '500' },
});

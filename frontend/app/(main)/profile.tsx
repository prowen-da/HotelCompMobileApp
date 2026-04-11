import React, { useEffect } from 'react';
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

const stats = [
  { label: 'Bookings', value: '24', icon: 'calendar' },
  { label: 'Reviews', value: '18', icon: 'star' },
  { label: 'Saved', value: '42', icon: 'heart' },
];

const menuSections = [
  {
    title: 'Account',
    items: [
      { icon: 'person-outline', label: 'Edit Profile', route: null, color: '#667eea' },
      { icon: 'heart-outline', label: 'Favorites', route: '/(main)/favorites', color: '#ee0979' },
      { icon: 'notifications-outline', label: 'Notifications', route: '/(main)/notifications', color: '#fc4a1a' },
      { icon: 'card-outline', label: 'Payment Methods', route: null, color: '#11998e' },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { icon: 'settings-outline', label: 'Settings', route: '/(main)/settings', color: '#2193b0' },
      { icon: 'globe-outline', label: 'Language', route: null, color: '#764ba2' },
      { icon: 'moon-outline', label: 'Dark Mode', route: null, color: '#333' },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: 'help-circle-outline', label: 'Help Center', route: null, color: '#38ef7d' },
      { icon: 'shield-checkmark-outline', label: 'Privacy Policy', route: null, color: '#6dd5ed' },
      { icon: 'log-out-outline', label: 'Log Out', route: null, color: '#FF416C' },
    ],
  },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const avatarScale = useSharedValue(0);

  useEffect(() => {
    avatarScale.value = withDelay(300, withSpring(1, { damping: 12 }));
  }, []);

  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }],
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View entering={FadeInDown.springify()} style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <BlurView intensity={30} style={styles.backBtnBlur}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </BlurView>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.editBtn}>
            <Ionicons name="create-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.avatarContainer, avatarStyle]}>
          <LinearGradient
            colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
            style={styles.avatarRing}
          >
            <View style={styles.avatar}>
              <Ionicons name="person" size={50} color="#667eea" />
            </View>
          </LinearGradient>
          <Animated.Text entering={FadeInUp.delay(400)} style={styles.userName}>
            Alex Johnson
          </Animated.Text>
          <Animated.Text entering={FadeInUp.delay(500)} style={styles.userEmail}>
            alex.johnson@email.com
          </Animated.Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(500)} style={styles.statsRow}>
          {stats.map((stat, i) => (
            <Animated.View
              key={stat.label}
              entering={ZoomIn.delay(600 + i * 100)}
              style={styles.statItem}
            >
              <BlurView intensity={25} style={styles.statBlur}>
                <Ionicons name={stat.icon as any} size={18} color="#FFD700" />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </BlurView>
            </Animated.View>
          ))}
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}
        showsVerticalScrollIndicator={false}
      >
        {menuSections.map((section, sIdx) => (
          <Animated.View
            key={section.title}
            entering={FadeInDown.delay(700 + sIdx * 150)}
            style={styles.menuSection}
          >
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, idx) => (
                <AnimatedTouchable
                  key={item.label}
                  entering={SlideInRight.delay(800 + sIdx * 150 + idx * 80)}
                  style={[
                    styles.menuItem,
                    idx < section.items.length - 1 && styles.menuItemBorder,
                  ]}
                  onPress={() => item.route && router.push(item.route as any)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuIconWrap, { backgroundColor: item.color + '15' }]}>
                    <Ionicons name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={18} color="#ccc" />
                </AnimatedTouchable>
              ))}
            </View>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { paddingBottom: 25 },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  backBtn: { width: 45, height: 45, borderRadius: 15, overflow: 'hidden' },
  backBtnBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  editBtn: { padding: 10 },
  avatarContainer: { alignItems: 'center', marginBottom: 20 },
  avatarRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: { fontSize: 22, fontWeight: '800', color: '#fff' },
  userEmail: { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 20,
  },
  statItem: { flex: 1, borderRadius: 16, overflow: 'hidden' },
  statBlur: {
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    gap: 4,
  },
  statValue: { fontSize: 20, fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  menuSection: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 5,
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    boxShadow: '0px 2px 8px rgba(0,0,0,0.06)',
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  menuIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: '#333' },
});

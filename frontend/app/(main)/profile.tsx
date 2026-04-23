import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
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
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  ZoomIn,
} from 'react-native-reanimated';
import { useAuth } from '../../src/context/AuthContext';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const stats = [
  { label: 'Compared', value: '24', icon: 'git-compare' },
  { label: 'Reviews', value: '18', icon: 'star' },
  { label: 'Saved', value: '42', icon: 'heart' },
];

const menuSections = [
  {
    title: 'Account',
    items: [
      { icon: 'person-outline', label: 'Edit Profile', route: null, color: '#667eea' },
      { icon: 'heart-outline', label: 'Favorites', route: '/(main)/favorites', color: '#a78bfa' },
      { icon: 'notifications-outline', label: 'Notifications', route: '/(main)/notifications', color: '#F5A623' },
      { icon: 'card-outline', label: 'Payment Methods', route: null, color: '#11998e' },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { icon: 'settings-outline', label: 'Settings', route: '/(main)/settings', color: '#2193b0' },
      { icon: 'globe-outline', label: 'Language', route: null, color: '#764ba2' },
      { icon: 'moon-outline', label: 'Dark Mode', route: null, color: '#6dd5ed' },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: 'help-circle-outline', label: 'Help Center', route: null, color: '#38ef7d' },
      { icon: 'shield-checkmark-outline', label: 'Privacy Policy', route: null, color: '#6dd5ed' },
      { icon: 'log-out-outline', label: 'Log Out', route: null, color: '#ef4444' },
    ],
  },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { isGuest, userId, logout } = useAuth();
  const avatarScale = useSharedValue(0);
  const glowOpacity = useSharedValue(0.3);

  useEffect(() => {
    avatarScale.value = withDelay(300, withSpring(1, { damping: 12 }));
    glowOpacity.value = withRepeat(
      withSequence(withTiming(0.5, { duration: 2500 }), withTiming(0.25, { duration: 2500 })),
      -1, true
    );
  }, []);

  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glowOpacity.value }));

  const handleMenuPress = async (label: string, route: string | null) => {
    if (label === 'Log Out') {
      Alert.alert('Log Out', 'Are you sure you want to log out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: async () => {
          await logout();
          router.replace('/welcome');
        }},
      ]);
      return;
    }
    if (route) router.push(route as any);
  };

  const displayName = isGuest ? 'Guest User' : `User #${userId || ''}`;
  const displayEmail = isGuest ? 'Browsing as guest' : `ID: ${userId || 'N/A'}`;

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
      <Animated.View style={[styles.orb, styles.orb1, glowStyle]} />
      <Animated.View style={[styles.orb, styles.orb2, glowStyle]} />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 30 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.springify()} style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <BlurView intensity={25} style={styles.backBtnBlur} tint="dark">
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </BlurView>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.editBtn}>
            <Ionicons name="create-outline" size={22} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        </Animated.View>

        {/* Avatar Card */}
        <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.avatarCard}>
          <Animated.View style={[styles.avatarRing, avatarStyle]}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.avatarGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.avatarInner}>
                <Ionicons name="person" size={40} color="#667eea" />
              </View>
            </LinearGradient>
          </Animated.View>
          <Animated.Text entering={FadeInUp.delay(400)} style={styles.userName}>{displayName}</Animated.Text>
          <Animated.Text entering={FadeInUp.delay(500)} style={styles.userEmail}>{displayEmail}</Animated.Text>

          <Animated.View entering={FadeInUp.delay(500)} style={styles.statsRow}>
            {stats.map((stat, i) => (
              <Animated.View key={stat.label} entering={ZoomIn.delay(600 + i * 100)} style={styles.statItem}>
                <View style={styles.statBox}>
                  <Ionicons name={stat.icon as any} size={16} color="#FFD700" />
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              </Animated.View>
            ))}
          </Animated.View>
        </Animated.View>

        {/* Menu Sections */}
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
                  style={[styles.menuItem, idx < section.items.length - 1 && styles.menuItemBorder]}
                  onPress={() => handleMenuPress(item.label, item.route)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuIconWrap, { backgroundColor: item.color + '20' }]}>
                    <Ionicons name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.25)" />
                </AnimatedTouchable>
              ))}
            </View>
          </Animated.View>
        ))}
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
  headerTop: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20,
  },
  backBtn: { width: 42, height: 42, borderRadius: 14, overflow: 'hidden' },
  backBtnBlur: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  editBtn: { padding: 10 },
  avatarCard: {
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 24,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    padding: 24, alignItems: 'center', marginBottom: 24,
  },
  avatarRing: { marginBottom: 14 },
  avatarGradient: {
    width: 96, height: 96, borderRadius: 48,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarInner: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center', alignItems: 'center',
  },
  userName: { fontSize: 22, fontWeight: '800', color: '#fff' },
  userEmail: { fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 4, marginBottom: 20 },
  statsRow: { flexDirection: 'row', gap: 12, width: '100%' },
  statItem: { flex: 1 },
  statBox: {
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', paddingVertical: 14, gap: 4,
  },
  statValue: { fontSize: 20, fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
  menuSection: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.35)',
    textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10, marginLeft: 5,
  },
  menuCard: {
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  menuIconWrap: {
    width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: '#fff' },
});

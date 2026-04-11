import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  SlideInRight,
} from 'react-native-reanimated';

const notifications = [
  {
    id: 1,
    type: 'booking',
    title: 'Booking Confirmed',
    message: 'Your reservation at The Grand Palace Hotel for Feb 14-17 has been confirmed.',
    time: '2 min ago',
    read: false,
    icon: 'checkmark-circle',
    gradient: ['#11998e', '#38ef7d'],
  },
  {
    id: 2,
    type: 'offer',
    title: '30% Off Flash Sale!',
    message: 'Luxury hotels in New York are now 30% off. Book before midnight!',
    time: '1 hour ago',
    read: false,
    icon: 'pricetag',
    gradient: ['#a78bfa', '#c084fc'],
  },
  {
    id: 3,
    type: 'reminder',
    title: 'Check-in Reminder',
    message: 'Your check-in at Royal Romance Suites is tomorrow. Don\'t forget your ID!',
    time: '3 hours ago',
    read: false,
    icon: 'alarm',
    gradient: ['#667eea', '#764ba2'],
  },
  {
    id: 4,
    type: 'review',
    title: 'Leave a Review',
    message: 'How was your stay at Serenity Spa Resort? Share your experience with others.',
    time: '1 day ago',
    read: true,
    icon: 'star',
    gradient: ['#F5A623', '#FFD700'],
  },
  {
    id: 5,
    type: 'system',
    title: 'New Feature Available',
    message: 'Compare hotels side-by-side with our new comparison tool. Try it now!',
    time: '2 days ago',
    read: true,
    icon: 'sparkles',
    gradient: ['#2193b0', '#6dd5ed'],
  },
  {
    id: 6,
    type: 'offer',
    title: 'Weekend Getaway Deals',
    message: 'Escape the city! Adventure hotels starting from $99/night this weekend.',
    time: '3 days ago',
    read: true,
    icon: 'compass',
    gradient: ['#ef4444', '#f87171'],
  },
  {
    id: 7,
    type: 'loyalty',
    title: 'You Earned 500 Points!',
    message: 'Your recent stay has earned you 500 loyalty points. Redeem for free nights.',
    time: '5 days ago',
    read: true,
    icon: 'trophy',
    gradient: ['#1D976C', '#93F9B9'],
  },
];

const NotificationCard = ({ item, index }: { item: typeof notifications[0]; index: number }) => (
  <Animated.View entering={SlideInRight.delay(index * 80).springify()}>
    <TouchableOpacity
      style={[styles.notifCard, !item.read && styles.notifCardUnread]}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={item.gradient}
        style={styles.notifIcon}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons name={item.icon as any} size={20} color="#fff" />
      </LinearGradient>
      <View style={styles.notifContent}>
        <View style={styles.notifHeader}>
          <Text style={styles.notifTitle} numberOfLines={1}>{item.title}</Text>
          {!item.read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.notifMessage} numberOfLines={2}>{item.message}</Text>
        <Text style={styles.notifTime}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  </Animated.View>
);

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f0c29', '#302b63', '#24243e']}
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
            <Text style={styles.headerTitle}>Notifications</Text>
            <Text style={styles.headerSub}>{unreadCount} unread messages</Text>
          </View>
          <TouchableOpacity style={styles.markReadBtn}>
            <Ionicons name="checkmark-done" size={22} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.list}
        contentContainerStyle={{ padding: 15, paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Today */}
        <Animated.View entering={FadeInDown.delay(200)}>
          <Text style={styles.sectionLabel}>Today</Text>
          {notifications.filter((n) => n.time.includes('min') || n.time.includes('hour')).map((n, i) => (
            <NotificationCard key={n.id} item={n} index={i} />
          ))}
        </Animated.View>

        {/* Earlier */}
        <Animated.View entering={FadeInDown.delay(400)}>
          <Text style={styles.sectionLabel}>Earlier</Text>
          {notifications.filter((n) => n.time.includes('day')).map((n, i) => (
            <NotificationCard key={n.id} item={n} index={i + 3} />
          ))}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0c29' },
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
  markReadBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: { flex: 1 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 8,
    marginLeft: 4,
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
        
  },
  notifCardUnread: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderLeftWidth: 3,
    borderLeftColor: '#F5A623',
  },
  notifIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notifContent: { flex: 1 },
  notifHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: '#fff' },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F5A623',
    marginLeft: 8,
  },
  notifMessage: { fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 18, marginBottom: 6 },
  notifTime: { fontSize: 11, color: 'rgba(255,255,255,0.3)' },
});

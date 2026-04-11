import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeInUp,
  SlideInRight,
} from 'react-native-reanimated';

const currencies = ['USD ($)', 'EUR (€)', 'GBP (£)', 'INR (₹)'];
const defaultTrips = ['Family', 'Business', 'Friends', 'Solo'];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [petDefault, setPetDefault] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(0);
  const [selectedTrip, setSelectedTrip] = useState(0);

  const settingSections = [
    {
      title: 'Comparison Preferences',
      items: [
        {
          icon: 'cash-outline',
          label: 'Default Currency',
          color: '#11998e',
          type: 'selector',
          options: currencies,
          selected: selectedCurrency,
          onSelect: setSelectedCurrency,
        },
        {
          icon: 'people-outline',
          label: 'Default Trip Type',
          color: '#F5A623',
          type: 'selector',
          options: defaultTrips,
          selected: selectedTrip,
          onSelect: setSelectedTrip,
        },
        {
          icon: 'paw',
          label: 'Pet-Friendly Default',
          color: '#1D976C',
          type: 'toggle',
          value: petDefault,
          onToggle: setPetDefault,
          sub: 'Always filter for pet-friendly hotels',
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          icon: 'notifications-outline',
          label: 'Push Notifications',
          color: '#667eea',
          type: 'toggle',
          value: notifications,
          onToggle: setNotifications,
          sub: 'Booking updates and reminders',
        },
        {
          icon: 'trending-down-outline',
          label: 'Price Drop Alerts',
          color: '#a78bfa',
          type: 'toggle',
          value: priceAlerts,
          onToggle: setPriceAlerts,
          sub: 'Notify when saved hotel prices drop',
        },
      ],
    },
    {
      title: 'Appearance',
      items: [
        {
          icon: 'moon-outline',
          label: 'Dark Mode',
          color: '#fff',
          type: 'toggle',
          value: darkMode,
          onToggle: setDarkMode,
          sub: 'Switch to dark theme',
        },
      ],
    },
    {
      title: 'Data & Privacy',
      items: [
        { icon: 'cloud-download-outline', label: 'Download My Data', color: '#2193b0', type: 'link' },
        { icon: 'trash-outline', label: 'Clear Search History', color: '#ef4444', type: 'link' },
        { icon: 'shield-checkmark-outline', label: 'Privacy Policy', color: '#764ba2', type: 'link' },
        { icon: 'document-text-outline', label: 'Terms of Service', color: '#11998e', type: 'link' },
      ],
    },
    {
      title: 'About',
      items: [
        { icon: 'information-circle-outline', label: 'App Version', color: 'rgba(255,255,255,0.4)', type: 'info', info: 'v1.0.0' },
        { icon: 'star-outline', label: 'Rate the App', color: '#FFD700', type: 'link' },
        { icon: 'chatbubble-ellipses-outline', label: 'Send Feedback', color: '#2193b0', type: 'link' },
      ],
    },
  ];

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Animated.View entering={FadeInDown.springify()} style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <BlurView intensity={25} style={styles.backBtnBlur} tint="dark">
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </BlurView>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 45 }} />
        </Animated.View>
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}
        showsVerticalScrollIndicator={false}
      >
        {settingSections.map((section, sIdx) => (
          <Animated.View
            key={section.title}
            entering={FadeInDown.delay(200 + sIdx * 100)}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, idx) => (
                <Animated.View
                  key={item.label}
                  entering={SlideInRight.delay(300 + sIdx * 100 + idx * 60)}
                >
                  <View
                    style={[
                      styles.settingRow,
                      idx < section.items.length - 1 && styles.settingRowBorder,
                    ]}
                  >
                    <View style={[styles.iconWrap, { backgroundColor: item.color + '15' }]}>
                      <Ionicons name={item.icon as any} size={20} color={item.color} />
                    </View>
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingLabel}>{item.label}</Text>
                      {item.type === 'toggle' && item.sub && (
                        <Text style={styles.settingSub}>{item.sub}</Text>
                      )}
                      {item.type === 'selector' && (
                        <View style={styles.selectorRow}>
                          {item.options?.map((opt, oIdx) => (
                            <TouchableOpacity
                              key={opt}
                              style={[
                                styles.selectorPill,
                                item.selected === oIdx && { backgroundColor: item.color, borderColor: item.color },
                              ]}
                              onPress={() => item.onSelect?.(oIdx)}
                            >
                              <Text
                                style={[
                                  styles.selectorText,
                                  item.selected === oIdx && styles.selectorTextActive,
                                ]}
                              >
                                {opt}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                    {item.type === 'toggle' && (
                      <Switch
                        value={item.value}
                        onValueChange={item.onToggle}
                        trackColor={{ false: 'rgba(255,255,255,0.1)', true: item.color + '60' }}
                        thumbColor={item.value ? item.color : 'rgba(255,255,255,0.5)'}
                      />
                    )}
                    {item.type === 'link' && (
                      <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.25)" />
                    )}
                    {item.type === 'info' && (
                      <Text style={styles.infoText}>{item.info}</Text>
                    )}
                  </View>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        ))}

        {/* Danger Zone */}
        <Animated.View entering={FadeInUp.delay(800)} style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity style={styles.dangerBtn}>
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <Text style={styles.dangerText}>Log Out</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.dangerBtn, { marginTop: 8 }]}>
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
            <Text style={styles.dangerText}>Delete Account</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingBottom: 18, paddingHorizontal: 15 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { width: 45, height: 45, borderRadius: 15, overflow: 'hidden' },
  backBtnBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  settingInfo: { flex: 1 },
  settingLabel: { fontSize: 15, fontWeight: '500', color: '#fff' },
  settingSub: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  selectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  selectorPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  selectorText: { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.6)' },
  selectorTextActive: { color: '#fff', fontWeight: '600' },
  infoText: { fontSize: 14, color: 'rgba(255,255,255,0.4)', fontWeight: '500' },
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.15)',
  },
  dangerText: { fontSize: 15, fontWeight: '600', color: '#ef4444' },
});

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
          color: '#fc4a1a',
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
          color: '#ee0979',
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
          color: '#333',
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
        { icon: 'trash-outline', label: 'Clear Search History', color: '#FF416C', type: 'link' },
        { icon: 'shield-checkmark-outline', label: 'Privacy Policy', color: '#764ba2', type: 'link' },
        { icon: 'document-text-outline', label: 'Terms of Service', color: '#11998e', type: 'link' },
      ],
    },
    {
      title: 'About',
      items: [
        { icon: 'information-circle-outline', label: 'App Version', color: '#999', type: 'info', info: 'v1.0.0' },
        { icon: 'star-outline', label: 'Rate the App', color: '#FFD700', type: 'link' },
        { icon: 'chatbubble-ellipses-outline', label: 'Send Feedback', color: '#2193b0', type: 'link' },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#2193b0', '#6dd5ed']}
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
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 45 }} />
        </Animated.View>
      </LinearGradient>

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
                        trackColor={{ false: '#e0e0e0', true: item.color + '60' }}
                        thumbColor={item.value ? item.color : '#f4f4f4'}
                      />
                    )}
                    {item.type === 'link' && (
                      <Ionicons name="chevron-forward" size={18} color="#ccc" />
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
            <Ionicons name="log-out-outline" size={20} color="#FF416C" />
            <Text style={styles.dangerText}>Log Out</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.dangerBtn, { marginTop: 8 }]}>
            <Ionicons name="trash-outline" size={20} color="#FF416C" />
            <Text style={styles.dangerText}>Delete Account</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
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
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
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
  settingLabel: { fontSize: 15, fontWeight: '500', color: '#333' },
  settingSub: { fontSize: 12, color: '#999', marginTop: 2 },
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
    borderColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
  },
  selectorText: { fontSize: 12, fontWeight: '500', color: '#666' },
  selectorTextActive: { color: '#fff', fontWeight: '600' },
  infoText: { fontSize: 14, color: '#999', fontWeight: '500' },
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#FFE0E6',
  },
  dangerText: { fontSize: 15, fontWeight: '600', color: '#FF416C' },
});

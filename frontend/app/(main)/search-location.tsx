import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const recentSearches = [
  { id: 1, name: 'Golden Sands Retreat', location: 'Clearwater, FL' },
  { id: 2, name: 'Crystal Peak Lodge', location: 'Aspen, CO' },
  { id: 3, name: 'Coral Bay Resort', location: 'Miami Beach, FL' },
];

const popularDestinations = [
  { id: 1, name: 'Herāt', country: 'Afghanistan', icon: 'business' },
  { id: 2, name: 'Himarë', country: 'Albania', icon: 'business' },
  { id: 3, name: 'Hammam Bou Hadjar', country: 'Algeria', icon: 'business' },
  { id: 4, name: 'Hamma Bouziane', country: 'Algeria', icon: 'business' },
  { id: 5, name: 'Héliopolis', country: 'Algeria', icon: 'business' },
];

export default function SearchLocationScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const insets = useSafeAreaInsets();

  const filteredDestinations = searchQuery
    ? popularDestinations.filter(
        (d) =>
          d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.country.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSelectLocation = (name: string) => {
    router.back();
  };

  const handleClearAll = () => {
    // Clear recent searches logic
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f0c29', '#302b63', '#24243e']}
        style={[styles.headerGradient, { paddingTop: insets.top + 10 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <BlurView intensity={30} style={styles.backButtonBlur}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </BlurView>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Search Location</Text>
          <View style={{ width: 45 }} />
        </View>

        <View style={styles.searchContainer}>
          <BlurView intensity={30} style={styles.searchBlur}>
            <Ionicons name="search" size={20} color="rgba(255,255,255,0.8)" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.8)" />
              </TouchableOpacity>
            )}
          </BlurView>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {searchQuery.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Search Results</Text>
            {filteredDestinations.map((destination) => (
              <TouchableOpacity
                key={destination.id}
                style={styles.locationItem}
                onPress={() => handleSelectLocation(destination.name)}
              >
                <View style={styles.locationIcon}>
                  <Ionicons name="business" size={20} color="#11998e" />
                </View>
                <View style={styles.locationInfo}>
                  <Text style={styles.locationName}>{destination.name}</Text>
                  <Text style={styles.locationCountry}>{destination.country}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
            ))}
            {filteredDestinations.length === 0 && (
              <Text style={styles.noResults}>No locations found</Text>
            )}
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Searches</Text>
                <TouchableOpacity onPress={handleClearAll}>
                  <Text style={styles.clearAllText}>Clear All</Text>
                </TouchableOpacity>
              </View>
              {recentSearches.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.locationItem}
                  onPress={() => handleSelectLocation(item.name)}
                >
                  <View style={styles.locationIcon}>
                    <Ionicons name="time-outline" size={20} color="#999" />
                  </View>
                  <View style={styles.locationInfo}>
                    <Text style={styles.locationName}>{item.name}</Text>
                    <Text style={styles.locationCountry}>{item.location}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Popular Destinations</Text>
              {popularDestinations.map((destination) => (
                <TouchableOpacity
                  key={destination.id}
                  style={styles.locationItem}
                  onPress={() => handleSelectLocation(destination.name)}
                >
                  <View style={styles.locationIcon}>
                    <Ionicons name="business" size={20} color="#11998e" />
                  </View>
                  <View style={styles.locationInfo}>
                    <Text style={styles.locationName}>{destination.name}</Text>
                    <Text style={styles.locationCountry}>{destination.country}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <View style={{ height: insets.bottom + 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0c29',
  },
  headerGradient: {
    paddingBottom: 25,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
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
  searchContainer: {
    marginHorizontal: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  searchBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 15,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    marginLeft: 10,
    marginRight: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 15,
  },
  clearAllText: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: '600',
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
        
  },
  locationIcon: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: '#0f0c29',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  locationCountry: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
  },
  noResults: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    paddingVertical: 20,
  },
});

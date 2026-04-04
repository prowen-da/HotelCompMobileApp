import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const onboardingData = [
  {
    id: 1,
    icon: 'search',
    title: 'SMART RECOMMENDATIONS',
    description:
      'Get intelligent hotel recommendations based on your travel preferences, budget, and popular choices from other travelers.',
    gradient: ['#667eea', '#764ba2'],
  },
  {
    id: 2,
    icon: 'git-compare',
    title: 'COMPARE HOTELS EASILY',
    description:
      'Compare hotel prices, ratings, and amenities across multiple options so you can clearly see what offers the best value for your stay.',
    gradient: ['#11998e', '#38ef7d'],
  },
  {
    id: 3,
    icon: 'trophy',
    title: 'CHOOSE THE BEST STAY',
    description:
      'Make confident booking decisions with clear insights, honest comparisons, and everything you need before choosing your stay.',
    gradient: ['#667eea', '#764ba2'],
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: (currentIndex + 1) * width,
        animated: true,
      });
      setCurrentIndex(currentIndex + 1);
    } else {
      router.replace('/welcome');
    }
  };

  const handleSkip = () => {
    router.replace('/welcome');
  };

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={onboardingData[currentIndex].gradient}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <TouchableOpacity
        style={[styles.skipButton, { top: insets.top + 10 }]}
        onPress={handleSkip}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
      >
        {onboardingData.map((item, index) => (
          <View key={item.id} style={styles.slide}>
            <View style={styles.illustrationContainer}>
              <View style={styles.glassCard}>
                <BlurView intensity={20} style={styles.blurContainer}>
                  <View style={styles.iconContainer}>
                    <Ionicons name={item.icon as any} size={80} color="#fff" />
                  </View>
                  <View style={styles.mockPhone}>
                    <View style={styles.phoneScreen}>
                      <View style={styles.mockHeader}>
                        <Ionicons name="home" size={16} color="#667eea" />
                        <Text style={styles.mockTitle}>Booking</Text>
                        <Ionicons name="menu" size={16} color="#667eea" />
                      </View>
                      <View style={styles.mockContent}>
                        {[1, 2, 3].map((_, i) => (
                          <View key={i} style={styles.mockCard}>
                            <View style={styles.mockCardIcon} />
                            <View style={styles.mockCardText}>
                              <View style={styles.mockLine} />
                              <View style={[styles.mockLine, { width: 40 }]} />
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                </BlurView>
              </View>
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </View>
        ))}
      </Animated.ScrollView>

      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.pagination}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index && styles.activeDot,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <BlurView intensity={30} style={styles.nextButtonBlur}>
            <Text style={styles.nextButtonText}>
              {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <Ionicons
              name={currentIndex === onboardingData.length - 1 ? 'checkmark' : 'arrow-forward'}
              size={20}
              color="#fff"
            />
          </BlurView>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
  },
  skipText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '600',
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
  },
  glassCard: {
    width: width * 0.85,
    height: height * 0.45,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  blurContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  mockPhone: {
    width: '90%',
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  phoneScreen: {
    flex: 1,
    padding: 15,
  },
  mockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  mockTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  mockContent: {
    flex: 1,
    gap: 10,
  },
  mockCard: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  mockCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#667eea',
    marginRight: 10,
  },
  mockCardText: {
    flex: 1,
    gap: 5,
  },
  mockLine: {
    height: 8,
    backgroundColor: '#ddd',
    borderRadius: 4,
    width: 80,
  },
  textContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
    letterSpacing: 1,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  activeDot: {
    width: 24,
    backgroundColor: '#fff',
  },
  nextButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  nextButtonBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 25,
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

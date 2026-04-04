import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
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
  withRepeat,
  withSequence,
  interpolate,
  Extrapolation,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInRight,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

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

const OnboardingSlide = ({ item, index, scrollX }: { item: typeof onboardingData[0]; index: number; scrollX: Animated.SharedValue<number> }) => {
  const floatY = useSharedValue(0);
  const cardScale = useSharedValue(0.8);
  const iconRotate = useSharedValue(0);

  useEffect(() => {
    // Floating animation
    floatY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(10, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Card entrance
    cardScale.value = withDelay(200, withSpring(1, { damping: 12 }));

    // Icon animation
    iconRotate.value = withRepeat(
      withSequence(
        withTiming(5, { duration: 2000 }),
        withTiming(-5, { duration: 2000 })
      ),
      -1,
      true
    );
  }, []);

  const floatingStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.85, 1, 0.85],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.5, 1, 0.5],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${iconRotate.value}deg` }],
  }));

  return (
    <View style={styles.slide}>
      <Animated.View style={[styles.illustrationContainer, floatingStyle]}>
        <Animated.View style={[styles.glassCard, cardAnimatedStyle]}>
          <BlurView intensity={20} style={styles.blurContainer}>
            <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
              <Ionicons name={item.icon as any} size={80} color="#fff" />
            </Animated.View>
            <View style={styles.mockPhone}>
              <View style={styles.phoneScreen}>
                <View style={styles.mockHeader}>
                  <Ionicons name="home" size={16} color="#667eea" />
                  <Text style={styles.mockTitle}>Booking</Text>
                  <Ionicons name="menu" size={16} color="#667eea" />
                </View>
                <View style={styles.mockContent}>
                  {[1, 2, 3].map((_, i) => (
                    <Animated.View
                      key={i}
                      entering={FadeInDown.delay(300 + i * 100).springify()}
                      style={styles.mockCard}
                    >
                      <View style={styles.mockCardIcon} />
                      <View style={styles.mockCardText}>
                        <View style={styles.mockLine} />
                        <View style={[styles.mockLine, { width: 40 }]} />
                      </View>
                    </Animated.View>
                  ))}
                </View>
              </View>
            </View>
          </BlurView>
        </Animated.View>
      </Animated.View>

      <Animated.View 
        style={styles.textContainer}
        entering={FadeInUp.delay(400).springify()}
      >
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </Animated.View>
    </View>
  );
};

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const buttonScale = useSharedValue(1);

  const handleNext = () => {
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1)
    );
    
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
    scrollX.value = event.nativeEvent.contentOffset.x;
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={onboardingData[currentIndex].gradient}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <Animated.View entering={FadeIn.delay(200)}>
        <TouchableOpacity
          style={[styles.skipButton, { top: insets.top + 10 }]}
          onPress={handleSkip}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {onboardingData.map((item, index) => (
          <OnboardingSlide
            key={item.id}
            item={item}
            index={index}
            scrollX={scrollX}
          />
        ))}
      </ScrollView>

      <Animated.View 
        style={[styles.bottomContainer, { paddingBottom: insets.bottom + 20 }]}
        entering={FadeInUp.delay(600)}
      >
        <View style={styles.pagination}>
          {onboardingData.map((_, index) => {
            const dotWidth = useAnimatedStyle(() => {
              const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
              const dotW = interpolate(
                scrollX.value,
                inputRange,
                [8, 24, 8],
                Extrapolation.CLAMP
              );
              const opacity = interpolate(
                scrollX.value,
                inputRange,
                [0.4, 1, 0.4],
                Extrapolation.CLAMP
              );
              return {
                width: dotW,
                opacity,
              };
            });
            return (
              <Animated.View
                key={index}
                style={[styles.dot, dotWidth]}
              />
            );
          })}
        </View>

        <AnimatedTouchable 
          style={[styles.nextButton, buttonAnimatedStyle]} 
          onPress={handleNext}
          activeOpacity={0.9}
        >
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
        </AnimatedTouchable>
      </Animated.View>
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
    height: 8,
    borderRadius: 4,
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

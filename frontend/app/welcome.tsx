import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
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
  withTiming,
  withSpring,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  
  // Animation values
  const globeRotate = useSharedValue(0);
  const planeX = useSharedValue(-50);
  const planeY = useSharedValue(0);
  const iconScale1 = useSharedValue(0);
  const iconScale2 = useSharedValue(0);
  const iconScale3 = useSharedValue(0);
  const loginButtonScale = useSharedValue(1);
  const createButtonScale = useSharedValue(1);

  useEffect(() => {
    // Globe subtle rotation
    globeRotate.value = withRepeat(
      withSequence(
        withTiming(5, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-5, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Plane flying animation
    planeX.value = withRepeat(
      withSequence(
        withTiming(50, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-50, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    planeY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(10, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Icons pop in
    iconScale1.value = withDelay(500, withSpring(1, { damping: 10 }));
    iconScale2.value = withDelay(700, withSpring(1, { damping: 10 }));
    iconScale3.value = withDelay(900, withSpring(1, { damping: 10 }));
  }, []);

  const globeStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${globeRotate.value}deg` }],
  }));

  const planeStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: planeX.value },
      { translateY: planeY.value },
      { rotate: '45deg' },
    ],
  }));

  const icon1Style = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale1.value }],
  }));
  const icon2Style = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale2.value }],
  }));
  const icon3Style = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale3.value }],
  }));

  const handleLoginPress = () => {
    loginButtonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1)
    );
    router.push('/(auth)/login');
  };

  const handleCreatePress = () => {
    createButtonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1)
    );
    router.push('/(auth)/register');
  };

  const loginButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: loginButtonScale.value }],
  }));

  const createButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: createButtonScale.value }],
  }));

  return (
    <LinearGradient
      colors={['#0f0c29', '#302b63', '#24243e']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={[styles.content, { paddingTop: insets.top + 40 }]}>
        <Animated.Text 
          entering={FadeInDown.delay(200).springify()}
          style={styles.title}
        >
          Your Perfect Stay Awaits
        </Animated.Text>
        <Animated.Text 
          entering={FadeInDown.delay(400).springify()}
          style={styles.subtitle}
        >
          Explore hotel comparisons, smart insights, and everything you need to
          choose the right stay.
        </Animated.Text>

        <View style={styles.illustrationContainer}>
          <View style={styles.glassCard}>
            <View style={styles.blurContainer}>
              <View style={styles.globeContainer}>
                <Animated.View style={globeStyle}>
                  <Ionicons name="globe-outline" size={120} color="rgba(255,255,255,0.9)" />
                </Animated.View>
                <Animated.View style={[styles.planeContainer, planeStyle]}>
                  <Ionicons name="airplane" size={40} color="#fff" />
                </Animated.View>
              </View>
              <View style={styles.travelIcons}>
                <Animated.View style={[styles.travelIcon, icon1Style]}>
                  <Ionicons name="bed" size={24} color="#667eea" />
                </Animated.View>
                <Animated.View style={[styles.travelIcon, icon2Style]}>
                  <Ionicons name="briefcase" size={24} color="#667eea" />
                </Animated.View>
                <Animated.View style={[styles.travelIcon, icon3Style]}>
                  <Ionicons name="camera" size={24} color="#667eea" />
                </Animated.View>
              </View>
            </View>
          </View>
        </View>

        <Animated.View 
          style={[styles.buttonContainer, { paddingBottom: insets.bottom + 30 }]}
          entering={FadeInUp.delay(600).springify()}
        >
          <AnimatedTouchable
            style={[styles.loginButton, loginButtonStyle]}
            onPress={handleLoginPress}
            activeOpacity={0.9}
          >
            <BlurView intensity={30} style={styles.buttonBlur}>
              <Text style={styles.loginButtonText}>Login</Text>
            </BlurView>
          </AnimatedTouchable>

          <AnimatedTouchable
            style={[styles.createButton, createButtonStyle]}
            onPress={handleCreatePress}
            activeOpacity={0.9}
          >
            <Text style={styles.createButtonText}>Create an Account</Text>
          </AnimatedTouchable>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 24,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassCard: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  globeContainer: {
    position: 'relative',
  },
  planeContainer: {
    position: 'absolute',
    top: -10,
    right: -20,
  },
  travelIcons: {
    flexDirection: 'row',
    marginTop: 30,
    gap: 20,
  },
  travelIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    gap: 15,
  },
  loginButton: {
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonBlur: {
    paddingVertical: 18,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#a78bfa',
    fontSize: 18,
    fontWeight: '600',
  },
});

import React from 'react';
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

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={[styles.content, { paddingTop: insets.top + 40 }]}>
        <Text style={styles.title}>Your Perfect Stay Awaits</Text>
        <Text style={styles.subtitle}>
          Explore hotel comparisons, smart insights, and everything you need to
          choose the right stay.
        </Text>

        <View style={styles.illustrationContainer}>
          <View style={styles.glassCard}>
            <BlurView intensity={20} style={styles.blurContainer}>
              <View style={styles.globeContainer}>
                <Ionicons name="globe-outline" size={120} color="rgba(255,255,255,0.9)" />
                <View style={styles.planeContainer}>
                  <Ionicons name="airplane" size={40} color="#fff" />
                </View>
              </View>
              <View style={styles.travelIcons}>
                <View style={styles.travelIcon}>
                  <Ionicons name="bed" size={24} color="#667eea" />
                </View>
                <View style={styles.travelIcon}>
                  <Ionicons name="briefcase" size={24} color="#667eea" />
                </View>
                <View style={styles.travelIcon}>
                  <Ionicons name="camera" size={24} color="#667eea" />
                </View>
              </View>
            </BlurView>
          </View>
        </View>

        <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + 30 }]}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <BlurView intensity={30} style={styles.buttonBlur}>
              <Text style={styles.loginButtonText}>Login</Text>
            </BlurView>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={styles.createButtonText}>Create an Account</Text>
          </TouchableOpacity>
        </View>
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
    transform: [{ rotate: '45deg' }],
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
    color: '#667eea',
    fontSize: 18,
    fontWeight: '600',
  },
});

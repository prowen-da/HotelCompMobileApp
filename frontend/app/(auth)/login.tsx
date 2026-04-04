import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
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
  withSequence,
  FadeInDown,
  FadeInLeft,
  FadeInUp,
  SlideInLeft,
} from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const buttonScale = useSharedValue(1);
  const socialScale1 = useSharedValue(0);
  const socialScale2 = useSharedValue(0);
  const socialScale3 = useSharedValue(0);

  useEffect(() => {
    socialScale1.value = withDelay(800, withSpring(1, { damping: 12 }));
    socialScale2.value = withDelay(900, withSpring(1, { damping: 12 }));
    socialScale3.value = withDelay(1000, withSpring(1, { damping: 12 }));
  }, []);

  const handleLogin = () => {
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1)
    );
    setTimeout(() => {
      router.replace('/(main)/home');
    }, 200);
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const social1Style = useAnimatedStyle(() => ({
    transform: [{ scale: socialScale1.value }],
  }));
  const social2Style = useAnimatedStyle(() => ({
    transform: [{ scale: socialScale2.value }],
  }));
  const social3Style = useAnimatedStyle(() => ({
    transform: [{ scale: socialScale3.value }],
  }));

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={SlideInLeft.springify()}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <BlurView intensity={30} style={styles.backButtonBlur}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </BlurView>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View 
            style={styles.headerContainer}
            entering={FadeInDown.delay(200).springify()}
          >
            <Text style={styles.title}>Let's Sign you in</Text>
            <Text style={styles.subtitle}>
              Sign in to access your account and continue where you left off.
            </Text>
          </Animated.View>

          <Animated.View 
            style={styles.formContainer}
            entering={FadeInUp.delay(400).springify()}
          >
            <BlurView intensity={20} style={styles.formBlur}>
              <View style={styles.formContent}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <Animated.View 
                    style={[
                      styles.inputContainer,
                      focusedField === 'email' && styles.inputFocused,
                    ]}
                  >
                    <Ionicons name="mail-outline" size={20} color={focusedField === 'email' ? '#fff' : 'rgba(255,255,255,0.7)'} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your email address"
                      placeholderTextColor="rgba(255,255,255,0.5)"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </Animated.View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <Animated.View 
                    style={[
                      styles.inputContainer,
                      focusedField === 'password' && styles.inputFocused,
                    ]}
                  >
                    <Ionicons name="lock-closed-outline" size={20} color={focusedField === 'password' ? '#fff' : 'rgba(255,255,255,0.7)'} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your password"
                      placeholderTextColor="rgba(255,255,255,0.5)"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons
                        name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                        size={20}
                        color="rgba(255,255,255,0.7)"
                      />
                    </TouchableOpacity>
                  </Animated.View>
                </View>

                <TouchableOpacity
                  onPress={() => router.push('/(auth)/forgot-password')}
                  style={styles.forgotButton}
                >
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>

                <AnimatedTouchable 
                  style={[styles.signInButton, buttonAnimatedStyle]} 
                  onPress={handleLogin}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.95)']}
                    style={styles.signInGradient}
                  >
                    <Text style={styles.signInText}>Sign In</Text>
                  </LinearGradient>
                </AnimatedTouchable>

                <View style={styles.signUpContainer}>
                  <Text style={styles.signUpText}>Don't have an account? </Text>
                  <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                    <Text style={styles.signUpLink}>Sign Up</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.dividerContainer}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>Or Sign In with</Text>
                  <View style={styles.divider} />
                </View>

                <View style={styles.socialContainer}>
                  <AnimatedTouchable style={[styles.socialButton, social1Style]}>
                    <Ionicons name="logo-google" size={24} color="#fff" />
                  </AnimatedTouchable>
                  <AnimatedTouchable style={[styles.socialButton, social2Style]}>
                    <Ionicons name="logo-apple" size={24} color="#fff" />
                  </AnimatedTouchable>
                  <AnimatedTouchable style={[styles.socialButton, social3Style]}>
                    <Ionicons name="logo-facebook" size={24} color="#fff" />
                  </AnimatedTouchable>
                </View>
              </View>
            </BlurView>
          </Animated.View>

          <Animated.Text 
            style={styles.termsText}
            entering={FadeInUp.delay(700)}
          >
            By signing in you agree to our{' '}
            <Text style={styles.termsLink}>Terms and Conditions of Use</Text>
          </Animated.Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 45,
    height: 45,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
  },
  backButtonBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 24,
  },
  formContainer: {
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 20,
  },
  formBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
  },
  formContent: {
    padding: 25,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  inputFocused: {
    borderColor: 'rgba(255, 255, 255, 0.5)',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 15,
    marginLeft: 10,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '600',
  },
  signInButton: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
  },
  signInGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  signInText: {
    color: '#667eea',
    fontSize: 18,
    fontWeight: '700',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  signUpText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  signUpLink: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginHorizontal: 15,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  termsText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    color: '#fff',
    fontWeight: '600',
  },
});

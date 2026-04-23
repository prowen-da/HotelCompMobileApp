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
  Dimensions,
  ActivityIndicator,
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
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
  FadeInDown,
  FadeInUp,
  SlideInLeft,
  ZoomIn,
} from 'react-native-reanimated';
import { useAuth } from '../../src/context/AuthContext';

const { width, height } = Dimensions.get('window');
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const insets = useSafeAreaInsets();
  const { login, guestLogin } = useAuth();

  const buttonScale = useSharedValue(1);
  const googleScale = useSharedValue(0);
  const floatY = useSharedValue(0);
  const glowOpacity = useSharedValue(0.3);

  useEffect(() => {
    googleScale.value = withDelay(900, withSpring(1, { damping: 12 }));
    floatY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 2000 }),
        withTiming(0.3, { duration: 2000 })
      ),
      -1,
      true
    );
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);
    buttonScale.value = withSequence(withTiming(0.95, { duration: 100 }), withSpring(1));
    const result = await login(email.trim(), password);
    setIsLoading(false);
    if (result.success) {
      router.replace('/(main)/home');
    } else {
      setErrorMsg(result.error || 'Login failed');
    }
  };

  const handleGuestLogin = async () => {
    setErrorMsg('');
    setIsLoading(true);
    const result = await guestLogin();
    setIsLoading(false);
    if (result.success) {
      router.replace('/(main)/home');
    } else {
      setErrorMsg(result.error || 'Guest login failed');
    }
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const googleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: googleScale.value }],
  }));

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <LinearGradient
      colors={['#0f0c29', '#302b63', '#24243e']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Decorative floating orbs */}
      <Animated.View style={[styles.orb, styles.orb1, glowStyle]} />
      <Animated.View style={[styles.orb, styles.orb2, glowStyle]} />

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
          keyboardShouldPersistTaps="handled"
        >
          {/* Back button */}
          <Animated.View entering={SlideInLeft.springify()}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <BlurView intensity={40} style={styles.backButtonBlur} tint="dark">
                <Ionicons name="arrow-back" size={22} color="#fff" />
              </BlurView>
            </TouchableOpacity>
          </Animated.View>

          {/* Logo / Brand Icon */}
          <Animated.View style={[styles.logoContainer, floatStyle]}>
            <Animated.View entering={ZoomIn.delay(200).springify()}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.logoCircle}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="git-compare" size={32} color="#fff" />
              </LinearGradient>
            </Animated.View>
          </Animated.View>

          {/* Header */}
          <Animated.View
            style={styles.headerContainer}
            entering={FadeInDown.delay(300).springify()}
          >
            <Text style={styles.welcomeBack}>Welcome back</Text>
            <Text style={styles.title}>Let's Sign you in</Text>
            <Text style={styles.subtitle}>
              Continue comparing the best hotels for your next trip
            </Text>
          </Animated.View>

          {/* Form Card */}
          <Animated.View
            style={styles.formContainer}
            entering={FadeInUp.delay(500).springify()}
          >
            <BlurView intensity={25} style={styles.formBlur} tint="dark">
              <View style={styles.formContent}>
                {/* Email */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
                  <View
                    style={[
                      styles.inputContainer,
                      focusedField === 'email' && styles.inputFocused,
                    ]}
                  >
                    <View style={[styles.inputIconWrap, focusedField === 'email' && styles.inputIconActive]}>
                      <Ionicons name="mail-outline" size={18} color={focusedField === 'email' ? '#667eea' : 'rgba(255,255,255,0.5)'} />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="your@email.com"
                      placeholderTextColor="rgba(255,255,255,0.35)"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                </View>

                {/* Password */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Text style={styles.label}>Password</Text>
                    <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
                      <Text style={styles.forgotText}>Forgot?</Text>
                    </TouchableOpacity>
                  </View>
                  <View
                    style={[
                      styles.inputContainer,
                      focusedField === 'password' && styles.inputFocused,
                    ]}
                  >
                    <View style={[styles.inputIconWrap, focusedField === 'password' && styles.inputIconActive]}>
                      <Ionicons name="lock-closed-outline" size={18} color={focusedField === 'password' ? '#667eea' : 'rgba(255,255,255,0.5)'} />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter password"
                      placeholderTextColor="rgba(255,255,255,0.35)"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeBtn}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                        size={20}
                        color="rgba(255,255,255,0.5)"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Error Message */}
                {errorMsg ? (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={16} color="#ef4444" />
                    <Text style={styles.errorText}>{errorMsg}</Text>
                  </View>
                ) : null}

                {/* Sign In Button */}
                <AnimatedTouchable
                  style={[styles.signInButton, buttonAnimatedStyle]}
                  onPress={handleLogin}
                  activeOpacity={0.9}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.signInGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Text style={styles.signInText}>Sign In</Text>
                        <Ionicons name="arrow-forward" size={20} color="#fff" />
                      </>
                    )}
                  </LinearGradient>
                </AnimatedTouchable>

                {/* Divider */}
                <View style={styles.dividerContainer}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>or continue with</Text>
                  <View style={styles.divider} />
                </View>

                {/* Google Sign-In — Full-Width Button */}
                <AnimatedTouchable style={[styles.googleButton, googleStyle]} activeOpacity={0.8} onPress={handleGuestLogin} disabled={isLoading}>
                  <View style={styles.googleInner}>
                    <View style={styles.googleLogoWrap}>
                      <Ionicons name="person-outline" size={20} color="#fff" />
                    </View>
                    <Text style={styles.googleText}>Continue as Guest</Text>
                  </View>
                </AnimatedTouchable>
              </View>
            </BlurView>
          </Animated.View>

          {/* Sign Up link */}
          <Animated.View
            style={styles.signUpContainer}
            entering={FadeInUp.delay(700)}
          >
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.signUpLink}>Create one</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Terms */}
          <Animated.Text
            style={styles.termsText}
            entering={FadeInUp.delay(800)}
          >
            By signing in you agree to our{' '}
            <Text style={styles.termsLink}>Terms & Privacy Policy</Text>
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
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orb1: {
    width: 200,
    height: 200,
    top: -50,
    right: -60,
    backgroundColor: '#667eea',
  },
  orb2: {
    width: 150,
    height: 150,
    bottom: 80,
    left: -40,
    backgroundColor: '#764ba2',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
  },
  backButtonBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 8px 16px rgba(102,126,234,0.4)',
    elevation: 10,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  welcomeBack: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.55)',
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 280,
  },
  formContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
  },
  formBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 24,
  },
  formContent: {
    padding: 22,
  },
  inputGroup: {
    marginBottom: 18,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  forgotText: {
    color: '#667eea',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    height: 54,
    paddingHorizontal: 4,
  },
  inputFocused: {
    borderColor: 'rgba(102, 126, 234, 0.6)',
    backgroundColor: 'rgba(102, 126, 234, 0.08)',
  },
  inputIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginLeft: 4,
  },
  inputIconActive: {
    backgroundColor: 'rgba(102,126,234,0.15)',
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    paddingHorizontal: 12,
  },
  eyeBtn: {
    padding: 10,
  },
  signInButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 4,
    marginBottom: 22,
  },
  signInGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 17,
    gap: 8,
  },
  signInText: {
    color: '#fff',
    fontSize: 17,
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 12,
    fontWeight: '500',
    marginHorizontal: 14,
  },
  googleButton: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  googleInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 12,
  },
  googleLogoWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  signUpText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
  },
  signUpLink: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '700',
  },
  termsText: {
    color: 'rgba(255, 255, 255, 0.35)',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
    marginBottom: 4,
  },
  errorText: {
    flex: 1,
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '600',
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { resetPassword } from '../../src/services/api';

export default function CreatePasswordScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const insets = useSafeAreaInsets();

  const handleNext = async () => {
    if (newPassword !== confirmPassword) { setErrorMsg('Passwords do not match'); return; }
    if (newPassword.length < 6) { setErrorMsg('Password must be at least 6 characters'); return; }
    setErrorMsg('');
    setIsLoading(true);
    const result = await resetPassword(email || '', 0, newPassword);
    setIsLoading(false);
    if (result.success) {
      Alert.alert('Success', 'Password has been reset. Please login with your new password.', [
        { text: 'Login', onPress: () => router.replace('/(auth)/login') }
      ]);
    } else {
      setErrorMsg(result.error || 'Failed to reset password');
    }
  };

  return (
    <LinearGradient
      colors={['#0f0c29', '#302b63', '#24243e']}
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <BlurView intensity={30} style={styles.backButtonBlur}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </BlurView>
          </TouchableOpacity>

          <View style={styles.headerContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="lock-open-outline" size={50} color="#fff" />
            </View>
            <Text style={styles.title}>Create a New Password</Text>
            <Text style={styles.subtitle}>Enter your new password</Text>
          </View>

          <View style={styles.formContainer}>
            <BlurView intensity={20} style={styles.formBlur}>
              <View style={styles.formContent}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>New Password</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed-outline" size={20} color="rgba(255,255,255,0.7)" />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter new password"
                      placeholderTextColor="rgba(255,255,255,0.5)"
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showNewPassword}
                    />
                    <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                      <Ionicons
                        name={showNewPassword ? 'eye-outline' : 'eye-off-outline'}
                        size={20}
                        color="rgba(255,255,255,0.7)"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed-outline" size={20} color="rgba(255,255,255,0.7)" />
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm your password"
                      placeholderTextColor="rgba(255,255,255,0.5)"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                      <Ionicons
                        name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                        size={20}
                        color="rgba(255,255,255,0.7)"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.95)']}
                    style={styles.nextGradient}
                  >
                    <Text style={styles.nextText}>Reset Password</Text>
                    <Ionicons name="checkmark-circle" size={20} color="#667eea" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
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
    marginBottom: 30,
  },
  backButtonBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  formContainer: {
    borderRadius: 25,
    overflow: 'hidden',
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
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 15,
    marginLeft: 10,
  },
  nextButton: {
    borderRadius: 15,
    overflow: 'hidden',
    marginTop: 10,
  },
  nextGradient: {
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  nextText: {
    color: '#a78bfa',
    fontSize: 18,
    fontWeight: '700',
  },
});

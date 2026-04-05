import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: 'transparent' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/register" />
        <Stack.Screen name="(auth)/forgot-password" />
        <Stack.Screen name="(auth)/otp-verification" />
        <Stack.Screen name="(auth)/create-password" />
        <Stack.Screen name="(main)/home" />
        <Stack.Screen name="(main)/search-location" />
        <Stack.Screen name="(main)/comparison" />
        <Stack.Screen name="(main)/hotel-listing" />
        <Stack.Screen name="(main)/hotel-details" />
        <Stack.Screen name="(main)/map-view" />
        <Stack.Screen name="(main)/profile" />
        <Stack.Screen name="(main)/favorites" />
        <Stack.Screen name="(main)/checkout" />
        <Stack.Screen name="(main)/booking-confirmation" />
        <Stack.Screen name="(main)/notifications" />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

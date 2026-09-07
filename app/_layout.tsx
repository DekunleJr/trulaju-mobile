import { useEffect } from 'react';
import { Redirect, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';

export default function RootLayout() {
  const initialize = useAuthStore((state) => state.initialize);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const segments = useSegments();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isInitialized) {
    const route = segments[0];
    const isAuthRoute = route === 'login' || route === 'register' || route === 'reset-password';
    const isRegistrationRoute = route === 'verify-otp' || route === 'complete-profile';
    if (isAuthenticated && isAuthRoute) {
      return <Redirect href="/" />;
    }
    if (!isAuthenticated && route !== undefined && !isAuthRoute && !isRegistrationRoute) {
      return <Redirect href="/login" />;
    }
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

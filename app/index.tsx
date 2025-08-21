import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SplashScreen } from '@/components/SplashScreen';
import { theme } from '@/constants/theme';

export default function Index() {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const [showSplash, setShowSplash] = useState(true);
  const [isReady, setIsReady] = useState(false);

  // Wait for auth to initialize and stores to hydrate
  useEffect(() => {
    if (isInitialized) {
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isInitialized]);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // Show splash screen while auth is initializing or during splash animation
  if (!isInitialized || !isReady || showSplash) {
    return (
      <View style={styles.container}>
        <SplashScreen onAnimationComplete={handleSplashComplete} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  // Go directly to home screen after authentication
  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
});
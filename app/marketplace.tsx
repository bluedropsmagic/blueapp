import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Loader } from 'lucide-react-native';
import { theme } from '@/constants/theme';

export default function MarketplaceScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const handleBack = () => {
    router.back();
  };

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const renderWebContent = () => {
    if (Platform.OS === 'web') {
      return (
        <iframe
          src="https://google.com"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            backgroundColor: '#ffffff',
          }}
          title="Premium Library"
          onLoad={() => setIsLoading(false)}
        />
      );
    } else {
      // For mobile platforms, show a placeholder
      return (
        <View style={styles.mobileContent}>
          <Text style={styles.mobileTitle}>Premium Library</Text>
          
          <Text style={styles.mobileDescription}>
            Access our premium health library with exclusive content, expert articles, and wellness resources.
          </Text>
          
          <TouchableOpacity style={styles.openWebButton}>
            <Text style={styles.openWebButtonText}>Open in Browser</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Floating Back Button */}
      <TouchableOpacity style={[styles.floatingBackButton, { top: insets.top + 16 }]} onPress={handleBack}>
        <ArrowLeft size={24} color={theme.colors.white} />
      </TouchableOpacity>

      {/* Loading Overlay */}
      {isLoading && Platform.OS === 'web' && (
        <View style={styles.loadingOverlay}>
          <Loader size={32} color={theme.colors.primary[600]} />
          <Text style={styles.loadingText}>Loading premium content...</Text>
        </View>
      )}

      {/* Content Container - Full Screen WebView */}
      <View style={styles.contentContainer}>
        {renderWebContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  floatingBackButton: {
    position: 'absolute',
    left: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: theme.colors.gray[600],
    marginTop: 16,
  },
  mobileContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: theme.colors.gray[50],
  },
  mobileTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: theme.colors.gray[900],
    marginBottom: 16,
    textAlign: 'center',
  },
  mobileDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: theme.colors.gray[600],
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  openWebButton: {
    backgroundColor: theme.colors.primary[600],
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  openWebButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: theme.colors.white,
  },
});
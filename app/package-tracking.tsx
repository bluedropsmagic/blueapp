import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Package, Loader } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { BlueDropsLogo } from '@/components/BlueDropsLogo';

export default function PackageTrackingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { number } = useLocalSearchParams<{ number: string }>();
  const [isLoading, setIsLoading] = useState(true);

  const trackingNumber = Array.isArray(number) ? number[0] : number;

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

  const renderTrackingContent = () => {
    if (!trackingNumber) {
      return (
        <View style={styles.errorContent}>
          <Package size={48} color={theme.colors.error[500]} />
          <Text style={styles.errorTitle}>Invalid Tracking Number</Text>
          <Text style={styles.errorDescription}>
            No tracking number was provided. Please go back and enter a valid tracking number.
          </Text>
        </View>
      );
    }

    if (Platform.OS === 'web') {
      return (
        <iframe
          src={`https://track.shiptracker.io/${trackingNumber}`}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            backgroundColor: theme.colors.white,
          }}
          title="Package Tracking"
          onLoad={() => setIsLoading(false)}
        />
      );
    } else {
      // For mobile platforms, show a placeholder with tracking info
      return (
        <View style={styles.mobileContent}>
          <View style={styles.mobileHeader}>
            <Package size={32} color={theme.colors.primary[600]} />
            <Text style={styles.mobileTitle}>Where is my BlueDrops?</Text>
          </View>
          
          <View style={styles.trackingInfo}>
            <Text style={styles.trackingLabel}>Tracking Number:</Text>
            <Text style={styles.trackingNumber}>{trackingNumber}</Text>
          </View>
          
          <Text style={styles.mobileDescription}>
            For the best tracking experience with real-time updates and detailed information, please access this feature through the web version of BlueApp.
          </Text>
          
          <TouchableOpacity 
            style={styles.openWebButton}
            onPress={() => {
              // In a real app, this would open the tracking URL in the device's browser
              console.log(`Opening: https://track.shiptracker.io/${trackingNumber}`);
            }}
          >
            <Package size={16} color={theme.colors.white} />
            <Text style={styles.openWebButtonText}>Open in Browser</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Clean Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color={theme.colors.white} />
        </TouchableOpacity>
        
        <View style={styles.logoContainer}>
          <BlueDropsLogo width={120} height={30} />
        </View>
        
        {/* Spacer to center logo */}
        <View style={styles.spacer} />
      </View>

      {/* Loading Overlay */}
      {isLoading && Platform.OS === 'web' && (
        <View style={styles.loadingOverlay}>
          <Loader size={32} color={theme.colors.primary[600]} />
          <Text style={styles.loadingText}>Loading tracking information...</Text>
        </View>
      )}

      {/* Content Container - No Scroll */}
      <View style={styles.contentContainer}>
        {renderTrackingContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.primary[600],
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  spacer: {
    width: 40, // Same width as back button to center logo
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
  mobileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  mobileTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: theme.colors.gray[900],
    marginTop: 16,
    textAlign: 'center',
  },
  trackingInfo: {
    backgroundColor: theme.colors.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  trackingLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.gray[600],
    marginBottom: 8,
  },
  trackingNumber: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: theme.colors.primary[700],
    letterSpacing: 1,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary[600],
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: theme.colors.primary[600],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  openWebButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: theme.colors.white,
    marginLeft: 8,
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: theme.colors.error[600],
    marginTop: 16,
    marginBottom: 8,
  },
  errorDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: theme.colors.gray[600],
    textAlign: 'center',
    lineHeight: 24,
  },
});
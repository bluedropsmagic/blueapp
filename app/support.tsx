import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Loader } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { BottomIconsBar } from '@/components/BottomIconsBar';

export default function SupportScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  useEffect(() => {
    // Simulate loading time for mobile
    if (Platform.OS !== 'web') {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const renderWebViewContent = () => {
    if (Platform.OS === 'web') {
      return (
        <iframe
          src="https://bluedropsmagic-charg-9uzw.bolt.host/"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            backgroundColor: '#ffffff',
          }}
          title="Product Support"
          onLoad={() => setIsLoading(false)}
        />
      );
    } else {
      // For mobile platforms, show a placeholder
      return (
        <View style={styles.mobileContent}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Loader size={32} color={theme.colors.primary[600]} />
              <Text style={styles.loadingText}>Loading support system...</Text>
            </View>
          ) : (
            <View style={styles.mobileInfo}>
              <Text style={styles.mobileTitle}>Product Support</Text>
              <Text style={styles.mobileDescription}>
                Access our complete product support system including issues reporting, returns, and exchanges. For the best experience, please access this feature through the web version of BlueApp.
              </Text>
              <TouchableOpacity style={styles.openWebButton}>
                <Text style={styles.openWebButtonText}>Open in Browser</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      );
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft size={24} color={theme.colors.gray[700]} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Product Support</Text>
          
          <View style={styles.placeholder} />
        </View>
      </View>

      {/* Loading Overlay for Web */}
      {isLoading && Platform.OS === 'web' && (
        <View style={styles.loadingOverlay}>
          <Loader size={32} color={theme.colors.primary[600]} />
          <Text style={styles.loadingText}>Loading support system...</Text>
        </View>
      )}

      {/* WebView Content */}
      <View style={[styles.webViewContainer, { paddingBottom: insets.bottom + 80 }]}>
        {renderWebViewContent()}
      </View>

      {/* Bottom Icons Bar */}
      <BottomIconsBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerContainer: {
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: theme.colors.gray[900],
  },
  placeholder: {
    width: 40,
  },
  webViewContainer: {
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
  loadingContainer: {
    alignItems: 'center',
  },
  mobileInfo: {
    alignItems: 'center',
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
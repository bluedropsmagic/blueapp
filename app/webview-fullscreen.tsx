import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X, ExternalLink, Loader } from 'lucide-react-native';
import { theme } from '@/constants/theme';

export default function WebViewFullScreenScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { url } = useLocalSearchParams<{ url?: string }>();
  const [isLoading, setIsLoading] = useState(true);

  // Default URL if none provided
  const targetUrl = url || 'https://creative-fudge-22fc93.netlify.app/';

  const handleClose = () => {
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
          src={targetUrl}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            backgroundColor: theme.colors.white,
          }}
          title="Content Viewer"
          onLoad={() => setIsLoading(false)}
        />
      );
    } else {
      // For mobile platforms, show a placeholder with the content description
      return (
        <View style={styles.mobileContent}>
          <View style={styles.mobileHeader}>
            <ExternalLink size={32} color={theme.colors.primary[600]} />
            <Text style={styles.mobileTitle}>Document Viewer</Text>
          </View>
          
          <Text style={styles.mobileDescription}>
            This content is optimized for web viewing. For the best experience, please access this feature through the web version of BlueApp.
          </Text>
          
          <TouchableOpacity style={styles.openWebButton}>
            <ExternalLink size={16} color={theme.colors.white} />
            <Text style={styles.openWebButtonText}>Open in Browser</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <X size={24} color={theme.colors.white} />
        </TouchableOpacity>
      </View>

      {isLoading && Platform.OS === 'web' && (
        <View style={styles.loadingOverlay}>
          <Loader size={32} color={theme.colors.primary[600]} />
          <Text style={styles.loadingText}>Loading content...</Text>
        </View>
      )}

      <View style={styles.contentContainer}>
        {renderWebContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.black,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  closeButton: {
    alignSelf: 'flex-end',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: 24,
  },
  mobileTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: theme.colors.gray[900],
    marginTop: 16,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary[600],
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  openWebButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: theme.colors.white,
    marginLeft: 8,
  },
});
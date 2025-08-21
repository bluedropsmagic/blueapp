import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Loader } from 'lucide-react-native';
import { theme } from '@/constants/theme';

type WebViewAdProps = {
  onPress: () => void;
};

export const WebViewAd = ({ onPress }: WebViewAdProps) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for mobile
    if (Platform.OS !== 'web') {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const renderWebViewContent = () => {
    if (Platform.OS === 'web') {
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <iframe
            src="https://creative-fudge-22fc93.netlify.app/"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: '12px',
              backgroundColor: '#ffffff',
              overflow: 'hidden',
            }}
            title="Featured Content"
            scrolling="no"
            onLoad={() => setIsLoading(false)}
          />
        </div>
      );
    } else {
      // Mobile fallback with preview
      return (
        <View style={styles.mobilePreview}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Loader size={24} color={theme.colors.primary[600]} />
            </View>
          ) : (
            <View style={styles.previewContent}>
              <View style={styles.previewHeader}>
                <View style={styles.previewDots}>
                  <View style={[styles.dot, { backgroundColor: theme.colors.error[500] }]} />
                  <View style={[styles.dot, { backgroundColor: theme.colors.warning[500] }]} />
                  <View style={[styles.dot, { backgroundColor: theme.colors.success[500] }]} />
                </View>
              </View>
              <View style={styles.previewBody}>
                <Text style={styles.previewTitle}>Health Resources</Text>
                <Text style={styles.previewDescription}>
                  Exclusive content and expert insights for your health journey
                </Text>
                <View style={styles.previewButton}>
                  <Text style={styles.previewButtonText}>Learn More</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      );
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.95}>
      <View style={styles.webviewContainer}>
        {renderWebViewContent()}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.primary[100],
  },
  webviewContainer: {
    height: 160, // Reduced from 200 to 160
    backgroundColor: theme.colors.gray[50],
  },
  mobilePreview: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContent: {
    flex: 1,
  },
  previewHeader: {
    backgroundColor: theme.colors.gray[100],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  previewDots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  previewBody: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: theme.colors.gray[900],
    marginBottom: 8,
    textAlign: 'center',
  },
  previewDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[600],
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  previewButton: {
    backgroundColor: theme.colors.primary[600],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  previewButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: theme.colors.white,
  },
});
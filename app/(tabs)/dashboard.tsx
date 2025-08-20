import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { HeaderMenu } from '@/components/HeaderMenu';
import { BottomIconsBar } from '@/components/BottomIconsBar';
import { Loader } from 'lucide-react-native';
import { theme } from '@/constants/theme';

export default function TrackOrderScreen() {
  const insets = useSafeAreaInsets();
  const { tracking } = useLocalSearchParams<{ tracking?: string }>();
  const [isLoading, setIsLoading] = useState(true);

  // Build the tracking URL
  const trackingUrl = tracking 
    ? `https://track.shiptracker.io/${encodeURIComponent(tracking)}`
    : 'https://track.shiptracker.io/';

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
          src={trackingUrl}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            backgroundColor: '#ffffff',
            // Desabilitar scroll e zoom
            overflow: 'hidden',
            pointerEvents: 'auto',
          }}
          title="Package Tracking"
          onLoad={() => setIsLoading(false)}
          // Atributos para desabilitar scroll e zoom
          scrolling="no"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
          // Injetar CSS para desabilitar zoom e scroll
          onLoadCapture={(e) => {
            try {
              const iframe = e.target as HTMLIFrameElement;
              const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
              if (iframeDoc) {
                // Adicionar meta viewport para desabilitar zoom
                const metaViewport = iframeDoc.createElement('meta');
                metaViewport.name = 'viewport';
                metaViewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
                iframeDoc.head.appendChild(metaViewport);
                
                // Adicionar CSS para desabilitar scroll
                const style = iframeDoc.createElement('style');
                style.textContent = `
                  html, body {
                    overflow: hidden !important;
                    touch-action: none !important;
                    -webkit-overflow-scrolling: touch !important;
                    overscroll-behavior: none !important;
                    height: 100vh !important;
                    margin: 0 !important;
                    padding: 0 !important;
                  }
                  
                  * {
                    -webkit-user-select: none !important;
                    -moz-user-select: none !important;
                    -ms-user-select: none !important;
                    user-select: none !important;
                    -webkit-touch-callout: none !important;
                    -webkit-tap-highlight-color: transparent !important;
                  }
                  
                  /* Desabilitar zoom em inputs */
                  input, textarea, select {
                    font-size: 16px !important;
                    -webkit-appearance: none !important;
                  }
                  
                  /* Desabilitar scroll em todos os elementos */
                  ::-webkit-scrollbar {
                    display: none !important;
                  }
                  
                  /* Desabilitar gestos de zoom */
                  img, svg, canvas {
                    pointer-events: none !important;
                    -webkit-user-drag: none !important;
                    -khtml-user-drag: none !important;
                    -moz-user-drag: none !important;
                    -o-user-drag: none !important;
                    user-drag: none !important;
                  }
                `;
                iframeDoc.head.appendChild(style);
              }
            } catch (error) {
              // Cross-origin restrictions - ignore silently
              console.log('Cannot modify iframe content due to CORS restrictions');
            }
          }}
        />
      );
    } else {
      // For mobile platforms, show a placeholder
      return (
        <View style={styles.mobileContent}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Loader size={32} color={theme.colors.primary[600]} />
              <Text style={styles.loadingText}>Loading tracking system...</Text>
            </View>
          ) : (
            <View style={styles.mobileInfo}>
              <Text style={styles.mobileTitle}>Package Tracking</Text>
              {tracking && (
                <View style={styles.trackingInfo}>
                  <Text style={styles.trackingLabel}>Tracking Number:</Text>
                  <Text style={styles.trackingNumber}>{tracking}</Text>
                </View>
              )}
              <Text style={styles.mobileDescription}>
                Track your BlueDrops packages and shipments. For the best experience, please access this feature through the web version of BlueApp.
              </Text>
            </View>
          )}
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      <HeaderMenu />
      
      {/* Loading Overlay for Web */}
      {isLoading && Platform.OS === 'web' && (
        <View style={styles.loadingOverlay}>
          <Loader size={32} color={theme.colors.primary[600]} />
          <Text style={styles.loadingText}>Loading tracking system...</Text>
        </View>
      )}
      
      {/* WebView Content - Sem scroll e zoom */}
      <View style={styles.webViewContainer}>
        {renderWebViewContent()}
      </View>

      <BottomIconsBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
    // Desabilitar scroll no container principal
    overflow: 'hidden',
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: theme.colors.white,
    // Desabilitar scroll e zoom no container do WebView
    overflow: 'hidden',
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
  trackingInfo: {
    backgroundColor: theme.colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
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
  },
});
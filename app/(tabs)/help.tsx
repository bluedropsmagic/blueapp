import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeaderMenu } from '@/components/HeaderMenu';
import { BottomIconsBar } from '@/components/BottomIconsBar';
import { SectionHeader } from '@/components/SectionHeader';
import { UsefulContainer } from '@/components/UsefulContainer';
import { Play } from 'lucide-react-native';
import { theme } from '@/constants/theme';

export default function TutorialScreen() {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Inject the vTurb script when component mounts (only on web)
    if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof document !== 'undefined') {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.innerHTML = `
        var s=document.createElement("script"); 
        s.src="https://scripts.converteai.net/b792ccfe-b151-4538-84c6-42bb48a19ba4/players/685caf41af75c1131db393ac/v4/player.js";
        s.async=true;
        document.head.appendChild(s);
      `;
      document.head.appendChild(script);

      // Cleanup function
      return () => {
        const existingScript = document.querySelector('script[src*="685caf41af75c1131db393ac"]');
        if (existingScript) {
          document.head.removeChild(existingScript);
        }
      };
    }
  }, []);

  const renderVideoPlayer = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof document !== 'undefined') {
      return (
        <div
          dangerouslySetInnerHTML={{
            __html: `
              <vturb-smartplayer 
                id="vid-685caf41af75c1131db393ac" 
                style="display: block; margin: 0 auto; width: 100%; max-width: 400px;"
              ></vturb-smartplayer>
            `
          }}
        />
      );
    } else {
      // For mobile platforms or server-side rendering, show a placeholder
      return (
        <View style={styles.mobileVideoPlaceholder}>
          <View style={styles.playIconContainer}>
            <Play size={48} color={theme.colors.white} />
          </View>
          <Text style={styles.mobileVideoTitle}>Video Tutorial</Text>
          <Text style={styles.mobileVideoDescription}>
            To watch the complete tutorial, please access the web version of the app.
          </Text>
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      <HeaderMenu />
      <SectionHeader 
        title="How to Use BlueApp" 
        variant="secondary"
      />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent, 
          { 
            paddingBottom: insets.bottom + 120,
          }
        ]}
      >
        <UsefulContainer>
          {/* Video Section */}
          <View style={styles.videoSection}>
            <Text style={styles.sectionTitle}>Complete Tutorial</Text>
            <Text style={styles.sectionDescription}>
              Learn how to use all BlueApp features in this comprehensive video tutorial.
            </Text>
            
            <View style={styles.videoContainer}>
              {renderVideoPlayer()}
            </View>
          </View>

          {/* Features Overview */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>What You'll Learn</Text>
            
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <View style={styles.featureNumber}>
                  <Text style={styles.featureNumberText}>1</Text>
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Setting Up Your Schedule</Text>
                  <Text style={styles.featureDescription}>
                    Configure your personal dose times and reminders
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.featureNumber}>
                  <Text style={styles.featureNumberText}>2</Text>
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Tracking Your Doses</Text>
                  <Text style={styles.featureDescription}>
                    Log your daily medication and maintain your streak
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.featureNumber}>
                  <Text style={styles.featureNumberText}>3</Text>
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Monitoring Progress</Text>
                  <Text style={styles.featureDescription}>
                    View charts and analytics of your health journey
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.featureNumber}>
                  <Text style={styles.featureNumberText}>4</Text>
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Package Tracking</Text>
                  <Text style={styles.featureDescription}>
                    Monitor your BlueDrops shipments and delivery status
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Tips Section */}
          <View style={styles.tipsSection}>
            <Text style={styles.sectionTitle}>Important Tips</Text>
            
            <View style={styles.tipCard}>
              <Text style={styles.tipTitle}>💡 Consistency is Key</Text>
              <Text style={styles.tipDescription}>
                Maintain a regular routine to get the best results from your treatment.
              </Text>
            </View>

            <View style={styles.tipCard}>
              <Text style={styles.tipTitle}>📊 Track Your Progress</Text>
              <Text style={styles.tipDescription}>
                Use charts and metrics to understand how your body is responding to treatment.
              </Text>
            </View>

            <View style={styles.tipCard}>
              <Text style={styles.tipTitle}>🔒 Privacy Guaranteed</Text>
              <Text style={styles.tipDescription}>
                All your data is stored securely and never shared with third parties.
              </Text>
            </View>
          </View>
        </UsefulContainer>
      </ScrollView>

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
  scrollContent: {
    flexGrow: 1,
  },
  videoSection: {
    marginTop: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: theme.colors.gray[900],
    marginBottom: 8,
  },
  sectionDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: theme.colors.gray[600],
    lineHeight: 24,
    marginBottom: 20,
  },
  videoContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: theme.colors.gray[100],
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mobileVideoPlaceholder: {
    aspectRatio: 16/9,
    backgroundColor: theme.colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  playIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  mobileVideoTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: theme.colors.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  mobileVideoDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.white,
    textAlign: 'center',
    lineHeight: 20,
  },
  featuresSection: {
    marginBottom: 32,
  },
  featuresList: {
    marginTop: 16,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: theme.colors.white,
    padding: 16,
    borderRadius: 12,
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureNumberText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: theme.colors.white,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.gray[900],
    marginBottom: 4,
  },
  featureDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[600],
    lineHeight: 20,
  },
  tipsSection: {
    marginBottom: 32,
  },
  tipCard: {
    backgroundColor: theme.colors.primary[50],
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary[600],
  },
  tipTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.gray[900],
    marginBottom: 8,
  },
  tipDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[700],
    lineHeight: 20,
  },
});
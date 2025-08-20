import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Play, CircleCheck as CheckCircle, ArrowRight } from 'lucide-react-native';
import { theme } from '@/constants/theme';

export default function VideoTutorialScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [showContinueButton, setShowContinueButton] = useState(false);

  useEffect(() => {
    // Only inject the vTurb script when running in a client-side browser environment
    if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof document !== 'undefined') {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.id = 'scr_68530a05f8badcb338d499b2';
      script.innerHTML = `
        var s=document.createElement("script"); 
        s.src="https://scripts.converteai.net/b792ccfe-b151-4538-84c6-42bb48a19ba4/players/68530a05f8badcb338d499b2/player.js";
        s.async=true;
        document.head.appendChild(s);
      `;
      document.head.appendChild(script);

      // Simulate video completion after 1 minute (60 seconds)
      const videoTimer = setTimeout(() => {
        setVideoCompleted(true);
        // Scroll down to show the continue button
        setTimeout(() => {
          setShowContinueButton(true);
          // Smooth scroll to bottom
          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
          });
        }, 500);
      }, 60000); // 60 seconds = 1 minute

      // Cleanup function
      return () => {
        clearTimeout(videoTimer);
        const existingScript = document.getElementById('scr_68530a05f8badcb338d499b2');
        if (existingScript) {
          document.head.removeChild(existingScript);
        }
      };
    }
  }, []);

  const handleContinueToApp = () => {
    router.replace('/(tabs)');
  };

  const renderVideoPlayer = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof document !== 'undefined') {
      return (
        <div
          id="vid_68530a05f8badcb338d499b2"
          style={{
            position: 'relative',
            width: '100%',
            padding: '177.77777777777777% 0 0',
          }}
          dangerouslySetInnerHTML={{
            __html: `
              <img 
                id="thumb_68530a05f8badcb338d499b2" 
                src="https://images.converteai.net/b792ccfe-b151-4538-84c6-42bb48a19ba4/players/68530a05f8badcb338d499b2/thumbnail.jpg" 
                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; display: block;" 
                alt="thumbnail"
              />
              <div 
                id="backdrop_68530a05f8badcb338d499b2" 
                style="-webkit-backdrop-filter: blur(5px); backdrop-filter: blur(5px); position: absolute; top: 0; height: 100%; width: 100%;"
              ></div>
            `
          }}
        />
      );
    } else {
      // For mobile platforms or server-side rendering, show a placeholder with instructions
      return (
        <View style={styles.mobileVideoPlaceholder}>
          <View style={styles.playIconContainer}>
            <Play size={48} color={theme.colors.white} />
          </View>
          <Text style={styles.mobileVideoTitle}>Video Tutorial</Text>
          <Text style={styles.mobileVideoDescription}>
            To watch the complete tutorial, please access the web version of the app or visit our website.
          </Text>
          <TouchableOpacity style={styles.webLinkButton}>
            <Text style={styles.webLinkButtonText}>Open in Browser</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.colors.gray[700]} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>How to Use BlueApp</Text>
        
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
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

        {/* Video Completion Section - Only show after video completes */}
        {videoCompleted && (
          <View style={styles.completionSection}>
            <View style={styles.completionHeader}>
              <CheckCircle size={32} color={theme.colors.success[500]} />
              <Text style={styles.completionTitle}>Tutorial Complete!</Text>
              <Text style={styles.completionDescription}>
                You've learned the basics of BlueApp. Ready to start your health journey?
              </Text>
            </View>

            {showContinueButton && (
              <TouchableOpacity 
                style={styles.continueButton}
                onPress={handleContinueToApp}
                activeOpacity={0.8}
              >
                <Text style={styles.continueButtonText}>I understand, continue to the app</Text>
                <ArrowRight size={20} color={theme.colors.white} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Features Overview */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Key Features</Text>
          
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureNumber}>1</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Dose Tracking</Text>
                <Text style={styles.featureDescription}>
                  Record your daily doses and maintain a complete history of your treatment.
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureNumber}>2</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Progress Monitoring</Text>
                <Text style={styles.featureDescription}>
                  Track your evolution with detailed charts and health metrics.
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureNumber}>3</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Smart Reminders</Text>
                <Text style={styles.featureDescription}>
                  Set up personalized reminders to never miss your doses.
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureNumber}>4</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Health Library</Text>
                <Text style={styles.featureDescription}>
                  Access educational articles and resources about health and wellness.
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
              All your data is stored locally and never shared with third parties.
            </Text>
          </View>
        </View>
      </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
    backgroundColor: theme.colors.primary[50],
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: theme.colors.primary[800],
  },
  placeholder: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  videoSection: {
    padding: 20,
    backgroundColor: theme.colors.white,
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
    marginBottom: 20,
  },
  webLinkButton: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  webLinkButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: theme.colors.primary[600],
  },
  completionSection: {
    padding: 20,
    backgroundColor: theme.colors.success[50],
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.colors.success[200],
  },
  completionHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  completionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: theme.colors.success[800],
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  completionDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: theme.colors.success[700],
    textAlign: 'center',
    lineHeight: 24,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[600],
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: theme.colors.primary[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  continueButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.white,
    marginRight: 8,
  },
  featuresSection: {
    padding: 20,
    backgroundColor: theme.colors.gray[50],
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
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureNumber: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
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
    padding: 20,
    backgroundColor: theme.colors.white,
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
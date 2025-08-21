import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Droplet, ChartBar as BarChart3, Calendar, BookOpen, Package } from 'lucide-react-native';
import { HeaderMenu } from '@/components/HeaderMenu';
import { BottomIconsBar } from '@/components/BottomIconsBar';
import { SectionHeader } from '@/components/SectionHeader';
import { UsefulContainer } from '@/components/UsefulContainer';
import { theme } from '@/constants/theme';

export default function HowToUseScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const features = [
    {
      icon: Droplet,
      title: 'Track Your Doses',
      description: 'Log your daily medication doses and maintain a complete history of your treatment journey.',
      color: theme.colors.primary[600],
    },
    {
      icon: BarChart3,
      title: 'Monitor Progress',
      description: 'View detailed charts and analytics to see how your body responds to treatment over time.',
      color: theme.colors.secondary[600],
    },
    {
      icon: Calendar,
      title: 'Set Reminders',
      description: 'Configure personalized dose schedules and never miss your medication times.',
      color: theme.colors.success[600],
    },
    {
      icon: BookOpen,
      title: 'Learn & Grow',
      description: 'Access educational articles and expert insights about health and wellness.',
      color: theme.colors.warning[600],
    },
    {
      icon: Package,
      title: 'Track Packages',
      description: 'Monitor your BlueDrops shipments and know exactly when they\'ll arrive.',
      color: theme.colors.error[600],
    },
  ];

  return (
    <View style={styles.container}>
      <HeaderMenu />
      <SectionHeader 
        title="How to Use BlueApp" 
        variant="primary"
      />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent, 
          { 
            paddingBottom: insets.bottom + 120, // Extra space for bottom icons
          }
        ]}
      >
        <UsefulContainer>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>Your Health Tracking Companion</Text>
            <Text style={styles.heroSubtitle}>
              BlueApp is designed to help you stay on track with your wellness journey through smart tracking and insights.
            </Text>
          </View>

          {/* Features Section */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>What BlueApp Does</Text>
            
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <View key={index} style={styles.featureCard}>
                  <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                    <Icon size={24} color={theme.colors.white} />
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Getting Started Section */}
          <View style={styles.gettingStartedSection}>
            <Text style={styles.sectionTitle}>Getting Started</Text>
            
            <View style={styles.stepCard}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Set Up Your Schedule</Text>
                <Text style={styles.stepDescription}>
                  Go to the Track tab and configure your personal dose times to get started.
                </Text>
              </View>
            </View>

            <View style={styles.stepCard}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Log Your Doses</Text>
                <Text style={styles.stepDescription}>
                  Use the home screen to quickly log when you take your medication.
                </Text>
              </View>
            </View>

            <View style={styles.stepCard}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Track Your Progress</Text>
                <Text style={styles.stepDescription}>
                  Monitor your journey with detailed charts and health insights in the Progress tab.
                </Text>
              </View>
            </View>
          </View>

          {/* Benefits Section */}
          <View style={styles.benefitsSection}>
            <Text style={styles.sectionTitle}>Why Use BlueApp?</Text>
            
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <View style={styles.benefitBullet} />
                <Text style={styles.benefitText}>Stay consistent with your medication schedule</Text>
              </View>
              
              <View style={styles.benefitItem}>
                <View style={styles.benefitBullet} />
                <Text style={styles.benefitText}>Visualize your health progress over time</Text>
              </View>
              
              <View style={styles.benefitItem}>
                <View style={styles.benefitBullet} />
                <Text style={styles.benefitText}>Access educational health content</Text>
              </View>
              
              <View style={styles.benefitItem}>
                <View style={styles.benefitBullet} />
                <Text style={styles.benefitText}>Keep all your health data in one place</Text>
              </View>
              
              <View style={styles.benefitItem}>
                <View style={styles.benefitBullet} />
                <Text style={styles.benefitText}>Sync across all your devices</Text>
              </View>
            </View>
          </View>

          {/* CTA Section */}
          <View style={styles.ctaSection}>
            <Text style={styles.ctaTitle}>Ready to Start?</Text>
            <Text style={styles.ctaDescription}>
              Begin your health tracking journey today and take control of your wellness.
            </Text>
            
            <TouchableOpacity 
              style={styles.ctaButton}
              onPress={() => router.replace('/(tabs)')}
            >
              <Text style={styles.ctaButtonText}>Get Started Now</Text>
            </TouchableOpacity>
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
  heroSection: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: theme.colors.primary[50],
    borderRadius: 16,
    marginTop: 24,
    marginBottom: 32,
  },
  heroTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: theme.colors.primary[800],
    textAlign: 'center',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: theme.colors.primary[700],
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: theme.colors.gray[900],
    marginBottom: 20,
    textAlign: 'center',
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary[500],
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: theme.colors.gray[900],
    marginBottom: 8,
  },
  featureDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[600],
    lineHeight: 20,
  },
  gettingStartedSection: {
    marginBottom: 32,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: theme.colors.white,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.gray[900],
    marginBottom: 6,
  },
  stepDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[600],
    lineHeight: 20,
  },
  benefitsSection: {
    marginBottom: 32,
  },
  benefitsList: {
    marginTop: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  benefitBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.success[500],
    marginRight: 16,
  },
  benefitText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: theme.colors.gray[700],
    flex: 1,
    lineHeight: 22,
  },
  ctaSection: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: theme.colors.primary[600],
    borderRadius: 16,
    marginBottom: 32,
  },
  ctaTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    color: theme.colors.white,
    textAlign: 'center',
    marginBottom: 12,
  },
  ctaDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: theme.colors.white,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    opacity: 0.9,
  },
  ctaButton: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.primary[600],
  },
});
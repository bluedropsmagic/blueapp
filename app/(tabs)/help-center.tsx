import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { HeaderMenu } from '@/components/HeaderMenu';
import { BottomIconsBar } from '@/components/BottomIconsBar';
import { SectionHeader } from '@/components/SectionHeader';
import { UsefulContainer } from '@/components/UsefulContainer';
import { Mail, Clock, ChevronRight, Headphones } from 'lucide-react-native';
import { theme } from '@/constants/theme';

export default function HelpCenterScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleEmailPress = async () => {
    const email = 'support@magicbluedrops.com';
    const subject = 'BlueApp Support Request';
    const body = 'Hello BlueApp Support Team,\n\nI need assistance with:\n\n[Please describe your issue here]\n\nThank you!';
    
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    try {
      const supported = await Linking.canOpenURL(mailtoUrl);
      if (supported) {
        await Linking.openURL(mailtoUrl);
      } else {
        Alert.alert(
          'Email Support',
          `Please send an email to: ${email}`,
          [
            { text: 'Copy Email', onPress: () => copyToClipboard(email) },
            { text: 'OK' }
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        'Email Support',
        `Please send an email to: ${email}`,
        [
          { text: 'Copy Email', onPress: () => copyToClipboard(email) },
          { text: 'OK' }
        ]
      );
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      // For web, use the Clipboard API
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        Alert.alert('Copied!', 'Email address copied to clipboard');
      } else {
        // Fallback for older browsers
        Alert.alert('Email Address', text);
      }
    } catch (error) {
      Alert.alert('Email Address', text);
    }
  };

  return (
    <View style={styles.container}>
      <HeaderMenu />
      <SectionHeader 
        title="Help Center" 
        variant="primary"
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
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.heroIcon}>
              <Headphones size={32} color={theme.colors.white} />
            </View>
            <Text style={styles.heroTitle}>We're Here to Help</Text>
            <Text style={styles.heroSubtitle}>
              Get support, find answers, and connect with our team
            </Text>
          </View>

          {/* Contact Options - Only Email Support */}
          <View style={styles.contactSection}>
            <Text style={styles.sectionTitle}>Contact Support</Text>
            
            <TouchableOpacity style={styles.contactCard} onPress={handleEmailPress}>
              <View style={styles.contactIcon}>
                <Mail size={24} color={theme.colors.primary[600]} />
              </View>
              <View style={styles.contactContent}>
                <Text style={styles.contactTitle}>Email Support</Text>
                <Text style={styles.contactDescription}>support@magicbluedrops.com</Text>
                <Text style={styles.contactSubtext}>Response within 24 hours</Text>
              </View>
              <ChevronRight size={20} color={theme.colors.gray[400]} />
            </TouchableOpacity>
          </View>

          {/* Support Hours */}
          <View style={styles.hoursSection}>
            <View style={styles.hoursHeader}>
              <Clock size={20} color={theme.colors.warning[600]} />
              <Text style={styles.hoursTitle}>Support Hours</Text>
            </View>
            <View style={styles.hoursContent}>
              <View style={styles.hoursItem}>
                <Text style={styles.hoursDay}>Monday - Friday</Text>
                <Text style={styles.hoursTime}>9:00 AM - 6:00 PM EST</Text>
              </View>
              <View style={styles.hoursItem}>
                <Text style={styles.hoursDay}>Saturday</Text>
                <Text style={styles.hoursTime}>10:00 AM - 4:00 PM EST</Text>
              </View>
              <View style={styles.hoursItem}>
                <Text style={styles.hoursDay}>Sunday</Text>
                <Text style={styles.hoursTime}>Closed</Text>
              </View>
            </View>
          </View>

          {/* FAQ Section */}
          <View style={styles.faqSection}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            
            <View style={styles.faqCard}>
              <Text style={styles.faqQuestion}>How do I track my BlueDrops package?</Text>
              <Text style={styles.faqAnswer}>
                You can track your package using the tracking feature on the home screen. Enter your tracking number to see real-time updates.
              </Text>
            </View>

            <View style={styles.faqCard}>
              <Text style={styles.faqQuestion}>How do I set up dose reminders?</Text>
              <Text style={styles.faqAnswer}>
                Go to the Track tab and tap "Configure Schedule" to set up your personal dose times and reminders.
              </Text>
            </View>

            <View style={styles.faqCard}>
              <Text style={styles.faqQuestion}>Is my health data secure?</Text>
              <Text style={styles.faqAnswer}>
                Yes, all your health data is encrypted and stored securely. We never share your personal information with third parties.
              </Text>
            </View>

            <View style={styles.faqCard}>
              <Text style={styles.faqQuestion}>How do I update my profile information?</Text>
              <Text style={styles.faqAnswer}>
                Go to Settings and tap on your profile section to update your name and other information.
              </Text>
            </View>

            <View style={styles.faqCard}>
              <Text style={styles.faqQuestion}>Can I sync my data across devices?</Text>
              <Text style={styles.faqAnswer}>
                Yes, your data automatically syncs across all your devices when you're signed in to your account.
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footerSection}>
            <Text style={styles.footerTitle}>Still need help?</Text>
            <Text style={styles.footerText}>
              Our support team is here to help you get the most out of BlueApp. Don't hesitate to reach out!
            </Text>
            
            <TouchableOpacity style={styles.footerButton} onPress={handleEmailPress}>
              <Mail size={16} color={theme.colors.white} />
              <Text style={styles.footerButtonText}>Contact Support</Text>
            </TouchableOpacity>
          </View>
        </UsefulContainer>
      </ScrollView>

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
    alignItems: 'center',
    padding: 32,
    backgroundColor: theme.colors.primary[600],
    borderRadius: 16,
    marginTop: 24,
    marginBottom: 32,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary[700],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: theme.colors.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: theme.colors.white,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 24,
  },
  contactSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: theme.colors.gray[900],
    marginBottom: 16,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.gray[900],
    marginBottom: 4,
  },
  contactDescription: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.primary[600],
    marginBottom: 2,
  },
  contactSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: theme.colors.gray[500],
  },
  hoursSection: {
    backgroundColor: theme.colors.warning[50],
    padding: 20,
    borderRadius: 12,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.warning[500],
  },
  hoursHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  hoursTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.gray[900],
    marginLeft: 8,
  },
  hoursContent: {
    gap: 8,
  },
  hoursItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hoursDay: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.gray[700],
  },
  hoursTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[600],
  },
  faqSection: {
    marginBottom: 32,
  },
  faqCard: {
    backgroundColor: theme.colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  faqQuestion: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: theme.colors.gray[900],
    marginBottom: 8,
  },
  faqAnswer: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[600],
    lineHeight: 20,
  },
  footerSection: {
    backgroundColor: theme.colors.primary[50],
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  footerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: theme.colors.primary[800],
    marginBottom: 8,
    textAlign: 'center',
  },
  footerText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.primary[700],
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary[600],
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  footerButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: theme.colors.white,
    marginLeft: 8,
  },
});
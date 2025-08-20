import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { X, Mail, ChevronRight } from 'lucide-react-native';
import { theme } from '@/constants/theme';

interface HelpSupportModalProps {
  visible: boolean;
  onClose: () => void;
}

export const HelpSupportModal = ({ visible, onClose }: HelpSupportModalProps) => {
  const handleEmailPress = () => {
    // This would open the email client
    console.log('Opening email support');
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Help Center</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={theme.colors.gray[600]} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Contact Support Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact Support</Text>
              
              <TouchableOpacity style={styles.contactItem} onPress={handleEmailPress}>
                <View style={styles.contactLeft}>
                  <View style={styles.emailIcon}>
                    <Mail size={20} color={theme.colors.primary[600]} />
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactTitle}>Email Support</Text>
                    <Text style={styles.contactSubtitle}>support@magicbluedrops.com</Text>
                  </View>
                </View>
                <ChevronRight size={16} color={theme.colors.gray[400]} />
              </TouchableOpacity>
            </View>

            {/* FAQ Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
              
              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>How do I add a new dose reminder?</Text>
                <Text style={styles.faqAnswer}>
                  Go to the Track tab and tap the "Add" button next to Dose Reminders.
                </Text>
              </View>

              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>Is my data secure?</Text>
                <Text style={styles.faqAnswer}>
                  Yes, all your data is encrypted and stored securely in our database with industry-standard security measures.
                </Text>
              </View>

              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>Can I track my package?</Text>
                <Text style={styles.faqAnswer}>
                  Yes, you can track your BlueDrops package using the tracking feature on the home screen.
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    minHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[100],
  },
  headerTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: theme.colors.gray[900],
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.gray[900],
    marginBottom: 16,
  },
  
  // Contact Support Styles
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.gray[50],
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.gray[100],
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: theme.colors.gray[900],
    marginBottom: 2,
  },
  contactSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: theme.colors.gray[500],
  },
  
  // FAQ Styles
  faqItem: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[100],
  },
  faqQuestion: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: theme.colors.gray[900],
    marginBottom: 8,
    lineHeight: 20,
  },
  faqAnswer: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[600],
    lineHeight: 20,
  },
});
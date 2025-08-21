import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Alert, Modal, TextInput, Linking, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { HeaderMenu } from '@/components/HeaderMenu';
import { BottomIconsBar } from '@/components/BottomIconsBar';
import { SectionHeader } from '@/components/SectionHeader';
import { UsefulContainer } from '@/components/UsefulContainer';
import { NotificationSettings } from '@/components/NotificationSettings';
import { Bell, User, Settings, CircleHelp as HelpCircle, LogOut, ChevronRight, EyeOff, Clock, CircleAlert as AlertCircle, X, Check, Mail } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAuthStore } from '@/stores/authStore';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isDiscreetMode, toggleDiscreetMode } = useSettingsStore();
  const { user, signOut, isLoading, updateProfile } = useAuthStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  
  // Modal states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDataPrivacyModal, setShowDataPrivacyModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  
  // Profile edit states
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [profileLoading, setProfileLoading] = useState(false);

  const handleDiscreetModeToggle = () => {
    toggleDiscreetMode();
    Alert.alert(
      'Discreet Mode',
      `Discreet mode ${!isDiscreetMode ? 'enabled' : 'disabled'}. ${!isDiscreetMode ? 'Tab labels are now hidden for privacy.' : 'Tab labels are now visible.'}`
    );
  };
  
  const handleNotificationsToggle = () => {
    setNotificationsEnabled(!notificationsEnabled);
    Alert.alert(
      'Notifications', 
      `Push notifications ${!notificationsEnabled ? 'enabled' : 'disabled'}. You can change this in your device settings anytime.`
    );
  };
  
  const handleRemindersToggle = () => {
    setRemindersEnabled(!remindersEnabled);
    Alert.alert(
      'Dose Reminders', 
      `Dose reminders ${!remindersEnabled ? 'enabled' : 'disabled'}. ${!remindersEnabled ? 'You will receive notifications for your scheduled doses.' : 'You will not receive dose reminder notifications.'}`
    );
  };

  const handleProfilePress = () => {
    setEditName(user?.name || '');
    setEditEmail(user?.email || '');
    setShowProfileModal(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    
    setProfileLoading(true);
    
    try {
      const success = await updateProfile(editName.trim());
      
      if (success) {
        Alert.alert(
          'Profile Updated',
          'Your profile information has been updated successfully.',
          [{ text: 'OK', onPress: () => setShowProfileModal(false) }]
        );
      } else {
        Alert.alert('Error', 'Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleDataPrivacyPress = () => {
    setShowDataPrivacyModal(true);
  };

  const handleHelpPress = () => {
    setShowHelpModal(true);
  };

  const handleAboutPress = () => {
    setShowAboutModal(true);
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@magicbluedrops.com?subject=BlueApp Support Request');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/login');
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if there's an error, still navigate to login
      router.replace('/login');
    }
  };
  
  return (
    <View style={styles.container}>
      <HeaderMenu />
      <SectionHeader 
        title="Settings" 
        variant="warning"
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
          <View style={styles.profileSection}>
            <TouchableOpacity style={styles.profileButton} onPress={handleProfilePress}>
              <View style={styles.profileIcon}>
                <User size={24} color={theme.colors.white} />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user?.name || 'User'}</Text>
                <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>
              </View>
              <ChevronRight size={20} color={theme.colors.gray[400]} />
            </TouchableOpacity>
          </View>

          {/* Push Notifications Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            <NotificationSettings />
          </View>
          
          {/* App Preferences section - Hidden but kept in code */}
          {false && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>App Preferences</Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingLabelContainer}>
                  <EyeOff size={20} color={theme.colors.primary[600]} />
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingLabel}>Discreet Mode</Text>
                    <Text style={styles.settingDescription}>Hide tab labels for privacy</Text>
                  </View>
                </View>
                <Switch
                  trackColor={{ false: theme.colors.gray[300], true: theme.colors.primary[500] }}
                  thumbColor={theme.colors.white}
                  ios_backgroundColor={theme.colors.gray[300]}
                  onValueChange={handleDiscreetModeToggle}
                  value={isDiscreetMode}
                />
              </View>
              
              <View style={styles.settingItem}>
                <View style={styles.settingLabelContainer}>
                  <Bell size={20} color={theme.colors.primary[600]} />
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingLabel}>Notifications</Text>
                    <Text style={styles.settingDescription}>General app notifications</Text>
                  </View>
                </View>
                <Switch
                  trackColor={{ false: theme.colors.gray[300], true: theme.colors.primary[500] }}
                  thumbColor={theme.colors.white}
                  ios_backgroundColor={theme.colors.gray[300]}
                  onValueChange={handleNotificationsToggle}
                  value={notificationsEnabled}
                />
              </View>
              
              <View style={styles.settingItem}>
                <View style={styles.settingLabelContainer}>
                  <Clock size={20} color={theme.colors.primary[600]} />
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingLabel}>Dose Reminders</Text>
                    <Text style={styles.settingDescription}>Medication reminder alerts</Text>
                  </View>
                </View>
                <Switch
                  trackColor={{ false: theme.colors.gray[300], true: theme.colors.primary[500] }}
                  thumbColor={theme.colors.white}
                  ios_backgroundColor={theme.colors.gray[300]}
                  onValueChange={handleRemindersToggle}
                  value={remindersEnabled}
                />
              </View>
            </View>
          )}
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy & Security</Text>
            
            <TouchableOpacity style={styles.settingButton} onPress={handleDataPrivacyPress}>
              <View style={styles.settingLabelContainer}>
                <AlertCircle size={20} color={theme.colors.primary[600]} />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingLabel}>Data & Privacy</Text>
                  <Text style={styles.settingDescription}>Manage your data and privacy settings</Text>
                </View>
              </View>
              <ChevronRight size={20} color={theme.colors.gray[400]} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>
            
            <TouchableOpacity style={styles.settingButton} onPress={handleHelpPress}>
              <View style={styles.settingLabelContainer}>
                <HelpCircle size={20} color={theme.colors.primary[600]} />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingLabel}>Help Center</Text>
                  <Text style={styles.settingDescription}>Get help and contact support</Text>
                </View>
              </View>
              <ChevronRight size={20} color={theme.colors.gray[400]} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingButton} onPress={handleAboutPress}>
              <View style={styles.settingLabelContainer}>
                <AlertCircle size={20} color={theme.colors.primary[600]} />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingLabel}>About</Text>
                  <Text style={styles.settingDescription}>App version and information</Text>
                </View>
              </View>
              <ChevronRight size={20} color={theme.colors.gray[400]} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[styles.logoutButton, isLoading && styles.logoutButtonDisabled]} 
            onPress={handleSignOut}
            disabled={isLoading}
          >
            <LogOut size={20} color={isLoading ? theme.colors.gray[400] : theme.colors.error[600]} />
            <Text style={[styles.logoutButtonText, isLoading && styles.logoutButtonTextDisabled]}>
              {isLoading ? 'Signing Out...' : 'Sign Out'}
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </UsefulContainer>
      </ScrollView>

      {/* Bottom Icons Bar */}
      <BottomIconsBar />

      {/* Profile Modal */}
      <Modal
        visible={showProfileModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowProfileModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setShowProfileModal(false)}>
                <X size={24} color={theme.colors.gray[600]} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.textInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter your full name"
                placeholderTextColor={theme.colors.gray[400]}
                editable={!profileLoading}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={[styles.textInput, styles.disabledInput]}
                value={editEmail}
                placeholder="Enter your email"
                placeholderTextColor={theme.colors.gray[400]}
                editable={false}
              />
              <Text style={styles.inputNote}>Email cannot be changed</Text>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowProfileModal(false)}
                disabled={profileLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.saveButton, profileLoading && styles.saveButtonDisabled]}
                onPress={handleSaveProfile}
                disabled={profileLoading}
              >
                <Check size={16} color={theme.colors.white} />
                <Text style={styles.saveButtonText}>
                  {profileLoading ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Data Privacy Modal */}
      <Modal
        visible={showDataPrivacyModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDataPrivacyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Data & Privacy</Text>
              <TouchableOpacity onPress={() => setShowDataPrivacyModal(false)}>
                <X size={24} color={theme.colors.gray[600]} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScrollContent}>
              <View style={styles.privacySection}>
                <Text style={styles.privacySectionTitle}>Data Collection</Text>
                <Text style={styles.privacyText}>
                  BlueApp collects only the health data you choose to track. All data is stored securely in our encrypted database and is only accessible to you.
                </Text>
              </View>
              
              <View style={styles.privacySection}>
                <Text style={styles.privacySectionTitle}>Data Sharing</Text>
                <Text style={styles.privacyText}>
                  We never share your personal health data with third parties. Your information remains private and under your control.
                </Text>
              </View>
              
              <View style={styles.privacySection}>
                <Text style={styles.privacySectionTitle}>Data Security</Text>
                <Text style={styles.privacyText}>
                  Your data is protected with industry-standard encryption both in transit and at rest. We use Supabase for secure data storage.
                </Text>
              </View>
              
              <View style={styles.privacySection}>
                <Text style={styles.privacySectionTitle}>Delete Account</Text>
                <TouchableOpacity style={styles.deleteButton}>
                  <Text style={styles.deleteButtonText}>Delete My Account</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Help Modal */}
      <Modal
        visible={showHelpModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowHelpModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Help Center</Text>
              <TouchableOpacity onPress={() => setShowHelpModal(false)}>
                <X size={24} color={theme.colors.gray[600]} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScrollContent}>
              <Text style={styles.helpSectionTitle}>Contact Support</Text>
              
              <TouchableOpacity 
                style={styles.contactOption}
                onPress={handleContactSupport}
              >
                <Mail size={20} color={theme.colors.primary[600]} />
                <View style={styles.contactInfo}>
                  <Text style={styles.contactTitle}>Email Support</Text>
                  <Text style={styles.contactDescription}>support@magicbluedrops.com</Text>
                </View>
                <ChevronRight size={16} color={theme.colors.gray[400]} />
              </TouchableOpacity>
              
              <Text style={styles.helpSectionTitle}>Frequently Asked Questions</Text>
              
              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>How do I add a new dose reminder?</Text>
                <Text style={styles.faqAnswer}>Go to the Track tab and tap the "Add" button next to Dose Reminders.</Text>
              </View>
              
              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>Is my data secure?</Text>
                <Text style={styles.faqAnswer}>Yes, all your data is encrypted and stored securely in our database with industry-standard security measures.</Text>
              </View>
              
              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>Can I track my package?</Text>
                <Text style={styles.faqAnswer}>Yes, you can track your BlueDrops package using the tracking feature on the home screen.</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* About Modal */}
      <Modal
        visible={showAboutModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAboutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>About BlueApp</Text>
              <TouchableOpacity onPress={() => setShowAboutModal(false)}>
                <X size={24} color={theme.colors.gray[600]} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScrollContent}>
              <View style={styles.aboutSection}>
                <Text style={styles.appName}>BlueApp</Text>
                <Text style={styles.appVersion}>Version 1.0.0</Text>
                <Text style={styles.appDescription}>
                  Your personal health tracking companion. BlueApp helps you stay on track with your medication schedule and monitor your health progress.
                </Text>
              </View>
              
              <View style={styles.aboutSection}>
                <Text style={styles.aboutSectionTitle}>Features</Text>
                <Text style={styles.aboutFeature}>• Medication tracking and reminders</Text>
                <Text style={styles.aboutFeature}>• Health progress monitoring</Text>
                <Text style={styles.aboutFeature}>• Symptom tracking</Text>
                <Text style={styles.aboutFeature}>• Package tracking</Text>
                <Text style={styles.aboutFeature}>• Educational health content</Text>
                <Text style={styles.aboutFeature}>• Cross-device synchronization</Text>
                <Text style={styles.aboutFeature}>• Push notifications</Text>
              </View>
              
              <View style={styles.aboutSection}>
                <Text style={styles.aboutSectionTitle}>Privacy</Text>
                <Text style={styles.aboutText}>
                  BlueApp is designed with privacy in mind. All your health data is encrypted and stored securely, and is never shared with third parties.
                </Text>
              </View>
              
              <View style={styles.aboutSection}>
                <Text style={styles.aboutSectionTitle}>Support</Text>
                <Text style={styles.aboutText}>
                  If you need help or have questions, please contact our support team through the Help Center.
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  profileSection: {
    marginBottom: 32,
    marginTop: 24,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    padding: 16,
    borderRadius: 12,
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.gray[900],
    marginBottom: 4,
  },
  profileEmail: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[500],
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.gray[900],
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  settingButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  settingLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.gray[800],
  },
  settingDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: theme.colors.gray[500],
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.error[50],
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  logoutButtonDisabled: {
    backgroundColor: theme.colors.gray[100],
  },
  logoutButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.error[600],
    marginLeft: 8,
  },
  logoutButtonTextDisabled: {
    color: theme.colors.gray[400],
  },
  versionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: theme.colors.gray[500],
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[100],
  },
  modalTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: theme.colors.gray[900],
  },
  modalScrollContent: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  inputLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.gray[700],
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[800],
  },
  disabledInput: {
    backgroundColor: theme.colors.gray[100],
    color: theme.colors.gray[500],
  },
  inputNote: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: theme.colors.gray[500],
    marginTop: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.gray[100],
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.gray[600],
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[600],
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: theme.colors.gray[400],
  },
  saveButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.white,
    marginLeft: 6,
  },
  privacySection: {
    marginBottom: 24,
  },
  privacySectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.gray[900],
    marginBottom: 8,
  },
  privacyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[600],
    lineHeight: 20,
  },
  deleteButton: {
    backgroundColor: theme.colors.error[50],
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.error[600],
  },
  helpSectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.gray[900],
    marginBottom: 16,
    marginTop: 8,
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray[50],
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  contactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.gray[900],
  },
  contactDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: theme.colors.gray[500],
    marginTop: 2,
  },
  faqItem: {
    marginBottom: 16,
  },
  faqQuestion: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: theme.colors.gray[900],
    marginBottom: 4,
  },
  faqAnswer: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[600],
    lineHeight: 20,
  },
  aboutSection: {
    marginBottom: 24,
  },
  appName: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: theme.colors.primary[600],
    textAlign: 'center',
    marginBottom: 8,
  },
  appVersion: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: theme.colors.gray[600],
    textAlign: 'center',
    marginBottom: 16,
  },
  appDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[600],
    lineHeight: 20,
    textAlign: 'center',
  },
  aboutSectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.gray[900],
    marginBottom: 8,
  },
  aboutFeature: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[600],
    lineHeight: 20,
    marginBottom: 4,
  },
  aboutText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[600],
    lineHeight: 20,
  },
});
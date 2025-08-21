import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, Platform } from 'react-native';
import { Bell, CircleCheck as CheckCircle, CircleAlert as AlertCircle, TestTube } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useNotificationStore } from '@/stores/notificationStore';
import { useAuthStore } from '@/stores/authStore';

export const NotificationSettings = () => {
  const { user } = useAuthStore();
  const {
    isInitialized,
    hasPermission,
    isSupported,
    permissionStatus,
    isLoading,
    initialize,
    requestPermission,
    sendTestNotification,
    setUserId,
    addTags,
    checkPermissionStatus,
  } = useNotificationStore();

  const [notificationsEnabled, setNotificationsEnabled] = useState(hasPermission);
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    setNotificationsEnabled(hasPermission);
  }, [hasPermission]);

  useEffect(() => {
    // Check permission status when component mounts
    checkPermissionStatus();
  }, [hasPermission]);

  useEffect(() => {
    // Set user ID when user is available and notifications are initialized
    if (user && isInitialized) {
      setUserId(user.id);
      addTags({
        user_name: user.name,
        user_email: user.email,
        platform: Platform.OS,
        app_version: '1.0.0',
        user_type: 'authenticated',
      });
    }
  }, [user, isInitialized]);

  const handleNotificationToggle = async () => {
    if (!isSupported) {
      Alert.alert(
        'Not Supported',
        'Push notifications are not supported on this device or browser.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!notificationsEnabled) {
      // User wants to enable notifications - AQUI É ONDE MOSTRAMOS O PROMPT
      console.log('User clicked to enable notifications - showing OneSignal prompt');
      
      const granted = await requestPermission();
      
      if (granted) {
        setNotificationsEnabled(true);
        Alert.alert(
          'Notifications Enabled! 🔔',
          'You will now receive push notifications for dose reminders and health tips.',
          [{ text: 'Great!' }]
        );
      } else {
        Alert.alert(
          'Permission Denied',
          'To receive notifications, please enable them in your browser settings. Look for the notification icon in your address bar or check your browser\'s notification settings.',
          [{ text: 'OK' }]
        );
      }
    } else {
      // User wants to disable notifications
      setNotificationsEnabled(false);
      Alert.alert(
        'Notifications Disabled',
        'You will no longer receive push notifications. You can re-enable them anytime.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleTestNotification = async () => {
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Please enable notifications first to send a test notification.',
        [{ text: 'OK' }]
      );
      return;
    }

    setTestLoading(true);
    
    try {
      await sendTestNotification();
      Alert.alert(
        'Test Notification Sent! 🚀',
        'A test notification has been sent. You should see it shortly! If you don\'t see it, check your browser\'s notification settings.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to send test notification. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setTestLoading(false);
    }
  };

  const getStatusColor = () => {
    if (!isSupported) return theme.colors.gray[500];
    if (hasPermission) return theme.colors.success[500];
    if (permissionStatus === 'denied') return theme.colors.error[500];
    return theme.colors.warning[500];
  };

  const getStatusText = () => {
    if (!isSupported) return 'Not Supported';
    if (hasPermission) return 'Enabled';
    if (permissionStatus === 'denied') return 'Denied';
    return 'Disabled';
  };

  const getStatusIcon = () => {
    if (!isSupported) return AlertCircle;
    if (hasPermission) return CheckCircle;
    return AlertCircle;
  };

  const StatusIcon = getStatusIcon();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Bell size={24} color={theme.colors.primary[600]} />
          <View style={styles.headerText}>
            <Text style={styles.title}>Push Notifications</Text>
            <Text style={styles.subtitle}>Get reminders and health tips</Text>
          </View>
        </View>
        
        <View style={styles.statusContainer}>
          <StatusIcon size={16} color={getStatusColor()} />
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>
      </View>

      {isSupported && (
        <View style={styles.content}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Enable Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive dose reminders and health tips
              </Text>
            </View>
            <Switch
              trackColor={{ false: theme.colors.gray[300], true: theme.colors.primary[500] }}
              thumbColor={theme.colors.white}
              ios_backgroundColor={theme.colors.gray[300]}
              onValueChange={handleNotificationToggle}
              value={notificationsEnabled && hasPermission}
              disabled={isLoading}
            />
          </View>

          {hasPermission && (
            <TouchableOpacity
              style={[styles.testButton, testLoading && styles.testButtonDisabled]}
              onPress={handleTestNotification}
              disabled={testLoading}
              activeOpacity={0.7}
            >
              <TestTube size={16} color={theme.colors.white} />
              <Text style={styles.testButtonText}>
                {testLoading ? 'Sending...' : 'Send Test Notification'}
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>What You'll Receive</Text>
            <Text style={styles.infoText}>
              • 💊 Dose reminders at your scheduled times{'\n'}
              • 💡 Daily health tips and motivation{'\n'}
              • 📈 Progress updates and achievements{'\n'}
              • 🔔 Important app updates{'\n'}
              • 🎯 Personalized health insights
            </Text>
          </View>

          {Platform.OS === 'web' && (
            <View style={styles.webNotice}>
              <Text style={styles.webNoticeText}>
                💡 Click "Enable Notifications" above to allow notifications when prompted by your browser.
              </Text>
            </View>
          )}
        </View>
      )}

      {!isSupported && (
        <View style={styles.unsupportedContainer}>
          <AlertCircle size={48} color={theme.colors.gray[400]} />
          <Text style={styles.unsupportedTitle}>Notifications Not Available</Text>
          <Text style={styles.unsupportedText}>
            Push notifications are not supported on this device or browser. 
            Please use a modern browser (Chrome, Firefox, Safari, Edge) or mobile app for notification features.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.gray[900],
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: theme.colors.gray[600],
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray[50],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    marginLeft: 4,
  },
  content: {
    gap: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.gray[800],
    marginBottom: 2,
  },
  settingDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: theme.colors.gray[600],
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[600],
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  testButtonDisabled: {
    backgroundColor: theme.colors.gray[400],
  },
  testButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.white,
  },
  infoBox: {
    backgroundColor: theme.colors.primary[50],
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary[500],
  },
  infoTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: theme.colors.primary[800],
    marginBottom: 8,
  },
  infoText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: theme.colors.primary[700],
    lineHeight: 18,
  },
  webNotice: {
    backgroundColor: theme.colors.warning[50],
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.warning[200],
  },
  webNoticeText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: theme.colors.warning[700],
    textAlign: 'center',
  },
  unsupportedContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  unsupportedTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.gray[700],
    marginTop: 16,
    marginBottom: 8,
  },
  unsupportedText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[600],
    textAlign: 'center',
    lineHeight: 20,
  },
});
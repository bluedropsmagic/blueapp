import { Platform } from 'react-native';

// OneSignal Configuration
const ONESIGNAL_APP_ID = '92702fef-b859-4458-8b6b-c87d32238ec6'; // Your actual OneSignal App ID

interface OneSignalService {
  initialize: () => Promise<void>;
  requestPermission: () => Promise<boolean>;
  sendTestNotification: () => Promise<void>;
  setUserId: (userId: string) => Promise<void>;
  addTags: (tags: { [key: string]: string }) => Promise<void>;
  isInitialized: boolean;
  getSubscriptionId: () => Promise<string | null>;
  sendNotification: (title: string, message: string, data?: any) => Promise<void>;
}

class OneSignalServiceImpl implements OneSignalService {
  isInitialized = false;
  private OneSignal: any = null;

  async initialize(): Promise<void> {
    // Skip initialization during SSR
    if (Platform.OS === 'web' && typeof window === 'undefined') {
      console.log('OneSignal: Skipping initialization during SSR');
      return;
    }

    if (Platform.OS === 'web') {
      await this.initializeWeb();
    } else {
      await this.initializeMobile();
    }
  }

  private async initializeWeb(): Promise<void> {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        console.log('OneSignal: Not in browser environment, skipping initialization');
        return;
      }

      // Check if OneSignal is already loaded
      if (window.OneSignal) {
        this.OneSignal = window.OneSignal;
        this.isInitialized = true;
        console.log('OneSignal: Already loaded');
        return;
      }

      // Load OneSignal Web SDK with timeout
      const script = document.createElement('script');
      script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
      script.defer = true;
      
      const loadPromise = new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('OneSignal script load timeout')), 15000)
      );

      await Promise.race([loadPromise, timeoutPromise]);

      // Wait for OneSignal to be available with timeout
      const oneSignalPromise = new Promise((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 100; // 10 seconds max
        
        const checkOneSignal = () => {
          attempts++;
          if (window.OneSignal) {
            resolve(window.OneSignal);
          } else if (attempts >= maxAttempts) {
            reject(new Error('OneSignal not available after timeout'));
          } else {
            setTimeout(checkOneSignal, 100);
          }
        };
        checkOneSignal();
      });

      await oneSignalPromise;

      // Initialize OneSignal with enhanced configuration - SEM AUTO PROMPT
      await window.OneSignal.init({
        appId: ONESIGNAL_APP_ID,
        allowLocalhostAsSecureOrigin: true, // For development
        serviceWorkerPath: '/OneSignalSDKWorker.js',
        serviceWorkerUpdaterPath: '/OneSignalSDKWorker.js',
        notifyButton: {
          enable: false, // We handle permission requests manually
        },
        welcomeNotification: {
          disable: true, // Disable welcome notification
        },
        autoRegister: false, // We handle registration manually - IMPORTANTE
        autoResubscribe: true, // Auto resubscribe users
        persistNotification: false, // Don't persist notifications
        showCredit: false, // Hide OneSignal branding
        // Enhanced web push configuration
        safari_web_id: undefined, // Add your Safari Web ID if you have one
        promptOptions: {
          slidedown: {
            prompts: [
              {
                type: "push", // current types are "push" & "category"
                autoPrompt: false, // NUNCA mostrar automaticamente
                text: {
                  actionMessage: "We'd like to show you notifications for dose reminders and health tips.",
                  acceptButton: "Allow",
                  cancelButton: "No Thanks"
                },
                delay: {
                  pageViews: 999999, // Número muito alto para nunca aparecer automaticamente
                  timeDelay: 999999 // Tempo muito alto para nunca aparecer automaticamente
                }
              }
            ]
          }
        }
      });

      this.OneSignal = window.OneSignal;
      this.isInitialized = true;
      console.log('OneSignal Web SDK initialized successfully with App ID:', ONESIGNAL_APP_ID);

      // Set up event listeners
      this.setupEventListeners();

    } catch (error) {
      console.warn('OneSignal Web SDK initialization failed:', error?.message || error);
      // Don't throw error, just mark as not initialized
      this.isInitialized = false;
    }
  }

  private setupEventListeners(): void {
    if (!this.OneSignal) return;

    try {
      // Listen for subscription changes
      this.OneSignal.User.PushSubscription.addEventListener('change', (event: any) => {
        console.log('OneSignal subscription changed:', event);
      });

      // Listen for notification clicks
      this.OneSignal.Notifications.addEventListener('click', (event: any) => {
        console.log('OneSignal notification clicked:', event);
        // Handle notification click here
        // You can navigate to specific screens based on notification data
      });

      // Listen for permission changes
      this.OneSignal.Notifications.addEventListener('permissionChange', (granted: boolean) => {
        console.log('OneSignal permission changed:', granted);
      });

    } catch (error) {
      console.warn('Error setting up OneSignal event listeners:', error);
    }
  }

  private async initializeMobile(): Promise<void> {
    try {
      // For mobile, we would use the OneSignal React Native SDK
      // Since we're focusing on web, we'll just log this
      console.log('OneSignal: Mobile initialization would happen here');
      
      // In a real mobile app, you would:
      // import OneSignal from 'react-native-onesignal';
      // OneSignal.setAppId(ONESIGNAL_APP_ID);
      // OneSignal.promptForPushNotificationsWithUserResponse();
      
      this.isInitialized = true;
    } catch (error) {
      console.warn('OneSignal Mobile SDK initialization failed:', error?.message || error);
      this.isInitialized = false;
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isInitialized) {
      console.warn('OneSignal not initialized');
      return false;
    }

    try {
      if (Platform.OS === 'web' && this.OneSignal) {
        // MOSTRAR O PROMPT MANUALMENTE quando o usuário clicar no switch
        console.log('OneSignal: Showing permission prompt manually');
        
        // Use the slidedown prompt for better UX
        const result = await this.OneSignal.Slidedown.promptPush();
        console.log('OneSignal slidedown result:', result);
        
        // Check if permission was granted
        const permission = await this.OneSignal.Notifications.getPermission();
        console.log('OneSignal permission result:', permission);
        
        return permission;
      } else {
        // Mobile permission request would happen here
        console.log('OneSignal: Mobile permission request would happen here');
        return true;
      }
    } catch (error) {
      console.warn('OneSignal permission request failed:', error?.message || error);
      
      // Fallback to native browser API
      if (Platform.OS === 'web' && 'Notification' in window) {
        try {
          const permission = await Notification.requestPermission();
          return permission === 'granted';
        } catch (fallbackError) {
          console.warn('Fallback permission request failed:', fallbackError);
          return false;
        }
      }
      
      return false;
    }
  }

  async getSubscriptionId(): Promise<string | null> {
    if (!this.isInitialized || !this.OneSignal) {
      return null;
    }

    try {
      if (Platform.OS === 'web') {
        const subscriptionId = await this.OneSignal.User.PushSubscription.id;
        return subscriptionId || null;
      }
      return null;
    } catch (error) {
      console.warn('Failed to get subscription ID:', error);
      return null;
    }
  }

  async sendTestNotification(): Promise<void> {
    if (!this.isInitialized) {
      console.warn('OneSignal not initialized');
      return;
    }

    try {
      if (Platform.OS === 'web' && this.OneSignal) {
        // Get the subscription ID for backend integration info
        const subscriptionId = await this.getSubscriptionId();
        console.log('OneSignal Subscription ID:', subscriptionId);
        
        // Show a local notification for testing (since we can't send from client)
        if ('Notification' in window && Notification.permission === 'granted') {
          const notification = new Notification('BlueApp Test Notification 🔔', {
            body: 'This is a test notification from BlueApp! Your notifications are working perfectly.',
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'blueapp-test',
            requireInteraction: false,
            data: {
              type: 'test',
              timestamp: Date.now()
            }
          });

          // Auto close after 5 seconds
          setTimeout(() => {
            notification.close();
          }, 5000);

          // Handle click
          notification.onclick = () => {
            window.focus();
            notification.close();
          };
        }
        
        // Log information for backend integration
        console.log('📊 OneSignal Integration Info:');
        console.log('App ID:', ONESIGNAL_APP_ID);
        console.log('Subscription ID:', subscriptionId);
        console.log('To send real notifications, use the OneSignal REST API with this subscription ID');
        
      } else {
        console.log('OneSignal: Mobile test notification would be sent here');
      }
    } catch (error) {
      console.warn('OneSignal test notification failed:', error?.message || error);
    }
  }

  async sendNotification(title: string, message: string, data?: any): Promise<void> {
    // This would typically be called from your backend
    // Included here for reference
    console.log('To send notifications from backend, use OneSignal REST API:');
    console.log('POST https://onesignal.com/api/v1/notifications');
    console.log('Headers: Authorization: Basic YOUR_REST_API_KEY');
    console.log('Body:', {
      app_id: ONESIGNAL_APP_ID,
      headings: { en: title },
      contents: { en: message },
      data: data,
      included_segments: ['All'] // or specific user IDs
    });
  }

  async setUserId(userId: string): Promise<void> {
    if (!this.isInitialized) {
      console.warn('OneSignal not initialized');
      return;
    }

    try {
      if (Platform.OS === 'web' && this.OneSignal) {
        await this.OneSignal.login(userId);
        console.log('OneSignal user ID set:', userId);
      } else {
        console.log('OneSignal: Mobile user ID would be set here');
      }
    } catch (error) {
      console.warn('OneSignal set user ID failed:', error?.message || error);
    }
  }

  async addTags(tags: { [key: string]: string }): Promise<void> {
    if (!this.isInitialized) {
      console.warn('OneSignal not initialized');
      return;
    }

    try {
      if (Platform.OS === 'web' && this.OneSignal) {
        await this.OneSignal.User.addTags(tags);
        console.log('OneSignal tags added:', tags);
      } else {
        console.log('OneSignal: Mobile tags would be added here');
      }
    } catch (error) {
      console.warn('OneSignal add tags failed:', error?.message || error);
    }
  }
}

// Export singleton instance
export const oneSignalService = new OneSignalServiceImpl();

// Helper functions for common use cases
export const initializeNotifications = async (): Promise<boolean> => {
  try {
    await oneSignalService.initialize();
    return oneSignalService.isInitialized;
  } catch (error) {
    console.warn('Failed to initialize notifications:', error?.message || error);
    return false;
  }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    return await oneSignalService.requestPermission();
  } catch (error) {
    console.warn('Failed to request notification permission:', error?.message || error);
    return false;
  }
};

export const sendTestNotification = async (): Promise<void> => {
  try {
    await oneSignalService.sendTestNotification();
  } catch (error) {
    console.warn('Failed to send test notification:', error?.message || error);
  }
};

export const setNotificationUserId = async (userId: string): Promise<void> => {
  try {
    await oneSignalService.setUserId(userId);
  } catch (error) {
    console.warn('Failed to set notification user ID:', error?.message || error);
  }
};

export const addNotificationTags = async (tags: { [key: string]: string }): Promise<void> => {
  try {
    await oneSignalService.addTags(tags);
  } catch (error) {
    console.warn('Failed to add notification tags:', error?.message || error);
  }
};

export const getSubscriptionId = async (): Promise<string | null> => {
  try {
    return await oneSignalService.getSubscriptionId();
  } catch (error) {
    console.warn('Failed to get subscription ID:', error?.message || error);
    return null;
  }
};

// Check if notifications are supported
export const isNotificationSupported = (): boolean => {
  if (Platform.OS === 'web') {
    return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
  }
  return true; // Mobile platforms support notifications
};

// Get current notification permission status
export const getNotificationPermission = (): string => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && 'Notification' in window) {
    return Notification.permission;
  }
  return 'default';
};

// Utility function to check if OneSignal is properly configured
export const checkOneSignalConfiguration = (): { isConfigured: boolean; issues: string[] } => {
  const issues: string[] = [];
  
  if (!ONESIGNAL_APP_ID || ONESIGNAL_APP_ID === 'YOUR_ONESIGNAL_APP_ID') {
    issues.push('OneSignal App ID not configured');
  }
  
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    if (!('Notification' in window)) {
      issues.push('Browser does not support notifications');
    }
    
    if (!('serviceWorker' in navigator)) {
      issues.push('Browser does not support service workers');
    }
  }
  
  return {
    isConfigured: issues.length === 0,
    issues
  };
};
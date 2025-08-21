import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

interface NotificationStore {
  isInitialized: boolean;
  hasPermission: boolean;
  isSupported: boolean;
  permissionStatus: string;
  isLoading: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  requestPermission: () => Promise<boolean>;
  sendTestNotification: () => Promise<void>;
  setUserId: (userId: string) => Promise<void>;
  addTags: (tags: { [key: string]: string }) => Promise<void>;
  checkPermissionStatus: () => void;
}

// Storage adapter that works on both web and mobile
const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        return localStorage.getItem(name);
      } else if (Platform.OS === 'web') {
        return null;
      }
      return await SecureStore.getItemAsync(name);
    } catch (e) {
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        localStorage.setItem(name, value);
      } else if (Platform.OS === 'web') {
        return;
      } else {
        await SecureStore.setItemAsync(name, value);
      }
    } catch (e) {
      // Handle errors
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        localStorage.removeItem(name);
      } else if (Platform.OS === 'web') {
        return;
      } else {
        await SecureStore.deleteItemAsync(name);
      }
    } catch (e) {
      // Handle errors
    }
  }
};

// Check if notifications are supported
const isNotificationSupported = (): boolean => {
  if (Platform.OS === 'web') {
    return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
  }
  return true; // Mobile platforms support notifications
};

// Get current notification permission status
const getNotificationPermission = (): string => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && 'Notification' in window) {
    return Notification.permission;
  }
  return 'default';
};

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      isInitialized: false,
      hasPermission: false,
      isSupported: isNotificationSupported(),
      permissionStatus: getNotificationPermission(),
      isLoading: false,

      initialize: async () => {
        // Skip initialization during SSR
        if (Platform.OS === 'web' && typeof window === 'undefined') {
          console.log('Skipping notification initialization during SSR');
          return;
        }

        set({ isLoading: true });
        
        try {
          console.log('Initializing notifications...');
          
          // Check if notifications are supported
          const supported = isNotificationSupported();
          if (!supported) {
            console.log('Notifications not supported on this platform');
            set({ 
              isSupported: false, 
              isInitialized: false, 
              isLoading: false 
            });
            return;
          }

          // For web, try to initialize OneSignal
          if (Platform.OS === 'web') {
            try {
              // Dynamic import to avoid SSR issues
              const { initializeNotifications } = await import('@/lib/oneSignal');
              const initialized = await initializeNotifications();
              
              if (initialized) {
                console.log('OneSignal initialized successfully');
                
                // Check current permission status
                const permissionStatus = getNotificationPermission();
                const hasPermission = permissionStatus === 'granted';
                
                set({
                  isInitialized: true,
                  hasPermission,
                  permissionStatus,
                  isSupported: supported,
                  isLoading: false,
                });
              } else {
                console.warn('Failed to initialize OneSignal');
                set({ 
                  isInitialized: false, 
                  isLoading: false 
                });
              }
            } catch (oneSignalError) {
              console.warn('OneSignal initialization failed:', oneSignalError?.message || oneSignalError);
              
              // Fall back to basic notification support
              const permissionStatus = getNotificationPermission();
              const hasPermission = permissionStatus === 'granted';
              
              set({
                isInitialized: true, // Mark as initialized even without OneSignal
                hasPermission,
                permissionStatus,
                isSupported: supported,
                isLoading: false,
              });
            }
          } else {
            // Mobile initialization
            console.log('Mobile notification initialization');
            set({
              isInitialized: true,
              hasPermission: false, // Will be set when permission is requested
              permissionStatus: 'default',
              isSupported: supported,
              isLoading: false,
            });
          }
        } catch (error) {
          console.error('Error initializing notifications:', error?.message || error);
          set({ 
            isInitialized: false, 
            isLoading: false 
          });
        }
      },

      requestPermission: async () => {
        const { isSupported } = get();
        
        if (!isSupported) {
          console.log('Notifications not supported');
          return false;
        }

        set({ isLoading: true });

        try {
          if (Platform.OS === 'web' && typeof window !== 'undefined' && 'Notification' in window) {
            // Request permission using native browser API
            const permission = await Notification.requestPermission();
            const granted = permission === 'granted';
            
            set({
              hasPermission: granted,
              permissionStatus: permission,
              isLoading: false,
            });

            console.log('Notification permission result:', granted);
            return granted;
          } else {
            // Mobile permission request would happen here
            console.log('Mobile permission request');
            set({ isLoading: false });
            return true;
          }
        } catch (error) {
          console.error('Error requesting notification permission:', error?.message || error);
          set({ isLoading: false });
          return false;
        }
      },

      sendTestNotification: async () => {
        const { hasPermission } = get();
        
        if (!hasPermission) {
          console.log('No notification permission');
          return;
        }

        try {
          if (Platform.OS === 'web' && typeof window !== 'undefined' && 'Notification' in window) {
            // Send a test notification using native browser API
            new Notification('BlueApp Test Notification', {
              body: 'This is a test notification from BlueApp! 🔔',
              icon: '/favicon.ico',
              badge: '/favicon.ico',
              tag: 'blueapp-test',
              requireInteraction: false,
            });
            
            console.log('Test notification sent');
          } else {
            console.log('Mobile test notification would be sent here');
          }
        } catch (error) {
          console.error('Error sending test notification:', error?.message || error);
        }
      },

      setUserId: async (userId: string) => {
        try {
          // Try to use OneSignal if available
          const { setNotificationUserId } = await import('@/lib/oneSignal');
          await setNotificationUserId(userId);
          console.log('User ID set for notifications:', userId);
        } catch (error) {
          console.warn('Could not set user ID (OneSignal not available):', error?.message || error);
        }
      },

      addTags: async (tags: { [key: string]: string }) => {
        try {
          // Try to use OneSignal if available
          const { addNotificationTags } = await import('@/lib/oneSignal');
          await addNotificationTags(tags);
          console.log('Notification tags added:', tags);
        } catch (error) {
          console.warn('Could not add tags (OneSignal not available):', error?.message || error);
        }
      },

      checkPermissionStatus: () => {
        const permissionStatus = getNotificationPermission();
        const hasPermission = permissionStatus === 'granted';
        
        set({
          hasPermission,
          permissionStatus,
        });
      },
    }),
    {
      name: 'notification-storage',
      storage: {
        getItem: async (name) => {
          try {
            const value = await secureStorage.getItem(name);
            return value ?? null;
          } catch (e) {
            return null;
          }
        },
        setItem: async (name, value) => {
          try {
            await secureStorage.setItem(name, value);
          } catch (e) {
            // Handle errors
          }
        },
        removeItem: async (name) => {
          try {
            await secureStorage.removeItem(name);
          } catch (e) {
            // Handle errors
          }
        }
      }
    }
  )
);
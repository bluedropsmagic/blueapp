import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

interface OnboardingStore {
  hasSeenFirstTimeModal: boolean;
  markFirstTimeModalSeen: () => void;
  resetOnboarding: () => void;
}

// Storage adapter que funciona tanto no web quanto mobile
const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        return localStorage.getItem(name);
      } else if (Platform.OS === 'web') {
        // Server-side rendering context
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
        // Server-side rendering context - do nothing
        return;
      } else {
        await SecureStore.setItemAsync(name, value);
      }
    } catch (e) {
      // Handle errors or fallback
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        localStorage.removeItem(name);
      } else if (Platform.OS === 'web') {
        // Server-side rendering context - do nothing
        return;
      } else {
        await SecureStore.deleteItemAsync(name);
      }
    } catch (e) {
      // Handle errors
    }
  }
};

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      hasSeenFirstTimeModal: false,
      
      markFirstTimeModalSeen: () => {
        set({ hasSeenFirstTimeModal: true });
      },
      
      resetOnboarding: () => {
        set({ hasSeenFirstTimeModal: false });
      }
    }),
    {
      name: 'onboarding-storage',
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
            // Handle errors or fallback
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
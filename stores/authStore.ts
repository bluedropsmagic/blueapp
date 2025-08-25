import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { 
  createLocalUser, 
  signInLocalUser, 
  getCurrentSession, 
  signOutLocalUser, 
  updateLocalProfile,
  Profile 
} from '@/lib/localStorage';

interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface AuthStore {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  isNewUser: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (name: string, email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
  clearNewUserFlag: () => void;
  updateProfile: (name: string) => Promise<boolean>;
  clearInvalidSession: () => Promise<void>;
}

// Storage adapter that works on both web and mobile
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

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      isNewUser: false,
      
      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      clearNewUserFlag: () => {
        set({ isNewUser: false });
      },

      clearInvalidSession: async () => {
        console.log('Clearing invalid session...');
        
        try {
          // Sign out from local storage
          await signOutLocalUser();
          
          // Clear all local storage
          const storageKeys = ['auth-storage', 'onboarding-storage', 'dose-storage', 'settings-storage'];
          await Promise.all(storageKeys.map(key => secureStorage.removeItem(key)));

          // Clear browser storage if on web
          if (Platform.OS === 'web' && typeof window !== 'undefined') {
            // Clear localStorage
            Object.keys(localStorage).forEach(key => {
              if (key.includes('user_') || key.includes('profile_') || key.includes('doses_') || key === 'current_session') {
                localStorage.removeItem(key);
              }
            });
          }

          // Reset state
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            isNewUser: false,
            isInitialized: true,
          });

          console.log('Invalid session cleared successfully');
        } catch (error) {
          console.error('Error clearing invalid session:', error);
          // Force reset state even if clearing fails
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            isNewUser: false,
            isInitialized: true,
          });
        }
      },

      initialize: async () => {
        try {
          set({ isLoading: true });
          
          console.log('Initializing local authentication...');
          
          // Check for existing local session
          const session = await getCurrentSession();
          
          if (session?.user && session?.profile) {
            const authUser: AuthUser = {
              id: session.user.id,
              name: session.profile.name,
              email: session.profile.email,
            };

            set({
              user: authUser,
              isAuthenticated: true,
              isInitialized: true,
              isLoading: false,
              isNewUser: false,
            });
            
            console.log('Local session restored for user:', session.user.email);
          } else {
            set({ isInitialized: true, isLoading: false });
            console.log('No valid local session found');
          }
        } catch (error) {
          console.error('Error initializing auth:', error);
          set({ isInitialized: true, isLoading: false });
        }
      },
      
      signIn: async (email: string, password: string) => {
        set({ isLoading: true });
        
        try {
          const result = await signInLocalUser(email.toLowerCase().trim(), password.trim());

          if (result) {
            const authUser: AuthUser = {
              id: result.user.id,
              name: result.profile.name,
              email: result.profile.email,
            };

            set({
              user: authUser,
              isAuthenticated: true,
              isLoading: false,
              isNewUser: false,
            });
            
            console.log('User signed in successfully:', email);
            return true;
          } else {
            console.log('Sign in failed for:', email);
            set({ isLoading: false });
            return false;
          }
        } catch (error) {
          console.error('Sign in error:', error);
          set({ isLoading: false });
          return false;
        }
      },
      
      signUp: async (name: string, email: string, password: string) => {
        set({ isLoading: true });
        
        try {
          // Check if user already exists
          const existingSession = await signInLocalUser(email.toLowerCase().trim(), 'dummy');
          if (existingSession) {
            console.log('User already exists:', email);
            set({ isLoading: false });
            return false;
          }
          
          const result = await createLocalUser(name.trim(), email.toLowerCase().trim(), password.trim());

          if (result) {
            const authUser: AuthUser = {
              id: result.user.id,
              name: result.profile.name,
              email: result.profile.email,
            };

            set({
              user: authUser,
              isAuthenticated: true,
              isLoading: false,
              isNewUser: true,
            });
            
            console.log('User signed up successfully:', email);
            return true;
          } else {
            console.log('Sign up failed for:', email);
            set({ isLoading: false });
            return false;
          }
        } catch (error) {
          console.error('Sign up error:', error);
          set({ isLoading: false });
          return false;
        }
      },

      updateProfile: async (name: string) => {
        const { user } = get();
        if (!user) return false;

        set({ isLoading: true });

        try {
          const success = await updateLocalProfile(user.id, { name: name.trim() });

          if (success) {
            // Update local user state
            const updatedUser = { ...user, name: name.trim() };
            set({
              user: updatedUser,
              isLoading: false,
            });

            console.log('Profile updated successfully');
            return true;
          } else {
            set({ isLoading: false });
            return false;
          }
        } catch (error) {
          console.error('Error updating profile:', error);
          set({ isLoading: false });
          return false;
        }
      },
      
      signOut: async () => {
        set({ isLoading: true });
        
        try {
          // Sign out from local storage
          await signOutLocalUser();
          
          // Clear all local storage
          const storageKeys = ['auth-storage', 'onboarding-storage', 'dose-storage', 'settings-storage'];
          
          await Promise.all(
            storageKeys.map(key => secureStorage.removeItem(key))
          );

          // Clear browser storage if on web
          if (Platform.OS === 'web' && typeof window !== 'undefined') {
            // Clear localStorage
            Object.keys(localStorage).forEach(key => {
              if (key.includes('user_') || key.includes('profile_') || key.includes('doses_') || key === 'current_session') {
                localStorage.removeItem(key);
              }
            });
          }
          
          // Reset state completely
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            isNewUser: false,
            isInitialized: true, // Keep initialized as true
          });
          
          console.log('User successfully signed out');
          
        } catch (error) {
          console.error('Error during sign out:', error);
          // Even with error, do local logout
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            isNewUser: false,
            isInitialized: true,
          });
        }
      }
    }),
    {
      name: 'auth-storage',
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
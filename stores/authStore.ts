import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { supabase, Profile, getOrCreateProfile, updateUserProfile, testConnection } from '@/lib/supabase';
import { AuthError, User } from '@supabase/supabase-js';

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
          // Sign out from Supabase to clear invalid tokens
          await supabase.auth.signOut();
          
          // Clear all local storage
          const storageKeys = ['auth-storage', 'onboarding-storage', 'dose-storage', 'settings-storage'];
          await Promise.all(storageKeys.map(key => secureStorage.removeItem(key)));

          // Clear browser storage if on web
          if (Platform.OS === 'web' && typeof window !== 'undefined') {
            // Clear localStorage
            Object.keys(localStorage).forEach(key => {
              if (key.includes('supabase') || key.includes('auth') || key.includes('sb-')) {
                localStorage.removeItem(key);
              }
            });

            // Clear sessionStorage
            Object.keys(sessionStorage).forEach(key => {
              if (key.includes('supabase') || key.includes('auth') || key.includes('sb-')) {
                sessionStorage.removeItem(key);
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
          
          // Test Supabase connection first
          const connectionOk = await testConnection();
          if (!connectionOk) {
            console.warn('Supabase connection test failed, but continuing...');
          }
          
          // Check for existing Supabase session
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error getting session:', error);
            
            // If it's a JWT error, clear the invalid session
            if (error.message?.includes('JWT') || error.message?.includes('user_not_found') || error.message?.includes('invalid_token')) {
              console.log('Detected invalid JWT token, clearing session...');
              await get().clearInvalidSession();
              return;
            }
            
            set({ isInitialized: true, isLoading: false });
            return;
          }

          if (session?.user) {
            try {
              // Verify the user still exists by making a simple API call
              const { data: userData, error: userError } = await supabase.auth.getUser();
              
              if (userError) {
                console.error('Error verifying user:', userError);
                
                // If user doesn't exist or token is invalid, clear session
                if (userError.message?.includes('JWT') || userError.message?.includes('user_not_found') || userError.message?.includes('invalid_token')) {
                  console.log('User verification failed, clearing session...');
                  await get().clearInvalidSession();
                  return;
                }
                
                set({ isInitialized: true, isLoading: false });
                return;
              }

              // Get or create user profile using helper function
              const profile = await getOrCreateProfile(session.user.id);

              if (profile) {
                const authUser: AuthUser = {
                  id: session.user.id,
                  name: profile.name,
                  email: profile.email,
                };

                set({
                  user: authUser,
                  isAuthenticated: true,
                  isInitialized: true,
                  isLoading: false,
                  isNewUser: false,
                });
              } else {
                console.error('Failed to get or create profile');
                set({ isInitialized: true, isLoading: false });
              }
            } catch (profileError) {
              console.error('Error during profile verification:', profileError);
              
              // If there's any error with the profile, clear the session
              await get().clearInvalidSession();
            }
          } else {
            set({ isInitialized: true, isLoading: false });
          }
        } catch (error) {
          console.error('Error initializing auth:', error);
          
          // If initialization fails completely, clear everything
          await get().clearInvalidSession();
        }
      },
      
      signIn: async (email: string, password: string) => {
        set({ isLoading: true });
        
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.toLowerCase().trim(),
            password: password.trim(),
          });

          if (error) {
            console.error('Sign in error:', error);
            set({ isLoading: false });
            return false;
          }

          if (data.user) {
            // Get or create user profile using helper function
            const profile = await getOrCreateProfile(data.user.id);

            if (profile) {
              const authUser: AuthUser = {
                id: data.user.id,
                name: profile.name,
                email: profile.email,
              };

              set({
                user: authUser,
                isAuthenticated: true,
                isLoading: false,
                isNewUser: false,
              });
              
              return true;
            } else {
              console.error('Failed to get or create profile after sign in');
              set({ isLoading: false });
              return false;
            }
          }

          set({ isLoading: false });
          return false;
        } catch (error) {
          console.error('Sign in error:', error);
          set({ isLoading: false });
          return false;
        }
      },
      
      signUp: async (name: string, email: string, password: string) => {
        set({ isLoading: true });
        
        try {
          const { data, error } = await supabase.auth.signUp({
            email: email.toLowerCase().trim(),
            password: password.trim(),
            options: {
              data: {
                name: name.trim(),
              }
            }
          });

          if (error) {
            console.error('Sign up error:', error);
            set({ isLoading: false });
            return false;
          }

          if (data.user) {
            // Check if user is already confirmed (immediate sign up)
            if (data.user.email_confirmed_at || data.session) {
              // Get or create user profile using helper function
              const profile = await getOrCreateProfile(data.user.id);

              if (profile) {
                const authUser: AuthUser = {
                  id: data.user.id,
                  name: profile.name,
                  email: profile.email,
                };

                set({
                  user: authUser,
                  isAuthenticated: true,
                  isLoading: false,
                  isNewUser: true,
                });
                
                return true;
              } else {
                console.error('Failed to get or create profile after sign up');
                set({ isLoading: false });
                return false;
              }
            } else {
              // User needs email confirmation
              set({ isLoading: false });
              return false;
            }
          }

          set({ isLoading: false });
          return false;
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
          const success = await updateUserProfile(user.id, { name: name.trim() });

          if (success) {
            // Update local user state
            const updatedUser = { ...user, name: name.trim() };
            set({
              user: updatedUser,
              isLoading: false,
            });

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
          // Sign out from Supabase
          const { error } = await supabase.auth.signOut();
          
          if (error) {
            console.error('Error signing out from Supabase:', error);
          }
          
          // Clear all local storage regardless of Supabase error
          const storageKeys = ['auth-storage', 'onboarding-storage', 'dose-storage', 'settings-storage'];
          
          await Promise.all(
            storageKeys.map(key => secureStorage.removeItem(key))
          );

          // Clear browser storage if on web
          if (Platform.OS === 'web' && typeof window !== 'undefined') {
            // Clear localStorage
            Object.keys(localStorage).forEach(key => {
              if (key.includes('supabase') || key.includes('auth') || key.includes('sb-')) {
                localStorage.removeItem(key);
              }
            });

            // Clear sessionStorage
            Object.keys(sessionStorage).forEach(key => {
              if (key.includes('supabase') || key.includes('auth') || key.includes('sb-')) {
                sessionStorage.removeItem(key);
              }
            });

            // Clear any cookies related to auth
            document.cookie.split(";").forEach(function(c) { 
              document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
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
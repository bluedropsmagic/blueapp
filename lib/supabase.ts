import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = 'https://dkgezgbzzrzjujfucpun.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrZ2V6Z2J6enJ6anVqZnVjcHVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NjM5NzksImV4cCI6MjA2NjAzOTk3OX0.mYdLjKGOAHnyjNEQsxdAb5duKnuY1L88a7sghhFklgI';

// Custom storage adapter for Supabase Auth
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return localStorage.getItem(key);
    } else if (Platform.OS === 'web') {
      // Server-side rendering context
      return null;
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      localStorage.setItem(key, value);
      return Promise.resolve();
    } else if (Platform.OS === 'web') {
      // Server-side rendering context
      return Promise.resolve();
    }
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      localStorage.removeItem(key);
      return Promise.resolve();
    } else if (Platform.OS === 'web') {
      // Server-side rendering context
      return Promise.resolve();
    }
    return SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // Add error handling for invalid tokens
    onAuthStateChange: (event, session) => {
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
      }
    },
  },
});

// Database types
export interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Dose {
  id: string;
  user_id: string;
  dose_type: string;
  taken_at: string;
  created_at: string;
}

// Helper function to safely get or create user profile
export const getOrCreateProfile = async (userId: string): Promise<Profile | null> => {
  try {
    // First, verify the user session is still valid
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error verifying user session:', userError);
      
      // If it's a JWT error, throw to trigger session cleanup
      if (userError.message?.includes('JWT') || userError.message?.includes('user_not_found') || userError.message?.includes('invalid_token')) {
        throw new Error('Invalid session detected');
      }
      
      return null;
    }

    if (!user || user.id !== userId) {
      console.error('User ID mismatch or no user found');
      throw new Error('User verification failed');
    }

    // Try to get existing profile
    const { data: existingProfile, error: selectError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle(); // Use maybeSingle() instead of single() to avoid errors when no rows found

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Error fetching profile:', selectError);
      return null;
    }

    if (existingProfile) {
      return existingProfile;
    }

    // If no profile exists, create new profile
    const newProfile = {
      user_id: userId,
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      email: user.email || '',
      avatar_url: user.user_metadata?.avatar_url || null,
    };

    const { data: createdProfile, error: insertError } = await supabase
      .from('profiles')
      .insert([newProfile])
      .select()
      .single();

    if (insertError) {
      console.error('Error creating profile:', insertError);
      
      // If insert failed due to conflict, try to fetch the existing profile again
      if (insertError.code === '23505') { // Unique violation
        const { data: retryProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
        
        return retryProfile;
      }
      
      return null;
    }

    return createdProfile;
  } catch (error) {
    console.error('Unexpected error in getOrCreateProfile:', error);
    
    // If it's a session-related error, re-throw to trigger cleanup
    if (error?.message?.includes('Invalid session') || error?.message?.includes('User verification failed')) {
      throw error;
    }
    
    return null;
  }
};

// Helper function to update user profile
export const updateUserProfile = async (userId: string, updates: Partial<Profile>): Promise<boolean> => {
  try {
    // Verify session before updating
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user || user.id !== userId) {
      console.error('Session verification failed for profile update');
      return false;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating profile:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error updating profile:', error);
    return false;
  }
};

// Helper function to check if session is valid
export const isSessionValid = async (): Promise<boolean> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      return false;
    }

    // Try to verify the user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    return !userError && !!user;
  } catch (error) {
    console.error('Error checking session validity:', error);
    return false;
  }
};

// Helper function to clear invalid session
export const clearInvalidSession = async (): Promise<void> => {
  try {
    await supabase.auth.signOut();
    
    // Clear local storage
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      Object.keys(localStorage).forEach(key => {
        if (key.includes('supabase') || key.includes('auth') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      Object.keys(sessionStorage).forEach(key => {
        if (key.includes('supabase') || key.includes('auth') || key.includes('sb-')) {
          sessionStorage.removeItem(key);
        }
      });
    }
    
    console.log('Invalid session cleared');
  } catch (error) {
    console.error('Error clearing invalid session:', error);
  }
};
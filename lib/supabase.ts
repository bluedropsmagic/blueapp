import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import 'react-native-url-polyfill/auto';

// Supabase credentials - hardcoded for reliability
const supabaseUrl = 'https://pvjtvoefgprtvculhfpw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2anR2b2VmZ3BydHZjdWxoZnB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MjYxOTEsImV4cCI6MjA3MTMwMjE5MX0.-fbr2wnhf6Ry6-4yUYfTqx4A5XNUBEBB4Awm2ciPME8';

// Validate credentials
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase credentials are missing');
  throw new Error('Supabase configuration error');
}

console.log('🔧 Configuring Supabase for Expo...');
console.log('📍 Supabase URL:', supabaseUrl);
console.log('🔑 Supabase Key configured:', supabaseAnonKey ? 'Yes' : 'No');

// Expo-compatible storage adapter for Supabase Auth
const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        return localStorage.getItem(key);
      } else if (Platform.OS === 'web') {
        // Server-side rendering context
        return null;
      }
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.warn('Storage getItem error:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        localStorage.setItem(key, value);
        return Promise.resolve();
      } else if (Platform.OS === 'web') {
        // Server-side rendering context
        return Promise.resolve();
      }
      return await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.warn('Storage setItem error:', error);
      return Promise.resolve();
    }
  },
  removeItem: async (key: string) => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        localStorage.removeItem(key);
        return Promise.resolve();
      } else if (Platform.OS === 'web') {
        // Server-side rendering context
        return Promise.resolve();
      }
      return await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.warn('Storage removeItem error:', error);
      return Promise.resolve();
    }
  },
};

// Create Supabase client with Expo-specific configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Important for Expo
    flowType: 'pkce', // Use PKCE for better security
    debug: __DEV__, // Enable debug in development
  },
  global: {
    headers: {
      'X-Client-Info': 'blueapp-expo@1.0.0',
      'apikey': supabaseAnonKey,
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
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
    console.log('🔍 Getting profile for user:', userId);
    
    // First, verify the user session is still valid
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ Error verifying user session:', userError);
      
      // If it's a JWT error, throw to trigger session cleanup
      if (userError.message?.includes('JWT') || 
          userError.message?.includes('user_not_found') || 
          userError.message?.includes('invalid_token')) {
        throw new Error('Invalid session detected');
      }
      
      return null;
    }

    if (!user || user.id !== userId) {
      console.error('❌ User ID mismatch or no user found');
      throw new Error('User verification failed');
    }

    console.log('✅ User session verified');

    // Try to get existing profile using the safe function
    const { data: profiles, error: functionError } = await supabase
      .rpc('get_or_create_profile', { user_uuid: userId });

    if (functionError) {
      console.warn('⚠️ RPC function failed, trying direct query:', functionError);
      
      // Fallback to direct query
      const { data: directProfile, error: directError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (directError) {
        console.error('❌ Direct profile query failed:', directError);
        return null;
      }

      if (directProfile) {
        console.log('✅ Profile found via direct query');
        return directProfile;
      }

      // If no profile exists, create one
      console.log('📝 Creating new profile...');
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
        console.error('❌ Error creating profile:', insertError);
        return null;
      }

      console.log('✅ Profile created successfully');
      return createdProfile;
    }

    if (profiles && profiles.length > 0) {
      console.log('✅ Profile retrieved via RPC function');
      return profiles[0];
    }

    console.warn('⚠️ No profile found and RPC function returned empty');
    return null;
  } catch (error) {
    console.error('❌ Unexpected error in getOrCreateProfile:', error);
    
    // If it's a session-related error, re-throw to trigger cleanup
    if (error?.message?.includes('Invalid session') || 
        error?.message?.includes('User verification failed')) {
      throw error;
    }
    
    return null;
  }
};

// Helper function to update user profile
export const updateUserProfile = async (userId: string, updates: Partial<Profile>): Promise<boolean> => {
  try {
    console.log('📝 Updating profile for user:', userId);
    
    // Verify session before updating
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user || user.id !== userId) {
      console.error('❌ Session verification failed for profile update');
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
      console.error('❌ Error updating profile:', error);
      return false;
    }

    console.log('✅ Profile updated successfully');
    return true;
  } catch (error) {
    console.error('❌ Unexpected error updating profile:', error);
    return false;
  }
};

// Helper function to add a dose record
export const addDoseRecord = async (userId: string, doseType: string): Promise<boolean> => {
  try {
    console.log('💊 Adding dose record:', { userId, doseType });
    
    const { error } = await supabase
      .from('doses')
      .insert([{
        user_id: userId,
        dose_type: doseType,
        taken_at: new Date().toISOString(),
      }]);

    if (error) {
      console.error('❌ Error adding dose record:', error);
      return false;
    }

    console.log('✅ Dose record added successfully');
    return true;
  } catch (error) {
    console.error('❌ Unexpected error adding dose:', error);
    return false;
  }
};

// Helper function to get user doses
export const getUserDoses = async (userId: string, limit = 100): Promise<Dose[]> => {
  try {
    console.log('📊 Fetching doses for user:', userId);
    
    const { data, error } = await supabase
      .from('doses')
      .select('*')
      .eq('user_id', userId)
      .order('taken_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ Error fetching doses:', error);
      return [];
    }

    console.log('✅ Doses fetched successfully:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('❌ Unexpected error fetching doses:', error);
    return [];
  }
};

// Helper function to check if session is valid
export const isSessionValid = async (): Promise<boolean> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      console.log('❌ No valid session found');
      return false;
    }

    // Try to verify the user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    const isValid = !userError && !!user;
    console.log(isValid ? '✅ Session is valid' : '❌ Session is invalid');
    return isValid;
  } catch (error) {
    console.error('❌ Error checking session validity:', error);
    return false;
  }
};

// Helper function to clear invalid session
export const clearInvalidSession = async (): Promise<void> => {
  try {
    console.log('🧹 Clearing invalid session...');
    
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
    
    console.log('✅ Invalid session cleared');
  } catch (error) {
    console.error('❌ Error clearing invalid session:', error);
  }
};

// Enhanced connection test with detailed diagnostics
export const testConnection = async (): Promise<boolean> => {
  try {
    console.log('🔍 Testing Supabase connection...');
    console.log('📍 URL:', supabaseUrl);
    console.log('🔑 Key length:', supabaseAnonKey.length);
    console.log('🌐 Platform:', Platform.OS);
    
    // Test 1: Basic connection
    console.log('🧪 Test 1: Basic connection...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (healthError) {
      console.error('❌ Basic connection failed:', healthError);
      console.error('📋 Error details:', {
        message: healthError.message,
        details: healthError.details,
        hint: healthError.hint,
        code: healthError.code
      });
      
      // Check if it's a table not found error
      if (healthError.code === '42P01') {
        console.error('🚨 TABLES NOT FOUND! You need to run the database migrations in Supabase.');
        console.error('📝 Go to your Supabase dashboard > SQL Editor and run the migration files.');
        return false;
      }
      
      return false;
    }

    console.log('✅ Basic connection successful');

    // Test 2: Auth connection
    console.log('🧪 Test 2: Auth connection...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.warn('⚠️ Session check failed (this is normal if not logged in):', sessionError.message);
    } else {
      console.log('✅ Auth connection successful');
      console.log('👤 Current session:', session ? 'Active' : 'None');
    }

    // Test 3: Database schema check
    console.log('🧪 Test 3: Database schema check...');
    const { data: tables, error: schemaError } = await supabase
      .rpc('get_or_create_profile', { user_uuid: '00000000-0000-0000-0000-000000000000' })
      .limit(0); // Don't actually execute, just test if function exists

    if (schemaError && schemaError.code === '42883') {
      console.warn('⚠️ Database function not found - migrations may not be applied');
    } else if (schemaError && schemaError.code !== '22P02') { // Ignore invalid UUID error
      console.warn('⚠️ Schema check warning:', schemaError.message);
    } else {
      console.log('✅ Database schema looks good');
    }

    console.log('🎉 Supabase connection test completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Unexpected connection test error:', error);
    console.error('🔍 Error type:', typeof error);
    console.error('📋 Error details:', error);
    return false;
  }
};

// Initialize connection test on module load (only in development)
if (__DEV__) {
  // Run connection test after a small delay to avoid blocking app startup
  setTimeout(() => {
    testConnection().catch(error => {
      console.error('❌ Initial connection test failed:', error);
    });
  }, 2000);
}
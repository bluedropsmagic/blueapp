import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Local storage adapter that works on both web and mobile
export const localStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        return window.localStorage.getItem(key);
      } else if (Platform.OS === 'web') {
        // Server-side rendering context
        return null;
      }
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      console.warn('Error getting item from storage:', e);
      return null;
    }
  },
  
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.localStorage.setItem(key, value);
      } else if (Platform.OS === 'web') {
        // Server-side rendering context - do nothing
        return;
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (e) {
      console.warn('Error setting item in storage:', e);
    }
  },
  
  removeItem: async (key: string): Promise<void> => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      } else if (Platform.OS === 'web') {
        // Server-side rendering context - do nothing
        return;
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (e) {
      console.warn('Error removing item from storage:', e);
    }
  }
};

// Database types for local storage
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

// Local user management functions
export const createLocalUser = async (name: string, email: string, password: string): Promise<{ user: any; profile: Profile } | null> => {
  try {
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    // Create user object
    const user = {
      id: userId,
      email: email.toLowerCase().trim(),
      created_at: now,
      user_metadata: {
        name: name.trim(),
      }
    };
    
    // Create profile
    const profile: Profile = {
      id: `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      created_at: now,
      updated_at: now,
    };
    
    // Store user credentials (in real app, this would be hashed)
    await localStorage.setItem(`user_${email.toLowerCase()}`, JSON.stringify({
      ...user,
      password: password // In production, this should be hashed
    }));
    
    // Store profile
    await localStorage.setItem(`profile_${userId}`, JSON.stringify(profile));
    
    // Store current session
    await localStorage.setItem('current_session', JSON.stringify({
      user,
      access_token: `token_${userId}`,
      expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    }));
    
    return { user, profile };
  } catch (error) {
    console.error('Error creating local user:', error);
    return null;
  }
};

export const signInLocalUser = async (email: string, password: string): Promise<{ user: any; profile: Profile } | null> => {
  try {
    const userKey = `user_${email.toLowerCase()}`;
    const userData = await localStorage.getItem(userKey);
    
    if (!userData) {
      return null; // User not found
    }
    
    const user = JSON.parse(userData);
    
    // Check password (in production, this would be properly hashed and verified)
    if (user.password !== password) {
      return null; // Invalid password
    }
    
    // Get profile
    const profileData = await localStorage.getItem(`profile_${user.id}`);
    if (!profileData) {
      return null; // Profile not found
    }
    
    const profile = JSON.parse(profileData);
    
    // Store current session
    await localStorage.setItem('current_session', JSON.stringify({
      user,
      access_token: `token_${user.id}`,
      expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    }));
    
    return { user, profile };
  } catch (error) {
    console.error('Error signing in local user:', error);
    return null;
  }
};

export const getCurrentSession = async (): Promise<{ user: any; profile: Profile } | null> => {
  try {
    const sessionData = await localStorage.getItem('current_session');
    if (!sessionData) {
      return null;
    }
    
    const session = JSON.parse(sessionData);
    
    // Check if session is expired
    if (Date.now() > session.expires_at) {
      await localStorage.removeItem('current_session');
      return null;
    }
    
    // Get profile
    const profileData = await localStorage.getItem(`profile_${session.user.id}`);
    if (!profileData) {
      return null;
    }
    
    const profile = JSON.parse(profileData);
    
    return { user: session.user, profile };
  } catch (error) {
    console.error('Error getting current session:', error);
    return null;
  }
};

export const signOutLocalUser = async (): Promise<void> => {
  try {
    await localStorage.removeItem('current_session');
  } catch (error) {
    console.error('Error signing out:', error);
  }
};

export const updateLocalProfile = async (userId: string, updates: Partial<Profile>): Promise<boolean> => {
  try {
    const profileData = await localStorage.getItem(`profile_${userId}`);
    if (!profileData) {
      return false;
    }
    
    const profile = JSON.parse(profileData);
    const updatedProfile = {
      ...profile,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    await localStorage.setItem(`profile_${userId}`, JSON.stringify(updatedProfile));
    return true;
  } catch (error) {
    console.error('Error updating local profile:', error);
    return false;
  }
};

export const addLocalDose = async (userId: string, doseType: string): Promise<boolean> => {
  try {
    const dose: Dose = {
      id: `dose_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      dose_type: doseType,
      taken_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    
    // Get existing doses
    const dosesData = await localStorage.getItem(`doses_${userId}`);
    const doses = dosesData ? JSON.parse(dosesData) : [];
    
    // Add new dose
    doses.push(dose);
    
    // Store updated doses
    await localStorage.setItem(`doses_${userId}`, JSON.stringify(doses));
    return true;
  } catch (error) {
    console.error('Error adding local dose:', error);
    return false;
  }
};

export const getLocalDoses = async (userId: string, limit = 100): Promise<Dose[]> => {
  try {
    const dosesData = await localStorage.getItem(`doses_${userId}`);
    if (!dosesData) {
      return [];
    }
    
    const doses = JSON.parse(dosesData);
    
    // Sort by taken_at descending and limit
    return doses
      .sort((a: Dose, b: Dose) => new Date(b.taken_at).getTime() - new Date(a.taken_at).getTime())
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting local doses:', error);
    return [];
  }
};

// Helper function to clear all local data
export const clearAllLocalData = async (): Promise<void> => {
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // Clear all localStorage items
      const keys = Object.keys(window.localStorage);
      keys.forEach(key => {
        if (key.includes('user_') || key.includes('profile_') || key.includes('doses_') || key === 'current_session') {
          window.localStorage.removeItem(key);
        }
      });
    } else if (Platform.OS !== 'web') {
      // For mobile, we'd need to track keys or clear known patterns
      // This is a simplified approach
      await localStorage.removeItem('current_session');
    }
  } catch (error) {
    console.error('Error clearing local data:', error);
  }
};
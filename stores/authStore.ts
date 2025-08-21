import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

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
      // Handle errors or fallback
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

// Enhanced local user database with better security
const localUserDB = {
  users: [] as Array<{ id: string; name: string; email: string; password: string; createdAt: string }>,
  
  async getUsers(): Promise<any[]> {
    try {
      const stored = await secureStorage.getItem('local-users-db');
      if (stored) {
        this.users = JSON.parse(stored);
      }
      return this.users;
    } catch (e) {
      return [];
    }
  },
  
  async saveUsers(): Promise<void> {
    try {
      await secureStorage.setItem('local-users-db', JSON.stringify(this.users));
    } catch (e) {
      console.error('Failed to save users:', e);
    }
  },
  
  async findUserByEmail(email: string): Promise<any | null> {
    await this.getUsers();
    return this.users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
  },
  
  async createUser(name: string, email: string, password: string): Promise<any> {
    await this.getUsers();
    
    const existingUser = await this.findUserByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }
    
    const newUser = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password, // Stored locally for demo purposes
      createdAt: new Date().toISOString(),
    };
    
    this.users.push(newUser);
    await this.saveUsers();
    
    return newUser;
  },
  
  async authenticateUser(email: string, password: string): Promise<any | null> {
    const user = await this.findUserByEmail(email);
    if (user && user.password === password) {
      return user;
    }
    return null;
  },
  
  async updateUser(userId: string, updates: Partial<{ name: string; email: string }>): Promise<boolean> {
    await this.getUsers();
    const userIndex = this.users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      return false;
    }
    
    this.users[userIndex] = { ...this.users[userIndex], ...updates };
    await this.saveUsers();
    return true;
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

      initialize: async () => {
        try {
          set({ isLoading: true });
          
          // Initialize local user database
          await localUserDB.getUsers();
          
          set({ isInitialized: true, isLoading: false });
        } catch (error) {
          console.error('Error initializing auth:', error);
          set({ isInitialized: true, isLoading: false });
        }
      },
      
      signIn: async (email: string, password: string) => {
        set({ isLoading: true });
        
        try {
          const user = await localUserDB.authenticateUser(email.toLowerCase().trim(), password.trim());

          if (user) {
            const authUser: AuthUser = {
              id: user.id,
              name: user.name,
              email: user.email,
            };

            set({
              user: authUser,
              isAuthenticated: true,
              isLoading: false,
              isNewUser: false,
            });
            
            return true;
          } else {
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
          const user = await localUserDB.createUser(name.trim(), email.toLowerCase().trim(), password.trim());

          if (user) {
            const authUser: AuthUser = {
              id: user.id,
              name: user.name,
              email: user.email,
            };

            set({
              user: authUser,
              isAuthenticated: true,
              isLoading: false,
              isNewUser: true,
            });
            
            return true;
          } else {
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
          const success = await localUserDB.updateUser(user.id, { name: name.trim() });

          if (success) {
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
          // Clear all local storage
          const storageKeys = ['auth-storage', 'onboarding-storage', 'dose-storage', 'settings-storage'];
          
          await Promise.all(
            storageKeys.map(key => secureStorage.removeItem(key))
          );

          // Clear browser storage if on web
          if (Platform.OS === 'web' && typeof window !== 'undefined') {
            Object.keys(localStorage).forEach(key => {
              if (key.includes('auth') || key.includes('dose') || key.includes('settings') || key.includes('onboarding')) {
                localStorage.removeItem(key);
              }
            });
          }
          
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            isNewUser: false,
            isInitialized: true,
          });
          
          console.log('User successfully signed out');
          
        } catch (error) {
          console.error('Error during sign out:', error);
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
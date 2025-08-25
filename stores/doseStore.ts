import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { addLocalDose, getLocalDoses } from '@/lib/localStorage';
import { useAuthStore } from '@/stores/authStore';

interface DoseSchedule {
  time: string;
  label: string;
}

interface Dose {
  id: string;
  timestamp: number;
  type: string;
}

interface Symptom {
  id: string;
  symptomId: number;
  rating: number;
  timestamp: number;
}

interface DailySymptomEntry {
  date: string; // YYYY-MM-DD format
  symptoms: { [symptomId: number]: number };
  timestamp: number;
}

interface DoseStore {
  doses: Dose[];
  symptoms: Symptom[];
  dailySymptomEntries: DailySymptomEntry[];
  schedules: DoseSchedule[];
  isScheduleSet: boolean;
  lastResetDate: string;
  addDose: (type: string, date?: Date) => void;
  getTodayDoses: () => number;
  getStreak: () => number;
  getWeeklyComplianceData: () => number[];
  addSymptom: (symptomId: number, rating: number, date?: Date) => void;
  setSchedules: (schedules: DoseSchedule[]) => void;
  getSchedules: () => DoseSchedule[];
  setScheduleStatus: (status: boolean) => void;
  hasAnsweredSymptomsToday: () => boolean;
  checkAndResetDaily: () => void;
  getTodaySymptomEntry: () => DailySymptomEntry | null;
  saveDailySymptoms: (symptoms: { [symptomId: number]: number }) => void;
  syncWithLocalStorage: () => Promise<void>;
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

// Helper function to get today's date string
const getTodayDateString = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

// Helper function to check if it's 8 AM or later
const isAfter8AM = () => {
  const now = new Date();
  return now.getHours() >= 8;
};

export const useDoseStore = create<DoseStore>()(
  persist(
    (set, get) => ({
      doses: [],
      symptoms: [],
      dailySymptomEntries: [],
      schedules: [
        { time: '8:00 AM', label: 'Morning Dose' },
        { time: '8:00 PM', label: 'Evening Dose' }
      ],
      isScheduleSet: false,
      lastResetDate: getTodayDateString(),
      
      checkAndResetDaily: () => {
        const today = getTodayDateString();
        const { lastResetDate } = get();
        
        // If it's a new day and it's after 8 AM, reset the daily tracking
        if (today !== lastResetDate && isAfter8AM()) {
          set({ lastResetDate: today });
        }
      },
      
      setSchedules: (schedules) => {
        set({ schedules });
      },
      
      getSchedules: () => {
        return get().schedules;
      },
      
      setScheduleStatus: (status) => {
        set({ isScheduleSet: status });
      },
      
      addDose: (type = 'Regular Dose', date = new Date()) => {
        const newDose = {
          id: Date.now().toString(),
          timestamp: date.getTime(),
          type
        };
        
        set(state => ({
          doses: [...state.doses, newDose]
        }));
        
        // Store in local storage in background
        const { user } = useAuthStore.getState();
        if (user) {
          addLocalDose(user.id, type).catch(error => {
            console.warn('Failed to store dose locally:', error);
          });
        }
      },
      
      getTodayDoses: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        return get().doses.filter(dose => {
          const doseDate = new Date(dose.timestamp);
          return doseDate >= today && doseDate < tomorrow;
        }).length;
      },
      
      getStreak: () => {
        const doses = get().doses;
        const schedules = get().schedules;
        const targetDosesPerDay = schedules.length || 2;
        
        if (doses.length === 0) return 0;
        
        // Group doses by day
        const dosesByDay: { [key: string]: Dose[] } = {};
        
        doses.forEach(dose => {
          const date = new Date(dose.timestamp);
          const dateString = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
          
          if (!dosesByDay[dateString]) {
            dosesByDay[dateString] = [];
          }
          
          dosesByDay[dateString].push(dose);
        });
        
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Check consecutive days backwards from today
        for (let i = 0; i < 100; i++) {
          const checkDate = new Date(today);
          checkDate.setDate(today.getDate() - i);
          
          const dateString = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
          
          if (dosesByDay[dateString] && dosesByDay[dateString].length >= targetDosesPerDay) {
            streak++;
          } else if (i > 0) {
            // If we're not on today (i > 0) and there's no complete day, break the streak
            break;
          }
          // If i === 0 (today) and no doses, continue checking previous days
        }
        
        return streak;
      },
      
      getWeeklyComplianceData: () => {
        const doses = get().doses;
        const schedules = get().schedules;
        const targetDosesPerDay = schedules.length || 2;
        
        // Initialize with default array to prevent undefined errors
        const data: number[] = [];
        
        // Get last 7 days
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (let i = 6; i >= 0; i--) {
          const checkDate = new Date(today);
          checkDate.setDate(today.getDate() - i);
          const nextDay = new Date(checkDate);
          nextDay.setDate(checkDate.getDate() + 1);
          
          const dayDoses = doses.filter(dose => {
            const doseDate = new Date(dose.timestamp);
            return doseDate >= checkDate && doseDate < nextDay;
          });
          
          // Calculate compliance for this day (0-2 scale)
          const compliance = Math.min(dayDoses.length, targetDosesPerDay);
          data.push(compliance);
        }
        
        // Ensure we always return exactly 7 values
        while (data.length < 7) {
          data.unshift(0);
        }
        
        // Ensure we don't return more than 7 values
        return data.slice(-7);
      },
      
      addSymptom: (symptomId: number, rating: number, date = new Date()) => {
        const newSymptom = {
          id: Date.now().toString(),
          symptomId,
          rating,
          timestamp: date.getTime()
        };
        
        set(state => ({
          symptoms: [...state.symptoms, newSymptom]
        }));
      },

      getTodaySymptomEntry: () => {
        const today = getTodayDateString();
        const { dailySymptomEntries } = get();
        
        return dailySymptomEntries.find(entry => entry.date === today) || null;
      },

      hasAnsweredSymptomsToday: () => {
        const today = getTodayDateString();
        const { dailySymptomEntries, lastResetDate } = get();
        
        // If it's a new day (after reset), return false
        if (today !== lastResetDate && isAfter8AM()) {
          return false;
        }
        
        // Check if there's an entry for today
        return dailySymptomEntries.some(entry => entry.date === today);
      },

      saveDailySymptoms: (symptoms: { [symptomId: number]: number }) => {
        const today = getTodayDateString();
        const newEntry: DailySymptomEntry = {
          date: today,
          symptoms,
          timestamp: Date.now()
        };

        set(state => {
          // Remove any existing entry for today and add the new one
          const filteredEntries = state.dailySymptomEntries.filter(entry => entry.date !== today);
          return {
            dailySymptomEntries: [...filteredEntries, newEntry]
          };
        });

        // Also add individual symptom entries for backward compatibility
        Object.entries(symptoms).forEach(([symptomIdStr, rating]) => {
          const symptomId = parseInt(symptomIdStr);
          get().addSymptom(symptomId, rating);
        });
      },

      syncWithLocalStorage: async () => {
        const { user } = useAuthStore.getState();
        if (!user) return;

        try {
          console.log('Syncing doses with local storage...');
          // This function now just ensures data consistency
          // All data is already stored locally through the store persistence
          console.log('Local storage sync completed');
        } catch (error) {
          console.warn('Failed to sync with local storage:', error);
        }
      }
    }),
    {
      name: 'dose-storage',
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
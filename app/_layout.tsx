import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, Dimensions } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useAuthStore } from '@/stores/authStore';
import * as SplashScreen from 'expo-splash-screen';
import { HelpBalloon } from '@/components/HelpBalloon';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  
  const { initialize: initializeAuth } = useAuthStore();

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    // Initialize auth store with error handling
    const initAuth = async () => {
      try {
        await initializeAuth();
      } catch (error) {
        console.error('Auth initialization failed:', error);
        // Auth store will handle clearing invalid sessions internally
      }
    };
    
    initAuth();
    
    // Initialize notifications only after a delay and with proper error handling
    const initializeNotifications = async () => {
      try {
        // Only initialize on web or mobile platforms, not during SSR
        if (Platform.OS === 'web' && typeof window === 'undefined') {
          console.log('Skipping notification initialization during SSR');
          return;
        }

        // Add a small delay to ensure everything is loaded
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Dynamic import to avoid SSR issues
        const { useNotificationStore } = await import('@/stores/notificationStore');
        const notificationStore = useNotificationStore.getState();
        
        // Initialize with timeout to prevent hanging
        const initPromise = notificationStore.initialize();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Notification initialization timeout')), 10000)
        );
        
        await Promise.race([initPromise, timeoutPromise]);
        console.log('Notifications initialized successfully');
      } catch (error) {
        // Log error but don't crash the app
        console.warn('Notification initialization failed (non-critical):', error?.message || error);
      }
    };
    
    // Initialize notifications with error boundary
    initializeNotifications().catch(error => {
      console.warn('Failed to initialize notifications:', error?.message || error);
    });
  }, []);

  // Web-specific optimizations
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // Set document title
      document.title = 'BlueApp - Your Health Tracking Companion';
      
      // Add meta tags for SEO
      const metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = 'Track your health journey with BlueApp. Monitor doses, track progress, and access educational health content.';
        document.head.appendChild(meta);
      }

      // Add viewport meta tag for responsive design
      const viewport = document.querySelector('meta[name="viewport"]');
      if (!viewport) {
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        document.head.appendChild(meta);
      }

      // Custom scrollbar and styles
      const style = document.createElement('style');
      style.textContent = `
        @media screen and (max-width: 768px) {
          input, textarea, select {
            font-size: 16px !important;
          }
        }
        
        /* Custom scrollbar for webkit browsers */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
        
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
        
        /* Remove focus outline on web */
        button:focus,
        input:focus,
        textarea:focus {
          outline: none;
        }
      `;
      document.head.appendChild(style);

      // Add global error handler for unhandled promise rejections
      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        // Check if it's a Supabase JWT error
        if (event.reason?.message?.includes('JWT') || 
            event.reason?.message?.includes('user_not_found') || 
            event.reason?.message?.includes('invalid_token')) {
          console.warn('Detected invalid JWT token, will be handled by auth store');
          event.preventDefault(); // Prevent the error from being logged to console
        }
      };

      window.addEventListener('unhandledrejection', handleUnhandledRejection);

      // Cleanup
      return () => {
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      };
    }
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
        <Stack.Screen name="video-tutorial" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="webview" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="webview-fullscreen" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
        <Stack.Screen name="package-tracking" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
        <Stack.Screen name="marketplace" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
        <Stack.Screen name="support" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
        <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
      </Stack>
      <StatusBar style="auto" />
      <HelpBalloon />
    </>
  );
}
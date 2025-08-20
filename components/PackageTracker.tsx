import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Package, Search, ArrowRight, Mail, Truck } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  withSequence,
  withSpring,
  Easing,
  runOnJS
} from 'react-native-reanimated';

interface PackageTrackerProps {
  onTrack?: (trackingNumber: string) => void;
}

export const PackageTracker = ({ onTrack }: PackageTrackerProps) => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Animation values for truck loading
  const truckTranslateX = useSharedValue(-50);
  const truckOpacity = useSharedValue(0);
  const truckScale = useSharedValue(0.8);
  const loadingTextOpacity = useSharedValue(0);
  const loadingTextTranslateY = useSharedValue(10);

  const startTruckAnimation = () => {
    // Reset animation values
    truckTranslateX.value = -50;
    truckOpacity.value = 0;
    truckScale.value = 0.8;
    loadingTextOpacity.value = 0;
    loadingTextTranslateY.value = 10;

    // 1. Truck appears and moves across screen
    truckOpacity.value = withTiming(1, { duration: 300 });
    truckScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    
    // 2. Truck moves from left to right with bounce
    truckTranslateX.value = withSequence(
      withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }),
      withRepeat(
        withSequence(
          withTiming(10, { duration: 400, easing: Easing.inOut(Easing.quad) }),
          withTiming(-10, { duration: 400, easing: Easing.inOut(Easing.quad) })
        ),
        -1, // Infinite repeat
        true // Reverse
      )
    );

    // 3. Loading text appears
    loadingTextOpacity.value = withTiming(1, { duration: 400 });
    loadingTextTranslateY.value = withSpring(0, { damping: 12, stiffness: 100 });
  };

  const stopTruckAnimation = () => {
    // Stop animations and hide truck
    truckOpacity.value = withTiming(0, { duration: 300 });
    truckScale.value = withTiming(0.8, { duration: 300 });
    loadingTextOpacity.value = withTiming(0, { duration: 300 });
    loadingTextTranslateY.value = withTiming(10, { duration: 300 });
  };

  const handleTrack = () => {
    const trimmedNumber = trackingNumber.trim();
    
    // Validação: campo vazio
    if (!trimmedNumber) {
      Alert.alert(
        'Tracking Code Required', 
        'Please enter your tracking code to continue.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    // Validação: mínimo de caracteres
    if (trimmedNumber.length < 8) {
      Alert.alert(
        'Invalid Tracking Code', 
        'Please enter a valid tracking code (minimum 8 characters).',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    setIsLoading(true);
    
    // Start truck animation
    startTruckAnimation();
    
    // Simulate loading time with truck animation
    setTimeout(() => {
      // Stop truck animation
      stopTruckAnimation();
      
      // Navigate to dashboard with the tracking number
      router.replace(`/(tabs)/dashboard?tracking=${encodeURIComponent(trimmedNumber)}`);
      
      // Reset state
      setTimeout(() => {
        setIsLoading(false);
        setTrackingNumber(''); // Clear the input
      }, 300);
    }, 2500); // 2.5 seconds of truck animation

    onTrack?.(trimmedNumber);
  };

  const handleInputChange = (text: string) => {
    // Remove any spaces and convert to uppercase for better UX
    const cleanText = text.replace(/\s/g, '').toUpperCase();
    
    // Limit to 30 characters to prevent overflow
    const limitedText = cleanText.slice(0, 30);
    
    setTrackingNumber(limitedText);
  };

  // Animated styles for truck
  const truckAnimatedStyle = useAnimatedStyle(() => ({
    opacity: truckOpacity.value,
    transform: [
      { translateX: truckTranslateX.value },
      { scale: truckScale.value }
    ],
  }));

  const loadingTextAnimatedStyle = useAnimatedStyle(() => ({
    opacity: loadingTextOpacity.value,
    transform: [{ translateY: loadingTextTranslateY.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Package size={20} color={theme.colors.white} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>Where is my BlueDrops?</Text>
          <Text style={styles.subtitle}>Your package hasn't arrived yet? See where it is</Text>
        </View>
      </View>

      {/* Loading Animation Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <Animated.View style={[styles.truckContainer, truckAnimatedStyle]}>
            <Truck size={32} color={theme.colors.primary[600]} />
          </Animated.View>
          <Animated.View style={loadingTextAnimatedStyle}>
            <Text style={styles.loadingText}>Tracking your package...</Text>
            <Text style={styles.loadingSubtext}>Please wait while we locate your BlueDrops</Text>
          </Animated.View>
        </View>
      )}

      {/* Input Container - Hidden during loading */}
      {!isLoading && (
        <>
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Search size={18} color={theme.colors.gray[400]} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Enter tracking code"
                placeholderTextColor={theme.colors.gray[400]}
                value={trackingNumber}
                onChangeText={handleInputChange}
                autoCapitalize="characters"
                autoCorrect={false}
                returnKeyType="search"
                onSubmitEditing={handleTrack}
                editable={!isLoading}
                maxLength={30} // Prevent text overflow
                numberOfLines={1} // Single line only
                multiline={false} // Disable multiline
              />
            </View>
            
            <TouchableOpacity 
              style={[
                styles.trackButton, 
                !trackingNumber.trim() && styles.trackButtonInactive
              ]}
              onPress={handleTrack}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.trackButtonText}>Track</Text>
              <ArrowRight size={16} color={theme.colors.white} />
            </TouchableOpacity>
          </View>

          <Text style={styles.helpText}>
            Enter your tracking code to see real-time package updates
          </Text>

          {/* Email note */}
          <View style={styles.emailNote}>
            <Mail size={14} color={theme.colors.warning[600]} />
            <Text style={styles.emailNoteText}>
              You can find your tracking code in your email
            </Text>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.warning[500],
    minHeight: 180, // Ensure consistent height during loading
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.warning[600],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.gray[900],
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: theme.colors.gray[600],
    lineHeight: 18,
  },
  
  // Loading Animation Styles
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    minHeight: 120,
  },
  truckContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: theme.colors.primary[50],
    borderRadius: 50,
    borderWidth: 2,
    borderColor: theme.colors.primary[100],
  },
  loadingText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.primary[700],
    textAlign: 'center',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[600],
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Input Styles
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray[50],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
    paddingHorizontal: 12,
    paddingVertical: 2,
    // Prevent text overflow
    overflow: 'hidden',
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.gray[800],
    paddingVertical: 12,
    letterSpacing: 0.5,
    // Prevent text overflow
    textAlign: 'left',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.warning[600],
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    shadowColor: theme.colors.warning[600],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  trackButtonInactive: {
    backgroundColor: theme.colors.gray[300],
    shadowOpacity: 0,
    elevation: 0,
  },
  trackButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: theme.colors.white,
    marginRight: 4,
  },
  helpText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: theme.colors.gray[500],
    textAlign: 'center',
    marginBottom: 12,
  },
  emailNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.warning[50],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.warning[100],
  },
  emailNoteText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: theme.colors.warning[700],
    marginLeft: 6,
  },
});
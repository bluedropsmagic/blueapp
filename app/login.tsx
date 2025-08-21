import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UsefulContainer } from '@/components/UsefulContainer';
import { BlueDropsLogo } from '@/components/BlueDropsLogo';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, CircleAlert as AlertCircle } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay,
  withSequence,
  withSpring,
  Easing,
  runOnJS
} from 'react-native-reanimated';
import { HelpBalloon } from '@/components/HelpBalloon';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signIn, signUp, isLoading } = useAuthStore();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Error states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [nameError, setNameError] = useState('');

  // Animation values for each element
  const logoOpacity = useSharedValue(0);
  const logoTranslateY = useSharedValue(30);
  
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(20);
  
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(30);
  
  const buttonOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(0.9);
  
  const dividerOpacity = useSharedValue(0);
  const toggleOpacity = useSharedValue(0);
  const infoOpacity = useSharedValue(0);

  // Entry animation when component mounts
  useEffect(() => {
    const startAnimations = () => {
      // 1. Logo (first element)
      logoOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
      logoTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
      
      // 2. Header (with delay)
      headerOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
      headerTranslateY.value = withDelay(200, withSpring(0, { damping: 12 }));
      
      // 3. Form (with larger delay)
      formOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
      formTranslateY.value = withDelay(400, withSpring(0, { damping: 10 }));
      
      // 4. Button (with special animation)
      buttonOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));
      buttonScale.value = withDelay(600, withSequence(
        withSpring(1.05, { damping: 8 }),
        withSpring(1, { damping: 12 })
      ));
      
      // 5. Final elements
      dividerOpacity.value = withDelay(800, withTiming(1, { duration: 400 }));
      toggleOpacity.value = withDelay(900, withTiming(1, { duration: 400 }));
      infoOpacity.value = withDelay(1000, withTiming(1, { duration: 400 }));
    };

    // Small delay to ensure component is mounted
    const timer = setTimeout(startAnimations, 100);
    return () => clearTimeout(timer);
  }, []);

  // Animation when switching between sign in/sign up
  useEffect(() => {
    if (formOpacity.value > 0) { // Only animate if already initialized
      // Quick fade out
      formOpacity.value = withTiming(0.7, { duration: 150 }, () => {
        // Fade back in
        runOnJS(() => {
          formOpacity.value = withTiming(1, { duration: 200 });
        })();
      });
    }
  }, [isSignUp]);

  // Animated styles
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ translateY: logoTranslateY.value }],
  }));

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ scale: buttonScale.value }],
  }));

  const dividerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: dividerOpacity.value,
  }));

  const toggleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: toggleOpacity.value,
  }));

  const infoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: infoOpacity.value,
  }));

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const validateName = (name: string) => {
    return name.trim().length >= 2;
  };

  const clearErrors = () => {
    setEmailError('');
    setPasswordError('');
    setNameError('');
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) {
      setEmailError('');
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (passwordError) {
      setPasswordError('');
    }
  };

  const handleNameChange = (text: string) => {
    setName(text);
    if (nameError) {
      setNameError('');
    }
  };

  const handleSubmit = async () => {
    clearErrors();
    
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    const trimmedName = name.trim();

    let hasErrors = false;

    // Validation
    if (!trimmedEmail) {
      setEmailError('Email is required');
      hasErrors = true;
    } else if (!validateEmail(trimmedEmail)) {
      setEmailError('Please enter a valid email address');
      hasErrors = true;
    }

    if (!trimmedPassword) {
      setPasswordError('Password is required');
      hasErrors = true;
    } else if (!validatePassword(trimmedPassword)) {
      setPasswordError('Password must be at least 6 characters long');
      hasErrors = true;
    }

    if (isSignUp) {
      if (!trimmedName) {
        setNameError('Full name is required');
        hasErrors = true;
      } else if (!validateName(trimmedName)) {
        setNameError('Name must be at least 2 characters long');
        hasErrors = true;
      }
    }

    if (hasErrors) {
      return;
    }

    let success = false;
    
    try {
      if (isSignUp) {
        success = await signUp(trimmedName, trimmedEmail, trimmedPassword);
        if (!success) {
          setEmailError('Failed to create account. This email may already be registered or there was a server error. Please try again.');
          return;
        } else {
          Alert.alert(
            'Account Created Successfully!',
            'Welcome to BlueApp! Your account has been created and you are now signed in. Start tracking your health journey today.',
            [{ text: 'Get Started', style: 'default' }]
          );
        }
      } else {
        success = await signIn(trimmedEmail, trimmedPassword);
        if (!success) {
          setEmailError('Invalid email or password. Please check your credentials and try again.');
          return;
        }
      }

      if (success) {
        // Clear form
        setName('');
        setEmail('');
        setPassword('');
        clearErrors();
        
        // Navigate to main app
        router.replace('/');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    // Clear form when switching modes
    setName('');
    setEmail('');
    setPassword('');
    clearErrors();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 40 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <UsefulContainer>
          {/* Logo with animation */}
          <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
            <BlueDropsLogo 
              width={200} 
              height={51} 
              color={theme.colors.primary[600]} 
            />
          </Animated.View>

          {/* Header with animation */}
          <Animated.View style={[styles.header, headerAnimatedStyle]}>
            <Text style={styles.title}>Welcome to BlueApp</Text>
            <Text style={styles.subtitle}>
              {isSignUp 
                ? 'Create your account to start tracking your health journey' 
                : 'Sign in to continue your health journey'
              }
            </Text>
          </Animated.View>

          {/* Form with animation */}
          <Animated.View style={[styles.form, formAnimatedStyle]}>
            {isSignUp && (
              <View style={styles.inputContainer}>
                <View style={[
                  styles.inputWrapper,
                  nameError ? styles.inputWrapperError : null
                ]}>
                  <User size={20} color={nameError ? theme.colors.error[500] : theme.colors.gray[400]} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Full Name"
                    placeholderTextColor={theme.colors.gray[400]}
                    value={name}
                    onChangeText={handleNameChange}
                    autoCapitalize="words"
                    autoComplete="name"
                    editable={!isLoading}
                  />
                </View>
                {nameError ? (
                  <View style={styles.errorContainer}>
                    <AlertCircle size={14} color={theme.colors.error[500]} />
                    <Text style={styles.errorText}>{nameError}</Text>
                  </View>
                ) : null}
              </View>
            )}

            <View style={styles.inputContainer}>
              <View style={[
                styles.inputWrapper,
                emailError ? styles.inputWrapperError : null
              ]}>
                <Mail size={20} color={emailError ? theme.colors.error[500] : theme.colors.gray[400]} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Email"
                  placeholderTextColor={theme.colors.gray[400]}
                  value={email}
                  onChangeText={handleEmailChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!isLoading}
                />
              </View>
              {emailError ? (
                <View style={styles.errorContainer}>
                  <AlertCircle size={14} color={theme.colors.error[500]} />
                  <Text style={styles.errorText}>{emailError}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.inputContainer}>
              <View style={[
                styles.inputWrapper,
                passwordError ? styles.inputWrapperError : null
              ]}>
                <Lock size={20} color={passwordError ? theme.colors.error[500] : theme.colors.gray[400]} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, styles.passwordInput]}
                  placeholder="Password"
                  placeholderTextColor={theme.colors.gray[400]}
                  value={password}
                  onChangeText={handlePasswordChange}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  editable={!isLoading}
                />
                <TouchableOpacity 
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={theme.colors.gray[400]} />
                  ) : (
                    <Eye size={20} color={theme.colors.gray[400]} />
                  )}
                </TouchableOpacity>
              </View>
              {passwordError ? (
                <View style={styles.errorContainer}>
                  <AlertCircle size={14} color={theme.colors.error[500]} />
                  <Text style={styles.errorText}>{passwordError}</Text>
                </View>
              ) : null}
            </View>

            {/* Button with special animation */}
            <Animated.View style={buttonAnimatedStyle}>
              <TouchableOpacity 
                style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                <Text style={styles.submitButtonText}>
                  {isLoading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
                </Text>
                {!isLoading && <ArrowRight size={20} color={theme.colors.white} />}
              </TouchableOpacity>
            </Animated.View>

            {/* Divider with animation */}
            <Animated.View style={[styles.divider, dividerAnimatedStyle]}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </Animated.View>

            {/* Toggle button with animation */}
            <Animated.View style={toggleAnimatedStyle}>
              <TouchableOpacity 
                style={styles.toggleButton} 
                onPress={toggleMode}
                disabled={isLoading}
              >
                <Text style={styles.toggleButtonText}>
                  {isSignUp 
                    ? 'Already have an account? Sign In' 
                    : "Don't have an account? Sign Up"
                  }
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>

          {/* Sign up info with animation */}
          {isSignUp && (
            <Animated.View style={[styles.signUpInfo, infoAnimatedStyle]}>
              <Text style={styles.signUpInfoText}>
                By creating an account, you agree to our Terms of Service and Privacy Policy. 
                Your health data is stored securely and never shared with third parties.
              </Text>
            </Animated.View>
          )}
        </UsefulContainer>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: theme.colors.gray[900],
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: theme.colors.gray[600],
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
    paddingHorizontal: 16,
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputWrapperError: {
    borderColor: theme.colors.error[500],
    borderWidth: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: theme.colors.gray[800],
    paddingVertical: 16,
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.error[500],
    marginLeft: 6,
    flex: 1,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[600],
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: theme.colors.primary[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: theme.colors.gray[400],
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.white,
    marginRight: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.gray[200],
  },
  dividerText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[500],
    marginHorizontal: 16,
  },
  toggleButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  toggleButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.primary[600],
  },
  signUpInfo: {
    backgroundColor: theme.colors.gray[50],
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.gray[400],
  },
  signUpInfoText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: theme.colors.gray[600],
    lineHeight: 18,
    textAlign: 'center',
  },
});
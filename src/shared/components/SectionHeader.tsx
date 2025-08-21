import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';

type SectionHeaderProps = {
  title: string;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning';
};

const { width } = Dimensions.get('window');

export const SectionHeader = ({ title, variant = 'default' }: SectionHeaderProps) => {
  const getGradientColors = () => {
    switch (variant) {
      case 'primary':
        return [theme.colors.primary[500], theme.colors.primary[700]];
      case 'secondary':
        return [theme.colors.primary[400], theme.colors.primary[600]];
      case 'success':
        return [theme.colors.primary[300], theme.colors.primary[500]];
      case 'warning':
        return [theme.colors.primary[600], theme.colors.primary[800]];
      default:
        return [theme.colors.primary[500], theme.colors.primary[700]];
    }
  };

  const gradientColors = getGradientColors();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Subtle decorative elements */}
        <View style={styles.decorativeContainer}>
          <View style={[styles.decorativeCircle, styles.circle1]} />
          <View style={[styles.decorativeCircle, styles.circle2]} />
        </View>

        {/* Centered content */}
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
        </View>

        {/* Minimal bottom accent */}
        <View style={styles.bottomAccent} />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gradient: {
    paddingHorizontal: 20,
    paddingVertical: 12, // Very thin - reduced from 16 to 12
    position: 'relative',
    minHeight: 48, // Very thin - reduced from 70 to 48
  },
  decorativeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  decorativeCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 50,
  },
  circle1: {
    width: 40, // Much smaller
    height: 40,
    top: -10,
    right: -10,
  },
  circle2: {
    width: 30, // Much smaller
    height: 30,
    bottom: -5,
    left: -5,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  content: {
    position: 'relative',
    zIndex: 2,
    alignItems: 'center', // Center the text
    justifyContent: 'center', // Center vertically
    flex: 1,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 18, // Reduced from 22 to 18
    color: theme.colors.white,
    letterSpacing: 0.3,
    textAlign: 'center', // Center the text
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bottomAccent: {
    position: 'absolute',
    bottom: 0,
    left: '25%', // Start from 25% of width
    right: '25%', // End at 75% of width (so it's 50% wide, centered)
    height: 2, // Very thin accent line
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 1,
  },
});
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { theme } from '@/constants/theme';

type MarketplaceBoxProps = {
  onPress: () => void;
};

export const MarketplaceBox = ({ onPress }: MarketplaceBoxProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Main Icon */}
        <View style={styles.mainIconContainer}>
          <Image 
            source={{ uri: 'https://i.imgur.com/67xpJvv.png' }}
            style={styles.iconImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.textContent}>
          <Text style={styles.title}>Exclusive Health Content</Text>
          <Text style={styles.subtitle}>Premium resources & expert insights</Text>
          
          <View style={styles.ctaContainer}>
            <Text style={styles.ctaText}>Discover exclusive content</Text>
            <View style={styles.ctaButton}>
              <Text style={styles.ctaButtonText}>Access Now</Text>
              <ArrowRight size={14} color={theme.colors.warning[600]} />
            </View>
          </View>
        </View>
      </View>

      {/* Decorative Background Elements */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />

      {/* Coming Soon Blur Overlay */}
      <View style={styles.blurOverlay}>
        <View style={styles.comingSoonContainer}>
          <Text style={styles.comingSoonText}>Coming Soon</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.warning[500],
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: theme.colors.warning[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: theme.colors.warning[600],
    position: 'relative',
    minHeight: 140,
  },
  content: {
    flex: 1,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    zIndex: 2,
  },
  mainIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.warning[600],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.warning[700],
    marginRight: 16,
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  iconImage: {
    width: 36,
    height: 36,
    tintColor: theme.colors.white,
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: theme.colors.white,
    marginBottom: 4,
    lineHeight: 20,
  },
  subtitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: theme.colors.warning[100],
    lineHeight: 16,
    marginBottom: 16,
  },
  ctaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ctaText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    color: theme.colors.white,
    flex: 1,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  ctaButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: theme.colors.warning[600],
    marginRight: 4,
  },
  // Decorative background elements
  decorativeCircle1: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.warning[400],
    opacity: 0.3,
    zIndex: 1,
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.warning[600],
    opacity: 0.2,
    zIndex: 1,
  },
  // Coming Soon Blur Overlay
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(4px)', // For web
  },
  comingSoonContainer: {
    backgroundColor: theme.colors.primary[600],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  comingSoonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: theme.colors.white,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
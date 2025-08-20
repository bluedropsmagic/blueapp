import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import { BlueDropsLogo } from '@/components/BlueDropsLogo';
import { HamburgerMenu } from '@/components/HamburgerMenu';

export const HeaderMenu = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        {/* Hamburger Menu */}
        <View style={styles.leftSection}>
          <HamburgerMenu />
        </View>
        
        {/* Logo */}
        <View style={styles.logoContainer}>
          <BlueDropsLogo width={120} height={30} />
        </View>
        
        {/* Right Section (empty for balance) */}
        <View style={styles.rightSection} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[100],
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leftSection: {
    width: 44,
    alignItems: 'flex-start',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  rightSection: {
    width: 44,
    alignItems: 'flex-end',
  },
});
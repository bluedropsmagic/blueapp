import React, { ReactNode } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';

type UsefulContainerProps = {
  children: ReactNode;
  maxWidth?: number;
  padding?: boolean;
};

const { width } = Dimensions.get('window');

export const UsefulContainer = ({ children, maxWidth = 1200, padding = true }: UsefulContainerProps) => {
  const isDesktop = Platform.OS === 'web' && width > 1024;
  const isTablet = Platform.OS === 'web' && width > 768 && width <= 1024;
  
  return (
    <View style={[
      styles.container,
      {
        maxWidth: isDesktop ? maxWidth : '100%',
        paddingHorizontal: padding ? (isDesktop ? 40 : isTablet ? 24 : 16) : 0,
      }
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
  },
});
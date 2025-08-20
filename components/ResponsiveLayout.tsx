import React, { ReactNode } from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ResponsiveLayoutProps = {
  children: ReactNode;
  maxWidth?: number;
  padding?: boolean;
  scrollable?: boolean;
};

const { width } = Dimensions.get('window');

export const ResponsiveLayout = ({ 
  children, 
  maxWidth = 1200, 
  padding = true,
  scrollable = false 
}: ResponsiveLayoutProps) => {
  const insets = useSafeAreaInsets();
  
  const isDesktop = width > 1024;
  const isTablet = width > 768 && width <= 1024;
  const isMobile = width <= 768;

  const containerStyle = [
    styles.container,
    {
      maxWidth: isDesktop ? maxWidth : '100%',
      paddingHorizontal: padding ? (isDesktop ? 40 : isTablet ? 24 : 16) : 0,
      paddingTop: insets.top,
    }
  ];

  if (scrollable) {
    return (
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={containerStyle}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={containerStyle}>
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
  scrollContainer: {
    flex: 1,
  },
});
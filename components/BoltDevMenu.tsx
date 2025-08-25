import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { 
  Menu, 
  X, 
  Home, 
  User, 
  Calendar, 
  BarChart3, 
  BookOpen, 
  Settings, 
  Package, 
  Video, 
  ExternalLink,
  Headphones,
  RefreshCw,
  Heart,
  Navigation
} from 'lucide-react-native';
import { theme } from '@/constants/theme';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  runOnJS
} from 'react-native-reanimated';

// Check if we're in Bolt environment
const isBoltEnvironment = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.hostname.includes('bolt.host') || 
           window.location.hostname.includes('localhost') ||
           window.location.hostname.includes('127.0.0.1') ||
           process.env.NODE_ENV === 'development';
  }
  return process.env.NODE_ENV === 'development';
};

export const BoltDevMenu = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Animation values
  const slideAnim = useSharedValue(-300);
  const overlayOpacity = useSharedValue(0);
  const menuItemsOpacity = useSharedValue(0);

  // Don't render if not in Bolt environment
  if (!isBoltEnvironment()) {
    return null;
  }

  const routes = [
    // Main App Routes
    { 
      icon: Home, 
      label: 'Home', 
      path: '/(tabs)/', 
      category: 'Main App',
      isActive: pathname === '/(tabs)' || pathname === '/' || pathname === '/(tabs)/index'
    },
    { 
      icon: Calendar, 
      label: 'Track Journey', 
      path: '/(tabs)/track', 
      category: 'Main App',
      isActive: pathname.includes('/track')
    },
    { 
      icon: BarChart3, 
      label: 'Progress', 
      path: '/(tabs)/progress', 
      category: 'Main App',
      isActive: pathname.includes('/progress')
    },
    { 
      icon: BookOpen, 
      label: 'Learn', 
      path: '/(tabs)/learn', 
      category: 'Main App',
      isActive: pathname.includes('/learn')
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      path: '/(tabs)/settings', 
      category: 'Main App',
      isActive: pathname.includes('/settings')
    },

    // Special Pages
    { 
      icon: User, 
      label: 'Login', 
      path: '/login', 
      category: 'Auth',
      isActive: pathname === '/login'
    },
    { 
      icon: Heart, 
      label: 'Thank You Page', 
      path: '/thankyou', 
      category: 'Special',
      isActive: pathname === '/thankyou'
    },

    // Help & Support
    { 
      icon: Video, 
      label: 'How to Use BlueApp', 
      path: '/(tabs)/help', 
      category: 'Help',
      isActive: pathname.includes('/help') && !pathname.includes('/help-center')
    },
    { 
      icon: Headphones, 
      label: 'Help Center', 
      path: '/(tabs)/help-center', 
      category: 'Help',
      isActive: pathname.includes('/help-center')
    },
    { 
      icon: Video, 
      label: 'Video Tutorial', 
      path: '/video-tutorial', 
      category: 'Help',
      isActive: pathname === '/video-tutorial'
    },

    // External Features
    { 
      icon: Package, 
      label: 'Package Tracking', 
      path: '/package-tracking', 
      category: 'External',
      isActive: pathname === '/package-tracking'
    },
    { 
      icon: Package, 
      label: 'Dashboard (Tracking)', 
      path: '/(tabs)/dashboard', 
      category: 'External',
      isActive: pathname.includes('/dashboard')
    },
    { 
      icon: ExternalLink, 
      label: 'WebView Fullscreen', 
      path: '/webview-fullscreen', 
      category: 'External',
      isActive: pathname === '/webview-fullscreen'
    },
    { 
      icon: RefreshCw, 
      label: 'Product Support', 
      path: '/support', 
      category: 'External',
      isActive: pathname === '/support'
    },
    { 
      icon: ExternalLink, 
      label: 'Marketplace', 
      path: '/marketplace', 
      category: 'External',
      isActive: pathname === '/marketplace'
    },
  ];

  const openMenu = () => {
    setIsMenuOpen(true);
    
    // Reset animations
    slideAnim.value = -300;
    overlayOpacity.value = 0;
    menuItemsOpacity.value = 0;

    // Animate menu opening
    overlayOpacity.value = withTiming(1, { duration: 200 });
    slideAnim.value = withSpring(0, { damping: 20, stiffness: 120 });
    menuItemsOpacity.value = withTiming(1, { duration: 300 });
  };

  const closeMenu = () => {
    overlayOpacity.value = withTiming(0, { duration: 200 });
    slideAnim.value = withTiming(-300, { duration: 250 }, () => {
      runOnJS(setIsMenuOpen)(false);
    });
    menuItemsOpacity.value = withTiming(0, { duration: 150 });
  };

  const handleNavigation = (path: string) => {
    closeMenu();
    setTimeout(() => {
      if (path === '/(tabs)/') {
        router.replace('/(tabs)');
      } else {
        router.replace(path);
      }
    }, 300);
  };

  // Animated styles
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const menuStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideAnim.value }],
  }));

  const menuItemsStyle = useAnimatedStyle(() => ({
    opacity: menuItemsOpacity.value,
  }));

  // Group routes by category
  const groupedRoutes = routes.reduce((acc, route) => {
    if (!acc[route.category]) {
      acc[route.category] = [];
    }
    acc[route.category].push(route);
    return acc;
  }, {} as Record<string, typeof routes>);

  return (
    <>
      {/* Floating Dev Menu Button */}
      <TouchableOpacity 
        style={styles.devMenuButton}
        onPress={openMenu}
        activeOpacity={0.8}
      >
        <Navigation size={20} color={theme.colors.white} />
        <Text style={styles.devMenuButtonText}>DEV</Text>
      </TouchableOpacity>

      {/* Dev Menu Modal */}
      <Modal
        visible={isMenuOpen}
        transparent={true}
        animationType="none"
        onRequestClose={closeMenu}
      >
        <Animated.View style={[styles.overlay, overlayStyle]}>
          <TouchableOpacity 
            style={styles.overlayTouchable}
            onPress={closeMenu}
            activeOpacity={1}
          />
          
          <Animated.View style={[styles.menuPanel, menuStyle]}>
            {/* Menu Header */}
            <View style={styles.menuHeader}>
              <View style={styles.headerLeft}>
                <View style={styles.boltIcon}>
                  <Navigation size={20} color={theme.colors.primary[600]} />
                </View>
                <View>
                  <Text style={styles.menuTitle}>Bolt Dev Menu</Text>
                  <Text style={styles.menuSubtitle}>Navigation & Testing</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={closeMenu}>
                <X size={20} color={theme.colors.gray[600]} />
              </TouchableOpacity>
            </View>

            {/* Current Route Info */}
            <View style={styles.currentRouteContainer}>
              <Text style={styles.currentRouteLabel}>Current Route:</Text>
              <Text style={styles.currentRoutePath}>{pathname}</Text>
            </View>

            {/* Menu Content */}
            <Animated.View style={[styles.menuContent, menuItemsStyle]}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {Object.entries(groupedRoutes).map(([category, categoryRoutes]) => (
                  <View key={category} style={styles.categorySection}>
                    <Text style={styles.categoryTitle}>{category}</Text>
                    
                    {categoryRoutes.map((route, index) => {
                      const Icon = route.icon;
                      return (
                        <TouchableOpacity
                          key={`${category}-${index}`}
                          style={[
                            styles.menuItem,
                            route.isActive && styles.activeMenuItem
                          ]}
                          onPress={() => handleNavigation(route.path)}
                          activeOpacity={0.7}
                        >
                          <View style={[
                            styles.menuItemIcon,
                            route.isActive && styles.activeMenuItemIcon
                          ]}>
                            <Icon 
                              size={18} 
                              color={route.isActive ? theme.colors.white : theme.colors.gray[600]} 
                            />
                          </View>
                          <View style={styles.menuItemContent}>
                            <Text style={[
                              styles.menuItemLabel,
                              route.isActive && styles.activeMenuItemLabel
                            ]}>
                              {route.label}
                            </Text>
                            <Text style={styles.menuItemPath}>{route.path}</Text>
                          </View>
                          {route.isActive && (
                            <View style={styles.activeIndicator} />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </ScrollView>
            </Animated.View>

            {/* Menu Footer */}
            <View style={styles.menuFooter}>
              <Text style={styles.footerText}>🚀 Bolt Development Environment</Text>
              <Text style={styles.footerSubtext}>This menu is only visible during development</Text>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  devMenuButton: {
    position: 'absolute',
    top: 60,
    left: 16,
    width: 56,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary[600],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    shadowColor: theme.colors.primary[600],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  devMenuButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    color: theme.colors.white,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    flexDirection: 'row',
  },
  overlayTouchable: {
    flex: 1,
  },
  menuPanel: {
    width: 320,
    backgroundColor: theme.colors.white,
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.primary[50],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.primary[100],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  boltIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: theme.colors.primary[800],
  },
  menuSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: theme.colors.primary[600],
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentRouteContainer: {
    backgroundColor: theme.colors.gray[900],
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  currentRouteLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: theme.colors.gray[400],
    marginBottom: 4,
  },
  currentRoutePath: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: theme.colors.white,
    letterSpacing: 0.5,
  },
  menuContent: {
    flex: 1,
    paddingVertical: 16,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: theme.colors.gray[500],
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[50],
  },
  activeMenuItem: {
    backgroundColor: theme.colors.primary[50],
    borderRightWidth: 4,
    borderRightColor: theme.colors.primary[600],
  },
  menuItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activeMenuItemIcon: {
    backgroundColor: theme.colors.primary[600],
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.gray[800],
    marginBottom: 2,
  },
  activeMenuItemLabel: {
    color: theme.colors.primary[800],
    fontFamily: 'Inter-SemiBold',
  },
  menuItemPath: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: theme.colors.gray[500],
    fontFamily: 'monospace',
  },
  activeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary[600],
  },
  menuFooter: {
    padding: 20,
    backgroundColor: theme.colors.gray[50],
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[100],
  },
  footerText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: theme.colors.gray[700],
    textAlign: 'center',
    marginBottom: 4,
  },
  footerSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    color: theme.colors.gray[500],
    textAlign: 'center',
  },
});
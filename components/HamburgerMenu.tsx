import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Menu, X, User, Settings, CircleHelp as HelpCircle, LogOut, Headphones as HeadphonesIcon, RefreshCw } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { BlueDropsLogo } from '@/components/BlueDropsLogo';
import { useAuthStore } from '@/stores/authStore';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  withDelay,
  withSequence,
  runOnJS,
  Easing,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface HamburgerMenuProps {
  onMenuPress?: () => void;
}

export const HamburgerMenu = ({ onMenuPress }: HamburgerMenuProps) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Animation values
  const slideAnim = useSharedValue(-width * 0.8);
  const menuItemsOpacity = useSharedValue(0);
  const menuItemsTranslateY = useSharedValue(30);
  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);
  const userInfoScale = useSharedValue(0.9);
  const userInfoOpacity = useSharedValue(0);
  const footerTranslateY = useSharedValue(20);
  const footerOpacity = useSharedValue(0);

  // Menu items with dedicated Help Center
  const menuItems = [
    { icon: HelpCircle, label: 'How to Use BlueApp', route: '/(tabs)/help' },
    { icon: HeadphonesIcon, label: 'Help Center', route: '/(tabs)/help-center' }, // Dedicated Help Center
    { icon: Settings, label: 'Settings', route: '/(tabs)/settings' },
    { icon: RefreshCw, label: 'Product Support', route: '/support' },
  ];

  const openMenu = () => {
    setIsMenuOpen(true);
    
    // Reset all animations to initial state
    slideAnim.value = -width * 0.8;
    menuItemsOpacity.value = 0;
    menuItemsTranslateY.value = 30;
    logoScale.value = 0.8;
    logoOpacity.value = 0;
    userInfoScale.value = 0.9;
    userInfoOpacity.value = 0;
    footerTranslateY.value = 20;
    footerOpacity.value = 0;

    // 1. Slide menu panel from left with spring animation
    slideAnim.value = withSpring(0, { 
      damping: 20, 
      stiffness: 120,
      mass: 1
    });

    // 2. Animate logo with scale and fade - MAIS RÁPIDO
    logoOpacity.value = withDelay(100, withTiming(1, { 
      duration: 300,
      easing: Easing.out(Easing.cubic)
    }));
    logoScale.value = withDelay(100, withSpring(1, { 
      damping: 15, 
      stiffness: 150 
    }));

    // 3. Animate user info with scale and fade - MAIS RÁPIDO
    if (user) {
      userInfoOpacity.value = withDelay(150, withTiming(1, { 
        duration: 250,
        easing: Easing.out(Easing.cubic)
      }));
      userInfoScale.value = withDelay(150, withSpring(1, { 
        damping: 12, 
        stiffness: 150 
      }));
    }

    // 4. Animate menu items with staggered entrance - MUITO MAIS RÁPIDO
    menuItemsOpacity.value = withDelay(200, withTiming(1, { 
      duration: 300,
      easing: Easing.out(Easing.cubic)
    }));
    menuItemsTranslateY.value = withDelay(200, withSpring(0, { 
      damping: 15, 
      stiffness: 150 
    }));

    // 5. Animate footer last - MAIS RÁPIDO
    footerOpacity.value = withDelay(300, withTiming(1, { 
      duration: 250,
      easing: Easing.out(Easing.cubic)
    }));
    footerTranslateY.value = withDelay(300, withSpring(0, { 
      damping: 12, 
      stiffness: 150 
    }));

    onMenuPress?.();
  };

  const closeMenu = () => {
    // Reverse animations with smoother, gentler timing
    footerOpacity.value = withTiming(0, { 
      duration: 200,
      easing: Easing.in(Easing.quad)
    });
    footerTranslateY.value = withTiming(20, { 
      duration: 200,
      easing: Easing.in(Easing.quad)
    });
    
    menuItemsOpacity.value = withTiming(0, { 
      duration: 250,
      easing: Easing.in(Easing.quad)
    });
    menuItemsTranslateY.value = withTiming(30, { 
      duration: 250,
      easing: Easing.in(Easing.quad)
    });
    
    if (user) {
      userInfoOpacity.value = withTiming(0, { 
        duration: 200,
        easing: Easing.in(Easing.quad)
      });
      userInfoScale.value = withTiming(0.9, { 
        duration: 200,
        easing: Easing.in(Easing.quad)
      });
    }
    
    logoOpacity.value = withTiming(0, { 
      duration: 200,
      easing: Easing.in(Easing.quad)
    });
    logoScale.value = withTiming(0.8, { 
      duration: 200,
      easing: Easing.in(Easing.quad)
    });
    
    // Slide menu out
    slideAnim.value = withTiming(-width * 0.8, { 
      duration: 300,
      easing: Easing.in(Easing.cubic)
    }, () => {
      runOnJS(setIsMenuOpen)(false);
    });
  };

  const handleMenuItemPress = (route: string) => {
    closeMenu();
    setTimeout(() => {
      router.replace(route);
    }, 300);
  };

  const handleSignOut = async () => {
    closeMenu();
    setTimeout(async () => {
      await signOut();
      router.replace('/login');
    }, 300);
  };

  // Animated styles
  const menuAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideAnim.value }],
  }));

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const userInfoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: userInfoOpacity.value,
    transform: [{ scale: userInfoScale.value }],
  }));

  const menuItemsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: menuItemsOpacity.value,
    transform: [{ translateY: menuItemsTranslateY.value }],
  }));

  const footerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: footerOpacity.value,
    transform: [{ translateY: footerTranslateY.value }],
  }));

  // Individual menu item animations with staggered effect - MAIS RÁPIDO
  const getMenuItemAnimatedStyle = (index: number) => {
    return useAnimatedStyle(() => {
      const delay = index * 25; // Reduzido de 50ms para 25ms
      const progress = interpolate(
        menuItemsOpacity.value,
        [0, 1],
        [0, 1],
        Extrapolate.CLAMP
      );
      
      const translateX = interpolate(
        progress,
        [0, 1],
        [30, 0],
        Extrapolate.CLAMP
      );
      
      const opacity = interpolate(
        progress,
        [0, 1],
        [0, 1],
        Extrapolate.CLAMP
      );

      return {
        opacity: withDelay(delay, withTiming(opacity, { duration: 200 })), // Reduzido de 300ms para 200ms
        transform: [
          { 
            translateX: withDelay(delay, withSpring(translateX, { 
              damping: 15, 
              stiffness: 150 // Aumentado de 100 para 150
            }))
          }
        ],
      };
    });
  };

  return (
    <>
      {/* Hamburger Button with subtle hover effect */}
      <TouchableOpacity 
        style={styles.hamburgerButton}
        onPress={openMenu}
        activeOpacity={0.7}
      >
        <Menu size={24} color={theme.colors.gray[700]} />
      </TouchableOpacity>

      {/* Menu Modal - SEM OVERLAY ESCURO */}
      <Modal
        visible={isMenuOpen}
        transparent={true}
        animationType="none"
        onRequestClose={closeMenu}
      >
        <View style={styles.modalContainer}>
          {/* Menu Panel */}
          <Animated.View 
            style={[
              styles.menuPanel, 
              { paddingTop: insets.top + 20 },
              menuAnimatedStyle
            ]}
          >
            {/* Menu Header */}
            <View style={styles.menuHeader}>
              <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
                <BlueDropsLogo width={120} height={30} />
              </Animated.View>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={closeMenu}
              >
                <X size={24} color={theme.colors.gray[600]} />
              </TouchableOpacity>
            </View>

            {/* User Info */}
            {user && (
              <Animated.View style={[styles.userInfo, userInfoAnimatedStyle]}>
                <View style={styles.userAvatar}>
                  <User size={24} color={theme.colors.white} />
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                </View>
              </Animated.View>
            )}

            {/* Menu Items - How to Use BlueApp, Help Center, and Settings */}
            <Animated.View style={[styles.menuItems, menuItemsAnimatedStyle]}>
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Animated.View 
                    key={index}
                    style={getMenuItemAnimatedStyle(index)}
                  >
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => handleMenuItemPress(item.route)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.menuItemIcon}>
                        <Icon size={20} color={theme.colors.primary[600]} />
                      </View>
                      <Text style={styles.menuItemText}>{item.label}</Text>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </Animated.View>

            {/* Menu Footer */}
            <Animated.View style={[styles.menuFooter, footerAnimatedStyle]}>
              <TouchableOpacity
                style={styles.signOutButton}
                onPress={handleSignOut}
                activeOpacity={0.7}
              >
                <LogOut size={20} color={theme.colors.error[600]} />
                <Text style={styles.signOutText}>Sign Out</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>

          {/* Área transparente para fechar o menu (sem escurecimento) */}
          <TouchableOpacity 
            style={styles.transparentArea}
            onPress={closeMenu}
            activeOpacity={1}
          />
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  hamburgerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  menuPanel: {
    width: width * 0.8,
    maxWidth: 320,
    backgroundColor: theme.colors.white,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  transparentArea: {
    flex: 1,
    marginLeft: width * 0.8,
    // Completamente transparente - sem backgroundColor
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[100],
  },
  logoContainer: {
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.primary[50],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[100],
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.gray[900],
    marginBottom: 4,
  },
  userEmail: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[600],
  },
  menuItems: {
    flex: 1,
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[50],
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  menuItemText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: theme.colors.gray[800],
    flex: 1,
  },
  menuFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[100],
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.error[50],
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.error[100],
  },
  signOutText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: theme.colors.error[600],
    marginLeft: 8,
  },
});
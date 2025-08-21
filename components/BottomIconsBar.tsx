import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, usePathname } from 'expo-router';
import { 
  ChartBar as BarChart2, 
  Calendar, 
  House, 
  BookOpen, 
  Settings
} from 'lucide-react-native';
import { theme } from '@/constants/theme';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  interpolate
} from 'react-native-reanimated';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const BottomIconsBar = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();

  const icons = [
    { 
      icon: BarChart2, 
      name: 'Progress', 
      path: '/(tabs)/progress',
      isActive: pathname.includes('/progress'),
      isClickable: true
    },
    { 
      icon: Calendar, 
      name: 'Track', 
      path: '/(tabs)/track',
      isActive: pathname.includes('/track'),
      isClickable: true
    },
    { 
      icon: House, 
      name: 'Home', 
      path: '/(tabs)/',
      isActive: pathname === '/(tabs)' || pathname === '/' || pathname === '/(tabs)/index',
      isClickable: true
    },
    { 
      icon: BookOpen, 
      name: 'Learn', 
      path: '/(tabs)/learn',
      isActive: pathname.includes('/learn'),
      isClickable: true
    },
    { 
      icon: Settings, 
      name: 'Settings', 
      path: '/(tabs)/settings',
      isActive: pathname.includes('/settings'),
      isClickable: true
    },
  ];

  const handleNavigation = (path: string, isClickable: boolean) => {
    if (!isClickable) return;
    
    if (path === '/(tabs)/') {
      router.replace('/(tabs)');
    } else {
      router.replace(path);
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 4 }]}>
      <View style={styles.iconsContainer}>
        {icons.map((item, index) => {
          const Icon = item.icon;
          const iconSize = item.isActive ? 28 : 22; // Increased difference: 28px vs 22px
          const strokeWidth = item.isActive ? 2.5 : 2;
          
          // Animation values for each icon
          const scale = useSharedValue(item.isActive ? 1 : 0.9);
          const opacity = useSharedValue(item.isActive ? 1 : 0.7);
          
          // Update animations when active state changes
          React.useEffect(() => {
            scale.value = withSpring(item.isActive ? 1.1 : 0.95, {
              damping: 15,
              stiffness: 150,
            });
            opacity.value = withTiming(item.isActive ? 1 : 0.7, {
              duration: 200,
            });
          }, [item.isActive]);
          
          const animatedIconStyle = useAnimatedStyle(() => ({
            transform: [{ scale: scale.value }],
            opacity: opacity.value,
          }));
          
          return (
            <AnimatedTouchableOpacity 
              key={index} 
              style={[styles.iconWrapper, animatedIconStyle]}
              onPress={() => handleNavigation(item.path, item.isClickable)}
              activeOpacity={0.6}
              disabled={!item.isClickable}
            >
              <View style={[
                styles.iconContainer,
                item.isActive && styles.activeIconContainer
              ]}>
                <Icon 
                  size={iconSize}
                  color={
                    item.isActive 
                      ? theme.colors.primary[600]
                      : theme.colors.gray[400]
                  } 
                  strokeWidth={strokeWidth}
                />
              </View>
              
              <Text style={[
                styles.iconLabel,
                item.isActive && styles.iconLabelActive
              ]}>
                {item.name}
              </Text>
            </AnimatedTouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[100],
  },
  iconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    height: 32, // Increased height to accommodate larger icons
    width: 32,  // Increased width to accommodate larger icons
    borderRadius: 16,
  },
  activeIconContainer: {
    backgroundColor: theme.colors.primary[50], // Subtle background for active state
  },
  iconLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 9,
    color: theme.colors.gray[500],
    textAlign: 'center',
    marginTop: 2,
  },
  iconLabelActive: {
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary[600],
    fontSize: 10, // Slightly larger text for active state
  },
});
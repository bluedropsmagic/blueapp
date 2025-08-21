import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Flame } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

type StreakDisplayProps = {
  streak: number;
};

export const StreakDisplay = ({ streak }: StreakDisplayProps) => {
  const scale = useSharedValue(1);
  
  // Animate when streak changes
  useEffect(() => {
    scale.value = withSpring(1.2, { damping: 10 }, () => {
      scale.value = withSpring(1);
    });
  }, [streak]);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Current Streak</Text>
      <View style={styles.streakContainer}>
        <Animated.View style={[styles.streakIconContainer, animatedStyle]}>
          <Flame size={20} color={theme.colors.white} />
        </Animated.View>
        <Text style={styles.streakValue}>{streak} days</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    flex: 1,
    minWidth: 140,
    marginRight: 12,
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.gray[600],
    marginBottom: 16,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakIconContainer: {
    backgroundColor: theme.colors.primary[600],
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  streakValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: theme.colors.gray[900],
  },
});
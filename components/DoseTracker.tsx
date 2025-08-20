import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Check, Droplet } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

type DoseTrackerProps = {
  completedDoses: number;
  totalDoses: number;
  onDoseComplete: () => void;
};

export const DoseTracker = ({ completedDoses, totalDoses, onDoseComplete }: DoseTrackerProps) => {
  const progress = useSharedValue(completedDoses / totalDoses);
  
  // Update progress when completedDoses changes
  React.useEffect(() => {
    progress.value = withSpring(completedDoses / totalDoses, { damping: 15 });
  }, [completedDoses, totalDoses]);
  
  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value * 100}%`,
    };
  });
  
  const canTakeDose = completedDoses < totalDoses;
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Doses</Text>
        <Text style={styles.counter}>{completedDoses}/{totalDoses}</Text>
      </View>
      
      <View style={styles.progressContainer}>
        <Animated.View style={[styles.progressBar, progressStyle]} />
      </View>
      
      <View style={styles.doseButtonContainer}>
        {canTakeDose ? (
          <TouchableOpacity 
            style={styles.takeDoseButton}
            onPress={onDoseComplete}
            activeOpacity={0.8}
          >
            <Droplet size={20} color={theme.colors.white} />
            <Text style={styles.takeDoseText}>Take Dose Now</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.completedContainer}>
            <Check size={20} color={theme.colors.success[500]} />
            <Text style={styles.completedText}>All doses taken for today</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.gray[900],
  },
  counter: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: theme.colors.primary[600],
  },
  progressContainer: {
    height: 8,
    backgroundColor: theme.colors.gray[100],
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.primary[600],
    borderRadius: 4,
  },
  doseButtonContainer: {
    alignItems: 'center',
  },
  takeDoseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[600],
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
  },
  takeDoseText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: theme.colors.white,
    marginLeft: 8,
  },
  completedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.success[50],
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
  },
  completedText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: theme.colors.success[700],
    marginLeft: 8,
  },
});
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import { Video as LucideIcon } from 'lucide-react-native';

type AchievementCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  isUnlocked: boolean;
  date?: string;
  progress?: number;
};

export const AchievementCard = ({ 
  title, 
  description, 
  icon: Icon, 
  isUnlocked,
  date,
  progress 
}: AchievementCardProps) => {
  return (
    <View style={[
      styles.container,
      isUnlocked ? styles.unlockedContainer : styles.lockedContainer
    ]}>
      <View style={[
        styles.iconContainer,
        isUnlocked ? styles.unlockedIconContainer : styles.lockedIconContainer
      ]}>
        <Icon 
          size={24} 
          color={isUnlocked ? theme.colors.white : theme.colors.gray[400]} 
        />
      </View>
      
      <View style={styles.content}>
        <Text style={[
          styles.title,
          isUnlocked ? styles.unlockedTitle : styles.lockedTitle
        ]}>
          {title}
        </Text>
        <Text style={styles.description}>{description}</Text>
        
        {isUnlocked && date ? (
          <Text style={styles.date}>Achieved on {date}</Text>
        ) : progress ? (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${progress}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{progress}%</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  unlockedContainer: {
    backgroundColor: theme.colors.white,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary[600],
  },
  lockedContainer: {
    backgroundColor: theme.colors.gray[50],
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  unlockedIconContainer: {
    backgroundColor: theme.colors.primary[600],
  },
  lockedIconContainer: {
    backgroundColor: theme.colors.gray[200],
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 6,
  },
  unlockedTitle: {
    color: theme.colors.gray[900],
  },
  lockedTitle: {
    color: theme.colors.gray[600],
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[600],
    marginBottom: 8,
    lineHeight: 20,
  },
  date: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: theme.colors.success[600],
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: theme.colors.gray[200],
    borderRadius: 3,
    marginRight: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary[500],
    borderRadius: 3,
  },
  progressText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: theme.colors.primary[600],
  },
});
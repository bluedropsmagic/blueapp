import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ArrowUp, ArrowDown } from 'lucide-react-native';
import { theme } from '@/constants/theme';

type ProgressCardProps = {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
};

export const ProgressCard = ({ title, value, change, isPositive }: ProgressCardProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
      <View style={styles.changeContainer}>
        {isPositive ? (
          <ArrowUp size={12} color={theme.colors.success[500]} />
        ) : (
          <ArrowDown size={12} color={theme.colors.error[500]} />
        )}
        <Text style={[
          styles.change,
          isPositive ? styles.positive : styles.negative
        ]}>
          {change}
        </Text>
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
    marginBottom: 8,
  },
  value: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: theme.colors.gray[900],
    marginBottom: 8,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  change: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    marginLeft: 4,
  },
  positive: {
    color: theme.colors.success[500],
  },
  negative: {
    color: theme.colors.error[500],
  },
});
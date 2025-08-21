import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';

type WeeklyComplianceChartProps = {
  data: number[];
};

export const WeeklyComplianceChart = ({ data }: WeeklyComplianceChartProps) => {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const maxHeight = 100; // maximum height of bar in percentage
  
  // Ensure data is always an array with default values
  const safeData = data && Array.isArray(data) ? data : [0, 0, 0, 0, 0, 0, 0];
  
  return (
    <View style={styles.container}>
      <View style={styles.chart}>
        {safeData.map((value, index) => {
          const height = (value / 2) * maxHeight; // 2 is max possible value (2 doses per day)
          const isToday = index === safeData.length - 1;
          return (
            <View key={index} style={styles.barContainer}>
              <View style={styles.barWrapper}>
                <View 
                  style={[
                    styles.bar, 
                    { height: `${height}%` },
                    isToday && styles.todayBar
                  ]} 
                />
              </View>
              <Text style={[
                styles.dayLabel,
                isToday && styles.todayLabel
              ]}>
                {days[index]}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
  },
  barWrapper: {
    height: 100,
    width: 16,
    backgroundColor: theme.colors.gray[100],
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    backgroundColor: theme.colors.primary[500],
    borderRadius: 8,
  },
  todayBar: {
    backgroundColor: theme.colors.primary[600],
  },
  dayLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: theme.colors.gray[500],
    marginTop: 8,
  },
  todayLabel: {
    color: theme.colors.primary[600],
    fontFamily: 'Inter-SemiBold',
  },
});
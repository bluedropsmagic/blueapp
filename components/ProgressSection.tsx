import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ArrowUp, ArrowDown } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { LineChart } from 'react-native-chart-kit';
import { Video as LucideIcon } from 'lucide-react-native';

type ProgressSectionProps = {
  title: string;
  subtitle: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: LucideIcon;
  chartData: any;
  chartConfig: any;
};

export const ProgressSection = ({ 
  title, 
  subtitle, 
  value, 
  change, 
  isPositive, 
  icon: Icon,
  chartData,
  chartConfig
}: ProgressSectionProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Icon size={20} color={theme.colors.white} />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>
      
      <View style={styles.dataContainer}>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{value}</Text>
          <View style={styles.changeContainer}>
            {isPositive ? (
              <ArrowUp size={16} color={theme.colors.success[500]} />
            ) : (
              <ArrowDown size={16} color={theme.colors.error[500]} />
            )}
            <Text style={[
              styles.change,
              isPositive ? styles.positive : styles.negative
            ]}>
              {change}
            </Text>
          </View>
        </View>
        
        <View style={styles.chartContainer}>
          <LineChart
            data={chartData}
            width={160}
            height={80}
            chartConfig={chartConfig}
            bezier
            withDots={false}
            withInnerLines={false}
            withOuterLines={false}
            withHorizontalLabels={false}
            withVerticalLabels={true}
            style={styles.chart}
          />
        </View>
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
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.gray[900],
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: theme.colors.gray[500],
  },
  dataContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valueContainer: {
    flex: 1,
  },
  value: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: theme.colors.gray[900],
    marginBottom: 4,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  change: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginLeft: 4,
  },
  positive: {
    color: theme.colors.success[500],
  },
  negative: {
    color: theme.colors.error[500],
  },
  chartContainer: {
    alignItems: 'flex-end',
    flex: 1,
  },
  chart: {
    paddingRight: 0,
    borderRadius: 8,
  },
});
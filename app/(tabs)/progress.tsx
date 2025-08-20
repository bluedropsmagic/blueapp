import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeaderMenu } from '@/components/HeaderMenu';
import { BottomIconsBar } from '@/components/BottomIconsBar';
import { SectionHeader } from '@/components/SectionHeader';
import { UsefulContainer } from '@/components/UsefulContainer';
import { Zap, Calendar, ChartBar as BarChart2, Droplet, ArrowRight, Medal, Heart, Clock, Activity } from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit';
import { theme } from '@/constants/theme';
import { ProgressSection } from '@/components/ProgressSection';
import { AchievementCard } from '@/components/AchievementCard';
import { useDoseStore } from '@/stores/doseStore';
import { useAuthStore } from '@/stores/authStore';

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('Overview');
  const { doses, symptoms, dailySymptomEntries, checkAndResetDaily } = useDoseStore();
  const { user } = useAuthStore();

  // Check for daily reset on component mount
  useEffect(() => {
    checkAndResetDaily();
  }, []);

  // Calculate realistic data based on actual user doses
  const calculateComplianceData = () => {
    if (doses.length === 0) {
      // New user with no doses - return zeros
      return [0, 0, 0, 0];
    }

    const last4Weeks: number[] = [];
    const now = new Date();
    
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7) - 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
      
      const weekDoses = doses.filter(dose => 
        dose.timestamp >= weekStart.getTime() && dose.timestamp < weekEnd.getTime()
      );
      
      // Calculate percentage (14 doses expected per week = 2 per day * 7 days)
      const percentage = Math.min((weekDoses.length / 14) * 100, 100);
      last4Weeks.push(Math.round(percentage));
    }
    
    // Ensure we always return exactly 4 values
    while (last4Weeks.length < 4) {
      last4Weeks.unshift(0);
    }
    
    return last4Weeks;
  };

  // Calculate energy level progression (starts at 0 and increases with usage)
  const calculateEnergyData = () => {
    if (doses.length === 0) {
      // New user - start at zero energy level
      return [0, 0, 0, 0];
    }

    const complianceData = calculateComplianceData();
    const totalDoses = doses.length;
    
    // Energy improves based on total doses taken and consistency
    const energyData = complianceData.map((compliance, index) => {
      // Base energy starts at 0 and increases with total doses
      const doseBonus = Math.min(totalDoses * 0.1, 2.0); // Up to 2.0 points from total doses
      
      // Compliance bonus for this week
      const complianceBonus = (compliance / 100) * 1.5; // Up to 1.5 points from compliance
      
      // Progressive bonus for consistency over time
      const consistencyBonus = index * 0.2; // Gradual improvement over weeks
      
      // Calculate final energy level (max 5.0)
      const energyLevel = Math.min(doseBonus + complianceBonus + consistencyBonus, 5.0);
      
      return Math.round(energyLevel * 10) / 10; // Round to 1 decimal place
    });
    
    // Ensure we always return exactly 4 values
    while (energyData.length < 4) {
      energyData.unshift(0);
    }
    
    return energyData;
  };

  // Calculate symptom data based on actual user input from daily entries
  const calculateSymptomData = (symptomId: number) => {
    if (dailySymptomEntries.length === 0) {
      return [1, 1, 1, 1, 1, 1]; // Start at 1 instead of 0 for 1-5 scale
    }

    // Get last 6 weeks of data
    const last6Weeks: number[] = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7) - 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
      
      // Get entries for this week
      const weekEntries = dailySymptomEntries.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= weekStart && entryDate < weekEnd;
      });
      
      // Calculate average rating for the week
      if (weekEntries.length > 0) {
        const ratingsForSymptom = weekEntries
          .map(entry => entry.symptoms[symptomId])
          .filter(rating => rating !== undefined);
        
        if (ratingsForSymptom.length > 0) {
          const averageRating = ratingsForSymptom.reduce((sum, rating) => sum + rating, 0) / ratingsForSymptom.length;
          last6Weeks.push(Math.round(averageRating * 10) / 10);
        } else {
          // If no data for this symptom this week, use previous week's data or 1
          const previousValue = last6Weeks.length > 0 ? last6Weeks[last6Weeks.length - 1] : 1;
          last6Weeks.push(previousValue);
        }
      } else {
        // If no data for this week, use previous week's data or 1
        const previousValue = last6Weeks.length > 0 ? last6Weeks[last6Weeks.length - 1] : 1;
        last6Weeks.push(previousValue);
      }
    }
    
    // Ensure we always return exactly 6 values
    while (last6Weeks.length < 6) {
      last6Weeks.unshift(1);
    }
    
    return last6Weeks;
  };

  const complianceData = calculateComplianceData();
  const energyData = calculateEnergyData();

  // Mock data for charts
  const complianceChartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        data: complianceData.length > 0 ? complianceData : [0, 0, 0, 0],
        color: () => theme.colors.primary[600],
        strokeWidth: 2,
      },
    ],
  };

  const energyChartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        data: energyData.length > 0 ? energyData : [0, 0, 0, 0],
        color: () => theme.colors.secondary[600],
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: theme.colors.white,
    backgroundGradientTo: theme.colors.white,
    decimalPlaces: 0,
    color: () => theme.colors.primary[600],
    labelColor: () => theme.colors.gray[600],
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: theme.colors.white,
    },
    propsForLabels: {
      fontFamily: 'Inter-Regular',
      fontSize: 10,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
    },
  };

  // Chart config specifically for symptoms with 1-5 scale
  const symptomsChartConfig = {
    backgroundGradientFrom: theme.colors.white,
    backgroundGradientTo: theme.colors.white,
    decimalPlaces: 1,
    color: () => theme.colors.primary[600],
    labelColor: () => theme.colors.gray[600],
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: theme.colors.white,
    },
    propsForLabels: {
      fontFamily: 'Inter-Regular',
      fontSize: 10,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
    },
    // Force Y-axis to show 1-5 scale
    yAxisLabel: '',
    yAxisSuffix: '',
    yAxisInterval: 1, // Show every integer
    fromZero: false, // Don't start from zero
    segments: 4, // 4 segments for 1-5 scale (1-2, 2-3, 3-4, 4-5)
    yAxisMin: 1, // Force minimum to 1
    yAxisMax: 5, // Force maximum to 5
  };

  // Calculate current compliance percentage
  const currentCompliance = complianceData.length > 0 ? complianceData[complianceData.length - 1] : 0;
  const previousCompliance = complianceData.length > 1 ? complianceData[complianceData.length - 2] : 0;
  const complianceChange = currentCompliance - previousCompliance;

  // Calculate current energy level
  const currentEnergy = energyData.length > 0 ? energyData[energyData.length - 1] : 0;
  const previousEnergy = energyData.length > 1 ? energyData[energyData.length - 2] : 0;
  const energyChange = currentEnergy - previousEnergy;

  // Calculate achievements based on actual data
  const calculateAchievements = () => {
    const totalDoses = doses.length;
    const streak = calculateCurrentStreak();
    
    const achievements = [
      {
        id: 1,
        title: 'First Dose',
        description: 'You took your very first dose',
        icon: Droplet,
        isUnlocked: totalDoses >= 1,
        date: totalDoses >= 1 ? formatAchievementDate(doses[0]?.timestamp) : undefined,
      },
      {
        id: 2,
        title: 'One Week Streak',
        description: 'You\'ve taken all doses for 7 consecutive days',
        icon: Medal,
        isUnlocked: streak >= 7,
        date: streak >= 7 ? 'Recently achieved' : undefined,
        progress: streak < 7 ? Math.round((streak / 7) * 100) : undefined,
      },
      {
        id: 3,
        title: 'Consistency Master',
        description: 'Maintained 80% compliance for a month',
        icon: Zap,
        isUnlocked: currentCompliance >= 80 && complianceData.every(week => week >= 80),
        progress: currentCompliance < 80 ? currentCompliance : undefined,
      },
    ];

    return achievements;
  };

  const calculateCurrentStreak = () => {
    if (doses.length === 0) return 0;
    
    const sortedDoses = [...doses].sort((a, b) => b.timestamp - a.timestamp);
    const dosesByDay: { [key: string]: number } = {};
    
    // Group doses by day
    sortedDoses.forEach(dose => {
      const date = new Date(dose.timestamp);
      const dateString = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      dosesByDay[dateString] = (dosesByDay[dateString] || 0) + 1;
    });
    
    let streak = 0;
    const today = new Date();
    
    // Check consecutive days backwards from today
    for (let i = 0; i < 100; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateString = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
      
      if (dosesByDay[dateString] >= 2) { // Assuming 2 doses per day target
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return streak;
  };

  const formatAchievementDate = (timestamp?: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const achievements = calculateAchievements();

  // Calculate days since account creation for better context
  const getDaysSinceStart = () => {
    if (doses.length === 0) return 0;
    
    const firstDose = Math.min(...doses.map(d => d.timestamp));
    const daysSince = Math.floor((Date.now() - firstDose) / (1000 * 60 * 60 * 24));
    return daysSince;
  };

  const daysSinceStart = getDaysSinceStart();

  // Calculate energy improvement message
  const getEnergyMessage = () => {
    if (doses.length === 0) {
      return 'Start tracking your doses to see your energy levels improve over time.';
    }
    
    if (currentEnergy === 0) {
      return 'Keep taking your doses consistently to start seeing energy improvements.';
    }
    
    const improvementPercentage = Math.round((currentEnergy / 5.0) * 100);
    return `Your energy levels have improved to ${currentEnergy}/5.0 (${improvementPercentage}% of maximum) since starting treatment ${daysSinceStart} days ago.`;
  };

  // Symptom tracking state - removed "Intimacy"
  const [selectedMetric, setSelectedMetric] = useState('Energy Level');
  
  const metrics = [
    { id: 1, name: 'Energy Level', color: theme.colors.secondary[600], icon: Activity },
    { id: 2, name: 'Sleep Quality', color: theme.colors.primary[600], icon: Clock },
    { id: 3, name: 'Mood', color: theme.colors.success[600], icon: Heart },
    { id: 5, name: 'Confidence', color: theme.colors.error[600], icon: Zap },
  ];

  const getSelectedMetricData = () => {
    const metric = metrics.find(m => m.name === selectedMetric);
    if (!metric) return [1, 1, 1, 1, 1, 1]; // Default to 1 for 1-5 scale
    
    return calculateSymptomData(metric.id);
  };

  const getSelectedMetricColor = () => {
    const metric = metrics.find(m => m.name === selectedMetric);
    return metric?.color || theme.colors.secondary[600];
  };

  const getSelectedMetricIcon = () => {
    const metric = metrics.find(m => m.name === selectedMetric);
    return metric?.icon || Activity;
  };

  return (
    <View style={styles.container}>
      <HeaderMenu />
      <SectionHeader 
        title="Your Progress" 
        variant="primary"
      />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent, 
          { 
            paddingBottom: insets.bottom + 120, // Extra space for bottom icons
          }
        ]}
      >
        <UsefulContainer>
          <View style={styles.header}>
            <TouchableOpacity style={styles.calendarButton}>
              <Calendar size={16} color={theme.colors.primary[600]} />
              <Text style={styles.calendarButtonText}>Last 30 Days</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.tabsContainer}>
            {['Overview', 'Symptoms', 'Achievements'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tab,
                  activeTab === tab && styles.activeTab
                ]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText
                ]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {activeTab === 'Overview' && (
            <View style={styles.overviewContainer}>
              {doses.length === 0 && (
                <View style={styles.newUserNotice}>
                  <Text style={styles.newUserTitle}>Welcome to your health journey!</Text>
                  <Text style={styles.newUserDescription}>
                    Start tracking your doses to see your progress and insights here. Your energy level will increase as you maintain consistency.
                  </Text>
                </View>
              )}
              
              <ProgressSection
                title="Treatment Compliance"
                subtitle="Percentage of doses taken on time"
                value={`${currentCompliance}%`}
                change={complianceChange >= 0 ? `+${complianceChange}%` : `${complianceChange}%`}
                isPositive={complianceChange >= 0}
                icon={Droplet}
                chartData={complianceChartData}
                chartConfig={chartConfig}
              />
              
              <ProgressSection
                title="Energy Level"
                subtitle="Self-reported rating (0-5 scale)"
                value={currentEnergy.toFixed(1)}
                change={energyChange >= 0 ? `+${energyChange.toFixed(1)}` : `${energyChange.toFixed(1)}`}
                isPositive={energyChange >= 0}
                icon={Zap}
                chartData={energyChartData}
                chartConfig={{
                  ...chartConfig,
                  color: () => theme.colors.secondary[600],
                }}
              />
              
              <TouchableOpacity 
                style={styles.viewDetailsButton}
                onPress={() => setActiveTab('Symptoms')}
              >
                <Text style={styles.viewDetailsText}>View Detailed Metrics</Text>
                <ArrowRight size={16} color={theme.colors.primary[600]} />
              </TouchableOpacity>
            </View>
          )}
          
          {activeTab === 'Symptoms' && (
            <View style={styles.symptomsContainer}>
              <Text style={styles.sectionIntro}>
                Track how your body responds to treatment over time. All data is private and only visible to you.
              </Text>
              
              <View style={styles.metricSelector}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {metrics.map((metric) => (
                    <TouchableOpacity
                      key={metric.id}
                      style={[
                        styles.metricButton,
                        selectedMetric === metric.name && styles.metricButtonSelected,
                        selectedMetric === metric.name && { backgroundColor: metric.color }
                      ]}
                      onPress={() => setSelectedMetric(metric.name)}
                    >
                      <metric.icon size={14} color={selectedMetric === metric.name ? theme.colors.white : theme.colors.gray[600]} />
                      <Text style={[
                        styles.metricButtonText,
                        selectedMetric === metric.name && styles.metricButtonTextSelected
                      ]}>
                        {metric.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              <View style={styles.chartContainer}>
                <LineChart
                  data={{
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
                    datasets: [
                      {
                        data: getSelectedMetricData(),
                        color: () => getSelectedMetricColor(),
                        strokeWidth: 3,
                      },
                    ],
                  }}
                  width={280}
                  height={180}
                  chartConfig={{
                    ...symptomsChartConfig,
                    color: () => getSelectedMetricColor(),
                  }}
                  bezier
                  style={styles.chart}
                  onDataPointClick={() => {}}
                  yAxisInterval={1}
                  segments={4}
                  fromZero={false}
                  yLabelsOffset={-10}
                  formatYLabel={(value) => {
                    // Ensure we show values 1-5 on the Y-axis
                    const numValue = parseFloat(value);
                    if (numValue >= 1 && numValue <= 5) {
                      return Math.round(numValue).toString();
                    }
                    return '';
                  }}
                />
              </View>
              
              <View style={styles.insightsContainer}>
                <Text style={styles.insightsTitle}>Insights</Text>
                <View style={styles.insightCard}>
                  <Zap size={18} color={theme.colors.success[500]} />
                  <Text style={styles.insightText}>
                    {getEnergyMessage()}
                  </Text>
                </View>
                
                {dailySymptomEntries.length > 0 && (
                  <View style={[styles.insightCard, { backgroundColor: theme.colors.primary[50], borderLeftColor: theme.colors.primary[500] }]}>
                    <BarChart2 size={18} color={theme.colors.primary[500]} />
                    <Text style={[styles.insightText, { color: theme.colors.primary[700] }]}>
                      You've tracked symptoms for {dailySymptomEntries.length} days. Keep logging daily for better insights!
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
          
          {activeTab === 'Achievements' && (
            <View style={styles.achievementsContainer}>
              <Text style={styles.sectionIntro}>
                Celebrate your journey with achievements that mark your progress and consistency.
              </Text>
              
              {doses.length === 0 && (
                <View style={styles.achievementNotice}>
                  <Medal size={24} color={theme.colors.gray[400]} />
                  <Text style={styles.achievementNoticeText}>
                    Take your first dose to start unlocking achievements!
                  </Text>
                </View>
              )}
              
              {achievements.map((achievement) => (
                <AchievementCard 
                  key={achievement.id}
                  title={achievement.title}
                  description={achievement.description}
                  icon={achievement.icon}
                  isUnlocked={achievement.isUnlocked}
                  date={achievement.date}
                  progress={achievement.progress}
                />
              ))}
            </View>
          )}
        </UsefulContainer>
      </ScrollView>

      {/* Bottom Icons Bar */}
      <BottomIconsBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 24,
  },
  calendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary[50],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  calendarButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: theme.colors.primary[700],
    marginLeft: 6,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.gray[100],
    borderRadius: 8,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.gray[500],
  },
  activeTabText: {
    color: theme.colors.gray[900],
  },
  overviewContainer: {
    marginBottom: 32,
  },
  newUserNotice: {
    backgroundColor: theme.colors.primary[50],
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary[500],
  },
  newUserTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.primary[800],
    marginBottom: 8,
  },
  newUserDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.primary[700],
    lineHeight: 20,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  viewDetailsText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.primary[600],
    marginRight: 8,
  },
  symptomsContainer: {
    marginBottom: 32,
  },
  sectionIntro: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[600],
    marginBottom: 20,
    lineHeight: 20,
  },
  metricSelector: {
    marginBottom: 20,
  },
  metricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray[100],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  metricButtonSelected: {
    backgroundColor: theme.colors.secondary[600],
  },
  metricButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.gray[700],
    marginLeft: 6,
  },
  metricButtonTextSelected: {
    color: theme.colors.white,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  chart: {
    borderRadius: 16,
  },
  insightsContainer: {
    marginBottom: 32,
  },
  insightsTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.gray[900],
    marginBottom: 16,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.success[50],
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.success[500],
    marginBottom: 12,
  },
  insightText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.gray[800],
    marginLeft: 10,
    flex: 1,
  },
  achievementsContainer: {
    marginBottom: 32,
  },
  achievementNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.gray[50],
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  achievementNoticeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.gray[600],
    marginLeft: 12,
    textAlign: 'center',
  },
});
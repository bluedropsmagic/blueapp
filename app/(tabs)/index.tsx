import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { HeaderMenu } from '@/components/HeaderMenu';
import { BottomIconsBar } from '@/components/BottomIconsBar';
import { UsefulContainer } from '@/components/UsefulContainer';
import { DoseTracker } from '@/components/DoseTracker';
import { ProgressCard } from '@/components/ProgressCard';
import { WeeklyComplianceChart } from '@/components/WeeklyComplianceChart';
import { StreakDisplay } from '@/components/StreakDisplay';
import { FirstTimeUserModal } from '@/components/FirstTimeUserModal';
import { WebViewAd } from '@/components/WebViewAd';
import { PackageTracker } from '@/components/PackageTracker';
import { CircleCheck as CheckCircle, Calendar, ChevronRight, Package, ArrowDown } from 'lucide-react-native';
import { useDoseStore } from '@/stores/doseStore';
import { useAuthStore } from '@/stores/authStore';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { formatDate } from '@/utils/dateUtils';
import { theme } from '@/constants/theme';
import { UpcomingReminderCard } from '@/components/UpcomingReminderCard';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { doses, addDose, getTodayDoses, getStreak, getWeeklyComplianceData, schedules, isScheduleSet } = useDoseStore();
  const { user, isNewUser, clearNewUserFlag } = useAuthStore();
  const { hasSeenFirstTimeModal, markFirstTimeModalSeen } = useOnboardingStore();
  const [todayDoses, setTodayDoses] = useState<number>(0);
  const [nextDoseTime, setNextDoseTime] = useState<string>('');
  const [streak, setStreak] = useState<number>(0);
  const [complianceData, setComplianceData] = useState<number[]>([]);
  const [showFirstTimeModal, setShowFirstTimeModal] = useState(false);
  
  // Ref for scrolling to package tracker
  const scrollViewRef = useRef<ScrollView>(null);
  const packageTrackerRef = useRef<View>(null);

  const isDesktop = Platform.OS === 'web' && width > 1024;
  const isTablet = width > 768;

  useEffect(() => {
    // Get today's doses
    const todayCompleted = getTodayDoses();
    setTodayDoses(todayCompleted);
    
    // Get streak
    setStreak(getStreak());
    
    // Get compliance data
    const weeklyData = getWeeklyComplianceData();
    setComplianceData(Array.isArray(weeklyData) ? weeklyData : [0, 0, 0, 0, 0, 0, 0]);
    
    // Calculate next dose time based on user's configured schedule
    calculateNextDoseTime(todayCompleted);
  }, [doses, schedules]);

  const calculateNextDoseTime = (completedToday: number) => {
    if (!isScheduleSet || schedules.length === 0) {
      setNextDoseTime('Configure your dose schedule in Track tab');
      return;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes

    // Convert schedule times to minutes for comparison
    const scheduleTimes = schedules.map(schedule => {
      const [time, period] = schedule.time.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      let totalMinutes = hours * 60 + minutes;
      
      if (period === 'PM' && hours !== 12) {
          // Note: addDose already handles local storage through the store
          console.log('Dose added locally for user:', user.id);
        totalMinutes = minutes;
      }
      
      return {
        ...schedule,
        timeInMinutes: totalMinutes
      };
    }).sort((a, b) => a.timeInMinutes - b.timeInMinutes);

    // Find next dose time
    if (completedToday >= schedules.length) {
      // All doses taken for today, next is tomorrow's first dose
      setNextDoseTime(`Tomorrow, ${scheduleTimes[0].time}`);
      return;
    }

    // Find the next scheduled dose that hasn't been taken yet
    const nextSchedule = scheduleTimes.find(schedule => schedule.timeInMinutes > currentTime);
    
    if (nextSchedule) {
      setNextDoseTime(nextSchedule.time);
    } else {
      // No more doses today, next is tomorrow's first dose
      setNextDoseTime(`Tomorrow, ${scheduleTimes[0].time}`);
    }
  };

  useEffect(() => {
    // Show first time modal ONLY if user is new (just signed up) and hasn't seen it yet
    if (isNewUser && !hasSeenFirstTimeModal) {
      const timer = setTimeout(() => {
        setShowFirstTimeModal(true);
      }, 2000); // Show after 2 seconds

      return () => clearTimeout(timer);
    }
  }, [isNewUser, hasSeenFirstTimeModal]);
  
  const today = formatDate(new Date());

  // Get first name from user's full name
  const getFirstName = (fullName: string) => {
    return fullName.split(' ')[0];
  };

  const handleProgressDetails = () => {
    router.push('/(tabs)/progress');
  };

  const handleWebViewPress = () => {
    router.push('/webview-fullscreen');
  };

  const handleReminderChange = (newTime: string) => {
    // This would update the user's schedule - for now just show the change
    setNextDoseTime(newTime);
  };

  const handleCloseFirstTimeModal = () => {
    setShowFirstTimeModal(false);
    markFirstTimeModalSeen();
    clearNewUserFlag(); // Clear the new user flag
  };

  const handleWatchTutorial = () => {
    setShowFirstTimeModal(false);
    markFirstTimeModalSeen();
    clearNewUserFlag(); // Clear the new user flag
    router.replace('/(tabs)/help'); // Navegar para a aba Help (How to Use BlueApp)
  };

  const handlePackageTrack = (trackingNumber: string) => {
    console.log('Tracking package:', trackingNumber);
  };

  const handleScrollToTracker = () => {
    if (packageTrackerRef.current && scrollViewRef.current) {
      packageTrackerRef.current.measureLayout(
        scrollViewRef.current.getInnerViewNode(),
        (x, y) => {
          scrollViewRef.current?.scrollTo({ y: y - 20, animated: true });
        },
        () => {}
      );
    }
  };

  const handleConfigureSchedule = () => {
    router.replace('/(tabs)/track');
  };

  // Calculate realistic completion rate based on actual data
  const calculateCompletionRate = () => {
    if (doses.length === 0) return '0%';
    
    // Get doses from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentDoses = doses.filter(dose => dose.timestamp >= thirtyDaysAgo.getTime());
    
    // Calculate expected doses based on user's schedule
    const expectedDosesPerDay = schedules.length || 2;
    const expectedDoses = expectedDosesPerDay * 30;
    const actualDoses = recentDoses.length;
    
    const rate = Math.round((actualDoses / expectedDoses) * 100);
    return `${Math.min(rate, 100)}%`;
  };

  // Calculate change in completion rate
  const calculateCompletionChange = () => {
    if (doses.length === 0) return '+0%';
    
    // Get doses from last 15 days vs previous 15 days
    const now = new Date();
    const fifteenDaysAgo = new Date(now.getTime() - (15 * 24 * 60 * 60 * 1000));
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    const recentDoses = doses.filter(dose => 
      dose.timestamp >= fifteenDaysAgo.getTime() && dose.timestamp <= now.getTime()
    );
    
    const previousDoses = doses.filter(dose => 
      dose.timestamp >= thirtyDaysAgo.getTime() && dose.timestamp < fifteenDaysAgo.getTime()
    );
    
    const expectedDosesPerDay = schedules.length || 2;
    const expectedDosesPer15Days = expectedDosesPerDay * 15;
    
    const recentRate = (recentDoses.length / expectedDosesPer15Days) * 100;
    const previousRate = (previousDoses.length / expectedDosesPer15Days) * 100;
    
    const change = recentRate - previousRate;
    
    if (change > 0) {
      return `+${Math.round(change)}%`;
    } else if (change < 0) {
      return `${Math.round(change)}%`;
    } else {
      return '0%';
    }
  };

  const completionRate = calculateCompletionRate();
  const completionChange = calculateCompletionChange();
  const isPositiveChange = !completionChange.startsWith('-');

  const totalDosesForToday = schedules.length || 2;

  return (
    <View style={styles.container}>
      <HeaderMenu />
      
      <ScrollView 
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent, 
          { 
            paddingBottom: insets.bottom + 120, // Extra space for bottom icons
          }
        ]}
      >
        {/* Featured Content WebView */}
        <View style={styles.webViewContainer}>
          <WebViewAd onPress={handleWebViewPress} />
        </View>

        <UsefulContainer>
          <View style={[styles.header, isTablet && styles.headerTablet]}>
            <View>
              <Text style={[styles.welcomeText, isTablet && styles.welcomeTextTablet]}>
                Welcome back{user?.name ? `, ${getFirstName(user.name)}` : ''}
              </Text>
              <Text style={[styles.dateText, isTablet && styles.dateTextTablet]}>{today}</Text>
            </View>
            
            {/* Only show today status if schedule is configured */}
            {isScheduleSet && (
              <View style={styles.todayStatus}>
                <CheckCircle size={16} color={todayDoses > 0 ? theme.colors.success[500] : theme.colors.gray[400]} />
                <Text style={styles.todayStatusText}>
                  {todayDoses}/{totalDosesForToday} Doses Today
                </Text>
              </View>
            )}
          </View>

          {/* Schedule Configuration Button - Only show if schedule is NOT set */}
          {!isScheduleSet && (
            <TouchableOpacity 
              style={styles.configureScheduleCard}
              onPress={handleConfigureSchedule}
              activeOpacity={0.7}
            >
              <View style={styles.configureScheduleContent}>
                <Calendar size={20} color={theme.colors.primary[600]} />
                <View style={styles.configureScheduleText}>
                  <Text style={styles.configureScheduleTitle}>Set Up Your Dose Schedule</Text>
                  <Text style={styles.configureScheduleSubtitle}>
                    Configure your personal dose times to get started
                  </Text>
                </View>
                <ChevronRight size={20} color={theme.colors.primary[600]} />
              </View>
            </TouchableOpacity>
          )}
          
          {/* Only show dose tracker if schedule is configured */}
          {isScheduleSet && (
            <DoseTracker 
              completedDoses={todayDoses} 
              totalDoses={totalDosesForToday} 
              onDoseComplete={() => addDose()}
            />
          )}
          
          {isScheduleSet && (
            <UpcomingReminderCard 
              time={nextDoseTime} 
              onReminderChange={handleReminderChange}
            />
          )}

          {/* Tracking Message - Now positioned after Today's Doses */}
          {isScheduleSet && (
            <TouchableOpacity 
              style={styles.trackingMessage}
              onPress={handleScrollToTracker}
              activeOpacity={0.7}
            >
              <View style={styles.trackingMessageContent}>
                <Package size={16} color={theme.colors.warning[600]} />
                <Text style={styles.trackingMessageText}>
                  Still don't have your BlueDrops? Track your package here
                </Text>
                <ArrowDown size={14} color={theme.colors.warning[600]} />
              </View>
            </TouchableOpacity>
          )}
          
          {/* Only show stats if schedule is configured */}
          {isScheduleSet && (
            <View style={styles.statsContainer}>
              <View style={[styles.statsRow, isTablet && styles.statsRowTablet]}>
                <StreakDisplay streak={streak} />
                <ProgressCard 
                  title="Completion Rate" 
                  value={completionRate}
                  change={completionChange}
                  isPositive={isPositiveChange}
                />
              </View>
            </View>
          )}
          
          {/* Only show chart if schedule is configured */}
          {isScheduleSet && (
            <View style={styles.chartContainer}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, isTablet && styles.sectionTitleTablet]}>Weekly Compliance</Text>
                <Pressable onPress={handleProgressDetails}>
                  <Text style={styles.seeAllText}>See Details</Text>
                </Pressable>
              </View>
              <WeeklyComplianceChart data={complianceData} />
            </View>
          )}

          {/* Package Tracking Component - Now at the end */}
          <View ref={packageTrackerRef}>
            <PackageTracker onTrack={handlePackageTrack} />
          </View>
        </UsefulContainer>
      </ScrollView>

      {/* Bottom Icons Bar */}
      <BottomIconsBar />

      {/* First Time User Modal - Only shows for new users */}
      <FirstTimeUserModal
        visible={showFirstTimeModal}
        onClose={handleCloseFirstTimeModal}
        onWatchTutorial={handleWatchTutorial}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  webViewContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 24,
  },
  headerTablet: {
    marginBottom: 32,
  },
  welcomeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: theme.colors.gray[900],
  },
  welcomeTextTablet: {
    fontSize: 24,
  },
  dateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[500],
    marginTop: 4,
  },
  dateTextTablet: {
    fontSize: 16,
  },
  todayStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray[100],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  todayStatusText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: theme.colors.gray[700],
    marginLeft: 6,
  },
  configureScheduleCard: {
    backgroundColor: theme.colors.primary[50],
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.primary[100],
    shadowColor: theme.colors.primary[600],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  configureScheduleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  configureScheduleText: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  configureScheduleTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.primary[800],
    marginBottom: 4,
  },
  configureScheduleSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: theme.colors.primary[600],
    lineHeight: 18,
  },
  trackingMessage: {
    backgroundColor: theme.colors.warning[50],
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.warning[100],
  },
  trackingMessageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  trackingMessageText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: theme.colors.warning[700],
    marginHorizontal: 8,
    textAlign: 'center',
    flex: 1,
  },
  statsContainer: {
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsRowTablet: {
    gap: 20,
  },
  chartContainer: {
    marginTop: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.gray[900],
  },
  sectionTitleTablet: {
    fontSize: 18,
  },
  seeAllText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.primary[600],
  },
});
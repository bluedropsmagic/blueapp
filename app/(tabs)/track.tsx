import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeaderMenu } from '@/components/HeaderMenu';
import { BottomIconsBar } from '@/components/BottomIconsBar';
import { SectionHeader } from '@/components/SectionHeader';
import { UsefulContainer } from '@/components/UsefulContainer';
import { Calendar, ChevronLeft, ChevronRight, Droplet, Activity, Clock, Plus, X, Check, Heart, Sparkles } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useDoseStore } from '@/stores/doseStore';
import { formatDate } from '@/utils/dateUtils';
import DateTimePicker from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';

interface CustomReminder {
  id: string;
  label: string;
  time: string;
  taken: boolean;
}

export default function TrackScreen() {
  const insets = useSafeAreaInsets();
  const { 
    doses, 
    addDose, 
    schedules, 
    setSchedules, 
    isScheduleSet, 
    setScheduleStatus,
    hasAnsweredSymptomsToday,
    saveDailySymptoms,
    getTodaySymptomEntry,
    checkAndResetDaily
  } = useDoseStore();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateString, setDateString] = useState(formatDate(selectedDate));
  const [customReminders, setCustomReminders] = useState<CustomReminder[]>([]);
  
  // Configuration modal states
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [tempSchedules, setTempSchedules] = useState(schedules);
  
  // Add reminder modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReminderLabel, setNewReminderLabel] = useState('');
  const [newReminderTime, setNewReminderTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Check for daily reset on component mount and focus
  useEffect(() => {
    checkAndResetDaily();
  }, []);

  // Initialize reminders from store schedules
  useEffect(() => {
    const initializeReminders = () => {
      const reminders = schedules.map((schedule, index) => ({
        id: `schedule-${index}`,
        label: schedule.label,
        time: schedule.time,
        taken: false
      }));
      setCustomReminders(reminders);
    };

    initializeReminders();
  }, [schedules, selectedDate]);

  // Auto-open configuration modal if no schedule is set
  useEffect(() => {
    if (!isScheduleSet) {
      const timer = setTimeout(() => {
        setShowConfigModal(true);
      }, 500); // Small delay for better UX

      return () => clearTimeout(timer);
    }
  }, [isScheduleSet]);

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
    setDateString(formatDate(newDate));
    resetDailyReminders();
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
    setDateString(formatDate(newDate));
    resetDailyReminders();
  };

  const resetDailyReminders = () => {
    setCustomReminders(prev => prev.map(reminder => ({ ...reminder, taken: false })));
  };

  const handleTakeDose = (reminderId: string) => {
    const reminder = customReminders.find(r => r.id === reminderId);
    if (reminder) {
      addDose(reminder.label, selectedDate);
      setCustomReminders(prev => 
        prev.map(r => r.id === reminderId ? { ...r, taken: true } : r)
      );
    }
  };

  const handleConfigureSchedule = () => {
    setTempSchedules([...schedules]);
    setShowConfigModal(true);
  };

  const handleSaveConfiguration = () => {
    if (tempSchedules.length === 0) {
      Alert.alert('Error', 'Please add at least one dose schedule');
      return;
    }

    setSchedules(tempSchedules);
    setScheduleStatus(true);
    setShowConfigModal(false);
    
    Alert.alert(
      'Schedule Updated',
      `Your dose schedule has been configured with ${tempSchedules.length} daily doses.`,
      [{ text: 'OK' }]
    );
  };

  const handleAddToTempSchedule = () => {
    if (newReminderLabel.trim()) {
      const newSchedule = {
        label: newReminderLabel.trim(),
        time: newReminderTime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })
      };
      
      setTempSchedules(prev => [...prev, newSchedule]);
      setNewReminderLabel('');
      setNewReminderTime(new Date());
      setShowAddModal(false);
    }
  };

  const handleDeleteFromTempSchedule = (index: number) => {
    setTempSchedules(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteReminder = (reminderId: string) => {
    Alert.alert(
      'Delete Reminder',
      'Are you sure you want to delete this reminder?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setCustomReminders(prev => prev.filter(r => r.id !== reminderId));
          }
        }
      ]
    );
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS !== 'web') {
      setShowTimePicker(false);
    }
    
    if (selectedTime) {
      setNewReminderTime(selectedTime);
    }
  };

  const symptoms = [
    { id: 1, name: 'Energy Level', icon: Activity },
    { id: 2, name: 'Sleep Quality', icon: Clock },
    { id: 3, name: 'Mood', icon: Heart },
  ];

  const [symptomRatings, setSymptomRatings] = useState<{ [key: number]: number }>({
    1: 3, // Energy Level
    2: 3, // Sleep Quality  
    3: 3, // Mood
  });

  // Check if user has already answered today and load their answers
  useEffect(() => {
    const todayEntry = getTodaySymptomEntry();
    if (todayEntry) {
      setSymptomRatings(todayEntry.symptoms);
    }
  }, []);

  const trackAllSymptoms = () => {
    // Save the daily symptoms entry
    saveDailySymptoms(symptomRatings);
  };

  // Check if user has already answered today
  const hasAnsweredToday = hasAnsweredSymptomsToday();

  return (
    <View style={styles.container}>
      <HeaderMenu />
      <SectionHeader 
        title="Track Journey" 
        variant="success"
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
          <View style={styles.dateSelector}>
            <TouchableOpacity onPress={goToPreviousDay}>
              <ChevronLeft size={24} color={theme.colors.gray[700]} />
            </TouchableOpacity>
            
            <View style={styles.dateContainer}>
              <Calendar size={18} color={theme.colors.primary[600]} />
              <Text style={styles.dateText}>{dateString}</Text>
            </View>
            
            <TouchableOpacity onPress={goToNextDay}>
              <ChevronRight size={24} color={theme.colors.gray[700]} />
            </TouchableOpacity>
          </View>

          {/* Schedule Configuration Section */}
          <View style={styles.configurationSection}>
            <View style={styles.configHeader}>
              <Text style={styles.configTitle}>Dose Schedule</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.configButton}
              onPress={handleConfigureSchedule}
            >
              <Text style={styles.configButtonText}>Configure Schedule</Text>
            </TouchableOpacity>
          </View>
          
          {/* Only show Today's Doses if schedule is configured */}
          {isScheduleSet && (
            <View style={styles.doseTrackingContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Today's Doses</Text>
                <Text style={styles.doseCounter}>
                  {customReminders.filter(r => r.taken).length}/{customReminders.length}
                </Text>
              </View>
              
              <View style={styles.doseCards}>
                {customReminders.length > 0 ? (
                  customReminders.map((reminder) => (
                    <View key={reminder.id} style={styles.doseCard}>
                      <View style={styles.doseTimeContainer}>
                        <Droplet size={16} color={theme.colors.primary[600]} />
                        <View style={styles.doseInfo}>
                          <Text style={styles.doseLabel}>{reminder.label}</Text>
                          <Text style={styles.doseTime}>({reminder.time})</Text>
                        </View>
                      </View>
                      
                      <View style={styles.doseActions}>
                        {reminder.taken ? (
                          <View style={styles.doseTakenContainer}>
                            <Text style={styles.doseTakenText}>Taken</Text>
                          </View>
                        ) : (
                          <TouchableOpacity 
                            style={styles.takeDoseButton}
                            onPress={() => handleTakeDose(reminder.id)}
                          >
                            <Text style={styles.takeDoseButtonText}>Take</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Clock size={32} color={theme.colors.gray[400]} />
                    <Text style={styles.emptyStateText}>
                      No dose schedule configured yet
                    </Text>
                    <Text style={styles.emptyStateSubtext}>
                      Click above to set up your personal dose times
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
          
          {/* Enhanced Symptoms Container with White Text */}
          <View style={styles.symptomsContainer}>
            <View style={styles.symptomsHeader}>
              <View style={styles.symptomsHeaderContent}>
                <View style={styles.symptomsIconContainer}>
                  <Sparkles size={20} color={theme.colors.white} />
                </View>
                <View style={styles.symptomsHeaderText}>
                  <Text style={styles.symptomsTitle}>Track Symptoms</Text>
                  <Text style={styles.symptomsSubtitle}>
                    Respond daily to get accurate insights into your health progress
                  </Text>
                </View>
              </View>
            </View>
            
            {hasAnsweredToday ? (
              // Show "Already answered today" state with saved message
              <View style={styles.savedMessageContainer}>
                <View style={styles.savedMessageContent}>
                  <View style={styles.savedMessageIcon}>
                    <Check size={32} color={theme.colors.success[600]} />
                  </View>
                  <Text style={styles.savedMessageTitle}>Symptoms Saved Successfully! ✅</Text>
                  <Text style={styles.savedMessageSubtitle}>
                    Your daily symptom tracking has been recorded. Come back tomorrow to track again.
                  </Text>
                </View>
                
                {/* Show today's answers */}
                <View style={styles.todayAnswersContainer}>
                  <Text style={styles.todayAnswersTitle}>Today's Responses:</Text>
                  {symptoms.map((symptom) => (
                    <View key={symptom.id} style={styles.todayAnswerItem}>
                      <View style={styles.todayAnswerLabel}>
                        <symptom.icon size={16} color={theme.colors.gray[600]} />
                        <Text style={styles.todayAnswerName}>{symptom.name}</Text>
                      </View>
                      <Text style={styles.todayAnswerValue}>
                        {symptomRatings[symptom.id]}/5
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              // Show slider-based symptom tracking
              <>
                <View style={styles.symptomSliders}>
                  {symptoms.map((symptom) => (
                    <View key={symptom.id} style={styles.symptomSliderContainer}>
                      <View style={styles.symptomSliderHeader}>
                        <View style={styles.symptomSliderLabelContainer}>
                          <symptom.icon size={18} color={theme.colors.secondary[600]} />
                          <Text style={styles.symptomSliderLabel}>{symptom.name}</Text>
                        </View>
                        <View style={styles.ratingDisplay}>
                          <Text style={styles.ratingValue}>{symptomRatings[symptom.id]}/5</Text>
                        </View>
                      </View>
                      
                      <View style={styles.sliderContainer}>
                        <Text style={styles.sliderMinLabel}>Poor</Text>
                        <Slider
                          style={styles.slider}
                          minimumValue={1}
                          maximumValue={5}
                          step={1}
                          value={symptomRatings[symptom.id]}
                          onValueChange={(value) => {
                            setSymptomRatings(prev => ({
                              ...prev,
                              [symptom.id]: value
                            }));
                          }}
                          minimumTrackTintColor={theme.colors.secondary[600]}
                          maximumTrackTintColor={theme.colors.gray[300]}
                          thumbStyle={styles.sliderThumb}
                        />
                        <Text style={styles.sliderMaxLabel}>Great</Text>
                      </View>
                    </View>
                  ))}
                </View>
                
                {/* Save all symptoms button */}
                <TouchableOpacity 
                  style={styles.saveAllButton}
                  onPress={trackAllSymptoms}
                >
                  <Check size={16} color={theme.colors.white} />
                  <Text style={styles.saveAllButtonText}>Save All Symptoms</Text>
                </TouchableOpacity>
              </>
            )}
            
            {/* Daily tracking reminder */}
            <Text style={styles.dailyReminder}>
              Respond daily to get accurate insights into your health progress
            </Text>
          </View>
        </UsefulContainer>
      </ScrollView>

      {/* Bottom Icons Bar */}
      <BottomIconsBar />

      {/* Schedule Configuration Modal */}
      <Modal
        visible={showConfigModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowConfigModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.configModalContent}>
            <View style={styles.configModalHeader}>
              <Text style={styles.configModalTitle}>Configure Dose Schedule</Text>
              <TouchableOpacity onPress={() => setShowConfigModal(false)}>
                <X size={24} color={theme.colors.gray[600]} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.configModalBody}>
              <Text style={styles.configDescription}>
                Set up your personal dose schedule. You can add multiple doses throughout the day.
              </Text>
              
              <View style={styles.scheduleList}>
                {tempSchedules.map((schedule, index) => (
                  <View key={index} style={styles.scheduleItem}>
                    <View style={styles.scheduleInfo}>
                      <Text style={styles.scheduleLabel}>{schedule.label}</Text>
                      <Text style={styles.scheduleTime}>{schedule.time}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.deleteScheduleButton}
                      onPress={() => handleDeleteFromTempSchedule(index)}
                    >
                      <X size={16} color={theme.colors.error[500]} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
              
              <TouchableOpacity 
                style={styles.addScheduleButton}
                onPress={() => setShowAddModal(true)}
              >
                <Plus size={16} color={theme.colors.primary[600]} />
                <Text style={styles.addScheduleButtonText}>Add Dose Time</Text>
              </TouchableOpacity>
            </ScrollView>
            
            <View style={styles.configModalFooter}>
              <TouchableOpacity 
                style={styles.cancelConfigButton} 
                onPress={() => setShowConfigModal(false)}
              >
                <Text style={styles.cancelConfigButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.saveConfigButton,
                  tempSchedules.length === 0 && styles.saveConfigButtonDisabled
                ]}
                onPress={handleSaveConfiguration}
                disabled={tempSchedules.length === 0}
              >
                <Check size={16} color={theme.colors.white} />
                <Text style={styles.saveConfigButtonText}>Save Schedule</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Reminder Modal */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Dose Time</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Dose Name</Text>
              <TextInput
                style={styles.textInput}
                value={newReminderLabel}
                onChangeText={setNewReminderLabel}
                placeholder="e.g., Morning Dose, Evening Dose"
                placeholderTextColor={theme.colors.gray[400]}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Time</Text>
              <TouchableOpacity 
                style={styles.timeButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Clock size={16} color={theme.colors.primary[600]} />
                <Text style={styles.timeButtonText}>
                  {newReminderTime.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowAddModal(false)}
              >
                <X size={16} color={theme.colors.gray[600]} />
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.confirmButton,
                  !newReminderLabel.trim() && styles.confirmButtonDisabled
                ]}
                onPress={handleAddToTempSchedule}
                disabled={!newReminderLabel.trim()}
              >
                <Check size={16} color={theme.colors.white} />
                <Text style={styles.confirmButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={newReminderTime}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={handleTimeChange}
        />
      )}
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
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    marginTop: 24,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary[50],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  dateText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.primary[700],
    marginLeft: 8,
  },
  configurationSection: {
    marginBottom: 24,
  },
  configHeader: {
    marginBottom: 12,
  },
  configTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.gray[900],
  },
  configButton: {
    backgroundColor: theme.colors.primary[600],
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  configButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.white,
  },
  doseTrackingContainer: {
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
  doseCounter: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: theme.colors.primary[600],
    backgroundColor: theme.colors.primary[50],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  doseCards: {
    gap: 12,
  },
  doseCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    padding: 16,
    borderRadius: 12,
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  doseTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  doseInfo: {
    marginLeft: 8,
  },
  doseLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.gray[800],
  },
  doseTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: theme.colors.gray[500],
    marginTop: 2,
  },
  doseActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  takeDoseButton: {
    backgroundColor: theme.colors.primary[600],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  takeDoseButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: theme.colors.white,
  },
  doseTakenContainer: {
    backgroundColor: theme.colors.success[100],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  doseTakenText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: theme.colors.success[700],
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: theme.colors.gray[50],
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.gray[200],
    borderStyle: 'dashed',
  },
  emptyStateText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.gray[600],
    marginTop: 12,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[500],
    marginTop: 4,
    textAlign: 'center',
  },
  symptomsContainer: {
    marginBottom: 32,
  },
  symptomsHeader: {
    backgroundColor: theme.colors.secondary[600],
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: theme.colors.secondary[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  symptomsHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  symptomsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.secondary[700],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  symptomsHeaderText: {
    flex: 1,
  },
  symptomsTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.white,
  },
  symptomsSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: theme.colors.white,
    marginTop: 4,
    opacity: 0.9,
    lineHeight: 18,
  },
  savedMessageContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  savedMessageContent: {
    alignItems: 'center',
    marginBottom: 20,
  },
  savedMessageIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.success[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: theme.colors.success[200],
  },
  savedMessageTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: theme.colors.success[700],
    marginBottom: 8,
    textAlign: 'center',
  },
  savedMessageSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[600],
    textAlign: 'center',
    lineHeight: 20,
  },
  todayAnswersContainer: {
    backgroundColor: theme.colors.gray[50],
    borderRadius: 8,
    padding: 16,
  },
  todayAnswersTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: theme.colors.gray[800],
    marginBottom: 12,
  },
  todayAnswerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  todayAnswerLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  todayAnswerName: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.gray[700],
    marginLeft: 8,
  },
  todayAnswerValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: theme.colors.secondary[600],
  },
  symptomSliders: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  symptomSliderContainer: {
    marginBottom: 24,
  },
  symptomSliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  symptomSliderLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  symptomSliderLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.gray[800],
    marginLeft: 8,
  },
  ratingDisplay: {
    backgroundColor: theme.colors.secondary[100],
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: theme.colors.secondary[700],
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  sliderMinLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: theme.colors.gray[500],
    width: 40,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 12,
  },
  sliderThumb: {
    backgroundColor: theme.colors.secondary[600],
    width: 20,
    height: 20,
  },
  sliderMaxLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: theme.colors.gray[500],
    width: 40,
    textAlign: 'right',
  },
  saveAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.secondary[600],
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: theme.colors.secondary[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveAllButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.white,
    marginLeft: 8,
  },
  dailyReminder: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: theme.colors.gray[600],
    textAlign: 'center',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  configModalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  configModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[100],
  },
  configModalTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: theme.colors.gray[900],
  },
  configModalBody: {
    padding: 20,
    maxHeight: 400,
  },
  configDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[600],
    lineHeight: 20,
    marginBottom: 20,
  },
  scheduleList: {
    marginBottom: 20,
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.gray[50],
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.gray[800],
  },
  scheduleTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: theme.colors.gray[500],
    marginTop: 2,
  },
  deleteScheduleButton: {
    padding: 4,
  },
  addScheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[50],
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.primary[200],
    borderStyle: 'dashed',
  },
  addScheduleButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.primary[600],
    marginLeft: 6,
  },
  configModalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[100],
  },
  cancelConfigButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.gray[100],
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelConfigButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.gray[600],
  },
  saveConfigButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[600],
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveConfigButtonDisabled: {
    backgroundColor: theme.colors.gray[300],
  },
  saveConfigButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.white,
    marginLeft: 6,
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: theme.colors.gray[900],
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.gray[700],
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[800],
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  timeButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.gray[800],
    marginLeft: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.gray[100],
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.gray[600],
    marginLeft: 6,
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[600],
    paddingVertical: 12,
    borderRadius: 8,
  },
  confirmButtonDisabled: {
    backgroundColor: theme.colors.gray[300],
  },
  confirmButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.white,
    marginLeft: 6,
  },
});
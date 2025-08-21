import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import { Bell, Clock, Check, X, Settings } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';

type UpcomingReminderCardProps = {
  time: string;
  onReminderChange?: (newTime: string) => void;
};

export const UpcomingReminderCard = ({ time, onReminderChange }: UpcomingReminderCardProps) => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());

  const handleChangePress = () => {
    // Navigate to Track tab for schedule configuration
    router.push('/(tabs)/track');
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS !== 'web') {
      setShowTimePicker(false);
    }
    
    if (selectedDate) {
      setSelectedTime(selectedDate);
      if (Platform.OS !== 'web') {
        confirmTimeChange(selectedDate);
      }
    }
  };

  const confirmTimeChange = (newTime: Date) => {
    const formattedTime = newTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    onReminderChange?.(formattedTime);
    setShowModal(false);
    
    Alert.alert(
      'Reminder Updated',
      `Your next dose reminder has been set for ${formattedTime}`
    );
  };

  const handleCancel = () => {
    setShowModal(false);
    setShowTimePicker(false);
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Bell size={16} color={theme.colors.white} />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>Next Dose</Text>
          <View style={styles.timeContainer}>
            <Clock size={12} color={theme.colors.gray[500]} />
            <Text style={styles.time}>{time}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.reminderButton} onPress={handleChangePress}>
          <Settings size={10} color={theme.colors.white} />
          <Text style={styles.reminderButtonText}>Change</Text>
        </TouchableOpacity>
      </View>

      {/* Web Modal */}
      {Platform.OS === 'web' && (
        <Modal
          visible={showModal}
          transparent={true}
          animationType="fade"
          onRequestClose={handleCancel}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Change Reminder Time</Text>
              
              <View style={styles.timePickerContainer}>
                <input
                  type="time"
                  value={selectedTime.toTimeString().slice(0, 5)}
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(':');
                    const newTime = new Date(selectedTime);
                    newTime.setHours(parseInt(hours), parseInt(minutes));
                    setSelectedTime(newTime);
                  }}
                  style={styles.webTimePicker}
                />
              </View>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                  <X size={16} color={theme.colors.gray[600]} />
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.confirmButton} 
                  onPress={() => confirmTimeChange(selectedTime)}
                >
                  <Check size={16} color={theme.colors.white} />
                  <Text style={styles.confirmButtonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Native Time Picker */}
      {showTimePicker && Platform.OS !== 'web' && (
        <DateTimePicker
          value={selectedTime}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary[50],
    borderRadius: 8,
    padding: 12, // Reduced from 16 to 12
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.primary[100],
  },
  iconContainer: {
    backgroundColor: theme.colors.primary[600],
    width: 32, // Reduced from 40 to 32
    height: 32, // Reduced from 40 to 32
    borderRadius: 16, // Reduced from 20 to 16
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10, // Reduced from 12 to 10
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14, // Reduced from 16 to 14
    color: theme.colors.gray[900],
    marginBottom: 2, // Reduced from 4 to 2
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontFamily: 'Inter-Medium',
    fontSize: 12, // Reduced from 14 to 12
    color: theme.colors.gray[600],
    marginLeft: 4, // Reduced from 6 to 4
  },
  reminderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary[600],
    paddingHorizontal: 10, // Reduced from 12 to 10
    paddingVertical: 6, // Reduced from 8 to 6
    borderRadius: 6,
  },
  reminderButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 11, // Reduced from 12 to 11
    color: theme.colors.white,
    marginLeft: 3, // Reduced from 4 to 3
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 320,
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
  timePickerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  webTimePicker: {
    fontSize: 18,
    padding: 12,
    borderRadius: 8,
    border: `2px solid ${theme.colors.primary[200]}`,
    backgroundColor: theme.colors.white,
    color: theme.colors.gray[800],
    fontFamily: 'Inter-Medium',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
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
  confirmButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.white,
    marginLeft: 6,
  },
});
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Video, X, ArrowRight } from 'lucide-react-native';
import { theme } from '@/constants/theme';

type FirstTimeUserModalProps = {
  visible: boolean;
  onClose: () => void;
  onWatchTutorial: () => void;
};

export const FirstTimeUserModal = ({ visible, onClose, onWatchTutorial }: FirstTimeUserModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={20} color={theme.colors.gray[500]} />
          </TouchableOpacity>
          
          <View style={styles.iconContainer}>
            <Video size={48} color={theme.colors.primary[600]} />
          </View>
          
          <Text style={styles.title}>First time using BlueApp?</Text>
          <Text style={styles.description}>
            Learn how to use all BlueApp features and get the most out of your health tracking journey.
          </Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.tutorialButton} onPress={onWatchTutorial}>
              <Video size={20} color={theme.colors.white} />
              <Text style={styles.tutorialButtonText}>How to Use BlueApp</Text>
              <ArrowRight size={16} color={theme.colors.white} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.skipButton} onPress={onClose}>
              <Text style={styles.skipButtonText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.footerText}>
            You can always access the tutorial later from the menu
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: theme.colors.white,
    borderRadius: 20,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 3,
    borderColor: theme.colors.primary[100],
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: theme.colors.gray[900],
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: theme.colors.gray[600],
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 20,
  },
  tutorialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[600],
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: theme.colors.primary[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  tutorialButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.white,
    marginHorizontal: 8,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.gray[500],
  },
  footerText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: theme.colors.gray[400],
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
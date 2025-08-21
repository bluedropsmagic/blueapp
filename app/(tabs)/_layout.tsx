import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { theme } from '@/shared/constants/theme';

export default function TabLayout() {
  return (
    <View style={styles.container}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="progress" />
        <Stack.Screen name="track" />
        <Stack.Screen name="index" />
        <Stack.Screen name="learn" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="how-to-use" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="help" />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
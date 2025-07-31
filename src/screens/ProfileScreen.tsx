import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { GradientBackground } from '../components/GradientBackground';
import { useGradient } from '../hooks/useGradient';
import { COLORS } from '../constants';

export const ProfileScreen: React.FC = () => {
  const { currentGradient } = useGradient();

  return (
    <GradientBackground colors={currentGradient}>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Coming Soon</Text>
          <Text style={styles.description}>
            View your journal stats and preferences
          </Text>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.8,
    textAlign: 'center',
  },
});
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, ViewStyle } from 'react-native';

interface GradientBackgroundProps {
  colors: {
    start: string;
    end: string;
  };
  style?: ViewStyle;
  children: React.ReactNode;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({ 
  colors, 
  style, 
  children 
}) => {
  return (
    <LinearGradient
      colors={[colors.start, colors.end]}
      style={[styles.gradient, style]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});
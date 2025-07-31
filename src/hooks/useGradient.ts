import { useMemo } from 'react';
import { GRADIENT_COLORS } from '../constants';

export const useGradient = () => {
  const getCurrentTimeSlot = (): 'morning' | 'afternoon' | 'evening' => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    return 'evening';
  };

  const getGradientForTimeSlot = (timeSlot: 'morning' | 'afternoon' | 'evening') => {
    return GRADIENT_COLORS[timeSlot];
  };

  const currentGradient = useMemo(() => {
    const timeSlot = getCurrentTimeSlot();
    return getGradientForTimeSlot(timeSlot);
  }, []);

  return {
    currentGradient,
    getCurrentTimeSlot,
    getGradientForTimeSlot,
    gradientColors: GRADIENT_COLORS
  };
};
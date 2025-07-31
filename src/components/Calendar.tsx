import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  markedDates: string[]; // Array of date strings (YYYY-MM-DD) that have entries
}

const { width } = Dimensions.get('window');
const CALENDAR_WIDTH = width - 32;
const DAY_WIDTH = CALENDAR_WIDTH / 7;

export const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  onDateSelect,
  markedDates,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setCurrentMonth(subMonths(currentMonth, 1))}
          style={styles.headerButton}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>
          {format(currentMonth, 'MMMM yyyy')}
        </Text>
        
        <TouchableOpacity
          onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}
          style={styles.headerButton}
        >
          <Ionicons name="chevron-forward" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderDaysOfWeek = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <View style={styles.weekDays}>
        {days.map((day) => (
          <View key={day} style={styles.weekDay}>
            <Text style={styles.weekDayText}>{day}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = 'd';
    const rows = [];

    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const cloneDay = day;
        const dateString = format(day, 'yyyy-MM-dd');
        const hasEntries = markedDates.includes(dateString);
        
        days.push(
          <TouchableOpacity
            key={day.toString()}
            style={[
              styles.day,
              !isSameMonth(day, monthStart) && styles.dayOutsideMonth,
              isSameDay(day, selectedDate) && styles.selectedDay,
              isToday(day) && styles.today,
            ]}
            onPress={() => onDateSelect(cloneDay)}
          >
            <Text
              style={[
                styles.dayText,
                !isSameMonth(day, monthStart) && styles.dayTextOutsideMonth,
                isSameDay(day, selectedDate) && styles.selectedDayText,
                isToday(day) && styles.todayText,
              ]}
            >
              {formattedDate}
            </Text>
            {hasEntries && (
              <View style={[
                styles.dot,
                isSameDay(day, selectedDate) && styles.selectedDot,
              ]} />
            )}
          </TouchableOpacity>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <View key={day.toString()} style={styles.week}>
          {days}
        </View>
      );
      days = [];
    }

    return <View style={styles.days}>{rows}</View>;
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderDaysOfWeek()}
      {renderDays()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDay: {
    width: DAY_WIDTH,
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  days: {
    
  },
  week: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  day: {
    width: DAY_WIDTH,
    height: DAY_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dayOutsideMonth: {
    opacity: 0.3,
  },
  selectedDay: {
    backgroundColor: COLORS.primary,
    borderRadius: DAY_WIDTH / 2,
  },
  today: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: DAY_WIDTH / 2,
  },
  dayText: {
    fontSize: 16,
    color: COLORS.text.primary,
  },
  dayTextOutsideMonth: {
    color: COLORS.text.light,
  },
  selectedDayText: {
    color: 'white',
    fontWeight: '600',
  },
  todayText: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  dot: {
    position: 'absolute',
    bottom: 8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
  selectedDot: {
    backgroundColor: 'white',
  },
});
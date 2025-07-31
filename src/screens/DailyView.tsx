import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  ScrollView,
  SafeAreaView,
  TouchableOpacity
} from 'react-native';
import { format } from 'date-fns';
import { useNavigation, useRoute, RouteProp, useFocusEffect, CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { EntryCard } from '../components/EntryCard';
import { GradientBackground } from '../components/GradientBackground';
import { useGradient } from '../hooks/useGradient';
import { MediaEntry, DailyEntries } from '../types';
import { StorageService } from '../utils/storage';
import { TIME_SLOTS } from '../constants';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, TabParamList } from '../../App';

type DailyViewNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Today'>,
  StackNavigationProp<RootStackParamList>
>;
type DailyViewRouteProp = RouteProp<TabParamList, 'Today'>;

export const DailyView: React.FC = () => {
  const navigation = useNavigation<DailyViewNavigationProp>();
  const route = useRoute<DailyViewRouteProp>();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [entries, setEntries] = useState<DailyEntries>({});
  const { currentGradient, getGradientForTimeSlot } = useGradient();

  useEffect(() => {
    loadEntriesForDate();
  }, [currentDate]);

  useFocusEffect(
    React.useCallback(() => {
      if (route.params?.newEntry) {
        const { entry, date, timeSlot, slotIndex } = route.params.newEntry;
        handleNewEntry(entry, date, timeSlot, slotIndex);
        navigation.setParams({ newEntry: undefined });
      }
    }, [route.params?.newEntry])
  );

  const loadEntriesForDate = async () => {
    const dateString = format(currentDate, 'yyyy-MM-dd');
    const dayEntries = await StorageService.getDailyEntries(dateString);
    if (dayEntries) {
      setEntries(dayEntries);
    } else {
      setEntries({});
    }
  };

  const handleNewEntry = async (entry: MediaEntry, date: string, timeSlot: string, slotIndex: number) => {
    const updatedEntries = { ...entries };
    const key = `${timeSlot}_${slotIndex}`;
    updatedEntries[key] = entry;
    
    setEntries(updatedEntries);
    await StorageService.saveDailyEntries(date, updatedEntries);
  };

  const handleEntryPress = (timeSlot: 'morning' | 'afternoon' | 'evening', slotIndex: number) => {
    const key = `${timeSlot}_${slotIndex}`;
    const existingEntry = entries[key];
    
    navigation.navigate('EntryCreation', {
      date: format(currentDate, 'yyyy-MM-dd'),
      timeSlot,
      slotIndex,
      existingEntry,
    });
  };

  const handleEditEntry = (timeSlot: 'morning' | 'afternoon' | 'evening', slotIndex: 0 | 1) => {
    const key = `${timeSlot}_${slotIndex}`;
    const existingEntry = entries[key];
    
    if (existingEntry) {
      navigation.navigate('EntryCreation', {
        date: format(currentDate, 'yyyy-MM-dd'),
        timeSlot,
        slotIndex,
        existingEntry,
      });
    }
  };

  const handleDeleteEntry = async (timeSlot: 'morning' | 'afternoon' | 'evening', slotIndex: 0 | 1) => {
    const updatedEntries = { ...entries };
    const key = `${timeSlot}_${slotIndex}`;
    delete updatedEntries[key];
    
    setEntries(updatedEntries);
    await StorageService.saveDailyEntries(format(currentDate, 'yyyy-MM-dd'), updatedEntries);
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const getEntryForSlot = (timeSlot: string, slotIndex: number) => {
    const key = `${timeSlot}_${slotIndex}`;
    return entries[key];
  };

  const renderTimeSlot = (timeSlot: 'morning' | 'afternoon' | 'evening') => {
    const slotGradient = getGradientForTimeSlot(timeSlot);
    
    return (
      <View key={timeSlot} style={styles.timeSlot}>
        <View style={[styles.timeSlotHeader, { backgroundColor: slotGradient.start }]}>
          <Text style={styles.timeSlotTitle}>
            {timeSlot.charAt(0).toUpperCase() + timeSlot.slice(1)}
          </Text>
        </View>
        <View style={styles.cardsRow}>
          <EntryCard
            entry={getEntryForSlot(timeSlot, 0)}
            timeSlot={timeSlot}
            slotIndex={0}
            onPress={() => handleEntryPress(timeSlot, 0)}
            onEdit={() => handleEditEntry(timeSlot, 0)}
            onDelete={() => handleDeleteEntry(timeSlot, 0)}
          />
          <EntryCard
            entry={getEntryForSlot(timeSlot, 1)}
            timeSlot={timeSlot}
            slotIndex={1}
            onPress={() => handleEntryPress(timeSlot, 1)}
            onEdit={() => handleEditEntry(timeSlot, 1)}
            onDelete={() => handleDeleteEntry(timeSlot, 1)}
          />
        </View>
      </View>
    );
  };

  return (
    <GradientBackground colors={currentGradient}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigateDate('prev')}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>
              {format(currentDate, 'EEEE')}
            </Text>
            <Text style={styles.dateNumber}>
              {format(currentDate, 'MMMM d, yyyy')}
            </Text>
          </View>
          
          <TouchableOpacity onPress={() => navigateDate('next')}>
            <Ionicons name="chevron-forward" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {TIME_SLOTS.map(slot => renderTimeSlot(slot as any))}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 8,
  },
  dateContainer: {
    alignItems: 'center',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  dateNumber: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  timeSlot: {
    marginBottom: 24,
  },
  timeSlotHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  timeSlotTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
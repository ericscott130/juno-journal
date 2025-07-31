import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { format } from 'date-fns';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { GradientBackground } from '../components/GradientBackground';
import { Calendar } from '../components/Calendar';
import { useGradient } from '../hooks/useGradient';
import { StorageService } from '../utils/storage';
import { COLORS } from '../constants';
import { DailyEntries } from '../types';
import { RootStackParamList, TabParamList } from '../../App';

type BrowseNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Browse'>,
  StackNavigationProp<RootStackParamList>
>;

export const BrowseScreen: React.FC = () => {
  const navigation = useNavigation<BrowseNavigationProp>();
  const { currentGradient } = useGradient();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [markedDates, setMarkedDates] = useState<string[]>([]);
  const [selectedDateEntries, setSelectedDateEntries] = useState<DailyEntries | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalEntries, setTotalEntries] = useState(0);

  useEffect(() => {
    loadAllDates();
  }, []);

  useEffect(() => {
    loadEntriesForDate(selectedDate);
  }, [selectedDate]);

  const loadAllDates = async () => {
    try {
      const dates = await StorageService.getAllDates();
      setMarkedDates(dates);
      
      // Calculate total entries
      let total = 0;
      for (const date of dates) {
        const entries = await StorageService.getDailyEntries(date);
        if (entries) {
          total += Object.keys(entries).length;
        }
      }
      setTotalEntries(total);
    } catch (error) {
      console.error('Error loading dates:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEntriesForDate = async (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const entries = await StorageService.getDailyEntries(dateString);
    setSelectedDateEntries(entries);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const navigateToDay = () => {
    // Navigate to Today tab with the selected date
    navigation.navigate('Today', {
      selectedDate: format(selectedDate, 'yyyy-MM-dd'),
    });
  };

  const getEntryCount = () => {
    if (!selectedDateEntries) return 0;
    return Object.keys(selectedDateEntries).length;
  };

  const renderSelectedDateInfo = () => {
    const entryCount = getEntryCount();
    const dateString = format(selectedDate, 'EEEE, MMMM d, yyyy');
    
    return (
      <View style={styles.dateInfo}>
        <View style={styles.dateHeader}>
          <View>
            <Text style={styles.dateText}>{dateString}</Text>
            <Text style={styles.entryCountText}>
              {entryCount === 0 
                ? 'No entries' 
                : `${entryCount} ${entryCount === 1 ? 'entry' : 'entries'}`}
            </Text>
          </View>
          {entryCount > 0 && (
            <TouchableOpacity 
              style={styles.viewButton}
              onPress={navigateToDay}
            >
              <Text style={styles.viewButtonText}>View Day</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {entryCount > 0 && selectedDateEntries && (
          <View style={styles.entryPreview}>
            {Object.entries(selectedDateEntries).map(([key, entry]) => {
              const [timeSlot, slotIndex] = key.split('_');
              return (
                <View key={key} style={styles.entryItem}>
                  <Text style={styles.entryTime}>
                    {timeSlot.charAt(0).toUpperCase() + timeSlot.slice(1)}
                  </Text>
                  <Text style={styles.entryType}>{entry.type}</Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  const renderStats = () => {
    return (
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{markedDates.length}</Text>
          <Text style={styles.statLabel}>Days Journaled</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalEntries}</Text>
          <Text style={styles.statLabel}>Total Entries</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <GradientBackground colors={currentGradient}>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
          </View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground colors={currentGradient}>
      <SafeAreaView style={styles.container}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Browse Entries</Text>
          
          {renderStats()}
          
          <Calendar
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            markedDates={markedDates}
          />
          
          {renderSelectedDateInfo()}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 20,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  dateInfo: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  entryCountText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  viewButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  viewButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  entryPreview: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
  },
  entryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  entryTime: {
    fontSize: 14,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  entryType: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textTransform: 'capitalize',
  },
});
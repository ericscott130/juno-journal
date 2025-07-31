import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { format } from 'date-fns';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { TimelineView } from '../components/TimelineView';
import { QuickCapture } from '../components/QuickCapture';
import { MediaEntry } from '../types';
import { StorageService } from '../utils/storage';
import { COLORS } from '../constants';
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
  const [currentDate, setCurrentDate] = useState(() => {
    if (route.params?.selectedDate) {
      return new Date(route.params.selectedDate);
    }
    return new Date();
  });
  const [entries, setEntries] = useState<MediaEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showQuickCapture, setShowQuickCapture] = useState(false);
  const quickCaptureRef = useRef<any>(null);

  useEffect(() => {
    loadEntriesForDate();
    setShowQuickCapture(false); // Reset when date changes
  }, [currentDate]);

  // Refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadEntriesForDate();
    }, [currentDate])
  );

  const loadEntriesForDate = async () => {
    setIsLoading(true);
    try {
      const dateString = format(currentDate, 'yyyy-MM-dd');
      const timelineEntries = await StorageService.getTimelineEntries(dateString);
      setEntries(timelineEntries);
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewEntry = async (entry: MediaEntry) => {
    const dateString = format(currentDate, 'yyyy-MM-dd');
    await StorageService.saveTimelineEntry(dateString, entry);
    setEntries([...entries, entry]);
  };

  const handleDeleteEntry = async (entry: MediaEntry) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            const dateString = format(currentDate, 'yyyy-MM-dd');
            await StorageService.deleteTimelineEntry(dateString, entry.id);
            setEntries(entries.filter(e => e.id !== entry.id));
          }
        }
      ]
    );
  };

  const handleEntryPress = (entry: MediaEntry) => {
    if (entry.type === 'image') {
      // Could navigate to a full-screen image viewer
      Alert.alert('Image Entry', 'Full image view coming soon!');
    } else {
      Alert.alert(
        entry.type === 'note' ? 'Note' : 'Link',
        entry.content,
        [{ text: 'OK' }]
      );
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const isToday = format(currentDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigateDate('prev')} style={styles.navButton}>
            <Ionicons name="chevron-back" size={28} color={COLORS.text.primary} />
          </TouchableOpacity>
          
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>
              {format(currentDate, 'EEEE')}
            </Text>
            <Text style={styles.dateNumber}>
              {format(currentDate, 'MMMM d, yyyy')}
            </Text>
            {!isToday && (
              <TouchableOpacity onPress={() => setCurrentDate(new Date())}>
                <Text style={styles.todayLink}>Go to Today</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity onPress={() => navigateDate('next')} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={28} color={COLORS.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Add Entry Button - only show if QuickCapture isn't visible */}
        {!showQuickCapture && !isToday && (
          <TouchableOpacity 
            style={styles.addEntryButton} 
            onPress={() => {
              console.log('Add Entry button pressed');
              setShowQuickCapture(true);
            }}
            activeOpacity={0.8}
          >
            <View style={styles.addEntryContent}>
              <View style={styles.addEntryIconContainer}>
                <Ionicons name="add-circle" size={32} color={COLORS.primary} />
              </View>
              <View style={styles.addEntryTextContainer}>
                <Text style={styles.addEntryText}>Add Entry</Text>
                <Text style={styles.addEntrySubtext}>Capture a moment from {format(currentDate, 'MMMM d')}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Timeline */}
        <View style={styles.timelineContainer}>
          <TimelineView
            entries={entries}
            onEntryPress={handleEntryPress}
            onDeleteEntry={handleDeleteEntry}
          />
        </View>

        {/* Quick Capture */}
        {(isToday || showQuickCapture) && (
          <QuickCapture
            ref={quickCaptureRef}
            onNewEntry={(entry) => {
              handleNewEntry(entry);
              if (!isToday) {
                setShowQuickCapture(false);
              }
            }}
            currentDate={format(currentDate, 'yyyy-MM-dd')}
          />
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  navButton: {
    padding: 4,
  },
  dateContainer: {
    alignItems: 'center',
    flex: 1,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  dateNumber: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  todayLink: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 4,
    textDecorationLine: 'underline',
  },
  timelineContainer: {
    flex: 1,
  },
  addEntryButton: {
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: `${COLORS.primary}08`,
    borderRadius: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1.5,
    borderColor: `${COLORS.primary}20`,
    overflow: 'hidden',
  },
  addEntryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    position: 'relative',
  },
  addEntryIconContainer: {
    marginRight: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addEntryTextContainer: {
    flex: 1,
  },
  addEntryText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 2,
  },
  addEntrySubtext: {
    fontSize: 13,
    color: COLORS.text.secondary,
  },
});
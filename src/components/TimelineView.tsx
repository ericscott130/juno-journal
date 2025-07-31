import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { MediaEntry } from '../types';
import { COLORS } from '../constants';

interface TimelineViewProps {
  entries: MediaEntry[];
  onEntryPress?: (entry: MediaEntry) => void;
  onDeleteEntry?: (entry: MediaEntry) => void;
}

const TimelineEntry: React.FC<{ 
  entry: MediaEntry; 
  onPress?: () => void;
  onDelete?: () => void;
  isFirst: boolean;
  isLast: boolean;
}> = ({ entry, onPress, onDelete, isFirst, isLast }) => {
  const entryTime = new Date(entry.createdAt);
  const timeString = format(entryTime, 'h:mm a');
  
  const getIcon = () => {
    switch (entry.type) {
      case 'image': return 'image';
      case 'note': return 'document-text';
      case 'link': return 'link';
      default: return 'ellipse';
    }
  };

  const handleLinkPress = () => {
    if (entry.type === 'link' && entry.content) {
      Linking.openURL(entry.content);
    }
  };

  return (
    <View style={styles.timelineEntry}>
      <View style={styles.timelineLeft}>
        <Text style={styles.timeText}>{timeString}</Text>
        <View style={styles.timelineLine}>
          {!isFirst && <View style={styles.lineTop} />}
          <View style={styles.dot} />
          {!isLast && <View style={styles.lineBottom} />}
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.entryCard} 
        onPress={onPress}
        activeOpacity={0.9}
      >
        <View style={styles.entryHeader}>
          <View style={styles.entryIcon}>
            <Ionicons name={getIcon() as any} size={20} color={COLORS.primary} />
          </View>
          {onDelete && (
            <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.entryContent}>
          {entry.type === 'image' ? (
            <Image source={{ uri: entry.content }} style={styles.entryImage} />
          ) : entry.type === 'note' ? (
            <Text style={styles.noteText}>{entry.content}</Text>
          ) : (
            <TouchableOpacity onPress={handleLinkPress}>
              <Text style={styles.linkText} numberOfLines={2}>
                {entry.content}
              </Text>
            </TouchableOpacity>
          )}
          
          {entry.metadata?.tags && entry.metadata.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {entry.metadata.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

export const TimelineView: React.FC<TimelineViewProps> = ({ 
  entries, 
  onEntryPress,
  onDeleteEntry 
}) => {
  // Sort entries by creation time
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  if (entries.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="time-outline" size={48} color="#ccc" />
        <Text style={styles.emptyText}>No entries yet today</Text>
        <Text style={styles.emptySubtext}>
          Start capturing moments with the + button
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {sortedEntries.map((entry, index) => (
        <TimelineEntry
          key={entry.id}
          entry={entry}
          onPress={() => onEntryPress?.(entry)}
          onDelete={() => onDeleteEntry?.(entry)}
          isFirst={index === 0}
          isLast={index === sortedEntries.length - 1}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 100,
  },
  timelineEntry: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  timelineLeft: {
    width: 60,
    alignItems: 'flex-end',
    marginRight: 16,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.text.light,
    marginBottom: 6,
  },
  timelineLine: {
    position: 'absolute',
    right: 0,
    top: 20,
    bottom: -20,
    width: 2,
    alignItems: 'center',
  },
  lineTop: {
    position: 'absolute',
    top: -20,
    width: 2,
    height: 20,
    backgroundColor: '#E0E0E0',
  },
  lineBottom: {
    position: 'absolute',
    top: 12,
    width: 2,
    height: '100%',
    backgroundColor: '#E0E0E0',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.white,
    zIndex: 1,
  },
  entryCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  entryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    padding: 4,
  },
  entryContent: {
    flex: 1,
  },
  entryImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  noteText: {
    fontSize: 16,
    color: COLORS.text.primary,
    lineHeight: 24,
  },
  linkText: {
    fontSize: 16,
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.text.secondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.text.light,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
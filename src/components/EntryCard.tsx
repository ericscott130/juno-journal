import React, { useState } from 'react';
import { 
  TouchableOpacity, 
  StyleSheet, 
  Text, 
  View, 
  Image,
  Dimensions,
  Alert,
  ActionSheetIOS,
  Platform
} from 'react-native';
import { MediaEntry } from '../types';
import { Ionicons } from '@expo/vector-icons';

interface EntryCardProps {
  entry?: MediaEntry;
  timeSlot: 'morning' | 'afternoon' | 'evening';
  slotIndex: 0 | 1;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 48) / 2; // 2 cards per row with padding

export const EntryCard: React.FC<EntryCardProps> = ({ 
  entry, 
  timeSlot, 
  slotIndex, 
  onPress,
  onEdit,
  onDelete
}) => {
  const getPlaceholderIcon = () => {
    const icons = {
      morning: 'sunny-outline',
      afternoon: 'partly-sunny-outline',
      evening: 'moon-outline'
    };
    return icons[timeSlot];
  };

  const handleLongPress = () => {
    if (!entry || (!onEdit && !onDelete)) return;

    if (Platform.OS === 'ios') {
      const options = ['Cancel'];
      const destructiveButtonIndex = onDelete ? 1 : -1;
      let cancelButtonIndex = 0;

      if (onEdit) {
        options.unshift('Edit');
        cancelButtonIndex++;
      }
      if (onDelete) {
        options.splice(destructiveButtonIndex, 0, 'Delete');
        cancelButtonIndex++;
      }

      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
          destructiveButtonIndex,
        },
        (buttonIndex) => {
          if (onEdit && buttonIndex === 0) {
            onEdit();
          } else if (onDelete && buttonIndex === (onEdit ? 1 : 0)) {
            Alert.alert(
              'Delete Entry',
              'Are you sure you want to delete this entry?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: onDelete }
              ]
            );
          }
        }
      );
    } else {
      Alert.alert(
        'Entry Options',
        'What would you like to do?',
        [
          { text: 'Cancel', style: 'cancel' },
          onEdit && { text: 'Edit', onPress: onEdit },
          onDelete && { 
            text: 'Delete', 
            style: 'destructive',
            onPress: () => {
              Alert.alert(
                'Delete Entry',
                'Are you sure you want to delete this entry?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: onDelete }
                ]
              );
            }
          }
        ].filter(Boolean)
      );
    }
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      onLongPress={handleLongPress}
      activeOpacity={0.8}
    >
      {entry ? (
        <View style={styles.content}>
          {entry.type === 'image' ? (
            <Image source={{ uri: entry.content }} style={styles.image} />
          ) : entry.type === 'note' ? (
            <View style={styles.noteContent}>
              <Ionicons name="document-text-outline" size={24} color="#666" />
              <Text style={styles.noteText} numberOfLines={3}>
                {entry.content}
              </Text>
            </View>
          ) : (
            <View style={styles.linkContent}>
              <Ionicons name="link-outline" size={24} color="#666" />
              <Text style={styles.linkText} numberOfLines={2}>
                {entry.content}
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.placeholder}>
          <Ionicons 
            name={getPlaceholderIcon() as any} 
            size={40} 
            color="#ccc" 
          />
          <Text style={styles.placeholderText}>Tap to add</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  noteContent: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  noteText: {
    marginTop: 12,
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  linkContent: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  linkText: {
    marginTop: 12,
    fontSize: 14,
    color: '#007AFF',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
  },
});
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Alert,
} from 'react-native';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { MediaEntry, MediaItem, Idea } from '../types';
import { StorageService } from '../utils/storage';
import * as ImagePicker from 'expo-image-picker';

interface QuickCaptureProps {
  onNewEntry: (entry: MediaEntry) => void;
  currentDate: string; // YYYY-MM-DD format
}

export const QuickCapture = React.forwardRef<any, QuickCaptureProps>(({ onNewEntry, currentDate }, ref) => {
  const [inputText, setInputText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputType, setInputType] = useState<'smart' | 'note' | 'link'>('smart');

  // Auto-expand when mounted for past dates
  React.useEffect(() => {
    const isToday = currentDate === format(new Date(), 'yyyy-MM-dd');
    if (!isToday) {
      setIsExpanded(true);
    }
  }, [currentDate]);

  const handleSmartParse = async (text: string) => {
    // Check for URL pattern
    const urlPattern = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
    const urlMatch = text.match(urlPattern);
    
    if (urlMatch) {
      return {
        type: 'link' as const,
        content: urlMatch[0],
      };
    }
    
    // Check for media patterns (from SmartCapture)
    const mediaPatterns = [
      { regex: /(?:reading|read|book):\s*(.+)/i, type: 'book' as const },
      { regex: /(?:watching|watched|movie):\s*(.+)/i, type: 'movie' as const },
      { regex: /(?:watching|watched|show|tv):\s*(.+)/i, type: 'tvshow' as const },
      { regex: /(?:listening|listened|podcast):\s*(.+)/i, type: 'podcast' as const },
    ];
    
    for (const pattern of mediaPatterns) {
      const match = text.match(pattern.regex);
      if (match) {
        // Save as media item
        const mediaItem: MediaItem = {
          id: Date.now().toString() + Math.random().toString(36),
          type: pattern.type,
          title: match[1].trim(),
          status: 'consuming',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        const existingMedia = await StorageService.getMediaItems();
        await StorageService.saveMediaItems([...existingMedia, mediaItem]);
        
        // Also create a note entry
        return {
          type: 'note' as const,
          content: text,
        };
      }
    }
    
    // Default to note
    return {
      type: 'note' as const,
      content: text,
    };
  };

  const handleSubmit = async () => {
    if (!inputText.trim()) return;

    try {
      let entryData: { type: MediaEntry['type']; content: string };
      
      if (inputType === 'smart') {
        entryData = await handleSmartParse(inputText);
      } else {
        entryData = {
          type: inputType,
          content: inputText.trim(),
        };
      }

      const newEntry: MediaEntry = {
        id: Date.now().toString(),
        ...entryData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onNewEntry(newEntry);
      setInputText('');
      setIsExpanded(false);
      Keyboard.dismiss();
    } catch (error) {
      Alert.alert('Error', 'Failed to save entry');
    }
  };

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const newEntry: MediaEntry = {
        id: Date.now().toString(),
        type: 'image',
        content: result.assets[0].uri,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onNewEntry(newEntry);
    }
  };

  const handleCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const newEntry: MediaEntry = {
        id: Date.now().toString(),
        type: 'image',
        content: result.assets[0].uri,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onNewEntry(newEntry);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={[styles.inputContainer, isExpanded && styles.expandedContainer]}>
        {isExpanded && (
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[styles.typeButton, inputType === 'smart' && styles.activeType]}
              onPress={() => setInputType('smart')}
            >
              <Ionicons name="sparkles" size={20} color={inputType === 'smart' ? COLORS.white : COLORS.text.secondary} />
              <Text style={[styles.typeText, inputType === 'smart' && styles.activeTypeText]}>Smart</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, inputType === 'note' && styles.activeType]}
              onPress={() => setInputType('note')}
            >
              <Ionicons name="document-text" size={20} color={inputType === 'note' ? COLORS.white : COLORS.text.secondary} />
              <Text style={[styles.typeText, inputType === 'note' && styles.activeTypeText]}>Note</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, inputType === 'link' && styles.activeType]}
              onPress={() => setInputType('link')}
            >
              <Ionicons name="link" size={20} color={inputType === 'link' ? COLORS.white : COLORS.text.secondary} />
              <Text style={[styles.typeText, inputType === 'link' && styles.activeTypeText]}>Link</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, isExpanded && styles.expandedInput]}
            placeholder={
              inputType === 'smart' 
                ? "What's on your mind? Try 'Reading: Atomic Habits'"
                : inputType === 'note'
                ? "Write a note..."
                : "Paste a link..."
            }
            placeholderTextColor={COLORS.text.light}
            value={inputText}
            onChangeText={setInputText}
            onFocus={() => setIsExpanded(true)}
            multiline={isExpanded}
            numberOfLines={isExpanded ? 3 : 1}
          />
          
          {inputText.trim() ? (
            <TouchableOpacity onPress={handleSubmit} style={styles.sendButton}>
              <Ionicons name="send" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          ) : (
            !isExpanded && (
              <View style={styles.quickActions}>
                <TouchableOpacity onPress={handleCamera} style={styles.quickButton}>
                  <Ionicons name="camera" size={24} color={COLORS.text.secondary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleImagePick} style={styles.quickButton}>
                  <Ionicons name="image" size={24} color={COLORS.text.secondary} />
                </TouchableOpacity>
              </View>
            )
          )}
        </View>
        
        {isExpanded && !inputText.trim() && (
          <TouchableOpacity onPress={() => setIsExpanded(false)} style={styles.collapseButton}>
            <Text style={styles.collapseText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  expandedContainer: {
    paddingTop: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    gap: 4,
  },
  activeType: {
    backgroundColor: COLORS.primary,
  },
  typeText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  activeTypeText: {
    color: COLORS.white,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: COLORS.text.primary,
    maxHeight: 40,
  },
  expandedInput: {
    borderRadius: 12,
    paddingVertical: 12,
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    padding: 8,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 4,
  },
  quickButton: {
    padding: 8,
  },
  collapseButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  collapseText: {
    color: COLORS.text.secondary,
    fontSize: 14,
  },
});
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { COLORS } from '../constants';
import { MediaItem, Idea, SmartCapture } from '../types';
import { StorageService } from '../utils/storage';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'SmartCapture'>;
};

export const SmartCaptureScreen: React.FC<Props> = ({ navigation }) => {
  const [brainDump, setBrainDump] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    loadConsumingItems();
  }, []);

  const loadConsumingItems = async () => {
    try {
      const items = await StorageService.getMediaItems();
      const consumingItems = items.filter(item => item.status === 'consuming');
      
      if (consumingItems.length > 0) {
        const preloadedText = consumingItems
          .map(item => {
            const typePrefix = {
              book: 'Reading',
              movie: 'Watching',
              tvshow: 'Watching',
              podcast: 'Listening',
              article: 'Reading',
              video: 'Watching',
              music: 'Listening',
              other: 'Consuming'
            };
            
            return `${typePrefix[item.type]}: ${item.title}${item.author ? ` by ${item.author}` : ''}`;
          })
          .join('\n');
        
        setBrainDump(preloadedText + '\n\n');
      }
    } catch (error) {
      console.error('Error loading consuming items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const extractMediaAndIdeas = async () => {
    if (!brainDump.trim()) {
      Alert.alert('Empty Input', 'Please enter some text to process');
      return;
    }

    setIsProcessing(true);
    
    try {
      const lines = brainDump.split('\n').filter(line => line.trim());
      const extractedMedia: MediaItem[] = [];
      const extractedIdeas: Idea[] = [];
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Extract media items (simple pattern matching)
        const mediaPatterns = [
          { regex: /(?:reading|read|book):\s*(.+)/i, type: 'book' as const },
          { regex: /(?:watching|watched|movie):\s*(.+)/i, type: 'movie' as const },
          { regex: /(?:watching|watched|show|tv):\s*(.+)/i, type: 'tvshow' as const },
          { regex: /(?:listening|listened|podcast):\s*(.+)/i, type: 'podcast' as const },
          { regex: /(?:reading|read|article):\s*(.+)/i, type: 'article' as const },
          { regex: /(?:watching|watched|video):\s*(.+)/i, type: 'video' as const },
          { regex: /(?:listening|listened|music|song):\s*(.+)/i, type: 'music' as const },
        ];
        
        let matched = false;
        for (const pattern of mediaPatterns) {
          const match = trimmedLine.match(pattern.regex);
          if (match) {
            extractedMedia.push({
              id: Date.now().toString() + Math.random().toString(36),
              type: pattern.type,
              title: match[1].trim(),
              status: 'consuming',
              backgroundColor: undefined,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
            matched = true;
            break;
          }
        }
        
        // Extract ideas (lines starting with - or * or containing "idea:")
        if (!matched && (
          trimmedLine.startsWith('-') || 
          trimmedLine.startsWith('*') || 
          trimmedLine.toLowerCase().includes('idea:')
        )) {
          const ideaContent = trimmedLine
            .replace(/^[-*]\s*/, '')
            .replace(/^idea:\s*/i, '')
            .trim();
            
          if (ideaContent) {
            extractedIdeas.push({
              id: Date.now().toString() + Math.random().toString(36),
              content: ideaContent,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
        }
      }
      
      // Save the smart capture
      const capture: SmartCapture = {
        id: Date.now().toString(),
        rawText: brainDump,
        extractedMedia,
        extractedIdeas,
        createdAt: new Date().toISOString(),
      };
      
      await StorageService.saveSmartCapture(capture);
      
      // Save media items and ideas
      const existingMedia = await StorageService.getMediaItems();
      await StorageService.saveMediaItems([...existingMedia, ...extractedMedia]);
      
      const existingIdeas = await StorageService.getIdeas();
      await StorageService.saveIdeas([...existingIdeas, ...extractedIdeas]);
      
      Alert.alert(
        'Success', 
        `Extracted ${extractedMedia.length} media items and ${extractedIdeas.length} ideas`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      
      setBrainDump('');
    } catch (error) {
      Alert.alert('Error', 'Failed to process your input');
      console.error('Error processing brain dump:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Brain Dump</Text>
          <Text style={styles.subtitle}>
            Just write everything on your mind. I'll extract media and ideas.
          </Text>
          <Text style={styles.hint}>
            Try formats like:{'\n'}
            - Book: The Great Gatsby{'\n'}
            - Watching: The Office{'\n'}
            - Idea: Build a journaling app{'\n'}
            - Podcast: How I Built This
          </Text>
        </View>
        
        <TextInput
          style={styles.input}
          multiline
          placeholder={isLoading ? "Loading your current media..." : "Start typing... Books you're reading, shows you're watching, ideas you have..."}
          placeholderTextColor={COLORS.text.light}
          value={brainDump}
          onChangeText={setBrainDump}
          textAlignVertical="top"
          editable={!isLoading}
        />
        
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.processButton]}
            onPress={extractMediaAndIdeas}
            disabled={isProcessing}
          >
            <Text style={styles.processButtonText}>
              {isProcessing ? 'Processing...' : 'Process'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginBottom: 16,
  },
  hint: {
    fontSize: 14,
    color: COLORS.text.light,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  input: {
    flex: 1,
    minHeight: 300,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text.primary,
    backgroundColor: COLORS.white,
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
  },
  processButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButtonText: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  processButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
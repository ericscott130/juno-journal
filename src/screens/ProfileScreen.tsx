import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { BookshelfGrid } from '../components/BookshelfGrid';
import { MediaItem } from '../types';
import { StorageService } from '../utils/storage';
import { COLORS } from '../constants';

export const ProfileScreen: React.FC = () => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMediaItems();
  }, []);

  const loadMediaItems = async () => {
    try {
      const items = await StorageService.getMediaItems();
      // Sort by status: consuming first, then want, then finished
      const sortedItems = items.sort((a, b) => {
        const statusOrder = { consuming: 0, want: 1, finished: 2 };
        return statusOrder[a.status] - statusOrder[b.status];
      });
      setMediaItems(sortedItems);
    } catch (error) {
      console.error('Error loading media items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemPress = (item: MediaItem) => {
    const statusEmoji = {
      want: '📌',
      consuming: '📖',
      finished: '✅'
    };
    
    Alert.alert(
      item.title,
      `${statusEmoji[item.status]} ${item.status.charAt(0).toUpperCase() + item.status.slice(1)}\n\n${item.author ? `By ${item.author}\n` : ''}${item.notes || 'No notes yet'}`,
      [
        { text: 'OK', style: 'default' }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>My Bookshelf</Text>
          <Text style={styles.subtitle}>
            {mediaItems.length} {mediaItems.length === 1 ? 'item' : 'items'} in your collection
          </Text>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading your collection...</Text>
          </View>
        ) : mediaItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Your bookshelf is empty</Text>
            <Text style={styles.emptySubtext}>
              Add media from the Media tab to see them here
            </Text>
          </View>
        ) : (
          <BookshelfGrid
            mediaItems={mediaItems}
            onItemPress={handleItemPress}
          />
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5DC', // Beige background
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
});
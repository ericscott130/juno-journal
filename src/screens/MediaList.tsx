import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SectionList,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { COLORS } from '../constants';
import { MediaItem, Idea } from '../types';
import { StorageService } from '../utils/storage';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'MediaList'>;
};

type Section = {
  title: string;
  data: (MediaItem | Idea)[];
};

const MEDIA_TYPE_LABELS = {
  book: '📚 Books',
  movie: '🎬 Movies',
  tvshow: '📺 TV Shows',
  podcast: '🎙️ Podcasts',
  article: '📰 Articles',
  video: '📹 Videos',
  music: '🎵 Music',
  other: '📌 Other',
};

export const MediaListScreen: React.FC<Props> = ({ navigation }) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [activeTab, setActiveTab] = useState<'media' | 'ideas'>('media');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    if (activeTab === 'media') {
      const mediaItems = await StorageService.getMediaItems();
      const groupedMedia = mediaItems.reduce((acc, item) => {
        const key = MEDIA_TYPE_LABELS[item.type] || MEDIA_TYPE_LABELS.other;
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      }, {} as Record<string, MediaItem[]>);

      const mediaSections = Object.entries(groupedMedia)
        .map(([title, data]) => ({ title, data }))
        .sort((a, b) => a.title.localeCompare(b.title));

      setSections(mediaSections);
    } else {
      const ideas = await StorageService.getIdeas();
      setSections([{ title: '💡 Ideas', data: ideas }]);
    }
  };

  const handleAddNew = () => {
    navigation.navigate('SmartCapture');
  };

  const handleItemPress = (item: MediaItem | Idea) => {
    const isMedia = 'type' in item;
    Alert.alert(
      isMedia ? (item as MediaItem).title : 'Idea',
      isMedia ? `Status: ${(item as MediaItem).status}` : (item as Idea).content,
    );
  };

  const renderItem = ({ item }: { item: MediaItem | Idea }) => {
    const isMedia = 'type' in item;
    
    return (
      <TouchableOpacity style={styles.item} onPress={() => handleItemPress(item)}>
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle}>
            {isMedia ? (item as MediaItem).title : (item as Idea).content}
          </Text>
          {isMedia && (
            <View style={[styles.statusBadge, styles[`status_${(item as MediaItem).status}`]]}>
              <Text style={styles.statusText}>{(item as MediaItem).status}</Text>
            </View>
          )}
        </View>
        <Text style={styles.itemDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Collection</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddNew}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'media' && styles.activeTab]}
          onPress={() => setActiveTab('media')}
        >
          <Text style={[styles.tabText, activeTab === 'media' && styles.activeTabText]}>
            Media
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'ideas' && styles.activeTab]}
          onPress={() => setActiveTab('ideas')}
        >
          <Text style={[styles.tabText, activeTab === 'ideas' && styles.activeTabText]}>
            Ideas
          </Text>
        </TouchableOpacity>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No {activeTab === 'media' ? 'media items' : 'ideas'} yet
            </Text>
            <Text style={styles.emptySubtext}>
              Tap the + button to add some!
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.white,
  },
  listContent: {
    paddingBottom: 20,
  },
  sectionHeader: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  item: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginVertical: 4,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 16,
    color: COLORS.text.primary,
    flex: 1,
    marginRight: 8,
  },
  itemDate: {
    fontSize: 12,
    color: COLORS.text.light,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  status_want: {
    backgroundColor: '#FFE5B4',
  },
  status_consuming: {
    backgroundColor: '#B4E5FF',
  },
  status_finished: {
    backgroundColor: '#B4FFB4',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text.primary,
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
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.text.light,
  },
});
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MediaItem } from '../types';
import { COLORS } from '../constants';
import { generateMediaCover } from '../utils/mediaCovers';

interface BookshelfGridProps {
  mediaItems: MediaItem[];
  onItemPress: (item: MediaItem) => void;
}

const { width: screenWidth } = Dimensions.get('window');
const COLUMNS = 4;
const BOOK_MARGIN = 4;
const BOOK_WIDTH = (screenWidth - 40 - (BOOK_MARGIN * 2 * COLUMNS)) / COLUMNS;
const BOOK_HEIGHT = BOOK_WIDTH * 1.5;
const SHELF_HEIGHT = BOOK_HEIGHT + 40;

const BookSpine: React.FC<{ item: MediaItem; onPress: () => void }> = ({ item, onPress }) => {
  const { backgroundColor, emoji } = generateMediaCover(item);
  
  return (
    <TouchableOpacity onPress={onPress} style={styles.bookContainer}>
      <View style={[styles.book, { transform: [{ rotateY: '0deg' }] }]}>
        <LinearGradient
          colors={[backgroundColor, `${backgroundColor}CC`]}
          style={styles.bookSpine}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {item.coverImage ? (
            <Image source={{ uri: item.coverImage }} style={styles.coverImage} />
          ) : (
            <>
              <Text style={styles.emoji}>{emoji}</Text>
              <View style={styles.titleContainer}>
                <Text style={styles.bookTitle} numberOfLines={3}>
                  {item.title}
                </Text>
                {item.author && (
                  <Text style={styles.bookAuthor} numberOfLines={1}>
                    {item.author}
                  </Text>
                )}
              </View>
            </>
          )}
        </LinearGradient>
        <View style={styles.bookShadow} />
      </View>
    </TouchableOpacity>
  );
};

export const BookshelfGrid: React.FC<BookshelfGridProps> = ({ mediaItems, onItemPress }) => {
  // Group items into shelves
  const shelves: MediaItem[][] = [];
  for (let i = 0; i < mediaItems.length; i += COLUMNS) {
    shelves.push(mediaItems.slice(i, i + COLUMNS));
  }
  
  const renderShelf = ({ item: shelfItems, index }: { item: MediaItem[]; index: number }) => (
    <View key={`shelf-${index}`} style={styles.shelfContainer}>
      <View style={styles.shelfItems}>
        {shelfItems.map((item) => (
          <BookSpine
            key={item.id}
            item={item}
            onPress={() => onItemPress(item)}
          />
        ))}
        {/* Fill empty slots */}
        {Array.from({ length: COLUMNS - shelfItems.length }).map((_, i) => (
          <View key={`empty-${i}`} style={styles.emptySlot} />
        ))}
      </View>
      <LinearGradient
        colors={['#8B4513', '#A0522D', '#8B4513']}
        style={styles.shelf}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.shelfEdge} />
      </LinearGradient>
    </View>
  );
  
  return (
    <FlatList
      data={shelves}
      renderItem={renderShelf}
      keyExtractor={(_, index) => `shelf-${index}`}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  shelfContainer: {
    marginBottom: 20,
  },
  shelfItems: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: -5,
  },
  bookContainer: {
    width: BOOK_WIDTH,
    height: BOOK_HEIGHT,
    marginHorizontal: BOOK_MARGIN,
  },
  book: {
    flex: 1,
    position: 'relative',
  },
  bookSpine: {
    flex: 1,
    borderRadius: 3,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    borderRadius: 3,
  },
  emoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  bookTitle: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  bookAuthor: {
    color: COLORS.white,
    fontSize: 9,
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  bookShadow: {
    position: 'absolute',
    bottom: -3,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 3,
  },
  emptySlot: {
    width: BOOK_WIDTH,
    height: BOOK_HEIGHT,
    marginHorizontal: BOOK_MARGIN,
  },
  shelf: {
    height: 20,
    marginHorizontal: 10,
    borderRadius: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
  },
  shelfEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
});
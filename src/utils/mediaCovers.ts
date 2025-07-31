import { MediaItem } from '../types';

// Generate a color based on the title string
const generateColorFromString = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = hash % 360;
  const saturation = 50 + (hash % 20);
  const lightness = 40 + (hash % 20);
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

// Media type specific colors
const MEDIA_TYPE_COLORS: Record<MediaItem['type'], string[]> = {
  book: ['#8B4513', '#A0522D', '#CD853F', '#DEB887', '#D2691E'],
  movie: ['#4B0082', '#483D8B', '#6A5ACD', '#7B68EE', '#9370DB'],
  tvshow: ['#2F4F4F', '#708090', '#778899', '#696969', '#A9A9A9'],
  podcast: ['#FF6347', '#FF7F50', '#FF8C00', '#FFA500', '#FFD700'],
  article: ['#228B22', '#32CD32', '#00FF00', '#7CFC00', '#7FFF00'],
  video: ['#DC143C', '#FF1493', '#FF69B4', '#FFB6C1', '#FFC0CB'],
  music: ['#4169E1', '#0000FF', '#0000CD', '#00008B', '#191970'],
  other: ['#808080', '#A9A9A9', '#C0C0C0', '#D3D3D3', '#DCDCDC'],
};

// Get emoji for media type
const MEDIA_TYPE_EMOJIS: Record<MediaItem['type'], string> = {
  book: '📚',
  movie: '🎬',
  tvshow: '📺',
  podcast: '🎙️',
  article: '📰',
  video: '📹',
  music: '🎵',
  other: '📌',
};

export const generateMediaCover = (item: MediaItem): { backgroundColor: string; emoji: string } => {
  // If item already has a backgroundColor, use it
  if (item.backgroundColor) {
    return {
      backgroundColor: item.backgroundColor,
      emoji: MEDIA_TYPE_EMOJIS[item.type],
    };
  }
  
  // Generate a color based on the title
  const titleColor = generateColorFromString(item.title);
  
  return {
    backgroundColor: titleColor,
    emoji: MEDIA_TYPE_EMOJIS[item.type],
  };
};

export const getMediaTypeColor = (type: MediaItem['type']): string => {
  const colors = MEDIA_TYPE_COLORS[type];
  return colors[Math.floor(Math.random() * colors.length)];
};
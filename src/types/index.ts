export interface MediaEntry {
  id: string;
  type: 'image' | 'note' | 'link';
  content: string;
  thumbnail?: string;
  metadata?: {
    tags?: string[];
    location?: string;
    mood?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DailyEntries {
  [key: string]: MediaEntry;
}

export interface TimelineEntries {
  [date: string]: MediaEntry[]; // date in YYYY-MM-DD format
}

export interface UserProfile {
  id: string;
  name: string;
  createdAt: string;
  streakCount: number;
  totalEntries: number;
  interests: string[];
  lastActiveDate: string;
}

export interface TimeSlotColors {
  morning: {
    start: string;
    end: string;
  };
  afternoon: {
    start: string;
    end: string;
  };
  evening: {
    start: string;
    end: string;
  };
}

export interface MediaItem {
  id: string;
  type: 'book' | 'movie' | 'tvshow' | 'podcast' | 'article' | 'video' | 'music' | 'other';
  title: string;
  status: 'want' | 'consuming' | 'finished';
  author?: string;
  url?: string;
  coverImage?: string;
  backgroundColor?: string;
  notes?: string;
  rating?: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Idea {
  id: string;
  content: string;
  category?: string;
  tags?: string[];
  relatedMedia?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SmartCapture {
  id: string;
  rawText: string;
  extractedMedia: MediaItem[];
  extractedIdeas: Idea[];
  createdAt: string;
}
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
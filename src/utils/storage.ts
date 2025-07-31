import AsyncStorage from '@react-native-async-storage/async-storage';
import { MediaEntry, DailyEntries, UserProfile, MediaItem, Idea, SmartCapture, TimelineEntries } from '../types';
import { STORAGE_KEYS } from '../constants';

export const StorageService = {
  async saveDailyEntries(date: string, entries: DailyEntries): Promise<void> {
    try {
      const key = `${STORAGE_KEYS.ENTRIES}_${date}`;
      await AsyncStorage.setItem(key, JSON.stringify(entries));
    } catch (error) {
      console.error('Error saving daily entries:', error);
      throw error;
    }
  },

  async getDailyEntries(date: string): Promise<DailyEntries | null> {
    try {
      const key = `${STORAGE_KEYS.ENTRIES}_${date}`;
      const entriesJson = await AsyncStorage.getItem(key);
      return entriesJson ? JSON.parse(entriesJson) : null;
    } catch (error) {
      console.error('Error getting daily entries:', error);
      return null;
    }
  },

  async getAllDates(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const entryKeys = keys.filter(key => key.startsWith(STORAGE_KEYS.ENTRIES + '_'));
      return entryKeys.map(key => key.replace(`${STORAGE_KEYS.ENTRIES}_`, '')).sort();
    } catch (error) {
      console.error('Error getting all dates:', error);
      return [];
    }
  },

  async deleteAllData(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Error deleting all data:', error);
      throw error;
    }
  },

  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const profileJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return profileJson ? JSON.parse(profileJson) : null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  },

  async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving user profile:', error);
      throw error;
    }
  },

  async saveMediaItems(items: MediaItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.MEDIA_ITEMS, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving media items:', error);
      throw error;
    }
  },

  async getMediaItems(): Promise<MediaItem[]> {
    try {
      const itemsJson = await AsyncStorage.getItem(STORAGE_KEYS.MEDIA_ITEMS);
      return itemsJson ? JSON.parse(itemsJson) : [];
    } catch (error) {
      console.error('Error getting media items:', error);
      return [];
    }
  },

  async saveIdeas(ideas: Idea[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(ideas));
    } catch (error) {
      console.error('Error saving ideas:', error);
      throw error;
    }
  },

  async getIdeas(): Promise<Idea[]> {
    try {
      const ideasJson = await AsyncStorage.getItem(STORAGE_KEYS.IDEAS);
      return ideasJson ? JSON.parse(ideasJson) : [];
    } catch (error) {
      console.error('Error getting ideas:', error);
      return [];
    }
  },

  async saveSmartCapture(capture: SmartCapture): Promise<void> {
    try {
      const captures = await this.getSmartCaptures();
      captures.push(capture);
      await AsyncStorage.setItem(STORAGE_KEYS.SMART_CAPTURES, JSON.stringify(captures));
    } catch (error) {
      console.error('Error saving smart capture:', error);
      throw error;
    }
  },

  async getSmartCaptures(): Promise<SmartCapture[]> {
    try {
      const capturesJson = await AsyncStorage.getItem(STORAGE_KEYS.SMART_CAPTURES);
      return capturesJson ? JSON.parse(capturesJson) : [];
    } catch (error) {
      console.error('Error getting smart captures:', error);
      return [];
    }
  },

  // Timeline storage methods
  async saveTimelineEntry(date: string, entry: MediaEntry): Promise<void> {
    try {
      const key = `${STORAGE_KEYS.ENTRIES}_timeline_${date}`;
      const existingJson = await AsyncStorage.getItem(key);
      const entries: MediaEntry[] = existingJson ? JSON.parse(existingJson) : [];
      entries.push(entry);
      await AsyncStorage.setItem(key, JSON.stringify(entries));
    } catch (error) {
      console.error('Error saving timeline entry:', error);
      throw error;
    }
  },

  async getTimelineEntries(date: string): Promise<MediaEntry[]> {
    try {
      const key = `${STORAGE_KEYS.ENTRIES}_timeline_${date}`;
      const entriesJson = await AsyncStorage.getItem(key);
      return entriesJson ? JSON.parse(entriesJson) : [];
    } catch (error) {
      console.error('Error getting timeline entries:', error);
      return [];
    }
  },

  async deleteTimelineEntry(date: string, entryId: string): Promise<void> {
    try {
      const key = `${STORAGE_KEYS.ENTRIES}_timeline_${date}`;
      const entries = await this.getTimelineEntries(date);
      const updatedEntries = entries.filter(e => e.id !== entryId);
      await AsyncStorage.setItem(key, JSON.stringify(updatedEntries));
    } catch (error) {
      console.error('Error deleting timeline entry:', error);
      throw error;
    }
  }
};
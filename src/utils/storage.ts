import AsyncStorage from '@react-native-async-storage/async-storage';
import { MediaEntry, DailyEntries, UserProfile } from '../types';
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
  }
};
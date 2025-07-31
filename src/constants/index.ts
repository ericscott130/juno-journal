export const TIME_SLOTS = ['morning', 'afternoon', 'evening'] as const;
export const ENTRIES_PER_SLOT = 2;
export const TOTAL_DAILY_ENTRIES = 6;

export const GRADIENT_COLORS = {
  morning: {
    start: '#FFE5B4', // Peach
    end: '#FFD700'    // Gold
  },
  afternoon: {
    start: '#87CEEB', // Sky Blue
    end: '#98D8C8'    // Mint
  },
  evening: {
    start: '#DDA0DD', // Plum
    end: '#4B0082'    // Indigo
  }
};

export const STORAGE_KEYS = {
  ENTRIES: '@juno_entries',
  USER_PROFILE: '@juno_profile',
  SETTINGS: '@juno_settings',
  MEDIA_ITEMS: '@juno_media',
  IDEAS: '@juno_ideas',
  SMART_CAPTURES: '@juno_captures'
};

export const COLORS = {
  primary: '#6B5B95',
  secondary: '#88D8B0',
  background: '#F7F7F7',
  text: {
    primary: '#333333',
    secondary: '#666666',
    light: '#999999'
  },
  white: '#FFFFFF',
  black: '#000000'
};
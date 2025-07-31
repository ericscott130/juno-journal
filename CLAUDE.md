# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Codebase Overview

Juno Journal is a React Native/Expo mobile application for creating media-rich daily journal entries. The app allows users to capture moments throughout their day with images, notes, and links, organized by time slots.

## Development Commands

### Running the Application
```bash
# Start Expo development server
npm start

# Run on specific platforms
npm run ios      # Opens in iOS Simulator
npm run android  # Opens in Android Emulator
npm run web      # Opens in web browser
```

### Building and Testing
- No build scripts configured beyond Expo defaults
- No test framework currently set up
- TypeScript compilation happens automatically via Expo

## Architecture

### Technology Stack
- **Framework**: React Native 0.79.5 with Expo SDK 53
- **Language**: TypeScript (strict mode enabled)
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **State Management**: React hooks with local component state
- **Data Persistence**: AsyncStorage for local data
- **UI Components**: Custom components with expo-linear-gradient

### Project Structure
```
juno-journal/
├── src/
│   ├── components/     # Reusable UI components (EntryCard, GradientBackground)
│   ├── constants/      # App constants (TIME_SLOTS, COLORS, STORAGE_KEYS)
│   ├── hooks/          # Custom hooks (useGradient for time-based colors)
│   ├── screens/        # Screen components (DailyView, EntryCreation)
│   ├── types/          # TypeScript interfaces (MediaEntry, DailyEntries, UserProfile)
│   └── utils/          # Utilities (storage.ts for AsyncStorage operations)
├── App.tsx            # Root component with NavigationContainer
└── index.ts           # Expo entry point
```

### Key Architectural Patterns

1. **Data Model**: 
   - Each day has 6 entry slots (2 per time period: morning, afternoon, evening)
   - Entries stored as `DailyEntries` objects keyed by date (YYYY-MM-DD format)
   - Three entry types: image (with URI), note (text), and link (URL)

2. **Storage Layer** (src/utils/storage.ts):
   - Centralized AsyncStorage service
   - Methods: saveDailyEntries, getDailyEntries, getAllDates, deleteAllData
   - Data persisted as JSON strings

3. **Time-Based UI**:
   - Gradient backgrounds change based on current time
   - useGradient hook provides colors for morning/afternoon/evening

4. **Navigation Structure**:
   - Stack navigator as root
   - Modal presentation for entry creation
   - Typed navigation parameters using RootStackParamList

### Development Guidelines

1. **TypeScript**: Strict mode is enabled. All new code must be properly typed.

2. **Component Structure**: 
   - Functional components with hooks
   - Props interfaces defined in component files
   - Reusable components in src/components/

3. **Async Operations**: 
   - All storage operations are async
   - Use try/catch blocks for error handling
   - Loading states should be handled in UI

4. **Platform Considerations**:
   - App locked to portrait orientation
   - Supports iOS, Android, and Web
   - Use platform-specific code sparingly

### Current TODOs in Codebase
- Entry updates and deletions (pending in todo list)
- Bottom tab navigation implementation
- Search/Browse screen
- User profile screen with statistics
- Settings screen
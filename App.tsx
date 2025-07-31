import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { DailyView } from './src/screens/DailyView';
import EntryCreation from './src/screens/EntryCreation';
import { BrowseScreen } from './src/screens/BrowseScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { MediaEntry } from './src/types';
import { COLORS } from './src/constants';

export type RootStackParamList = {
  MainTabs: {
    screen?: keyof TabParamList;
    params?: any;
  };
  EntryCreation: {
    date: string;
    timeSlot: 'morning' | 'afternoon' | 'evening';
    slotIndex: number;
    existingEntry?: MediaEntry;
  };
};

export type TabParamList = {
  Today: {
    newEntry?: {
      entry: MediaEntry;
      date: string;
      timeSlot: 'morning' | 'afternoon' | 'evening';
      slotIndex: number;
    };
  };
  Browse: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Today') {
            iconName = focused ? 'today' : 'today-outline';
          } else if (route.name === 'Browse') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0.1,
          shadowRadius: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
        },
      })}
    >
      <Tab.Screen 
        name="Today" 
        component={DailyView}
        options={{ title: 'Today' }}
      />
      <Tab.Screen 
        name="Browse" 
        component={BrowseScreen}
        options={{ title: 'Browse' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator 
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen 
          name="EntryCreation" 
          component={EntryCreation} 
          options={{ presentation: 'modal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { DailyView } from './src/screens/DailyView';
import EntryCreation from './src/screens/EntryCreation';
import { BrowseScreen } from './src/screens/BrowseScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { SmartCaptureScreen } from './src/screens/SmartCapture';
import { MediaListScreen } from './src/screens/MediaList';
import { MediaEntry } from './src/types';
import { COLORS } from './src/constants';
import { FloatingActionButton } from './src/components/FloatingActionButton';

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
  SmartCapture: undefined;
  MediaList: undefined;
};

export type TabParamList = {
  Today: {
    newEntry?: {
      entry: MediaEntry;
      date: string;
      timeSlot: 'morning' | 'afternoon' | 'evening';
      slotIndex: number;
    };
    selectedDate?: string; // YYYY-MM-DD format
  };
  Browse: undefined;
  Media: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  const navigation = useNavigation<any>();

  const TabScreenWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
      <View style={{ flex: 1 }}>
        {children}
        <FloatingActionButton onPress={() => navigation.navigate('SmartCapture')} />
      </View>
    );
  };

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
          } else if (route.name === 'Media') {
            iconName = focused ? 'library' : 'library-outline';
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
        options={{ title: 'Today' }}
      >
        {(props) => (
          <TabScreenWrapper>
            <DailyView {...props} />
          </TabScreenWrapper>
        )}
      </Tab.Screen>
      <Tab.Screen 
        name="Browse" 
        options={{ title: 'Browse' }}
      >
        {(props) => (
          <TabScreenWrapper>
            <BrowseScreen {...props} />
          </TabScreenWrapper>
        )}
      </Tab.Screen>
      <Tab.Screen 
        name="Media" 
        options={{ title: 'Media' }}
      >
        {(props) => (
          <TabScreenWrapper>
            <MediaListScreen {...props} />
          </TabScreenWrapper>
        )}
      </Tab.Screen>
      <Tab.Screen 
        name="Profile" 
        options={{ title: 'Profile' }}
      >
        {(props) => (
          <TabScreenWrapper>
            <ProfileScreen {...props} />
          </TabScreenWrapper>
        )}
      </Tab.Screen>
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
        <Stack.Screen 
          name="SmartCapture" 
          component={SmartCaptureScreen} 
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen 
          name="MediaList" 
          component={MediaListScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
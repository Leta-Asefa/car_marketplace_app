import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BrowseCars } from '../screens/buyer/BrowseCars';
import { CompareCars } from '../screens/buyer/CompareCars';
import { Messages } from '../screens/shared/Messages';
import { Settings } from '../screens/shared/Settings';

const Tab = createBottomTabNavigator();

export default function BuyerTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#7c3aed', // Purple color for active tab
        tabBarInactiveTintColor: '#9ca3af', // Gray color for inactive tabs
      }}
    >
      <Tab.Screen 
        name="Browse" 
        component={BrowseCars}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="search" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Compare" 
        component={CompareCars}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="compare" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Messages" 
        component={Messages}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="message" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={Settings}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="settings" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
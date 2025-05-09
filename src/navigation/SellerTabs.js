import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PostCar } from '../screens/seller/PostCar';
import { PostList } from '../screens/seller/PostList';
import { Messages } from '../screens/shared/Messages';
import { Settings } from '../screens/shared/Settings';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Tab = createBottomTabNavigator();

export default function SellerTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#7c3aed', // Purple color for active tab
        tabBarInactiveTintColor: '#9ca3af', // Gray color for inactive tabs
      }}
    >
      <Tab.Screen 
        name="PostCar" 
        component={PostCar} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="add-circle" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="PostList" 
        component={PostList} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="list" color={color} size={size} />
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

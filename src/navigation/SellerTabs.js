import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PostCar } from '../screens/seller/PostCar';
import { PostList } from '../screens/seller/PostList';
import { Messages } from '../screens/shared/Messages';
import { Settings } from '../screens/shared/Settings';

const Tab = createBottomTabNavigator();

export default function SellerTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="PostCar" component={PostCar} options={{ title: "Post Car" }} />
      <Tab.Screen name="PostList" component={PostList} options={{ title: "My Listings" }} />
      <Tab.Screen name="Messages" component={Messages} />
      <Tab.Screen name="Settings" component={Settings} />
    </Tab.Navigator>
  );
}

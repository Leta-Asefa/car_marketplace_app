import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BrowseCars } from '../screens/buyer/BrowseCars';
import { CompareCars } from '../screens/buyer/CompareCars';
import { Messages } from '../screens/shared/Messages';
import { Settings } from '../screens/shared/Settings';

const Tab = createBottomTabNavigator();

export default function BuyerTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Browse" component={BrowseCars} options={{ title: "Browse Cars" }} />
      <Tab.Screen name="Compare" component={CompareCars} options={{ title: "Compare Cars" }} />
      <Tab.Screen name="Messages" component={Messages} />
      <Tab.Screen name="Settings" component={Settings} />
    </Tab.Navigator>
  );
}

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthUserContext } from '../contexts/AuthUserContext';
import AuthNavigation from './AuthNavigation';
import SellerTabs from './SellerTabs';
import BuyerTabs from './BuyerTabs';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { authUser } = useAuthUserContext();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!authUser ? (
        <Stack.Screen name="Auth" component={AuthNavigation} />
      ) : authUser.role === 'seller' ? (
        <Stack.Screen name="Seller" component={SellerTabs} />
      ) : (
        <Stack.Screen name="Buyer" component={BuyerTabs} />
      )}
    </Stack.Navigator>
  );
}

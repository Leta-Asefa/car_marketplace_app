import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuthUserContext } from '../contexts/AuthUserContext';
import RootNavigator from './RootNavigatoin';

const Stack = createNativeStackNavigator();

export default function Navigation() {
  const { authUser } = useAuthUserContext();

  return (
    <NavigationContainer>
     <RootNavigator/>
    </NavigationContainer>
  );
}

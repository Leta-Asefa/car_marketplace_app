import React from 'react';
import {
  Text,
  View,
} from 'react-native';
import { AuthUserContextProvider } from './src/contexts/AuthUserContext';
import Navigation from './src/navigation/Navigation';



function App(){

  return (
   <AuthUserContextProvider>
    <Navigation/>
   </AuthUserContextProvider>
  );
}



export default App;

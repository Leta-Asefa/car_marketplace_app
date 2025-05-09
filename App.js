import React from 'react';
import {Text, View} from 'react-native';
import {AuthUserContextProvider} from './src/contexts/AuthUserContext';
import Navigation from './src/navigation/Navigation';
import {SocketContextProvider} from './src/contexts/SocketContext';

function App() {
  return (
    <AuthUserContextProvider>
      <SocketContextProvider>
        <Navigation />
      </SocketContextProvider>
    </AuthUserContextProvider>
  );
}

export default App;

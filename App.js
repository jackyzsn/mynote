/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import { StoreProvider } from './Store';
import Test from './Test';
import 'react-native-gesture-handler';

const App: () => React$Node = () => {
  return (
    <StoreProvider>
      <Test />
    </StoreProvider>
  );
};

export default App;

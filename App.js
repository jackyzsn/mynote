/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from "react";
import { StoreProvider } from "./Store";
import Main from "./Main";

const App: () => React$Node = () => {
  return (
    <StoreProvider>
      <Main />
    </StoreProvider>
  );
};

export default App;

import React from 'react';
import MynoteProvider from './context/mynoteContext';
import 'react-native-gesture-handler';
import './i18n';
import Main from './Main';

const App: React.FC = () => {

  return (
    <MynoteProvider>
      <Main />
    </MynoteProvider>
  );
};

export default App;

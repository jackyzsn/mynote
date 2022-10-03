import React from 'react';
import { Platform, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from './screens/HomeScreen';
import { NoteMainScreen } from './screens/NoteMainScreen';
import { NewNoteScreen } from './screens/NewNoteScreen';
import { NewNoteAndroid8Screen } from './screens/NewNoteAndroid8Screen';
import { BrowseNoteScreen } from './screens/BrowseNoteScreen';
import { ImportNoteScreen } from './screens/ImportNoteScreen';
import { NoteDetailScreen } from './screens/NoteDetailScreen';
import { NoteDetailAndroid8Screen } from './screens/NoteDetailAndroid8Screen';
import { SearchExistingNotesScreen } from './screens/SearchExistingNotesScreen';
import translate from './utils/language.utils';

const Stack = createStackNavigator();

const isAndroid8 = Platform.OS === 'android' && Platform.Version <= 26;

function Test() {
  return (
    <View>
      <Text>{translate('note_group')}</Text>
    </View>
  );
}

export default Test;

import React from 'react';
import { Platform } from 'react-native';
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
import { Root } from 'native-base';

const Stack = createStackNavigator();

const isAndroid8 = Platform.OS === 'android' && Platform.Version <= 26;

function Main() {
  return (
    <Root>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="NoteMain" component={NoteMainScreen} options={{ title: translate('note_main') }} />
          {isAndroid8 ? (
            <React.Fragment>
              <Stack.Screen
                name="NewNote"
                component={NewNoteAndroid8Screen}
                options={{ title: translate('new_note') }}
              />
              <Stack.Screen name="NoteDetail" component={NoteDetailAndroid8Screen} options={{ headerShown: false }} />
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Stack.Screen name="NewNote" component={NewNoteScreen} options={{ title: translate('new_note') }} />
              <Stack.Screen name="NoteDetail" component={NoteDetailScreen} options={{ headerShown: false }} />
            </React.Fragment>
          )}
          <Stack.Screen name="BrowseNote" component={BrowseNoteScreen} options={{ title: translate('browse_note') }} />
          <Stack.Screen
            name="SearchExistingNotes"
            component={SearchExistingNotesScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="ImportNote" component={ImportNoteScreen} options={{ title: translate('import_note') }} />
        </Stack.Navigator>
      </NavigationContainer>
    </Root>
  );
}

export default Main;

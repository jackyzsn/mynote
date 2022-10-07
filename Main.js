import React from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from './screens/HomeScreen';
import { NoteMainScreen } from './screens/NoteMainScreen';
import { NewNoteScreen } from './screens/NewNoteScreen';
import { BrowseNoteScreen } from './screens/BrowseNoteScreen';
import { ImportNoteScreen } from './screens/ImportNoteScreen';
import { NoteDetailScreen } from './screens/NoteDetailScreen';
import { SearchExistingNotesScreen } from './screens/SearchExistingNotesScreen';
import translate from './utils/language.utils';
import { NativeBaseProvider } from 'native-base';
import theme from './resources/theme.json';

const Stack = createStackNavigator();

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    fontSize: 25,
    fontWeight: '500',
  },
});

function Main() {
  return (
    <SafeAreaView style={styles.container}>
      <NativeBaseProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Home">
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen
              name="NoteMain"
              component={NoteMainScreen}
              options={{ title: translate('note_main'), headerTintColor: theme.major_text_color }}
            />
            <Stack.Screen
              name="NewNote"
              component={NewNoteScreen}
              options={{ title: translate('new_note'), headerTintColor: theme.major_text_color }}
            />
            <Stack.Screen name="NoteDetail" component={NoteDetailScreen} options={{ headerShown: false }} />
            <Stack.Screen
              name="BrowseNote"
              component={BrowseNoteScreen}
              options={{ title: translate('browse_note'), headerTintColor: theme.major_text_color }}
            />
            <Stack.Screen
              name="SearchExistingNotes"
              component={SearchExistingNotesScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ImportNote"
              component={ImportNoteScreen}
              options={{ title: translate('import_note'), headerTintColor: theme.major_text_color }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </NativeBaseProvider>
    </SafeAreaView>
  );
}

export default Main;

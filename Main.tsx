import React, { useEffect, useRef, useState, useContext } from 'react';
import { StyleSheet, SafeAreaView, AppState, AppStateStatus } from 'react-native';
import RNRestart from 'react-native-restart';
import moment, { Moment } from 'moment';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';
import { HomeScreen } from './screens/HomeScreen';
import { NoteMainScreen } from './screens/NoteMainScreen';
import { NewNoteScreen } from './screens/NewNoteScreen';
import { BrowseNoteScreen } from './screens/BrowseNoteScreen';
import { ImportNoteScreen } from './screens/ImportNoteScreen';
import { NoteDetailScreen } from './screens/NoteDetailScreen';
import { SearchExistingNotesScreen } from './screens/SearchExistingNotesScreen';
import { RestoreCloudScreen } from './screens/RestoreCloudScreen';
import { useTranslation } from 'react-i18next';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';
import theme from './resources/theme.json';
import { MynoteContext } from './context/mynoteContext';
import { MynoteContextType, ScreenType } from './@types/mynote.d';

type RouteParams = {
    itemid: string;
    notetag: string;
    backto: string;
};

type RootStackParamList = {
    NoteDetail: RouteParams;
    Home: undefined;
    NoteMain: undefined;
    NewNote: undefined;
    BrowseNote: undefined;
    SearchExistingNotes: undefined;
    ImportNote: undefined;
    RestoreCloud: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    text: {
        fontSize: 25,
        fontWeight: '500',
    },
});

function Main(): JSX.Element {
    const appState = useRef<AppStateStatus>(AppState.currentState);
    const [offlineAt, setOfflineAt] = useState<Moment | null>(null);
    const { mynoteConfig, changeScreen } = useContext(MynoteContext) as MynoteContextType;
    const { t } = useTranslation();

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                const now = moment();

                const diff = now.diff(offlineAt, 'seconds');

                if (diff > theme.session_timeout && mynoteConfig.currentScreen !== ScreenType.HOME) {
                    RNRestart.Restart();
                    changeScreen(ScreenType.HOME);
                }
            } else if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
                const now = moment();

                setOfflineAt(now);
            }

            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, [offlineAt, changeScreen, mynoteConfig.currentScreen]);

    return (
        <SafeAreaView style={styles.container}>
            <GluestackUIProvider config={config}>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName="Home">
                        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false } as StackNavigationOptions} />
                        <Stack.Screen
                            name="NoteMain"
                            component={NoteMainScreen}
                            options={{ title: t('note_main'), headerTintColor: theme.major_text_color } as StackNavigationOptions}
                        />
                        <Stack.Screen
                            name="NewNote"
                            component={NewNoteScreen}
                            options={{ title: t('new_note'), headerTintColor: theme.major_text_color } as StackNavigationOptions}
                        />
                        <Stack.Screen
                            name="BrowseNote"
                            component={BrowseNoteScreen}
                            options={{ title: t('browse_note'), headerTintColor: theme.major_text_color } as StackNavigationOptions}
                        />
                        <Stack.Screen
                            name="NoteDetail"
                            component={NoteDetailScreen}
                            options={{ headerShown: false } as StackNavigationOptions}
                        />
                        <Stack.Screen
                            name="SearchExistingNotes"
                            component={SearchExistingNotesScreen}
                            options={{ headerShown: false } as StackNavigationOptions}
                        />
                        <Stack.Screen
                            name="ImportNote"
                            component={ImportNoteScreen}
                            options={{ title: t('import_note'), headerTintColor: theme.major_text_color } as StackNavigationOptions}
                        />
                        <Stack.Screen
                            name="RestoreCloud"
                            component={RestoreCloudScreen}
                            options={{ title: t('restore_cloud'), headerTintColor: theme.major_text_color } as StackNavigationOptions}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </GluestackUIProvider>
        </SafeAreaView>
    );
}

export default Main;

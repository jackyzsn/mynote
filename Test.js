import React, { useEffect, useState, useContext } from 'react';
import { Dimensions, Platform, StyleSheet, SafeAreaView } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createTable } from './utils/dbhelper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import translate from './utils/language.utils';
import { NativeBaseProvider } from 'native-base';
import { Store } from './Store';
import { requestMultiple, checkMultiple, PERMISSIONS, RESULTS } from 'react-native-permissions';
import {
  Container,
  Heading,
  Center,
  Box,
  Stack,
  FormControl,
  Input,
  Button,
  Text,
  Icon,
  Fab,
  Pressable,
} from 'native-base';
import theme from './resources/theme.json';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FeatherIcons from 'react-native-vector-icons/Feather';

// const Stack = createStackNavigator();
const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;
const contentWidth = deviceWidth - theme.content_margin;
const isAndroid8 = Platform.OS === 'android' && Platform.Version <= 26;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    fontSize: 25,
    fontWeight: '500',
  },
});

function Test({ navigation }) {
  const { state, dispatch } = useContext(Store);
  const [themeColor, setThemeColor] = useState('#2D9CDB');
  const [loading, setLoading] = useState(true);
  const [favActive, setFavActive] = useState(true);
  const [hasPermission, setHasPermission] = useState(state.config.hasPermission);
  const [notegroup, setNotegroup] = useState(state.config.notegroup);
  const [encrypkey, setEncrypkey] = useState(state.config.encryptionkey);
  const [secureKey, setSecureKey] = useState(true);

  const checkPermission = () => {
    if (Platform.OS === 'android') {
      checkMultiple([PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE, PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE]).then(
        statuses => {
          if (
            statuses[PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE] !== RESULTS.GRANTED ||
            statuses[PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE] !== RESULTS.GRANTED
          ) {
            requestMultiple([
              PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
              PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
            ]).then(statuses => {
              if (
                statuses[PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE] === RESULTS.GRANTED &&
                statuses[PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE] === RESULTS.GRANTED
              ) {
                setHasPermission(true);
              } else {
                setHasPermission(false);
              }
            });
          } else {
            setHasPermission(true);
          }
        }
      );
    } else {
      setHasPermission(true);
    }
  };

  useEffect(() => {
    createTable();
    checkPermission();
    AsyncStorage.getItem('MyNote').then(favColor => {
      if (favColor) {
        setThemeColor(favColor);
      }
      setLoading(false);
    });
  }, []);

  return (
    <React.Fragment>
      <Center>
        <Container width={contentWidth}>
          <Box alignItems="center" w="100%">
            <FormControl mt={10}>
              <Stack space={5}>
                <Stack>
                  <FormControl.Label>{translate('note_group')}</FormControl.Label>
                  <Input
                    value={notegroup}
                    isFullWidth={true}
                    onChangeText={text => {
                      setNotegroup(text);
                    }}
                  />
                </Stack>

                <Stack>
                  <FormControl.Label>{translate('encryption_key')}</FormControl.Label>

                  <Input
                    type={secureKey ? 'password' : 'text'}
                    InputRightElement={
                      <Pressable onPress={() => setSecureKey(!secureKey)}>
                        <Icon
                          as={<MaterialIcons name={secureKey ? 'visibility' : 'visibility-off'} />}
                          size={5}
                          mr="2"
                        />
                      </Pressable>
                    }
                    onChangeText={text => {
                      setEncrypkey(text);
                    }}
                  />
                </Stack>
                <Stack>
                  <Button
                    block
                    mt="32"
                    bgColor={themeColor}
                    onPress={() => {
                      dispatch({
                        type: 'CHANGE_CONFIG',
                        payload: {
                          notegroup,
                          encryptionkey: encrypkey,
                          hasPermission,
                          favColor: themeColor,
                        },
                      });
                      AsyncStorage.setItem('MyNote', themeColor);
                      navigation.navigate('NoteMain');
                    }}>
                    <Text>{translate('next')}</Text>
                  </Button>
                </Stack>
              </Stack>
            </FormControl>
          </Box>
        </Container>
      </Center>
      <Text position={'absolute'} bottom={5} left={theme.content_margin / 2}>
        v{theme.ver}
      </Text>
      {/* <Fab
        renderInPortal={false}
        active={favActive}
        color="red"
        shadow={2}
        size="sm"
        icon={<Icon color="white" as={FeatherIcons} name="plus" size="sm" />}
        onPress={() => {
          console.log('Click: ' + favActive);
          setFavActive(!favActive);
        }}>
        <Button
          bgColor={{ backgroundColor: '#2D9CDB' }}
          onPress={() => {
            setThemeColor('#2D9CDB');
          }}
        />
        <Button
          bgColor={{ backgroundColor: '#56CCF2' }}
          onPress={() => {
            setThemeColor('#56CCF2');
          }}
        />
      </Fab> */}
      {/* <Fab
        renderInPortal={false}
        bgColor={{ backgroundColor: themeColor }}
        onPress={() => {
          let nextState = !favActive;
          setFavActive(nextState);
        }}
        icon={<Icon name="settings" size="36" />}>
        <Button
          bgColor={{ backgroundColor: '#2D9CDB' }}
          onPress={() => {
            setThemeColor('#2D9CDB');
          }}
        />
        <Button
          bgColor={{ backgroundColor: '#56CCF2' }}
          onPress={() => {
            setThemeColor('#56CCF2');
          }}
        />
        <Button
          bgColor={{ backgroundColor: '#27AE60' }}
          onPress={() => {
            setThemeColor('#27AE60');
          }}
        />
        <Button
          bgColor={{ backgroundColor: '#6FCF97' }}
          onPress={() => {
            setThemeColor('#6FCF97');
          }}
        />
        <Button
          bgColor={{ backgroundColor: '#F2994A' }}
          onPress={() => {
            setThemeColor('#F2994A');
          }}
        />
        <Button
          bgColor={{ backgroundColor: '#2F80ED' }}
          onPress={() => {
            setThemeColor('#2F80ED');
          }}
        />
      </Fab> */}
    </React.Fragment>
  );
}

export default Test;

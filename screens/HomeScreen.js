import React, { useState, useContext, useEffect } from 'react';
import { Dimensions, View, Platform } from 'react-native';
import { Container, Button, Input, FormControl, Text, Icon, Spinner, Stack, Center, Box, Pressable } from 'native-base';
import theme from '../resources/theme.json';
import translate from '../utils/language.utils';
import { Store } from '../Store';
import { createTable } from '../utils/dbhelper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { requestMultiple, checkMultiple, PERMISSIONS, RESULTS } from 'react-native-permissions';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;
const contentWidth = deviceWidth - theme.content_margin;

export function HomeScreen({ navigation }) {
  const { state, dispatch } = useContext(Store);
  const [notegroup, setNotegroup] = useState(state.config.notegroup);
  const [encrypkey, setEncrypkey] = useState(state.config.encryptionkey);
  const [hasPermission, setHasPermission] = useState(state.config.hasPermission);
  const [secureKey, setSecureKey] = useState(true);

  const [themeColor, setThemeColor] = useState('#6FCF97');
  const [loading, setLoading] = useState(true);

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
            ]).then(sts => {
              if (
                sts[PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE] === RESULTS.GRANTED &&
                sts[PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE] === RESULTS.GRANTED
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

  // Only want to execute once
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
            {loading ? (
              <View style={{ marginTop: deviceHeight / 2.5 }}>
                <Spinner color="blue" />
              </View>
            ) : (
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
            )}
          </Box>
        </Container>
      </Center>
      <Text position={'absolute'} bottom={5} left={theme.content_margin / 2}>
        v{theme.ver}
      </Text>
    </React.Fragment>
  );
}

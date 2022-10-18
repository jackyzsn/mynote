import React, { useState, useContext, useEffect } from 'react';
import { Dimensions, Platform } from 'react-native';
import {
  Container,
  Text,
  Input,
  useToast,
  Icon,
  Box,
  Center,
  HStack,
  Pressable,
  FormControl,
  Stack,
  TextArea,
} from 'native-base';
import theme from '../resources/theme.json';
import translate from '../utils/language.utils';
import { Store } from '../Store';
import { encrypt } from '../utils/crypto';
import { insertNote } from '../utils/dbhelper';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FeatherIcons from 'react-native-vector-icons/Feather';
import { sha256 } from 'react-native-sha256';

const deviceWidth = Dimensions.get('window').width;
const contentWidth = deviceWidth - theme.content_margin;

export function NewNoteScreen({ navigation }) {
  const { state, dispatch } = useContext(Store);
  const [notecontent, setNotecontent] = useState('');
  const [notetag, setNotetag] = useState('');
  const toast = useToast();

  useEffect(() => {
    dispatch({
      type: 'CHANGE_SCREEN',
      payload: 'NewNote',
    });
  }, [dispatch]);

  const showToast = rtnCode => {
    if (rtnCode === '00') {
      toast.show({
        description: translate('note_save_success'),
        placement: 'top',
        duration: theme.toast_delay_duration,
        bgColor: state.config.favColor,
        onCloseComplete: () => {
          navigation.navigate('NoteMain');
          dispatch({
            type: 'CHANGE_SCREEN',
            payload: 'NoteMain',
          });
        },
      });
    } else if (rtnCode === '10') {
      toast.show({
        description: translate('note_tag_exist'),
        placement: 'top',
        duration: theme.toast_delay_duration,
        bgColor: theme.toast_fail_bg_color,
      });
    } else {
      toast.show({
        text: translate('note_save_failed'),
        placement: 'top',
        duration: theme.toast_delay_duration,
        bgColor: theme.toast_fail_bg_color,
      });
    }
  };

  return (
    <Box flex={1} bg="white" safeAreaTop width="100%" alignSelf="center">
      <Center justifyContent="flex-start" flex={1}>
        <Container width={contentWidth}>
          <Box w="100%">
            <FormControl mt={2}>
              <Stack space={5}>
                <Stack>
                  {/* <FormControl.Label>{translate('note_tag')}</FormControl.Label> */}
                  <Input
                    value={notetag}
                    placeholder={translate('note_tag')}
                    isFullWidth={true}
                    InputRightElement={
                      <Pressable
                        onPress={() =>
                          DocumentPicker.pick({
                            type: [DocumentPicker.types.allFiles],
                          })
                            .then(res => {
                              let filePath;

                              if (Platform.OS === 'ios') {
                                filePath = res[0].uri.replace('file://', '');
                              } else {
                                // filePath = res[0].uri.split('raw%3A')[1].replace(/%2F/gm, '/');
                                filePath = res[0].uri;
                              }

                              RNFS.readFile(filePath, 'utf8')
                                .then(file => {
                                  setNotecontent(file);
                                })
                                .catch(err => {
                                  throw err;
                                });
                            })
                            .catch(err => {
                              if (DocumentPicker.isCancel(err)) {
                                console.log('User Cancelled..');
                              } else {
                                throw err;
                              }
                            })
                        }>
                        <Icon as={<FeatherIcons name="file-text" />} size={5} mr="2" />
                      </Pressable>
                    }
                    onChangeText={text => {
                      setNotetag(text);
                    }}
                  />
                </Stack>
                <Stack>
                  <TextArea
                    w="100%"
                    h="93%"
                    borderWidth={0}
                    placeholder={translate('note_area')}
                    value={notecontent}
                    onChangeText={text => {
                      setNotecontent(text);
                    }}
                    autoCorrect={false}
                    maxLength={10240000}
                  />
                </Stack>
              </Stack>
            </FormControl>
          </Box>
        </Container>
      </Center>
      <HStack bg={state.config.favColor} alignItems="center" safeAreaBottom shadow={6}>
        <Pressable
          cursor="pointer"
          opacity={notetag.trim() === '' ? 0.5 : 1}
          py="3"
          flex={1}
          disabled={notetag.trim() === ''}
          onPress={() => {
            let tmpTxt = encrypt(notecontent, state.config.encryptionkey);

            sha256(state.config.encryptionkey).then(hash => {
              insertNote(state.config.notegroup, notetag, tmpTxt, hash, showToast);
            });
          }}>
          <Center>
            <Icon mb="1" as={<MaterialIcons name="save" />} color="white" size="sm" />
            <Text color="white" fontSize="12">
              {translate('save')}
            </Text>
          </Center>
        </Pressable>
        <Pressable
          cursor="pointer"
          py="2"
          flex={1}
          onPress={() => {
            navigation.navigate('NoteMain');
            dispatch({
              type: 'CHANGE_SCREEN',
              payload: 'NoteMain',
            });
          }}>
          <Center>
            <Icon mb="1" as={<MaterialIcons name="cancel" />} color="white" size="sm" />
            <Text color="white" fontSize="12">
              {translate('cancel')}
            </Text>
          </Center>
        </Pressable>
      </HStack>
    </Box>
  );
}

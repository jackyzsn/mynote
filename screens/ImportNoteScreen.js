import React, { useState, useContext, useEffect } from 'react';
import { Dimensions, Platform } from 'react-native';
import {
  Container,
  Center,
  Button,
  Box,
  Input,
  Stack,
  FormControl,
  Text,
  Icon,
  Pressable,
  useToast,
} from 'native-base';
import theme from '../resources/theme.json';
import translate from '../utils/language.utils';
import { Store } from '../Store';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import { encrypt } from '../utils/crypto';
import { fileIsValid, importFromFile } from '../utils/dbhelper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { sha256 } from 'react-native-sha256';

const deviceWidth = Dimensions.get('window').width;
const contentWidth = deviceWidth - theme.content_margin;

export function ImportNoteScreen({ navigation }) {
  const { state, dispatch } = useContext(Store);
  const [fileName, setFileName] = useState('');
  const [fileFullName, setFileFullName] = useState('');
  const [exportDisabled, setExportDisabled] = useState(true);
  const toast = useToast();

  useEffect(() => {
    dispatch({
      type: 'CHANGE_SCREEN',
      payload: 'ImportNote',
    });
  }, [dispatch]);

  const importCallback = rtnCode => {
    if (rtnCode === '00') {
      toast.show({
        description: translate('import_success') + fileName,
        placement: 'top',
        duration: theme.toast_delay_duration,
        bgColor: state.config.favColor,
        onClose: () => {
          navigation.navigate('NoteMain');
          dispatch({
            type: 'CHANGE_SCREEN',
            payload: 'NoteMain',
          });
        },
      });
    } else {
      toast.show({
        description: translate('import_failed'),
        placement: 'top',
        duration: theme.toast_delay_duration,
        bgColor: theme.toast_fail_bg_color,
      });
    }
  };

  return (
    <Center>
      <Container width={contentWidth}>
        <Box alignItems="center" w="100%">
          <FormControl mt={10}>
            <Stack space={5}>
              <Stack>
                <FormControl.Label>{translate('import_file')}</FormControl.Label>
                <Input
                  InputRightElement={
                    <Pressable
                      onPress={() => {
                        DocumentPicker.pick({
                          type: [DocumentPicker.types.allFiles],
                        })
                          .then(res => {
                            let filePath;
                            if (Platform.OS === 'ios') {
                              filePath = res[0].uri.replace('file://', '');
                            } else {
                              filePath = res[0].uri;
                            }
                            try {
                              RNFS.readFile(filePath, 'utf8').then(file => {
                                if (fileIsValid(file)) {
                                  setFileName(res[0].name);
                                  setExportDisabled(false);
                                  setFileFullName(filePath);
                                } else {
                                  setFileName('');
                                  setExportDisabled(true);
                                  setFileFullName('');
                                  toast.show({
                                    description: translate('file_invalid'),
                                    placement: 'top',
                                    duration: theme.toast_delay_duration,
                                    bgColor: theme.toast_fail_bg_color,
                                  });
                                }
                              });
                            } catch (e) {
                              console.log(e);
                            }
                          })
                          .catch(err => {
                            if (DocumentPicker.isCancel(err)) {
                              console.log('User Cancelled..');
                            } else {
                              throw err;
                            }
                          });
                      }}>
                      <Icon as={<MaterialCommunityIcons name="import" />} size={5} mr="2" />
                    </Pressable>
                  }
                  value={fileName}
                  onChangeText={text => {
                    setFileName(text);
                  }}
                />
              </Stack>
              <Stack>
                <Button
                  block
                  mt="8"
                  bgColor={state.config.favColor}
                  disabled={exportDisabled}
                  onPress={() => {
                    RNFS.readFile(fileFullName, 'utf8').then(file => {
                      let notes = JSON.parse(file);
                      let noteList = notes.noteList;

                      sha256(state.config.encryptionkey).then(hash => {
                        importFromFile(
                          state.config.notegroup,
                          noteList,
                          state.config.encryptionkey,
                          encrypt,
                          hash,
                          importCallback
                        );
                      });
                    });
                  }}>
                  <Text color={theme.btn_txt_color}>{translate('import')}</Text>
                </Button>
              </Stack>
            </Stack>
          </FormControl>
        </Box>
      </Container>
    </Center>
  );
}

import React, { useState, useContext, useEffect } from 'react';
import { Dimensions, Platform } from 'react-native';
import { Container, Content, Button, Label, Input, Item, Form, Text, Icon, Toast } from 'native-base';
import theme from '../resources/theme.json';
import translate from '../utils/language.utils';
import { Store } from '../Store';
import DocumentPicker from 'react-native-document-picker';
import RNFetchBlob from 'rn-fetch-blob';
import { encrypt } from '../utils/crypto';
import { fileIsValid, importFromFile } from '../utils/dbhelper';

const deviceWidth = Dimensions.get('window').width;
const contentWidth = deviceWidth - theme.content_margin;

export function ImportNoteScreen({ navigation }) {
  const { state } = useContext(Store);
  const [fileName, setFileName] = useState('');
  const [fileFullName, setFileFullName] = useState('');
  const [exportDisabled, setExportDisabled] = useState(true);

  const importCallback = rtnCode => {
    if (rtnCode === '00') {
      Toast.show({
        text: translate('import_success') + fileName,
        buttonText: translate('ok'),
        position: 'top',
        duration: 3000,
        style: {
          marginLeft: theme.toast_width_margin,
          marginRight: theme.toast_width_margin,
          backgroundColor: state.config.favColor,
        },
        onClose: () => {
          navigation.navigate('NoteMain');
        },
      });
    } else {
      Toast.show({
        text: translate('import_failed'),
        buttonText: translate('ok'),
        position: 'top',
        duration: 3000,
        style: {
          marginLeft: theme.toast_width_margin,
          marginRight: theme.toast_width_margin,
        },
        backgroundColor: theme.toast_fail_bg_color,
      });
    }
  };

  return (
    <Container style={{ width: deviceWidth, alignItems: 'center' }}>
      <Content style={{ width: contentWidth }}>
        <Form
          style={{
            marginTop: 20,
          }}>
          <Item floatingLabel last>
            <Label>{translate('import_file')}</Label>
            <Input
              value={fileName}
              onChangeText={text => {
                setFileName(text);
              }}
            />

            <Icon
              active
              type="FontAwesome"
              name="file-text-o"
              onPress={() => {
                DocumentPicker.pick({
                  type: [DocumentPicker.types.allFiles],
                })
                  .then(res => {
                    let filePath;
                    if (Platform.OS === 'ios') {
                      filePath = res.uri.replace('file://', '');
                    } else {
                      filePath = res.uri.split('raw%3A')[1].replace(/\%2F/gm, '/');
                    }

                    RNFetchBlob.fs.readFile(filePath, 'utf-8').then(file => {
                      if (fileIsValid(file)) {
                        setFileName(res.name);
                        setExportDisabled(false);
                        setFileFullName(filePath);
                      } else {
                        setFileName('');
                        setExportDisabled(true);
                        setFileFullName('');
                        Toast.show({
                          text: translate('file_invalid'),
                          buttonText: translate('ok'),
                          position: 'top',
                          duration: 3000,
                          style: {
                            marginLeft: theme.toast_width_margin,
                            marginRight: theme.toast_width_margin,
                          },
                          backgroundColor: theme.toast_fail_bg_color,
                        });
                      }
                    });
                  })
                  .catch(err => {
                    if (DocumentPicker.isCancel(err)) {
                      console.log('User Cancelled..');
                    } else {
                      throw err;
                    }
                  });
              }}
            />
          </Item>
          <Button
            block
            style={{
              marginTop: 50,
              height: theme.btn_full_height,
              backgroundColor: state.config.favColor,
            }}
            onPress={() => {
              RNFetchBlob.fs.readFile(fileFullName, 'utf-8').then(file => {
                let notes = JSON.parse(file);
                let noteList = notes.noteList;

                importFromFile(state.config.notegroup, noteList, state.config.encryptionkey, encrypt, importCallback);
              });
            }}
            disabled={exportDisabled}>
            <Text>{translate('import')}</Text>
          </Button>
        </Form>
      </Content>
    </Container>
  );
}

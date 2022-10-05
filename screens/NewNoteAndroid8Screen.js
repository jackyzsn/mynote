import React, { useState, useContext } from 'react';
import { Dimensions, Platform } from 'react-native';
import {
  Container,
  Content,
  Footer,
  FooterTab,
  Button,
  Textarea,
  Text,
  Toast,
  Item,
  Input,
  Label,
  Icon,
} from 'native-base';
import theme from '../resources/theme.json';
import translate from '../utils/language.utils';
import { Store } from '../Store';
import { encrypt } from '../utils/crypto';
import { insertNote } from '../utils/dbhelper';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;
const contentWidth = deviceWidth - theme.content_margin;
const contentHeight = deviceHeight * 0.8;

export function NewNoteAndroid8Screen({ navigation }) {
  const { state } = useContext(Store);
  const [notecontent, setNotecontent] = useState('');
  const [notetag, setNotetag] = useState('');

  const showToast = rtnCode => {
    if (rtnCode === '00') {
      Toast.show({
        text: translate('note_save_success'),
        buttonText: translate('ok'),
        position: 'top',
        duration: theme.toast_delay_duration,
        onClose: () => {
          navigation.navigate('NoteMain');
        },
        style: {
          marginLeft: theme.toast_width_margin,
          marginRight: theme.toast_width_margin,
          backgroundColor: state.config.favColor,
        },
      });
    } else if (rtnCode === '10') {
      Toast.show({
        text: translate('note_tag_exist'),
        buttonText: translate('ok'),
        position: 'top',
        duration: theme.toast_delay_duration,
        style: {
          marginLeft: theme.toast_width_margin,
          marginRight: theme.toast_width_margin,
        },
        backgroundColor: theme.toast_fail_bg_color,
      });
    } else {
      Toast.show({
        text: translate('note_save_failed'),
        buttonText: translate('ok'),
        position: 'top',
        duration: theme.toast_delay_duration,
        style: {
          marginLeft: theme.toast_width_margin,
          marginRight: theme.toast_width_margin,
        },
        backgroundColor: theme.toast_fail_bg_color,
      });
    }
  };

  return (
    <Container>
      <Content>
        <Item
          floatingLabel
          style={{
            marginLeft: 15,
            marginTop: 5,
          }}>
          <Label>{translate('note_tag')}</Label>
          <Input
            value={notetag}
            onChangeText={text => {
              setNotetag(text);
            }}
          />
          <Icon
            active
            type="FontAwesome"
            name="download"
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

                  RNFS.readFile(filePath, 'utf8').then(file => {
                    setNotecontent(file);
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
        <Textarea
          style={{
            height: deviceHeight,
            width: '100%',
            marginLeft: 5,
            marginRight: 5,
          }}
          placeholder={translate('note_area')}
          value={notecontent}
          onChangeText={text => {
            setNotecontent(text);
          }}
          autoCorrect={false}
          numberOfLines={40}
        />
      </Content>
      <Footer>
        <FooterTab
          style={{
            backgroundColor: state.config.favColor,
          }}>
          <Button
            vertical
            onPress={() => {
              let tmpTxt = encrypt(notecontent, state.config.encryptionkey);
              insertNote(state.config.notegroup, notetag, tmpTxt, showToast);
            }}
            disabled={notetag.trim() === ''}>
            <Text style={{ color: theme.btn_txt_color }}>{translate('save')}</Text>
          </Button>
          <Button
            vertical
            onPress={() => {
              navigation.navigate('NoteMain');
            }}>
            <Text style={{ color: theme.btn_txt_color }}>{translate('cancel')}</Text>
          </Button>
        </FooterTab>
      </Footer>
    </Container>
  );
}

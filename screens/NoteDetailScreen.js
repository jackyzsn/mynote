import React, { useState, useContext, useEffect } from 'react';
import { Dimensions, Alert } from 'react-native';
import {
  Container,
  TextArea,
  Text,
  Icon,
  Input,
  Box,
  Center,
  HStack,
  Pressable,
  useToast,
  Heading,
  Divider,
} from 'native-base';
import theme from '../resources/theme.json';
import translate from '../utils/language.utils';
import { Store } from '../Store';
import { encrypt, decrypt } from '../utils/crypto';
import { retrieveNoteDetail, updateNote } from '../utils/dbhelper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const deviceWidth = Dimensions.get('window').width;
const contentWidth = deviceWidth - theme.content_margin;

export function NoteDetailScreen({ route, navigation }) {
  const { state } = useContext(Store);
  const [notecontent, setNotecontent] = useState('');
  const [updatable, setUpdatable] = useState(true);
  const [detailUpdated, setDetailUpdated] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchStartFrom, setSearchStartFrom] = useState(0);
  const { id, notetag, backto } = route.params;

  const toast = useToast();

  let textAreaRef = null;

  const updateCallback = rtnCode => {
    if (rtnCode === '00') {
      toast.show({
        description: translate('note_update_success'),
        placement: 'top',
        duration: 3000,
        onCloseComplete: () => {
          navigation.navigate('BrowseNote');
        },
        bgColor: state.config.favColor,
      });
    } else {
      toast.show({
        description: translate('note_update_failed'),
        placement: 'top',
        duration: 3000,
        bgColor: theme.toast_fail_bg_color,
      });
    }
  };

  const decryptText = (rtnCode, encryptedText) => {
    if (rtnCode === '00') {
      let decryptedText = decrypt(encryptedText, state.config.encryptionkey);
      if (decryptedText) {
        setNotecontent(decryptedText);
        setUpdatable(true);
      } else {
        setNotecontent(encryptedText);
        setUpdatable(false);
        toast.show({
          description: translate('note_not_decrypted'),
          placement: 'top',
          duration: 3000,
          bgColor: theme.toast_fail_bg_color,
        });
      }
    } else {
      toast.show({
        description: translate('note_not_found'),
        placement: 'top',
        duration: 3000,
        onCloseComplete: () => {
          navigation.navigate('BrowseNote');
        },
        bgColor: theme.toast_fail_bg_color,
      });
    }
  };

  useEffect(() => {
    retrieveNoteDetail(id, decryptText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const confirmCancel = navigation =>
    Alert.alert(
      translate('confirm_exit_title'),
      translate('confirm_exit_body'),
      [
        {
          text: translate('save'),
          onPress: () => {
            let tmpTxt = encrypt(notecontent, state.config.encryptionkey);
            updateNote(id, tmpTxt, updateCallback);
            navigation.navigate(backto);
          },
        },
        {
          text: translate('not_save'),
          onPress: () => {
            navigation.navigate(backto);
          },
        },
      ],
      { cancelable: false }
    );

  const searchTextArea = () => {
    let inx = notecontent.toLowerCase().indexOf(searchText.trim().toLowerCase(), searchStartFrom);

    if (inx > -1) {
      setSearchStartFrom(inx + searchText.length);

      textAreaRef.setNativeProps({
        selection: {
          start: inx,
          end: inx + searchText.length,
        },
      });
      textAreaRef.focus();
    } else {
      setSearchStartFrom(0);
      textAreaRef.setNativeProps({ start: 0, end: 0 });
      toast.show({
        description: translate('end_of_search'),
        placement: 'top',
        duration: 3000,
        bgColor: state.config.favColor,
      });
    }
  };

  return (
    <Box flex={1} bg="white" safeAreaTop width="100%" alignSelf="center">
      <HStack w="98%" bg="transparent" alignItems="center" justifyContent="space-between" safeAreaBottom shadow={6}>
        <Pressable
          cursor="pointer"
          mt={2}
          ml={2}
          onPress={() => {
            if (detailUpdated) {
              confirmCancel(navigation);
            } else {
              navigation.navigate(backto);
            }
          }}>
          <MaterialIcons name="arrow-back-ios" size={24} color={theme.major_text_color} />
        </Pressable>
        <Heading size="md" color={theme.major_text_color}>
          {notetag}
        </Heading>
        <Input
          borderWidth={0}
          w="30%"
          value={searchText}
          onChangeText={text => {
            setSearchText(text);
          }}
          placeholder={translate('search_text')}
          InputRightElement={
            <Pressable
              onPress={searchTextArea}
              opacity={!searchText || searchText.trim().length === 0 ? 0.5 : 1}
              disabled={!searchText || searchText.trim().length === 0}>
              <Icon as={<MaterialIcons name="search" />} size={8} mr="2" />
            </Pressable>
          }
        />
      </HStack>
      <Divider my="2" bg="lightgrey" />
      <Center justifyContent="flex-start" flex={1}>
        <Container width={contentWidth}>
          <Box w="100%">
            <TextArea
              w="100%"
              h="100%"
              borderWidth={0}
              placeholder={translate('note_area')}
              value={notecontent}
              onChangeText={text => {
                setNotecontent(text);
                setDetailUpdated(true);
                textAreaRef.setNativeProps({
                  selection: null,
                });
              }}
              ref={ref => {
                textAreaRef = ref;
              }}
              autoCorrect={false}
              selectionColor={state.config.favColor}
              underlineColorAndroid={state.config.favColor}
              maxLength={10240000}
            />
          </Box>
        </Container>
      </Center>
      <HStack bg={state.config.favColor} alignItems="center" safeAreaBottom shadow={6}>
        <Pressable
          cursor="pointer"
          opacity={!updatable || notecontent.trim() === '' ? 0.5 : 1}
          py="3"
          flex={1}
          disabled={!updatable || notecontent.trim() === ''}
          onPress={() => {
            let tmpTxt = encrypt(notecontent, state.config.encryptionkey);
            updateNote(id, tmpTxt, updateCallback);
          }}>
          <Center>
            <Icon mb="1" as={<MaterialIcons name="update" />} color="white" size="sm" />
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
            if (detailUpdated) {
              confirmCancel(navigation);
            } else {
              navigation.navigate(backto);
            }
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

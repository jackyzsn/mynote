import React, { useState, useContext, useEffect } from 'react';
import { Dimensions, Alert, Keyboard } from 'react-native';
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
  ScrollView,
  IconButton,
} from 'native-base';
import HighlightText from '@sanar/react-native-highlight-text';
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
  const [edit, setEdit] = useState(false);
  const [toLocate, setToLocate] = useState(false);
  const [searchHit, setSearchHit] = useState(false);

  const [lines, setLines] = useState([]);

  const toast = useToast();

  let textAreaRef = null;
  let searchTextInputRef = null;

  const updateCallback = rtnCode => {
    if (rtnCode === '00') {
      toast.show({
        description: translate('note_update_success'),
        placement: 'top',
        duration: theme.toast_delay_duration,
        onCloseComplete: () => {
          navigation.navigate('BrowseNote');
        },
        bgColor: state.config.favColor,
      });
    } else {
      toast.show({
        description: translate('note_update_failed'),
        placement: 'top',
        duration: theme.toast_delay_duration,
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
          duration: theme.toast_delay_duration,
          bgColor: theme.toast_fail_bg_color,
        });
      }
    } else {
      toast.show({
        description: translate('note_not_found'),
        placement: 'top',
        duration: theme.toast_delay_duration,
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

  useEffect(() => {
    if (toLocate) {
      locateTextArea();
      setToLocate(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toLocate]);

  const confirmCancel = () =>
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

  const locateTextArea = () => {
    textAreaRef.setNativeProps({
      selection: {
        start: searchStartFrom,
        end: searchStartFrom,
      },
    });
    textAreaRef.focus();
  };

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
        duration: theme.toast_delay_duration,
        bgColor: state.config.favColor,
      });
    }
  };

  const searchTextView = () => {
    Keyboard.dismiss();
    let inx = notecontent.toLowerCase().indexOf(searchText.trim().toLowerCase(), searchStartFrom);
    if (inx > -1) {
      setSearchHit(true);
    } else {
      setSearchHit(false);
      toast.show({
        description: translate('end_of_search'),
        placement: 'top',
        duration: theme.toast_delay_duration,
        bgColor: state.config.favColor,
      });
    }
  };

  const switchToEdit = event => {
    let clickX = event.nativeEvent.locationX;
    let clickY = event.nativeEvent.locationY;

    let clickedRow = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].baseline - lines[i].ascender < clickY && clickY <= lines[i].baseline + lines[i].descender) {
        clickedRow = i;
      }
    }
    if (clickedRow === -1) {
      clickedRow = lines.length;
    }

    let row = lines[clickedRow].text;
    let calculatedOffset = Math.ceil((row.length * clickX) / lines[clickedRow].width) - 1;
    let rowX = calculatedOffset > row.length ? row.length : calculatedOffset;

    let offset = 0;
    for (let i = 0; i < clickedRow; i++) {
      offset += lines[i].text.length;
    }

    offset += rowX;

    setSearchText('');
    setSearchStartFrom(offset);
    setEdit(true);
    setToLocate(true);
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
              confirmCancel();
            } else {
              navigation.navigate(backto);
            }
          }}>
          <MaterialIcons name="arrow-back-ios" size={24} color={theme.major_text_color} />
        </Pressable>
        <Heading size="md" color={theme.major_text_color}>
          {notetag}
        </Heading>
        <HStack bg="transparent" justifyContent="center" w="35%">
          <IconButton
            icon={<Icon as={MaterialIcons} name="edit" />}
            borderRadius="full"
            _icon={{
              color: state.config.favColor,
              size: 'md',
            }}
            _pressed={{
              bg: theme.bg_highlight_color,
            }}
            onPress={() => {
              setEdit(!edit);
            }}
          />
          <Input
            borderWidth={0}
            value={searchText}
            mr={5}
            onChangeText={text => {
              setSearchText(text);
              setSearchStartFrom(0);
            }}
            onSelectionChange={() => {
              searchTextInputRef.setNativeProps({
                selectionColor: state.config.favColor,
              });
            }}
            ref={ref => {
              searchTextInputRef = ref;
            }}
            placeholder={translate('search_text')}
            InputRightElement={
              <Pressable
                onPress={() => {
                  if (edit) {
                    searchTextArea();
                  } else {
                    searchTextView();
                  }
                }}
                opacity={!searchText || searchText.trim().length === 0 ? 0.5 : 1}
                disabled={!searchText || searchText.trim().length === 0}>
                <Icon as={<MaterialIcons name="search" />} size={8} mr="2" />
              </Pressable>
            }
          />
        </HStack>
      </HStack>
      <Divider my="2" bg="lightgrey" />
      {!edit && (
        <ScrollView>
          <Box w="100%" width={contentWidth} ml={theme.content_margin / 8} mr={theme.content_margin / 8}>
            {!searchHit ? (
              <Text
                textAlign="left"
                onTextLayout={event => {
                  setLines(event.nativeEvent.lines);
                }}
                onPress={switchToEdit}>
                {notecontent}
              </Text>
            ) : (
              <HighlightText
                highlightStyle={{ backgroundColor: state.config.favColor }}
                searchWords={[searchText]}
                textToHighlight={notecontent}
                onPress={switchToEdit}
              />
            )}
          </Box>
        </ScrollView>
      )}
      <Center justifyContent="flex-start" flex={1}>
        <Container>
          {edit && (
            <TextArea
              w="115%"
              h="100%"
              ml={-8}
              mr={-8}
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
              onSelectionChange={() => {
                textAreaRef.setNativeProps({
                  selectionColor: state.config.favColor,
                });
              }}
              ref={ref => {
                textAreaRef = ref;
              }}
              autoCorrect={false}
              maxLength={10240000}
            />
          )}
        </Container>
      </Center>
      <HStack bg={state.config.favColor} alignItems="center" safeAreaBottom shadow={6}>
        <Pressable
          cursor="pointer"
          opacity={!edit || !updatable || notecontent.trim() === '' ? 0.5 : 1}
          py="3"
          flex={1}
          disabled={!edit || !updatable || notecontent.trim() === ''}
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
              confirmCancel();
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

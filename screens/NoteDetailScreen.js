import React, { useState, useContext, useEffect } from 'react';
import { Dimensions, TouchableOpacity, Alert } from 'react-native';
import {
  Container,
  Content,
  Footer,
  FooterTab,
  Button,
  Textarea,
  Text,
  Toast,
  Header,
  Left,
  Right,
  Body,
  Icon,
  Title,
  Item,
  Input,
  Box,
  Center,
  HStack,
  Pressable,
  useToast,
} from 'native-base';
import theme from '../resources/theme.json';
import translate from '../utils/language.utils';
import { Store } from '../Store';
import { encrypt, decrypt } from '../utils/crypto';
import { retrieveNoteDetail, updateNote } from '../utils/dbhelper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FeatherIcons from 'react-native-vector-icons/Feather';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;
const contentWidth = deviceWidth - theme.content_margin;

export function NoteDetailScreen({ route, navigation }) {
  const { state } = useContext(Store);
  const [notecontent, setNotecontent] = useState('');
  const [updatable, setUpdatable] = useState(true);
  const [detailUpdated, setDetailUpdated] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchStartFrom, setSearchStartFrom] = useState(0);
  const { id, notetag, backto } = route.params;
  const [selected, setSelected] = React.useState(1);
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

  return (
    // <Container>
    //   <Header style={{ backgroundColor: 'transparent' }}>
    //     <Left>
    //       <Button
    //         transparent
    //         onPress={() => {
    //           if (detailUpdated) {
    //             confirmCancel(navigation);
    //           } else {
    //             navigation.navigate(backto);
    //           }
    //         }}>
    //         <Icon style={{ color: 'black' }} name="arrow-back" />
    //       </Button>
    //     </Left>
    //     <Body>
    //       <Title style={{ color: 'black' }}>{notetag}</Title>
    //     </Body>
    //     <Right>
    //       <Item
    //         style={{
    //           marginLeft: 10,
    //           marginRight: 20,
    //           marginTop: 5,
    //         }}>
    //         <Input
    //           value={searchText}
    //           onChangeText={text => {
    //             setSearchText(text);
    //           }}
    //           placeholder={translate('search_text')}
    //         />
    //         <TouchableOpacity
    //           onPress={() => {
    //             let inx = notecontent.toLowerCase().indexOf(searchText.trim().toLowerCase(), searchStartFrom);

    //             if (inx > -1) {
    //               setSearchStartFrom(inx + searchText.length);
    //               textAreaRef._root.setNativeProps({
    //                 selection: {
    //                   start: inx,
    //                   end: inx + searchText.length,
    //                 },
    //               });
    //               textAreaRef._root.focus();
    //             } else {
    //               setSearchStartFrom(0);
    //               textAreaRef._root.setNativeProps({ start: 0, end: 0 });
    //               Toast.show({
    //                 text: translate('end_of_search'),
    //                 buttonText: translate('ok'),
    //                 position: 'top',
    //                 duration: 3000,
    //                 style: {
    //                   marginLeft: theme.toast_width_margin,
    //                   marginRight: theme.toast_width_margin,
    //                   backgroundColor: state.config.favColor,
    //                 },
    //               });
    //             }
    //           }}
    //           disabled={!searchText || searchText.trim().length === 0}>
    //           <Icon active name="search" />
    //         </TouchableOpacity>
    //       </Item>
    //     </Right>
    //   </Header>
    //   <Content>
    //     <Textarea
    //       style={{
    //         height: '100%',
    //         width: '100%',
    //         marginLeft: 5,
    //         marginRight: 5,
    //         marginTop: 5,
    //       }}
    //       placeholder={translate('note_area')}
    //       value={notecontent}
    //       onChangeText={text => {
    //         setNotecontent(text);
    //         setDetailUpdated(true);
    //         textAreaRef._root.setNativeProps({
    //           selection: null,
    //         });
    //       }}
    //       ref={ref => {
    //         textAreaRef = ref;
    //       }}
    //       autoCorrect={false}
    //       selectionColor={state.config.favColor}
    //       underlineColorAndroid={state.config.favColor}
    //       maxLength={10240000}
    //     />
    //   </Content>
    //   <Footer>
    //     <FooterTab
    //       style={{
    //         backgroundColor: state.config.favColor,
    //       }}>
    //       <Button
    //         vertical
    //         onPress={() => {
    //           let tmpTxt = encrypt(notecontent, state.config.encryptionkey);
    //           updateNote(id, tmpTxt, updateCallback);
    //         }}
    //         disabled={!updatable || notecontent.trim() === ''}>
    //         <Text style={{ color: theme.btn_txt_color }}>{translate('update')}</Text>
    //       </Button>
    //       <Button
    //         vertical
    //         onPress={() => {
    //           if (detailUpdated) {
    //             confirmCancel(navigation);
    //           } else {
    //             navigation.navigate(backto);
    //           }
    //         }}>
    //         <Text style={{ color: theme.btn_txt_color }}>{translate('cancel')}</Text>
    //       </Button>
    //     </FooterTab>
    //   </Footer>
    // </Container>
    <Box flex={1} bg="white" safeAreaTop width="100%" alignSelf="center">
      <Center justifyContent="flex-start" flex={1}>
        <Container width={contentWidth}>
          <Box w="100%"></Box>
        </Container>
      </Center>
      <HStack bg={state.config.favColor} alignItems="center" safeAreaBottom shadow={6}>
        <Pressable
          cursor="pointer"
          opacity={selected === 0 ? 1 : 0.5}
          py="3"
          flex={1}
          disabled={!updatable || notecontent.trim() === ''}
          onPress={() => {
            setSelected(0);
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
          opacity={selected === 1 ? 1 : 0.5}
          py="2"
          flex={1}
          onPress={() => {
            setSelected(1);
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

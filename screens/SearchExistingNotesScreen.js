import React, { useState, useContext } from 'react';
import { Dimensions, Alert } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import {
  Container,
  Center,
  HStack,
  FlatList,
  Text,
  VStack,
  Icon,
  useToast,
  Box,
  Pressable,
  Heading,
  Input,
  Divider,
} from 'native-base';
import theme from '../resources/theme.json';
import translate from '../utils/language.utils';
import { Store } from '../Store';
import { decrypt } from '../utils/crypto';
import { deleteNotes, searchTextAllNotes, exportToFile } from '../utils/dbhelper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontistoIcons from 'react-native-vector-icons/Fontisto';

const deviceWidth = Dimensions.get('window').width;
const contentWidth = deviceWidth - theme.content_margin;

export function SearchExistingNotesScreen({ route, navigation }) {
  const { state } = useContext(Store);
  const [searchText, setSearchText] = useState('');
  const [notelist, setNotelist] = useState([]);
  const [checkboxes, setCheckboxes] = useState([]);

  const toast = useToast();

  const confirmExport = list => {
    Alert.alert(
      translate('confirm'),
      translate('q_export_note'),
      [
        {
          text: translate('cancel'),
          style: 'cancel',
        },
        {
          text: translate('ok'),
          onPress: () => {
            exportToFile(list, state.config.encryptionkey, decrypt, exportCallback);
          },
        },
      ],
      { cancelable: false }
    );
  };

  const exportCallback = (rtnCode, fileName) => {
    if (rtnCode === '00') {
      toast.show({
        description: translate('export_success') + fileName,
        placement: 'top',
        duration: theme.toast_delay_duration,
        bgColor: state.config.favColor,
      });
      setCheckboxes([]);
    } else if (rtnCode === '10') {
      toast.show({
        description: translate('nothing_export'),
        placement: 'top',
        duration: theme.toast_delay_duration,
        bgColor: theme.toast_fail_bg_color,
      });
    } else {
      toast.show({
        description: translate('export_failed'),
        placement: 'top',
        duration: theme.toast_delay_duration,
        bgColor: theme.toast_fail_bg_color,
      });
    }
  };

  const confirmDelete = list => {
    Alert.alert(
      translate('confirm'),
      translate('q_delete_note'),
      [
        {
          text: translate('cancel'),
          style: 'cancel',
        },
        { text: translate('ok'), onPress: () => deleteList(list) },
      ],
      { cancelable: false }
    );
  };

  const deleteCallback = (rtnCode, list) => {
    if (rtnCode === '00') {
      // remove checkboxes/notelist
      let wkNotelist = notelist;

      list.map(function (item) {
        wkNotelist.splice(
          wkNotelist.findIndex(x => x.id === item),
          1
        );
      });

      setCheckboxes([]);
      setNotelist(wkNotelist);

      toast.show({
        description: translate('note_delete_success'),
        placement: 'top',
        duration: theme.toast_delay_duration,
        bgColor: state.config.favColor,
      });
    } else {
      toast.show({
        description: translate('note_delete_failed'),
        placement: 'top',
        duration: theme.toast_delay_duration,
        bgColor: theme.toast_fail_bg_color,
      });
    }
  };

  const deleteList = list => {
    // delete from DB
    deleteNotes(list, deleteCallback);
  };

  const toggleCheckbox = id => {
    let wkChkboxes = [...checkboxes];

    if (wkChkboxes && wkChkboxes.includes(id)) {
      wkChkboxes.splice(wkChkboxes.indexOf(id), 1);
    } else {
      wkChkboxes.push(id);
    }

    setCheckboxes(wkChkboxes);
  };

  return (
    <Box flex={1} bg="white" safeAreaTop width="100%" alignSelf="center">
      <HStack w="98%" bg="transparent" alignItems="center" justifyContent="space-between" safeAreaBottom shadow={6}>
        <Pressable
          cursor="pointer"
          mt={2}
          ml={2}
          onPress={() => {
            navigation.navigate('NoteMain');
          }}>
          <MaterialIcons name="arrow-back-ios" size={24} color={theme.major_text_color} />
        </Pressable>
        <Heading size="md" color={theme.major_text_color}>
          {translate('search_in_notes')}
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
              onPress={() => {
                searchTextAllNotes(
                  state.config.notegroup,
                  searchText,
                  state.config.encryptionkey,
                  decrypt,
                  setNotelist
                );
              }}
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
            <FlatList
              data={notelist}
              renderItem={({ item, inx }) => (
                <Box borderBottomWidth="1" borderColor={theme.minor_text_color} pl={['0', '4']} pr={['0', '5']} py="2">
                  <HStack space={[2, 3]} justifyContent="space-evenly" alignItems="center" w="100%">
                    <CheckBox
                      key={inx}
                      boxType="square"
                      onCheckColor="white"
                      onFillColor={state.config.favColor}
                      onTintColor={state.config.favColor}
                      value={checkboxes.includes(item.id) ? true : false}
                      onValueChange={() => toggleCheckbox(item.id)}
                    />

                    <Pressable
                      onPress={() =>
                        navigation.navigate('NoteDetail', {
                          id: item.id,
                          notetag: item.note_tag,
                          backto: 'SearchExistingNotes',
                        })
                      }>
                      <VStack>
                        <Text color={theme.major_text_color}>{item.note_tag}</Text>
                        <Text color={theme.major_text_color}>{item.updt}</Text>
                      </VStack>
                    </Pressable>
                    <Pressable
                      onPress={() =>
                        navigation.navigate('NoteDetail', {
                          id: item.id,
                          notetag: item.note_tag,
                          backto: 'SearchExistingNotes',
                        })
                      }>
                      <MaterialIcons name="arrow-forward" size={24} color={theme.major_text_color} />
                    </Pressable>
                  </HStack>
                </Box>
              )}
            />
          </Box>
        </Container>
      </Center>
      <HStack bg={state.config.favColor} alignItems="center" safeAreaBottom shadow={6}>
        <Pressable
          cursor="pointer"
          opacity={checkboxes.length === 0 ? 0.5 : 1}
          py="3"
          flex={1}
          disabled={checkboxes.length === 0}
          onPress={() => {
            confirmDelete(checkboxes);
          }}>
          <Center>
            <Icon mb="1" as={<MaterialIcons name="delete" />} color="white" size="sm" />
            <Text color="white" fontSize="12">
              {translate('delete')}
            </Text>
          </Center>
        </Pressable>
        <Pressable
          cursor="pointer"
          opacity={checkboxes.length === 0 || !state.config.hasPermission ? 0.5 : 1}
          py="2"
          flex={1}
          disabled={checkboxes.length === 0 || !state.config.hasPermission}
          onPress={() => {
            confirmExport(checkboxes);
          }}>
          <Center>
            <Icon mb="1" as={<FontistoIcons name="export" />} color="white" size="sm" />
            <Text color="white" fontSize="12">
              {translate('export')}
            </Text>
          </Center>
        </Pressable>
        <Pressable
          cursor="pointer"
          py="2"
          flex={1}
          onPress={() => {
            navigation.navigate('NoteMain');
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

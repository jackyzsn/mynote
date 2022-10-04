import React, { useState, useContext, useEffect } from 'react';
import { Dimensions, Alert } from 'react-native';
import { Container, Center, HStack, FlatList, Text, VStack, Icon, Checkbox, Toast, Box, Pressable } from 'native-base';
import theme from '../resources/theme.json';
import translate from '../utils/language.utils';
import { Store } from '../Store';
import { deleteNotes, retrieveAllNotes, exportToFile } from '../utils/dbhelper';
import { decrypt } from '../utils/crypto';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontistoIcons from 'react-native-vector-icons/Fontisto';

const deviceWidth = Dimensions.get('window').width;
// const deviceHeight = Dimensions.get('window').height;
const contentWidth = deviceWidth - theme.content_margin;

export function BrowseNoteScreen({ navigation }) {
  const { state } = useContext(Store);
  const [notelist, setNotelist] = useState([]);
  const [checkboxes, setCheckboxes] = useState([]);
  const [selected, setSelected] = React.useState(1);

  // Refresh browse all page everytime when focus, to refesh the timestamp on the page
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => navigation.addListener('focus', () => retrieveAllNotes(state.config.notegroup, setNotelist)), []);

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
          onPress: () => exportToFile(list, state.config.encryptionkey, decrypt, exportCallback),
        },
      ],
      { cancelable: false }
    );
  };

  const exportCallback = (rtnCode, fileName) => {
    if (rtnCode === '00') {
      Toast.show({
        text: translate('export_success') + fileName,
        buttonText: translate('ok'),
        position: 'top',
        duration: 3000,
        style: {
          marginLeft: theme.toast_width_margin,
          marginRight: theme.toast_width_margin,
          backgroundColor: state.config.favColor,
        },
      });
      setCheckboxes([]);
    } else if (rtnCode === '10') {
      Toast.show({
        text: translate('nothing_export'),
        buttonText: translate('ok'),
        position: 'top',
        duration: 3000,
        style: {
          marginLeft: theme.toast_width_margin,
          marginRight: theme.toast_width_margin,
        },
        backgroundColor: theme.toast_fail_bg_color,
      });
    } else {
      Toast.show({
        text: translate('export_failed'),
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

      Toast.show({
        text: translate('note_delete_success'),
        buttonText: translate('ok'),
        position: 'top',
        duration: 3000,
        style: {
          marginLeft: theme.toast_width_margin,
          marginRight: theme.toast_width_margin,
          backgroundColor: state.config.favColor,
        },
      });
    } else {
      Toast.show({
        text: translate('note_delete_failed'),
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
      <Center justifyContent="flex-start" flex={1}>
        <Container width={contentWidth}>
          <Box w="100%">
            <FlatList
              data={notelist}
              renderItem={({ item, inx }) => (
                <Box
                  borderBottomWidth="1"
                  _dark={{
                    borderColor: 'muted.50',
                  }}
                  borderColor="muted.800"
                  pl={['0', '4']}
                  pr={['0', '5']}
                  py="2">
                  <HStack space={[2, 3]} justifyContent="space-evenly" alignItems="center" w="100%">
                    <Checkbox
                      key={inx}
                      accessibilityLabel="choose note"
                      color={state.config.favColor}
                      checked={checkboxes.includes(item.id) ? true : false}
                      onPress={() => toggleCheckbox(item.id)}
                    />

                    <Pressable
                      onPress={() =>
                        navigation.navigate('NoteDetail', {
                          id: item.id,
                          notetag: item.note_tag,
                          backto: 'BrowseNote',
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
                          backto: 'BrowseNote',
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
          opacity={selected === 0 ? 1 : 0.5}
          py="3"
          flex={1}
          disabled={checkboxes.length === 0}
          onPress={() => {
            setSelected(0);
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
          opacity={selected === 1 ? 1 : 0.5}
          py="2"
          flex={1}
          disabled={checkboxes.length === 0 || !state.config.hasPermission}
          onPress={() => {
            setSelected(1);
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
          opacity={selected === 2 ? 1 : 0.5}
          py="2"
          flex={1}
          onPress={() => {
            setSelected(2);
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

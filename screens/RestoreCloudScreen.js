import React, { useState, useContext, useEffect } from 'react';
import { Dimensions, Alert } from 'react-native';
import { Container, Center, HStack, FlatList, Text, VStack, Icon, useToast, Box, Pressable, Radio } from 'native-base';
import theme from '../resources/theme.json';
import translate from '../utils/language.utils';
import { Store } from '../Store';
import { retrieveBackups, restoreToDB } from '../utils/dbhelper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const deviceWidth = Dimensions.get('window').width;
const contentWidth = deviceWidth - theme.content_margin;

export function RestoreCloudScreen({ navigation }) {
  const { state, dispatch } = useContext(Store);
  const [backuplist, setBackuplist] = useState([]);
  const [selected, setSelected] = useState(null);

  const toast = useToast();

  // Refresh browse all page everytime when focus, to refesh the timestamp on the page
  const showError = () => {
    toast.show({
      description: translate('retrieve_failed'),
      placement: 'top',
      duration: theme.toast_delay_duration,
      bgColor: theme.toast_fail_bg_color,
    });
  };

  useEffect(
    () =>
      navigation.addListener('focus', () => {
        retrieveBackups(setBackuplist, showError);
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    dispatch({
      type: 'CHANGE_SCREEN',
      payload: 'RestoreCloud',
    });
  }, [dispatch]);

  const restoreCallback = rtnCode => {
    if (rtnCode === '00') {
      toast.show({
        description: translate('restore_success'),
        placement: 'top',
        duration: theme.toast_delay_duration,
        bgColor: state.config.favColor,
      });
    } else {
      toast.show({
        description: translate('restore_failed'),
        placement: 'top',
        duration: theme.toast_delay_duration,
        bgColor: theme.toast_fail_bg_color,
      });
    }
  };

  const confirmRestoreFromCloud = key => {
    Alert.alert(
      translate('confirm'),
      translate('q_restore_from_cloud'),
      [
        {
          text: translate('cancel'),
          style: 'cancel',
        },
        {
          text: translate('ok'),
          onPress: () => {
            restoreToDB(selected, restoreCallback);
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <Box flex={1} bg="white" safeAreaTop width="100%" alignSelf="center">
      <Center justifyContent="flex-start" flex={1}>
        <Container width={contentWidth}>
          <Box w="100%">
            <FlatList
              data={backuplist}
              renderItem={({ item, inx }) => (
                <Box borderBottomWidth="1" borderColor={theme.minor_text_color} pl={['0', '4']} pr={['0', '5']} py="2">
                  <HStack space={[2, 3]} justifyContent="flex-start" alignItems="center" w="100%">
                    <Radio.Group
                      name="backupGroup"
                      accessibilityLabel="backup list"
                      value={selected}
                      onChange={nextValue => {
                        setSelected(nextValue);
                      }}>
                      <Radio value={item.uuid} size="sm" my={1} icon={<Icon as={<MaterialIcons name="check" />} />}>
                        <VStack>
                          <Text color={theme.major_text_color}>{item.device}</Text>
                          <Text color={theme.major_text_color}>{item.backupAt}</Text>
                        </VStack>
                      </Radio>
                    </Radio.Group>
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
          opacity={selected === null ? 0.5 : 1}
          py="2"
          flex={1}
          disabled={selected === null}
          onPress={() => {
            confirmRestoreFromCloud(selected);
          }}>
          <Center>
            <Icon mb="1" as={<MaterialIcons name="restore" />} color="white" size="sm" />
            <Text color="white" fontSize="12">
              {translate('restore')}
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

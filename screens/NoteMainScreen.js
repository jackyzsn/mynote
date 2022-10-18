import React, { useContext, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { Store } from '../Store';
import { Container, Center, Button, Text, Box, useToast } from 'native-base';
import theme from '../resources/theme.json';
import translate from '../utils/language.utils';
import { syncToCloud } from '../utils/dbhelper';

const deviceWidth = Dimensions.get('window').width;
const contentWidth = deviceWidth - theme.content_margin;

export function NoteMainScreen({ navigation }) {
  const { state, dispatch } = useContext(Store);
  const toast = useToast();

  const syncCallback = rtnCode => {
    if (rtnCode === '00') {
      toast.show({
        description: translate('sync_success'),
        placement: 'top',
        duration: theme.toast_delay_duration,
        bgColor: state.config.favColor,
      });
    } else {
      toast.show({
        description: translate('sync_failed'),
        placement: 'top',
        duration: theme.toast_delay_duration,
        bgColor: theme.toast_fail_bg_color,
      });
    }
  };

  useEffect(() => {
    dispatch({
      type: 'CHANGE_SCREEN',
      payload: 'NoteMain',
    });
  }, [dispatch]);

  return (
    <Center>
      <Container width={contentWidth}>
        <Box alignItems="center" w="100%">
          <Button
            block
            w="100%"
            mt={10}
            bgColor={state.config.favColor}
            onPress={() => {
              navigation.navigate('BrowseNote');
            }}>
            <Text color={theme.btn_txt_color}>{translate('browse_all_notes')}</Text>
          </Button>
          <Button
            block
            mt={10}
            w="100%"
            bgColor={state.config.favColor}
            onPress={() => {
              navigation.navigate('NewNote');
            }}>
            <Text color={theme.btn_txt_color}>{translate('add_new_note')}</Text>
          </Button>
          <Button
            block
            mt={10}
            w="100%"
            bgColor={state.config.favColor}
            onPress={() => {
              navigation.navigate('SearchExistingNotes');
            }}>
            <Text color={theme.btn_txt_color}>{translate('search_note')}</Text>
          </Button>
          <Button
            block
            mt={10}
            w="100%"
            bgColor={state.config.favColor}
            onPress={() => {
              navigation.navigate('ImportNote');
            }}>
            <Text color={theme.btn_txt_color}>{translate('import_note_file')}</Text>
          </Button>
          <Button
            block
            mt={10}
            w="100%"
            bgColor={state.config.favColor}
            onPress={() => {
              syncToCloud(syncCallback);
            }}>
            <Text color={theme.btn_txt_color}>{translate('sync_to_cloud')}</Text>
          </Button>
        </Box>
      </Container>
    </Center>
  );
}

import React, { useContext } from 'react';
import { Dimensions } from 'react-native';
import { Store } from '../Store';
import { Container, Center, Button, Text, Box } from 'native-base';
import theme from '../resources/theme.json';
import translate from '../utils/language.utils';

const deviceWidth = Dimensions.get('window').width;
const contentWidth = deviceWidth - theme.content_margin;

export function NoteMainScreen({ navigation }) {
  const { state } = useContext(Store);

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
        </Box>
      </Container>
    </Center>
  );
}

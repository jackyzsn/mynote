import React, { useContext } from "react";
import { Dimensions } from "react-native";
import { Store } from "../Store";
import { Container, Content, Button, Text } from "native-base";
import theme from "../resources/theme.json";
import translate from "../utils/language.utils";

const deviceWidth = Dimensions.get("window").width;
const contentWidth = deviceWidth - theme.content_margin;

export function NoteMainScreen({ navigation }) {
  const { state } = useContext(Store);

  return (
    <Container style={{ width: deviceWidth, alignItems: "center" }}>
      <Content style={{ width: contentWidth }}>
        <Button
          block
          style={{
            marginTop: 20,
            height: theme.btn_full_height,
            backgroundColor: state.config.favColor,
          }}
          onPress={() => {
            navigation.navigate("BrowseNote");
          }}
        >
          <Text>{translate("browse_all_notes")}</Text>
        </Button>
        <Button
          block
          style={{
            marginTop: 20,
            height: theme.btn_full_height,
            backgroundColor: state.config.favColor,
          }}
          onPress={() => {
            navigation.navigate("NewNote");
          }}
        >
          <Text>{translate("add_new_note")}</Text>
        </Button>
        <Button
          block
          style={{
            marginTop: 20,
            height: theme.btn_full_height,
            backgroundColor: state.config.favColor,
          }}
          onPress={() => {
            navigation.navigate("SearchExistingNotes");
          }}
        >
          <Text>{translate("search_note")}</Text>
        </Button>
        <Button
          block
          style={{
            marginTop: 20,
            height: theme.btn_full_height,
            backgroundColor: state.config.favColor,
          }}
          onPress={() => {
            navigation.navigate("ImportNote");
          }}
        >
          <Text>{translate("import_note_file")}</Text>
        </Button>
      </Content>
    </Container>
  );
}

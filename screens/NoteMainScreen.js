import React from "react";
import { Dimensions } from "react-native";
import { Container, Content, Button, Text } from "native-base";
import theme from "../resources/theme.json";
import translate from "../utils/language.utils";

const deviceWidth = Dimensions.get("window").width;
const contentWidth = deviceWidth - theme.content_margin;

export function NoteMainScreen({ navigation }) {
  return (
    <Container style={{ width: deviceWidth, alignItems: "center" }}>
      <Content style={{ width: contentWidth }}>
        <Button
          block
          style={{
            marginTop: 20,
            height: theme.btn_full_height,
            backgroundColor: theme.btn_bg_color,
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
            backgroundColor: theme.btn_bg_color,
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
            backgroundColor: theme.btn_bg_color,
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
            backgroundColor: theme.btn_bg_color,
          }}
          onPress={() => {
            navigation.navigate("ImportNote");
          }}
        >
          <Text>{translate("import_note")}</Text>
        </Button>
      </Content>
    </Container>
  );
}

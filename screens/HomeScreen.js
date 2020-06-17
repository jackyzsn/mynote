import React, { useState, useContext, useEffect } from "react";
import { Dimensions } from "react-native";
import {
  Container,
  Content,
  Button,
  Label,
  Input,
  Item,
  Form,
  Text,
} from "native-base";
import theme from "../resources/theme.json";
import translate from "../utils/language.utils";
import { Store } from "../Store";
import { createTable } from "../utils/dbhelper";

const deviceWidth = Dimensions.get("window").width;
const contentWidth = deviceWidth - theme.content_margin;

export function HomeScreen({ navigation }) {
  const { state, dispatch } = useContext(Store);
  const [notegroup, setNotegroup] = useState(state.config.notegroup);
  const [encrypkey, setEncrypkey] = useState(state.config.encryptionkey);

  // Only want to execute once
  useEffect(() => {
    createTable();
  }, []);

  return (
    <Container style={{ width: deviceWidth, alignItems: "center" }}>
      <Content style={{ width: contentWidth }}>
        <Form
          style={{
            marginTop: 20,
          }}
        >
          <Item floatingLabel>
            <Label>{translate("note_group")}</Label>
            <Input
              value={notegroup}
              onChangeText={(text) => {
                setNotegroup(text);
              }}
            />
          </Item>
          <Item floatingLabel last>
            <Label>{translate("encryption_key")}</Label>
            <Input
              value={encrypkey}
              onChangeText={(text) => {
                setEncrypkey(text);
              }}
            />
          </Item>
          <Button
            block
            style={{
              marginTop: 50,
              height: theme.btn_full_height,
              backgroundColor: theme.btn_bg_color,
            }}
            onPress={() => {
              dispatch({
                type: "CHANGE_CONFIG",
                payload: { notegroup, encryptionkey: encrypkey },
              });
              navigation.navigate("NoteMain");
            }}
          >
            <Text>{translate("next")}</Text>
          </Button>
        </Form>
      </Content>
    </Container>
  );
}

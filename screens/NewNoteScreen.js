import React, { useState, useContext } from "react";
import { Dimensions } from "react-native";
import {
  Container,
  Content,
  Footer,
  FooterTab,
  Button,
  Textarea,
  Text,
  Root,
  Toast,
  Item,
  Input,
  Label,
} from "native-base";
import theme from "../resources/theme.json";
import translate from "../utils/language.utils";
import { Store } from "../Store";
import { encrypt, decrypt } from "../utils/crypto";
import { insertNote } from "../utils/dbhelper";

const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;
const contentWidth = deviceWidth - theme.content_margin;

export function NewNoteScreen({ navigation }) {
  const { state } = useContext(Store);
  const [notecontent, setNotecontent] = useState("");

  const showToast = (success) => {
    if (success === "success") {
      Toast.show({
        text: translate("note_save_success"),
        buttonText: translate("ok"),
        position: "top",
        duration: 3000,
        onClose: () => {
          navigation.navigate("NoteMain");
        },
        style: {
          marginLeft: theme.toast_width_margin,
          marginRight: theme.toast_width_margin,
          backgroundColor: theme.toast_success_bg_color,
        },
      });
    } else {
      Toast.show({
        text: translate("note_save_failed"),
        buttonText: translate("ok"),
        position: "top",
        duration: 3000,
        style: {
          marginLeft: theme.toast_width_margin,
          marginRight: theme.toast_width_margin,
        },
        backgroundColor: theme.toast_fail_bg_color,
      });
    }
  };

  return (
    <Root>
      <Container>
        <Content>
          <Item
            floatingLabel
            style={{
              marginLeft: 15,
            }}
          >
            <Label>Note Title</Label>
            <Input />
          </Item>
          <Textarea
            style={{
              height: "100%",
              width: "100%",
              marginLeft: 5,
              marginRight: 5,
            }}
            placeholder="Textarea"
            value={notecontent}
            onChangeText={(text) => {
              setNotecontent(text);
            }}
          />
        </Content>
        <Footer>
          <FooterTab
            style={{
              backgroundColor: theme.btn_bg_color,
            }}
          >
            <Button
              vertical
              onPress={() => {
                let tmpTxt = encrypt(notecontent, state.config.encryptionkey);
                insertNote(state.config.notetag, tmpTxt, showToast);
              }}
            >
              <Text style={{ color: theme.btn_txt_color }}>
                {translate("save")}
              </Text>
            </Button>
            <Button
              vertical
              onPress={() => {
                navigation.navigate("NoteMain");
              }}
            >
              <Text style={{ color: theme.btn_txt_color }}>
                {translate("cancel")}
              </Text>
            </Button>
          </FooterTab>
        </Footer>
      </Container>
    </Root>
  );
}

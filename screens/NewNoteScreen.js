import React, { useState, useContext } from "react";
import { Dimensions, View } from "react-native";
import {
  Container,
  Content,
  Footer,
  FooterTab,
  Button,
  Textarea,
  Text,
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
  const [notetag, setNotetag] = useState("");

  const showToast = (rtnCode) => {
    if (rtnCode === "00") {
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
    } else if (rtnCode === "10") {
      Toast.show({
        text: translate("note_tag_exist"),
        buttonText: translate("ok"),
        position: "top",
        duration: 3000,
        style: {
          marginLeft: theme.toast_width_margin,
          marginRight: theme.toast_width_margin,
        },
        backgroundColor: theme.toast_fail_bg_color,
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
    <Container>
      <Content>
        <Item
          floatingLabel
          style={{
            marginLeft: 15,
            marginTop: 5,
          }}
        >
          <Label>{translate("note_tag")}</Label>
          <Input
            value={notetag}
            onChangeText={(text) => {
              setNotetag(text);
            }}
          />
        </Item>
        <Textarea
          style={{
            height: "100%",
            width: "100%",
            marginLeft: 5,
            marginRight: 5,
          }}
          placeholder={translate("note_area")}
          value={notecontent}
          onChangeText={(text) => {
            setNotecontent(text);
          }}
          autoCorrect={false}
          maxLength={10240000}
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
              insertNote(state.config.notegroup, notetag, tmpTxt, showToast);
            }}
            disabled={notetag.trim() === ""}
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
  );
}

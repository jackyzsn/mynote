import React, { useState, useContext, useEffect } from "react";
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
} from "native-base";
import theme from "../resources/theme.json";
import translate from "../utils/language.utils";
import { Store } from "../Store";
import { encrypt, decrypt } from "../utils/crypto";
import { retrieveNoteDetail } from "../utils/dbhelper";

const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;
const contentWidth = deviceWidth - theme.content_margin;

export function NoteDetailScreen({ route, navigation }) {
  const { state } = useContext(Store);
  const [notecontent, setNotecontent] = useState("");
  const [updatable, setUpdatable] = useState(true);
  const { id } = route.params;

  const decryptText = (success, encryptedText) => {
    if (success === "success") {
      var decryptedText = decrypt(encryptedText, state.config.encryptionkey);
      if (decryptedText) {
        setNotecontent(decryptedText);
        setUpdatable(true);
      } else {
        setNotecontent(encryptedText);
        setUpdatable(false);
        Toast.show({
          text: translate("note_not_decrypted"),
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
    } else {
      Toast.show({
        text: translate("note_not_found"),
        buttonText: translate("ok"),
        position: "top",
        duration: 3000,
        style: {
          marginLeft: theme.toast_width_margin,
          marginRight: theme.toast_width_margin,
        },
        onClose: () => {
          navigation.navigate("BrowseNote");
        },
        backgroundColor: theme.toast_fail_bg_color,
      });
    }
  };

  useEffect(() => {
    retrieveNoteDetail(id, state.config.encryptionkey, decryptText);
  }, []);

  return (
    <Root>
      <Container>
        <Content>
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
            <Button vertical onPress={() => {}} disabled={!updatable}>
              <Text style={{ color: theme.btn_txt_color }}>
                {translate("update")}
              </Text>
            </Button>
            <Button
              vertical
              onPress={() => {
                navigation.navigate("NoteMain");
              }}
              disabled={!updatable}
            >
              <Text style={{ color: theme.btn_txt_color }}>
                {translate("save_as_new")}
              </Text>
            </Button>
            <Button
              vertical
              onPress={() => {
                navigation.navigate("NoteMain");
              }}
            >
              <Text style={{ color: theme.btn_txt_color }}>
                {translate("delete")}
              </Text>
            </Button>
          </FooterTab>
        </Footer>
      </Container>
    </Root>
  );
}

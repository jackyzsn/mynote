import React, { useState, useContext, useEffect } from "react";
import { Dimensions, TouchableOpacity } from "react-native";
import {
  Container,
  Content,
  Footer,
  FooterTab,
  Button,
  Textarea,
  Text,
  Toast,
  Header,
  Left,
  Right,
  Body,
  Icon,
  Title,
  Item,
  Input,
} from "native-base";
import theme from "../resources/theme.json";
import translate from "../utils/language.utils";
import { Store } from "../Store";
import { encrypt, decrypt } from "../utils/crypto";
import { retrieveNoteDetail, updateNote } from "../utils/dbhelper";

const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;
const contentWidth = deviceWidth - theme.content_margin;

export function NoteDetailScreen({ route, navigation }) {
  const { state } = useContext(Store);
  const [notecontent, setNotecontent] = useState("");
  const [updatable, setUpdatable] = useState(true);
  const [searchText, setSearchText] = useState("");
  // const [selection, setSelection] = useState({
  //   start: 0,
  //   end: 0,
  // });
  const [searchStartFrom, setSearchStartFrom] = useState(0);
  const { id, notetag } = route.params;

  let textAreaRef = null;

  // handleSelectionChange = ({ nativeEvent: { selection } }) => {
  //   setSelection(selection);
  //   console.log("handling selection change.." + JSON.stringify(selection));
  // };

  const updateCallback = (rtnCode) => {
    if (rtnCode === "00") {
      Toast.show({
        text: translate("note_update_success"),
        buttonText: translate("ok"),
        position: "top",
        duration: 3000,
        onClose: () => {
          navigation.navigate("BrowseNote");
        },
        style: {
          marginLeft: theme.toast_width_margin,
          marginRight: theme.toast_width_margin,
          backgroundColor: theme.toast_success_bg_color,
        },
      });
    } else {
      Toast.show({
        text: translate("note_update_failed"),
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

  const decryptText = (rtnCode, encryptedText) => {
    if (rtnCode === "00") {
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
    retrieveNoteDetail(id, decryptText);
  }, []);

  return (
    <Container>
      <Header style={{ backgroundColor: "transparent" }}>
        <Left>
          <Button
            transparent
            onPress={() => {
              navigation.navigate("BrowseNote");
            }}
          >
            <Icon style={{ color: "black" }} name="arrow-back" />
          </Button>
        </Left>
        <Body>
          <Title style={{ color: "black" }}>{notetag}</Title>
        </Body>
        <Right>
          <Item
            style={{
              marginLeft: 10,
              marginRight: 20,
              marginTop: 5,
            }}
          >
            <Input
              value={searchText}
              onChangeText={(text) => {
                setSearchText(text);
              }}
              placeholder={translate("search_text")}
            />
            <TouchableOpacity
              onPress={() => {
                var inx = notecontent
                  .toLowerCase()
                  .indexOf(searchText.trim().toLowerCase(), searchStartFrom);

                if (inx > -1) {
                  setSearchStartFrom(inx + searchText.length);
                  textAreaRef._root.focus();
                  textAreaRef._root.setNativeProps({
                    selection: {
                      start: inx,
                      end: inx + searchText.length,
                    },
                  });
                } else {
                  setSearchStartFrom(0);
                  textAreaRef._root.setNativeProps({ start: 0, end: 0 });
                  Toast.show({
                    text: translate("end_of_search"),
                    buttonText: translate("ok"),
                    position: "top",
                    duration: 3000,
                    style: {
                      marginLeft: theme.toast_width_margin,
                      marginRight: theme.toast_width_margin,
                      backgroundColor: theme.toast_success_bg_color,
                    },
                  });
                }
              }}
              disabled={!searchText || searchText.trim().length === 0}
            >
              <Icon active name="search" />
            </TouchableOpacity>
          </Item>
        </Right>
      </Header>
      <Content>
        <Textarea
          style={{
            height: "100%",
            width: "100%",
            marginLeft: 5,
            marginRight: 5,
            marginTop: 5,
          }}
          placeholder={translate("note_area")}
          value={notecontent}
          onChangeText={(text) => {
            setNotecontent(text);
            textAreaRef._root.setNativeProps({
              selection: null,
            });
          }}
          ref={(ref) => {
            textAreaRef = ref;
          }}
          autoFocus={true}
          selectionColor={theme.highlight_bg_color}
          underlineColorAndroid={theme.highlight_bg_color}
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
              updateNote(id, tmpTxt, updateCallback);
            }}
            disabled={!updatable || notecontent.trim() === ""}
          >
            <Text style={{ color: theme.btn_txt_color }}>
              {translate("update")}
            </Text>
          </Button>
          <Button
            vertical
            onPress={() => {
              navigation.navigate("BrowseNote");
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

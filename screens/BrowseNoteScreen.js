import React, { useState, useContext } from "react";
import { Dimensions } from "react-native";
import {
  Container,
  Content,
  Footer,
  FooterTab,
  Button,
  ListItem,
  Text,
  Root,
  Left,
  Body,
  Icon,
  Right,
  Switch,
} from "native-base";
import theme from "../resources/theme.json";
import translate from "../utils/language.utils";
import { Store } from "../Store";
import { encrypt, decrypt } from "../utils/crypto";
import { insertNote } from "../utils/dbhelper";

const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;
const contentWidth = deviceWidth - theme.content_margin;

export function BrowseNoteScreen({ navigation }) {
  const { state } = useContext(Store);
  const [notecontent, setNotecontent] = useState("");
  return (
    <Root>
      <Container>
        <Content>
          <ListItem icon>
            <Left>
              <Button style={{ backgroundColor: "#FF9501" }}>
                <Icon active name="airplane" />
              </Button>
            </Left>
            <Body>
              <Text>Airplane Mode</Text>
            </Body>
            <Right>
              <Switch value={false} />
            </Right>
          </ListItem>
          <ListItem icon>
            <Left>
              <Button style={{ backgroundColor: "#007AFF" }}>
                <Icon active name="wifi" />
              </Button>
            </Left>
            <Body>
              <Text>Wi-Fi</Text>
            </Body>
            <Right>
              <Text>GeekyAnts</Text>
              <Icon active name="arrow-forward" />
            </Right>
          </ListItem>
          <ListItem icon>
            <Left>
              <Button style={{ backgroundColor: "#007AFF" }}>
                <Icon active name="bluetooth" />
              </Button>
            </Left>
            <Body>
              <Text>Bluetooth</Text>
            </Body>
            <Right>
              <Text>On</Text>
              <Icon active name="arrow-forward" />
            </Right>
          </ListItem>
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
                insertNote(state.config.notetag, tmpTxt, showToast, navigation);
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

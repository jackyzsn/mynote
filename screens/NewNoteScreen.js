import React, { useState, useContext } from "react";
import { Alert, Dimensions } from "react-native";
import {
  Container,
  Header,
  Badge,
  Content,
  Footer,
  FooterTab,
  Button,
  Left,
  Right,
  Body,
  Icon,
  Label,
  Item,
  Textarea,
  Text,
  Col,
  Grid,
} from "native-base";
import theme from "../resources/theme.json";
import translate from "../utils/language.utils";
import { Store } from "../Store";

const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;
const contentWidth = deviceWidth - theme.content_margin;

const showAlert = (text) => {
  Alert.alert(text);
};

export function NewNoteScreen({ navigation }) {
  const { state } = useContext(Store);
  const [notecontent, setNotecontent] = useState("");

  return (
    <Container>
      <Content>
        <Textarea
          style={{ height: "100%", width: "100%" }}
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
              showAlert(notecontent);
            }}
          >
            <Text style={{ color: theme.btn_txt_color }}> Save</Text>
          </Button>
          <Button
            vertical
            onPress={() => {
              navigation.navigate("NoteMain");
            }}
          >
            <Text style={{ color: theme.btn_txt_color }}>Cancel</Text>
          </Button>
        </FooterTab>
      </Footer>
    </Container>
  );
}

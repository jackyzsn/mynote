import React from "react";
import { View, Dimensions } from "react-native";
import {
  Container,
  Header,
  Title,
  Content,
  Footer,
  FooterTab,
  Button,
  Left,
  Right,
  Body,
  Icon,
  Label,
  Input,
  Item,
  Form,
  Text,
} from "native-base";
import theme from "../resources/theme.json";
import translate from "../utils/language.utils";

const deviceWidth = Dimensions.get("window").width;
const contentWidth = deviceWidth - theme.content_margin;

export function HomeScreen() {
  return (
    <Container style={{ width: deviceWidth, alignItems: "center" }}>
      <Content style={{ width: contentWidth }}>
        <Form
          style={{
            marginTop: 20,
          }}
        >
          <Item floatingLabel>
            <Label>{translate("note_tag")}</Label>
            <Input />
          </Item>
          <Item floatingLabel last>
            <Label>{translate("encryption_key")}</Label>
            <Input />
          </Item>
          <Button
            block
            success
            style={{
              marginTop: 50,
              height: theme.btn_full_height,
              backgroundColor: theme.btn_bg_color,
            }}
          >
            <Text>{translate("next")}</Text>
          </Button>
        </Form>
      </Content>
    </Container>
  );
}

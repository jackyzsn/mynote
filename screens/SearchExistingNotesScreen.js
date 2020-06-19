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
  ListItem,
  CheckBox,
} from "native-base";
import theme from "../resources/theme.json";
import translate from "../utils/language.utils";
import { Store } from "../Store";
import { encrypt, decrypt } from "../utils/crypto";
import { retrieveNoteDetail, searchTextAllNotes } from "../utils/dbhelper";

const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;
const contentWidth = deviceWidth - theme.content_margin;

export function SearchExistingNotesScreen({ route, navigation }) {
  const { state } = useContext(Store);
  const [searchText, setSearchText] = useState("");
  const [notelist, setNotelist] = useState([]);
  const [checkboxes, setCheckboxes] = useState([]);

  const noteListItems = notelist.map((r, inx) => (
    <ListItem
      icon
      key={inx}
      style={{ marginTop: 5 }}
      onPress={() => {
        navigation.navigate("NoteDetail", {
          id: r.id,
          notetag: r.note_tag,
          backto: "SearchExistingNotes",
        });
      }}
    >
      <Left>
        <CheckBox
          key={inx}
          color={theme.btn_bg_color}
          checked={checkboxes.includes(r.id) ? true : false}
          onPress={() => toggleCheckbox(r.id)}
        />
      </Left>
      <Body>
        <Text
          style={{
            color: theme.major_text_color,
          }}
        >
          {r.note_tag}
        </Text>
        <Text
          style={{
            color: theme.minor_text_color,
            fontWeight: "100",
          }}
        >
          {r.updt}
        </Text>
      </Body>
      <Right>
        <Icon active name="arrow-forward" />
      </Right>
    </ListItem>
  ));

  return (
    <Container>
      <Header style={{ backgroundColor: "transparent" }}>
        <Left>
          <Button
            transparent
            onPress={() => {
              navigation.navigate("NoteMain");
            }}
          >
            <Icon style={{ color: "black" }} name="arrow-back" />
          </Button>
        </Left>
        <Body>
          <Title style={{ color: "black" }}>
            {translate("search_in_notes")}
          </Title>
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
                searchTextAllNotes(
                  state.config.notegroup,
                  searchText,
                  state.config.encryptionkey,
                  decrypt,
                  setNotelist
                );
              }}
              disabled={!searchText || searchText.trim().length === 0}
            >
              <Icon active name="search" />
            </TouchableOpacity>
          </Item>
        </Right>
      </Header>
      <Content>{noteListItems}</Content>
      <Footer>
        <FooterTab
          style={{
            backgroundColor: theme.btn_bg_color,
          }}
        >
          <Button
            vertical
            onPress={() => {
              confirmDelete(checkboxes);
            }}
            disabled={checkboxes.length === 0}
          >
            <Text style={{ color: theme.btn_txt_color }}>
              {translate("delete")}
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

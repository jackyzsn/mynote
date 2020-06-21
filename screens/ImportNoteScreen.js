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
  Icon,
} from "native-base";
import theme from "../resources/theme.json";
import translate from "../utils/language.utils";
import { Store } from "../Store";
// import RNFileSelector from "react-native-file-selector";

const deviceWidth = Dimensions.get("window").width;
const contentWidth = deviceWidth - theme.content_margin;

export function ImportNoteScreen({ navigation }) {
  const { state } = useContext(Store);
  const [fileName, setFileName] = useState("");

  return (
    <Container style={{ width: deviceWidth, alignItems: "center" }}>
      <Content style={{ width: contentWidth }}>
        <Form
          style={{
            marginTop: 20,
          }}
        >
          <Item floatingLabel last>
            <Label>{translate("import_file")}</Label>
            <Input
              value={fileName}
              onChangeText={(text) => {
                setFileName(text);
              }}
            />

            <Icon
              active
              type="FontAwesome"
              name="file-text-o"
              onPress={() => {
                // RNFileSelector.Show({
                //   title: "Select File",
                //   onDone: (path) => {
                //     setFileName(path);
                //     console.log("file selected: " + path);
                //   },
                //   onCancel: () => {
                //     console.log("cancelled");
                //   },
                // });
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
              navigation.navigate("NoteMain");
            }}
          >
            <Text>{translate("import")}</Text>
          </Button>
        </Form>
      </Content>
    </Container>
  );
}

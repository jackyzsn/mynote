import React, { useState, useContext, useEffect } from "react";
import { Dimensions, Platform } from "react-native";
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
import DocumentPicker from "react-native-document-picker";
import RNFetchBlob from "react-native-fetch-blob";

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
                try {
                  DocumentPicker.pick({
                    type: [DocumentPicker.types.allFiles],
                  })
                    .then((res) => {
                      setFileName(res.name);

                      var filePath;
                      if (Platform.OS === "ios") {
                        filePath = uri.replace("file://", "");
                      } else {
                        filePath = res.uri
                          .split("raw%3A")[1]
                          .replace(/\%2F/gm, "/");
                      }

                      RNFetchBlob.fs
                        .readFile(filePath, "utf-8")
                        // files will an array contains filenames
                        .then((files) => {
                          // this.setState({ base64Str: files });
                          console.log(files);
                        });
                    })
                    .catch((err) => {
                      if (DocumentPicker.isCancel(err)) {
                        console.log("Cancelled..");
                        // User cancelled the picker, exit any dialogs or menus and move on
                      } else {
                        throw err;
                      }
                    });
                } catch (err) {
                  if (DocumentPicker.isCancel(err)) {
                    console.log("Cancelled..");
                    // User cancelled the picker, exit any dialogs or menus and move on
                  } else {
                    throw err;
                  }
                }
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

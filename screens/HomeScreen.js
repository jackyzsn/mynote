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
import { createTable } from "../utils/dbhelper";
import {
  requestMultiple,
  checkMultiple,
  PERMISSIONS,
  RESULTS,
} from "react-native-permissions";

const deviceWidth = Dimensions.get("window").width;
const contentWidth = deviceWidth - theme.content_margin;

export function HomeScreen({ navigation }) {
  const { state, dispatch } = useContext(Store);
  const [notegroup, setNotegroup] = useState(state.config.notegroup);
  const [encrypkey, setEncrypkey] = useState(state.config.encryptionkey);
  const [hasPermission, setHasPermission] = useState(
    state.config.hasPermission
  );
  const [secureKey, setSecureKey] = useState(true);

  const checkPermission = () => {
    if (Platform.OS === "android") {
      checkMultiple([
        PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
        PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
      ]).then((statuses) => {
        if (
          statuses[PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE] !==
            RESULTS.GRANTED ||
          statuses[PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE] !==
            RESULTS.GRANTED
        ) {
          requestMultiple([
            PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
            PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
          ]).then((statuses) => {
            if (
              statuses[PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE] ===
                RESULTS.GRANTED &&
              statuses[PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE] ===
                RESULTS.GRANTED
            ) {
              setHasPermission(true);
            } else {
              setHasPermission(false);
            }
          });
        } else {
          setHasPermission(true);
        }
      });
    } else {
      setHasPermission(true);
    }
  };

  // Only want to execute once
  useEffect(() => {
    createTable();
    checkPermission();
  }, []);

  return (
    <Container style={{ width: deviceWidth, alignItems: "center" }}>
      <Content style={{ width: contentWidth }}>
        <Form
          style={{
            marginTop: 20,
          }}
        >
          <Item floatingLabel>
            <Label>{translate("note_group")}</Label>
            <Input
              value={notegroup}
              onChangeText={(text) => {
                setNotegroup(text);
              }}
            />
          </Item>
          <Item floatingLabel last>
            <Label>{translate("encryption_key")}</Label>
            <Input
              value={encrypkey}
              onChangeText={(text) => {
                setEncrypkey(text);
              }}
              secureTextEntry={secureKey}
            />

            <Icon
              active
              name={secureKey ? "eye" : "eye-off"}
              onPress={() => {
                let newState = !secureKey;
                setSecureKey(newState);
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
              dispatch({
                type: "CHANGE_CONFIG",
                payload: { notegroup, encryptionkey: encrypkey, hasPermission },
              });
              navigation.navigate("NoteMain");
            }}
          >
            <Text>{translate("next")}</Text>
          </Button>
        </Form>
      </Content>
    </Container>
  );
}

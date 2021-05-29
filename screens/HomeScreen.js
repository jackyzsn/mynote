import React, { useState, useContext, useEffect } from "react";
import { Dimensions, View } from "react-native";
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
  Fab,
  Spinner,
} from "native-base";
import theme from "../resources/theme.json";
import translate from "../utils/language.utils";
import { Store } from "../Store";
import { createTable } from "../utils/dbhelper";
import AsyncStorage from "@react-native-community/async-storage";
import {
  requestMultiple,
  checkMultiple,
  PERMISSIONS,
  RESULTS,
} from "react-native-permissions";

const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;
const contentWidth = deviceWidth - theme.content_margin;

export function HomeScreen({ navigation }) {
  const { state, dispatch } = useContext(Store);
  const [notegroup, setNotegroup] = useState(state.config.notegroup);
  const [encrypkey, setEncrypkey] = useState(state.config.encryptionkey);
  const [hasPermission, setHasPermission] = useState(
    state.config.hasPermission
  );
  const [secureKey, setSecureKey] = useState(true);
  const [favActive, setFavActive] = useState(false);
  const [themeColor, setThemeColor] = useState("#2D9CDB");
  const [loading, setLoading] = useState(true);

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
    AsyncStorage.getItem("MyNote").then((favColor) => {
      if (favColor) {
        setThemeColor(favColor);
      }
      setLoading(false);
    });
  }, []);

  return (
    <Container>
      {loading ? (
        <View style={{ marginTop: deviceHeight / 2.5 }}>
          <Spinner color="blue" />
        </View>
      ) : (
        <React.Fragment>
          <Content
            style={{
              width: contentWidth,
              marginStart: theme.content_margin / 2,
            }}
          >
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
                  backgroundColor: themeColor,
                }}
                onPress={() => {
                  dispatch({
                    type: "CHANGE_CONFIG",
                    payload: {
                      notegroup,
                      encryptionkey: encrypkey,
                      hasPermission,
                      favColor: themeColor,
                    },
                  });
                  AsyncStorage.setItem("MyNote", themeColor);
                  navigation.navigate("NoteMain");
                }}
              >
                <Text>{translate("next")}</Text>
              </Button>
            </Form>
          </Content>
          <View style={{ flex: 0.5 }}>
            <Text
              style={{
                position: "absolute",
                bottom: 10,
                left: theme.content_margin / 2,
              }}
            >
              v{theme.ver}
            </Text>
            <Fab
              active={favActive}
              direction="up"
              containerStyle={{}}
              style={{ backgroundColor: themeColor }}
              position="bottomRight"
              onPress={() => {
                var nextState = !favActive;
                setFavActive(nextState);
              }}
            >
              <Icon name="settings" style={{ fontSize: 36 }} />
              <Button
                style={{ backgroundColor: "#2D9CDB" }}
                onPress={() => {
                  setThemeColor("#2D9CDB");
                }}
              />
              <Button
                style={{ backgroundColor: "#56CCF2" }}
                onPress={() => {
                  setThemeColor("#56CCF2");
                }}
              />
              <Button
                style={{ backgroundColor: "#27AE60" }}
                onPress={() => {
                  setThemeColor("#27AE60");
                }}
              />
              <Button
                style={{ backgroundColor: "#6FCF97" }}
                onPress={() => {
                  setThemeColor("#6FCF97");
                }}
              />
              <Button
                style={{ backgroundColor: "#F2994A" }}
                onPress={() => {
                  setThemeColor("#F2994A");
                }}
              />
              <Button
                style={{ backgroundColor: "#2F80ED" }}
                onPress={() => {
                  setThemeColor("#2F80ED");
                }}
              />
            </Fab>
          </View>
        </React.Fragment>
      )}
    </Container>
  );
}

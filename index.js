/**
 * @format
 */

import { AppRegistry } from "react-native";
import App from "./App";
import { name as appName } from "./app.json";
import { YellowBox } from "react-native";

YellowBox.ignoreWarnings(["Animated: `useNativeDriver` was not specified."]);

AppRegistry.registerComponent(appName, () => App);

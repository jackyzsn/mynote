import React from "react";
import { Store } from "./Store";
import { View, Text } from "react-native";

export default function Main() {
  const store = React.useContext(Store);

  return (
    <View>
      <Text>This is a test.</Text>
    </View>
  );
}

import React from "react";
import { ActivityIndicator, View } from "react-native";
import { useTheme } from "../theme/useTheme";

export default function Loader() {
  const { theme } = useTheme();
  return (
    <View style={{ padding: 20, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator color={theme.colors.primary} />
    </View>
  );
}

import React from "react";
import { View, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "../theme/useTheme";

type Props = {
  children: React.ReactNode;
  padded?: boolean;
};

export default function Screen({ children, padded = false }: Props) {
  const { theme, mode } = useTheme();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      edges={["top", "left", "right"]}
    >
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          paddingHorizontal: padded ? 16 : 0,
          paddingTop: Platform.OS === "android" ? 6 : 0,
        }}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

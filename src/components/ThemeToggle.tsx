import React from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "../theme/useTheme";

export default function ThemeToggle() {
  const { theme, mode, toggle } = useTheme();
  return (
    <Pressable
      onPress={toggle}
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderWidth: 1,
        padding: 12,
        borderRadius: 14,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <View style={{ gap: 4 }}>
        <Text style={{ color: theme.colors.text, fontWeight: "800" }}>Theme</Text>
        <Text style={{ color: theme.colors.muted, fontSize: 12 }}>
          Dark mode by default (tap to toggle)
        </Text>
      </View>
      <Text style={{ color: theme.colors.primary, fontWeight: "800" }}>
        {mode === "dark" ? "Dark" : "Light"}
      </Text>
    </Pressable>
  );
}

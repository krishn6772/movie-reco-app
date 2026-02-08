import React from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "../theme/useTheme";
import { useAppStore } from "../store/useAppStore";

export default function ContentTypeToggle() {
  const { theme } = useTheme();
  const contentType = useAppStore((s) => s.contentType);
  const setContentType = useAppStore((s) => s.setContentType);

  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderWidth: 1,
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      {(["movie", "tv"] as const).map((t) => {
        const active = contentType === t;
        return (
          <Pressable
            key={t}
            onPress={() => setContentType(t)}
            style={{
              flex: 1,
              paddingVertical: 10,
              alignItems: "center",
              backgroundColor: active ? theme.colors.primary : "transparent",
            }}
          >
            <Text style={{ color: active ? "#fff" : theme.colors.text, fontWeight: "900" }}>
              {t === "movie" ? "Movies" : "TV Series"}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

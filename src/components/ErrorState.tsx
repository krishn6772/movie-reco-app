import React from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "../theme/useTheme";

export default function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  const { theme } = useTheme();

  return (
    <View style={{ padding: 16, gap: 10 }}>
      <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: "700" }}>{title}</Text>
      {!!message && <Text style={{ color: theme.colors.muted }}>{message}</Text>}

      {!!onRetry && (
        <Pressable
          onPress={onRetry}
          style={{
            backgroundColor: theme.colors.primary,
            paddingVertical: 10,
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Retry</Text>
        </Pressable>
      )}
    </View>
  );
}

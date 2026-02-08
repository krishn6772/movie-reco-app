import React from "react";
import { Text, View } from "react-native";
import { useTheme } from "../theme/useTheme";

export default function RatingBadge({ rating }: { rating: number }) {
  const { theme } = useTheme();
  const label = Number.isFinite(rating) ? rating.toFixed(1) : "—";

  return (
    <View
      style={{
        backgroundColor: "rgba(0,0,0,0.6)",
        borderColor: theme.colors.border,
        borderWidth: 1,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
      }}
    >
      <Text style={{ color: theme.colors.text, fontWeight: "700", fontSize: 12 }}>★ {label}</Text>
    </View>
  );
}

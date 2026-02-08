import React from "react";
import { Text, View } from "react-native";
import { useTheme } from "../theme/useTheme";

export default function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const { theme } = useTheme();

  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 18, paddingBottom: 10 }}>
      <Text
        style={{
          color: theme.colors.text,
          fontSize: 20,
          fontWeight: "900",
          letterSpacing: 0.2,
        }}
      >
        {title}
      </Text>

      {!!subtitle && (
        <Text style={{ color: theme.colors.muted, marginTop: 6, fontSize: 12 }}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

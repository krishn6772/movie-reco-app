import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useTheme } from "../theme/useTheme";
import Screen from "../components/Screen";
import { useAuthStore } from "../store/useAuthStore";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import type { AuthStackParamList } from "../navigation/types";

type Nav = NativeStackNavigationProp<AuthStackParamList>;

export default function LoginScreen() {
  const { theme } = useTheme();
  const nav = useNavigation<Nav>();

  const login = useAuthStore((s) => s.login);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Screen padded>
      <Text style={{ color: theme.colors.text, fontSize: 34, fontWeight: "900", marginTop: 6 }}>
        Login
      </Text>
      <Text style={{ color: theme.colors.muted, marginTop: 6 }}>
        Sign in to sync likes + watchlist.
      </Text>

      <View style={{ marginTop: 20, gap: 12 }}>
        <TextInput
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            clearError();
          }}
          placeholder="Email"
          placeholderTextColor={theme.colors.muted}
          autoCapitalize="none"
          keyboardType="email-address"
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderWidth: 1,
            padding: 14,
            borderRadius: 14,
            color: theme.colors.text,
          }}
        />

        <TextInput
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            clearError();
          }}
          placeholder="Password"
          placeholderTextColor={theme.colors.muted}
          secureTextEntry
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderWidth: 1,
            padding: 14,
            borderRadius: 14,
            color: theme.colors.text,
          }}
        />

        {error ? (
          <Text style={{ color: theme.colors.danger ?? "#ff5252", fontWeight: "700" }}>{error}</Text>
        ) : null}

        <Pressable
          onPress={() => login(email, password)}
          style={{
            backgroundColor: theme.colors.primary,
            paddingVertical: 14,
            borderRadius: 16,
            alignItems: "center",
            marginTop: 6,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "900", fontSize: 16 }}>Login</Text>
        </Pressable>

        <Pressable
          onPress={() => nav.navigate("Register")}
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderWidth: 1,
            paddingVertical: 14,
            borderRadius: 16,
            alignItems: "center",
          }}
        >
          <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 16 }}>
            Create account
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

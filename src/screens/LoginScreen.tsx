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
      <View style={{ marginTop: 10 }}>
        <View
          style={{
            position: "absolute",
            top: -30,
            right: -20,
            width: 140,
            height: 140,
            borderRadius: 999,
            backgroundColor: theme.colors.primary,
            opacity: 0.12,
          }}
          pointerEvents="none"
        />
        <View
          style={{
            position: "absolute",
            top: 60,
            left: -30,
            width: 90,
            height: 90,
            borderRadius: 999,
            backgroundColor: theme.colors.primary,
            opacity: 0.08,
          }}
          pointerEvents="none"
        />

        <Text style={{ color: theme.colors.muted, fontWeight: "800", fontSize: 12 }}>
          Welcome back
        </Text>
        <Text style={{ color: theme.colors.text, fontSize: 34, fontWeight: "900", marginTop: 4 }}>
          Login
        </Text>
        <Text style={{ color: theme.colors.muted, marginTop: 6 }}>
          Sign in to sync likes + watchlist.
        </Text>
      </View>

      <View
        style={{
          marginTop: 20,
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderWidth: 1,
          borderRadius: 18,
          padding: 16,
          gap: 12,
        }}
      >
        <View>
          <Text style={{ color: theme.colors.muted, fontSize: 12, fontWeight: "800", marginBottom: 6 }}>
            Email
          </Text>
          <TextInput
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              clearError();
            }}
            placeholder="you@example.com"
            placeholderTextColor={theme.colors.muted}
            autoCapitalize="none"
            keyboardType="email-address"
            style={{
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border,
              borderWidth: 1,
              padding: 14,
              borderRadius: 14,
              color: theme.colors.text,
            }}
          />
        </View>

        <View>
          <Text style={{ color: theme.colors.muted, fontSize: 12, fontWeight: "800", marginBottom: 6 }}>
            Password
          </Text>
          <TextInput
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              clearError();
            }}
            placeholder="••••••••"
            placeholderTextColor={theme.colors.muted}
            secureTextEntry
            style={{
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border,
              borderWidth: 1,
              padding: 14,
              borderRadius: 14,
              color: theme.colors.text,
            }}
          />
        </View>

        {error ? (
          <Text style={{ color: theme.colors.danger ?? "#ff5252", fontWeight: "700" }}>{error}</Text>
        ) : null}

        <Pressable
          onPress={() => login(email, password)}
          style={{
            backgroundColor: theme.colors.primary,
            paddingVertical: 14,
            borderRadius: 999,
            alignItems: "center",
            marginTop: 4,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "900", fontSize: 16 }}>Login</Text>
        </Pressable>

        <Pressable
          onPress={() => nav.navigate("Register")}
          style={{
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.border,
            borderWidth: 1,
            paddingVertical: 14,
            borderRadius: 999,
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

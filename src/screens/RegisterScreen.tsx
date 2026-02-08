import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useTheme } from "../theme/useTheme";
import Screen from "../components/Screen";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../navigation/types";

type Nav = NativeStackNavigationProp<AuthStackParamList>;

export default function RegisterScreen() {
  const { theme } = useTheme();
  const nav = useNavigation<Nav>();

  const register = useAuthStore((s) => s.register);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Screen padded>
      <Text style={{ color: theme.colors.text, fontSize: 34, fontWeight: "900", marginTop: 6 }}>
        Register
      </Text>
      <Text style={{ color: theme.colors.muted, marginTop: 6 }}>
        Create your account for sync.
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
          placeholder="Password (min 6 chars)"
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
          onPress={async () => {
            await register(email, password);
          }}
          style={{
            backgroundColor: theme.colors.primary,
            paddingVertical: 14,
            borderRadius: 16,
            alignItems: "center",
            marginTop: 6,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "900", fontSize: 16 }}>Create account</Text>
        </Pressable>

        <Pressable
          onPress={() => nav.goBack()}
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
            Back to Login
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

import React, { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import Screen from "../components/Screen";
import { useTheme } from "../theme/useTheme";
import { auth } from "../services/firebase/firebase";

export default function AuthScreen() {
  const { theme } = useTheme();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async () => {
    try {
      const e = email.trim();
      if (!e || password.length < 6) {
        Alert.alert("Invalid", "Enter a valid email and password (min 6 chars).");
        return;
      }
      if (mode === "signup") await createUserWithEmailAndPassword(auth, e, password);
      else await signInWithEmailAndPassword(auth, e, password);
    } catch (err: any) {
      Alert.alert("Auth error", err?.message ?? "Something went wrong");
    }
  };

  return (
    <Screen padded>
      <Text style={{ color: theme.colors.text, fontSize: 34, fontWeight: "900", marginTop: 6 }}>
        {mode === "login" ? "Login" : "Sign up"}
      </Text>
      <Text style={{ color: theme.colors.muted, marginTop: 8 }}>
        Access your synced likes + watchlist.
      </Text>

      <View style={{ marginTop: 18, gap: 12 }}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={theme.colors.muted}
          autoCapitalize="none"
          keyboardType="email-address"
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderWidth: 1,
            borderRadius: 14,
            padding: 12,
            color: theme.colors.text,
          }}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password (min 6 chars)"
          placeholderTextColor={theme.colors.muted}
          secureTextEntry
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderWidth: 1,
            borderRadius: 14,
            padding: 12,
            color: theme.colors.text,
          }}
        />

        <Pressable
          onPress={submit}
          style={{
            backgroundColor: theme.colors.primary,
            paddingVertical: 14,
            borderRadius: 16,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "900", fontSize: 16 }}>
            {mode === "login" ? "Login" : "Create account"}
          </Text>
        </Pressable>

        <Pressable onPress={() => setMode(mode === "login" ? "signup" : "login")}>
          <Text style={{ color: theme.colors.muted, textAlign: "center", marginTop: 8 }}>
            {mode === "login" ? "No account? Sign up" : "Already have an account? Login"}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

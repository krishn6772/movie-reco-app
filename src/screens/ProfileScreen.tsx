import React, { useEffect } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import Screen from "../components/Screen";
import { useTheme } from "../theme/useTheme";
import { useAppStore } from "../store/useAppStore";
import ThemeToggle from "../components/ThemeToggle";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase/firebase";

function Card({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderWidth: 1,
        borderRadius: 16,
        padding: 14,
      }}
    >
      {children}
    </View>
  );
}

export default function ProfileScreen() {
  const { theme } = useTheme();

  const loadPersisted = useAppStore((s) => s.loadPersisted);
  const liked = useAppStore((s) => s.liked);
  const watchlist = useAppStore((s) => s.watchlist);
  const clearAll = useAppStore((s) => s.clearAll);

  useEffect(() => {
    loadPersisted();
  }, [loadPersisted]);

  const likedCount = Object.keys(liked).length;
  const watchCount = Object.keys(watchlist).length;

  const onClear = () => {
    Alert.alert(
      "Clear everything?",
      "This will remove all likes and watchlist movies. (If logged in, it also clears Firestore data.)",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await clearAll();
            await loadPersisted(); // ✅ refresh UI counts immediately
            Alert.alert("Done", "Likes and watchlist cleared.");
          },
        },
      ]
    );
  };

  const onLogout = () => {
    Alert.alert("Logout?", "Do you want to logout from this account?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await signOut(auth);
        },
      },
    ]);
  };

  return (
    <Screen padded>
      <Text style={{ color: theme.colors.text, fontSize: 34, fontWeight: "900", marginTop: 6 }}>
        Profile
      </Text>

      <View style={{ marginTop: 16, gap: 12 }}>
        <Card>
          <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 16 }}>
            Your activity
          </Text>
          <View style={{ marginTop: 10, gap: 8 }}>
            <Text style={{ color: theme.colors.muted, fontSize: 14 }}>Liked: {likedCount}</Text>
            <Text style={{ color: theme.colors.muted, fontSize: 14 }}>Watchlist: {watchCount}</Text>
          </View>
        </Card>

        <ThemeToggle />

        <Card>
          <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 16 }}>
            Recommendation engine
          </Text>
          <Text style={{ color: theme.colors.muted, marginTop: 10, lineHeight: 20 }}>
            Score = 0.55*GenreOverlap + 0.30*Rating + 0.15*Popularity. Movies you already liked or
            watchlisted are excluded. Cold start uses Trending/Top Rated.
          </Text>
        </Card>

        {/* ✅ Clear */}
        <Pressable
          onPress={onClear}
          style={{
            backgroundColor: theme.colors.danger ?? "#d63a3a",
            paddingVertical: 14,
            borderRadius: 16,
            alignItems: "center",
            marginTop: 6,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "900", fontSize: 16 }}>
            Clear likes & watchlist
          </Text>
        </Pressable>

        {/* ✅ Logout */}
        <Pressable
          onPress={onLogout}
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
            Logout
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

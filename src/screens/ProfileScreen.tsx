import React, { useEffect } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import Screen from "../components/Screen";
import { useTheme } from "../theme/useTheme";
import { useAppStore } from "../store/useAppStore";
import ThemeToggle from "../components/ThemeToggle";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase/firebase";
import { useAuthStore } from "../store/useAuthStore";

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

function StatPill({ label, value }: { label: string; value: string }) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderWidth: 1,
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 12,
        flex: 1,
      }}
    >
      <Text style={{ color: theme.colors.muted, fontSize: 12, fontWeight: "700" }}>{label}</Text>
      <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "900", marginTop: 4 }}>
        {value}
      </Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { theme } = useTheme();

  const loadPersisted = useAppStore((s) => s.loadPersisted);
  const liked = useAppStore((s) => s.liked);
  const watchlist = useAppStore((s) => s.watchlist);
  const clearAll = useAppStore((s) => s.clearAll);
  const contentType = useAppStore((s) => s.contentType);
  const filters = useAppStore((s) => s.filters);
  const region = useAppStore((s) => s.region);
  const recentSearches = useAppStore((s) => s.recentSearches);

  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    loadPersisted();
  }, [loadPersisted]);

  const likedCount = Object.keys(liked).length;
  const watchCount = Object.keys(watchlist).length;
  const recentCount = recentSearches.length;

  const userName = user?.displayName?.trim()
    ? user.displayName.trim()
    : user?.email
      ? user.email.split("@")[0]
      : "Guest";

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
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
      >
      <View style={{ marginTop: 6 }}>
        <View
          style={{
            padding: 18,
            borderRadius: 22,
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <View
              style={{
                width: 58,
                height: 58,
                borderRadius: 18,
                backgroundColor: theme.colors.primary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "900", fontSize: 22 }}>
                {userName.slice(0, 1).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.colors.muted, fontWeight: "700", fontSize: 12 }}>
                Welcome back
              </Text>
              <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 22 }}>
                {userName}
              </Text>
              <Text style={{ color: theme.colors.muted, fontWeight: "700", fontSize: 12, marginTop: 4 }}>
                Region: {region}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
            <StatPill label="Liked" value={String(likedCount)} />
            <StatPill label="Watchlist" value={String(watchCount)} />
            <StatPill label="Searches" value={String(recentCount)} />
          </View>
        </View>
      </View>

      <View style={{ marginTop: 16, gap: 12 }}>
        <Card>
          <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 16 }}>
            Preferences
          </Text>
          <View style={{ marginTop: 10, gap: 6 }}>
            <Text style={{ color: theme.colors.muted, fontSize: 14 }}>
              Content: {contentType === "movie" ? "Movies" : "TV Series"}
            </Text>
            <Text style={{ color: theme.colors.muted, fontSize: 14 }}>
              Category: {filters.categoryByType[contentType].replace(/_/g, " ")}
            </Text>
            <Text style={{ color: theme.colors.muted, fontSize: 14 }}>
              Genres: {filters.genreIds.length > 0 ? `${filters.genreIds.length} selected` : "All"}
            </Text>
            <Text style={{ color: theme.colors.muted, fontSize: 14 }}>
              Sort: {filters.sort.replace("_", " ")}
            </Text>
            <Text style={{ color: theme.colors.muted, fontSize: 14 }}>
              Recent searches: {recentCount}
            </Text>
          </View>
        </Card>

        <Card>
          <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 16 }}>
            Appearance
          </Text>
          <View style={{ marginTop: 10 }}>
            <ThemeToggle />
          </View>
        </Card>

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
      </ScrollView>
    </Screen>
  );
}

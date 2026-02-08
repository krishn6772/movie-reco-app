import React, { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, Text, View } from "react-native";
import Screen from "../components/Screen";
import { useTheme } from "../theme/useTheme";
import { useAppStore } from "../store/useAppStore";
import MovieCard from "../components/MovieCard";
import ContentTypeToggle from "../components/ContentTypeToggle";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import type { ContentType, MediaItem } from "../services/tmdb/types";
import { getMediaTitle, getMediaYear } from "../utils/format";

type Nav = NativeStackNavigationProp<RootStackParamList>;

function getItemType(key: string, item: MediaItem): ContentType {
  if (item.media_type === "tv" || item.media_type === "movie") return item.media_type;
  if (key.startsWith("tv:")) return "tv";
  return "movie";
}

export default function WatchlistScreen() {
  const nav = useNavigation<Nav>();
  const { theme } = useTheme();

  const loadPersisted = useAppStore((s) => s.loadPersisted);
  const watchlist = useAppStore((s) => s.watchlist);
  const contentType = useAppStore((s) => s.contentType);
  const clearWatchlist = useAppStore((s) => s.clearWatchlist);

  const [sortBy, setSortBy] = useState<"recent" | "title" | "rating" | "year">("recent");
  const [groupByYear, setGroupByYear] = useState(false);

  useEffect(() => {
    loadPersisted();
  }, [loadPersisted]);

  const items = useMemo(() => {
    const filtered: MediaItem[] = [];
    Object.entries(watchlist).forEach(([key, value]) => {
      const type = getItemType(key, value);
      if (type === contentType) filtered.push(value);
    });
    if (sortBy === "title") {
      return filtered.sort((a, b) => getMediaTitle(a).localeCompare(getMediaTitle(b)));
    }
    if (sortBy === "rating") {
      return filtered.sort((a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0));
    }
    if (sortBy === "year") {
      return filtered.sort((a, b) => (getMediaYear(b) ?? "").localeCompare(getMediaYear(a) ?? ""));
    }
    return filtered;
  }, [watchlist, contentType, sortBy]);

  const groupedByYear = useMemo(() => {
    const map = new Map<string, MediaItem[]>();
    items.forEach((item) => {
      const year = getMediaYear(item) ?? "Unknown";
      if (!map.has(year)) map.set(year, []);
      map.get(year)!.push(item);
    });
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [items]);

  const openDetails = (item: MediaItem) => {
    const type = item.media_type === "tv" ? "tv" : "movie";
    nav.navigate("MovieDetails", { id: item.id, type, from: "Watchlist" });
  };

  return (
    <Screen padded>
      <Text style={{ color: theme.colors.text, fontSize: 34, fontWeight: "900", marginTop: 6 }}>
        Watchlist
      </Text>
      <Text style={{ color: theme.colors.muted, marginTop: 8 }}>
        Saved {contentType === "movie" ? "movies" : "TV series"} ({items.length})
      </Text>

      <View style={{ marginTop: 10 }}>
        <ContentTypeToggle />
      </View>

      <View style={{ marginTop: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          {[
            { key: "recent", label: "Recent" },
            { key: "title", label: "Title" },
            { key: "rating", label: "Rating" },
            { key: "year", label: "Year" },
          ].map((opt) => {
            const active = sortBy === opt.key;
            return (
              <Pressable
                key={opt.key}
                onPress={() => setSortBy(opt.key as typeof sortBy)}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: active ? theme.colors.primary : theme.colors.border,
                  backgroundColor: active ? theme.colors.primary : theme.colors.surface,
                }}
              >
                <Text style={{ color: active ? "#fff" : theme.colors.text, fontWeight: "800" }}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable
          onPress={() => setGroupByYear((v) => !v)}
          style={{
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: groupByYear ? theme.colors.primary : theme.colors.border,
            backgroundColor: groupByYear ? theme.colors.primary : theme.colors.surface,
          }}
        >
          <Text style={{ color: groupByYear ? "#fff" : theme.colors.text, fontWeight: "800" }}>
            Group
          </Text>
        </Pressable>
      </View>

      {items.length === 0 ? (
        <View style={{ marginTop: 28 }}>
          <Text style={{ color: theme.colors.muted, fontSize: 16, lineHeight: 22 }}>
            Your watchlist is empty. Add items from Home or Search.
          </Text>
        </View>
      ) : (
        <View style={{ marginTop: 18 }}>
          <View style={{ flexDirection: "row", justifyContent: "flex-end", marginBottom: 10 }}>
            <Pressable
              onPress={() =>
                Alert.alert("Remove all?", "This will clear your watchlist.", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Remove", style: "destructive", onPress: () => clearWatchlist() },
                ])
              }
              style={{
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <Text style={{ color: theme.colors.text, fontWeight: "800" }}>Remove All</Text>
            </Pressable>
          </View>

          {groupByYear ? (
            groupedByYear.map(([year, list]) => (
              <View key={year} style={{ marginBottom: 18 }}>
                <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 16, marginBottom: 10 }}>
                  {year}
                </Text>
                <FlatList
                  data={list}
                  keyExtractor={(item) => String(item.id)}
                  numColumns={2}
                  columnWrapperStyle={{ justifyContent: "space-between" }}
                  renderItem={({ item }) => (
                    <View style={{ marginBottom: 18 }}>
                      <MovieCard movie={item} size="large" onPress={() => openDetails(item)} />
                    </View>
                  )}
                  removeClippedSubviews
                  initialNumToRender={10}
                  windowSize={7}
                />
              </View>
            ))
          ) : (
            <FlatList
              data={items}
              keyExtractor={(item) => String(item.id)}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: "space-between" }}
              renderItem={({ item }) => (
                <View style={{ marginBottom: 18 }}>
                  <MovieCard movie={item} size="large" onPress={() => openDetails(item)} />
                </View>
              )}
              removeClippedSubviews
              initialNumToRender={10}
              windowSize={7}
              ListFooterComponent={<View style={{ height: 28 }} />}
            />
          )}
        </View>
      )}
    </Screen>
  );
}

import React, { useEffect, useMemo } from "react";
import { FlatList, Text, View } from "react-native";
import Screen from "../components/Screen";
import { useTheme } from "../theme/useTheme";
import { useAppStore } from "../store/useAppStore";
import MovieCard from "../components/MovieCard";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function WatchlistScreen() {
  const nav = useNavigation<Nav>();
  const { theme } = useTheme();

  const loadPersisted = useAppStore((s) => s.loadPersisted);
  const watchlist = useAppStore((s) => s.watchlist);

  useEffect(() => {
    loadPersisted();
  }, [loadPersisted]);

  const items = useMemo(() => Object.values(watchlist), [watchlist]);

  const openDetails = (movieId: number) => nav.navigate("MovieDetails", { movieId, from: "Watchlist" });

  return (
    <Screen padded>
      <Text style={{ color: theme.colors.text, fontSize: 34, fontWeight: "900", marginTop: 6 }}>
        Watchlist
      </Text>
      <Text style={{ color: theme.colors.muted, marginTop: 8 }}>
        Saved movies ({items.length})
      </Text>

      {items.length === 0 ? (
        <View style={{ marginTop: 28 }}>
          <Text style={{ color: theme.colors.muted, fontSize: 16, lineHeight: 22 }}>
            Your watchlist is empty. Add movies from Home or Search.
          </Text>
        </View>
      ) : (
        <FlatList
          style={{ marginTop: 18 }}
          data={items}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          renderItem={({ item }) => (
            <View style={{ marginBottom: 18 }}>
              <MovieCard movie={item} size="small" onPress={() => openDetails(item.id)} />
            </View>
          )}
          removeClippedSubviews
          initialNumToRender={10}
          windowSize={7}
          ListFooterComponent={<View style={{ height: 28 }} />}
        />
      )}
    </Screen>
  );
}

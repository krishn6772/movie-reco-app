import React, { useMemo, useState } from "react";
import { FlatList, Text, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import Screen from "../components/Screen";
import { useTheme } from "../theme/useTheme";
import Loader from "../components/Loader";
import ErrorState from "../components/ErrorState";
import MovieCard from "../components/MovieCard";
import { useSearchMovies } from "../services/tmdb/hooks";
import { useDebouncedValue } from "../utils/useDebouncedValue";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function SearchScreen() {
  const nav = useNavigation<Nav>();
  const { theme } = useTheme();

  const [q, setQ] = useState("");
  const dq = useDebouncedValue(q.trim(), 450);

  const search = useSearchMovies(dq);

  const items = useMemo(() => search.data?.pages?.flatMap((p) => p.results) ?? [], [search.data]);

  const openDetails = (movieId: number) => nav.navigate("MovieDetails", { movieId, from: "Search" });

  return (
    <Screen padded>
      <Text style={{ color: theme.colors.text, fontSize: 34, fontWeight: "900", marginTop: 6 }}>
        Search
      </Text>

      <View
        style={{
          marginTop: 14,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          paddingHorizontal: 14,
          paddingVertical: 12,
        }}
      >
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search movies…"
          placeholderTextColor={theme.colors.muted}
          style={{
            color: theme.colors.text,
            fontSize: 16,
            fontWeight: "700",
          }}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
      </View>

      <Text style={{ color: theme.colors.muted, marginTop: 10 }}>
        Search by movie title. Try “Avengers”, “Batman”, “Dune”, “John Wick”…
      </Text>

      {dq.length > 0 && search.isLoading && (
        <View style={{ marginTop: 24 }}>
          <Loader />
        </View>
      )}

      {dq.length > 0 && search.isError && (
        <View style={{ marginTop: 18 }}>
          <ErrorState
            title="Search failed"
            message={(search.error as Error)?.message}
            onRetry={() => search.refetch()}
          />
        </View>
      )}

      {dq.length > 0 && !search.isLoading && !search.isError && items.length === 0 && (
        <View style={{ marginTop: 22 }}>
          <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 16 }}>No results</Text>
          <Text style={{ color: theme.colors.muted, marginTop: 6 }}>Try a different keyword.</Text>
        </View>
      )}

      {items.length > 0 && (
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
          onEndReached={() => {
            if (search.hasNextPage && !search.isFetchingNextPage) search.fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            search.isFetchingNextPage ? (
              <View style={{ paddingVertical: 16 }}>
                <Loader />
              </View>
            ) : (
              <View style={{ height: 28 }} />
            )
          }
          removeClippedSubviews
          initialNumToRender={10}
          windowSize={7}
        />
      )}
    </Screen>
  );
}

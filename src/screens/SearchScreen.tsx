import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import Screen from "../components/Screen";
import { useTheme } from "../theme/useTheme";
import Loader from "../components/Loader";
import ErrorState from "../components/ErrorState";
import MovieCard from "../components/MovieCard";
import { useHomeCategory, useSearchMedia, useGenres } from "../services/tmdb/hooks";
import { useDebouncedValue } from "../utils/useDebouncedValue";
import { useAppStore, type SortOption } from "../store/useAppStore";
import type { MediaItem } from "../services/tmdb/types";
import type { MovieCategory, TvCategory } from "../services/tmdb/endpoints";
import { getMediaDate } from "../utils/format";

type Nav = NativeStackNavigationProp<RootStackParamList>;

type SearchFilters = {
  genreIds: number[];
  excludedGenreIds: number[];
  sort: SortOption;
  minRating: number | null;
  year: number | null;
};

type ModalTab = "category" | "genres" | "sort";

type CategoryOption = { key: MovieCategory | TvCategory; label: string };

const movieCategories: CategoryOption[] = [
  { key: "trending", label: "Trending" },
  { key: "popular", label: "Popular" },
  { key: "top_rated", label: "Top Rated" },
  { key: "upcoming", label: "Upcoming" },
];

const tvCategories: CategoryOption[] = [
  { key: "trending", label: "Trending" },
  { key: "popular", label: "Popular" },
  { key: "top_rated", label: "Top Rated" },
  { key: "on_the_air", label: "On The Air" },
  { key: "airing_today", label: "Airing Today" },
];

const sortOptions: { key: SortOption; label: string }[] = [
  { key: "popularity_desc", label: "Popularity" },
  { key: "rating_desc", label: "Rating" },
  { key: "date_desc", label: "Release Date" },
];

const EMPTY_SUGGESTIONS = ["Action", "Comedy", "Drama", "Thriller", "Romance"];

function applyFilters(items: MediaItem[], filters: SearchFilters) {
  let out = items.slice();

  if (filters.genreIds.length > 0) {
    out = out.filter((m) => (m.genre_ids ?? []).some((g) => filters.genreIds.includes(g)));
  }
  if (filters.excludedGenreIds.length > 0) {
    out = out.filter((m) => !(m.genre_ids ?? []).some((g) => filters.excludedGenreIds.includes(g)));
  }
  if (filters.minRating !== null) {
    out = out.filter((m) => (m.vote_average ?? 0) >= filters.minRating);
  }
  if (filters.year !== null) {
    out = out.filter((m) => {
      const d = getMediaDate(m);
      const y = d ? Number(String(d).slice(0, 4)) : NaN;
      return Number.isFinite(y) && y === filters.year;
    });
  }

  if (filters.sort === "rating_desc") {
    out.sort((a, b) => b.vote_average - a.vote_average);
  } else if (filters.sort === "date_desc") {
    out.sort((a, b) => {
      const da = Date.parse(getMediaDate(a));
      const db = Date.parse(getMediaDate(b));
      return (isNaN(db) ? 0 : db) - (isNaN(da) ? 0 : da);
    });
  } else {
    out.sort((a, b) => b.popularity - a.popularity);
  }

  return out;
}

export default function SearchScreen() {
  const nav = useNavigation<Nav>();
  const { theme } = useTheme();

  const [q, setQ] = useState("");
  const dq = useDebouncedValue(q.trim(), 450);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filtersTab, setFiltersTab] = useState<ModalTab>("genres");
  const [excludedGenreIds, setExcludedGenreIds] = useState<number[]>([]);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [year, setYear] = useState<number | null>(null);

  const contentType = useAppStore((s) => s.contentType);
  const filters = useAppStore((s) => s.filters);
  const region = useAppStore((s) => s.region);
  const recentSearches = useAppStore((s) => s.recentSearches);
  const addRecentSearch = useAppStore((s) => s.addRecentSearch);
  const clearRecentSearches = useAppStore((s) => s.clearRecentSearches);
  const setCategory = useAppStore((s) => s.setCategory);
  const toggleGenre = useAppStore((s) => s.toggleGenre);
  const clearGenres = useAppStore((s) => s.clearGenres);
  const setSort = useAppStore((s) => s.setSort);
  const resetFilters = useAppStore((s) => s.resetFilters);

  const categoryOptions = contentType === "movie" ? movieCategories : tvCategories;
  const currentCategory = filters.categoryByType?.[contentType] ?? "trending";
  const currentCategoryLabel =
    categoryOptions.find((c) => c.key === currentCategory)?.label ?? "Category";
  const currentSortLabel = sortOptions.find((s) => s.key === filters.sort)?.label ?? "Sort";

  const search = useSearchMedia(contentType, dq, { region, year });
  const genresQuery = useGenres(contentType);
  const homeQuery = useHomeCategory(contentType, currentCategory, region);

  const items = useMemo(() => {
    const base = search.data?.pages?.flatMap((p) => p.results) ?? [];
    return applyFilters(base, {
      genreIds: filters.genreIds,
      excludedGenreIds,
      sort: filters.sort,
      minRating,
      year,
    });
  }, [search.data, filters.genreIds, excludedGenreIds, filters.sort, minRating, year]);

  const previewItems = useMemo(() => {
    const base = homeQuery.data?.results ?? [];
    return applyFilters(base, {
      genreIds: filters.genreIds,
      excludedGenreIds,
      sort: filters.sort,
      minRating,
      year,
    }).slice(0, 12);
  }, [homeQuery.data, filters.genreIds, excludedGenreIds, filters.sort, minRating, year]);

  const openDetails = (id: number) =>
    nav.navigate("MovieDetails", { id, type: contentType, from: "Search" });

  const openFilters = () => {
    setFiltersTab("genres");
    setFiltersOpen(true);
  };

  const activeFilterCount =
    filters.genreIds.length +
    excludedGenreIds.length +
    (filters.sort !== "popularity_desc" ? 1 : 0) +
    (currentCategory !== "trending" ? 1 : 0) +
    (minRating !== null ? 1 : 0) +
    (year !== null ? 1 : 0);

  const filterSummary = [
    currentCategory !== "trending" ? currentCategoryLabel : null,
    filters.genreIds.length ? `${filters.genreIds.length} include` : null,
    excludedGenreIds.length ? `${excludedGenreIds.length} exclude` : null,
    minRating !== null ? `Rating ${minRating}+` : null,
    year !== null ? `Year ${year}` : null,
    filters.sort !== "popularity_desc" ? currentSortLabel : null,
  ]
    .filter(Boolean)
    .join(" | ");

  useEffect(() => {
    if (dq.length >= 2) addRecentSearch(dq);
  }, [dq, addRecentSearch]);

  const toggleExcludeGenre = (genreId: number) => {
    setExcludedGenreIds((prev) =>
      prev.includes(genreId) ? prev.filter((g) => g !== genreId) : [...prev, genreId]
    );
    if (filters.genreIds.includes(genreId)) toggleGenre(genreId);
  };

  const clearLocalFilters = () => {
    setExcludedGenreIds([]);
    setMinRating(null);
    setYear(null);
  };

  return (
    <Screen padded>
      <View
        style={{
          marginTop: 14,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          paddingHorizontal: 12,
          paddingVertical: 10,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder={`Search ${contentType === "movie" ? "movies" : "TV series"}...`}
          placeholderTextColor={theme.colors.muted}
          style={{
            color: theme.colors.text,
            fontSize: 16,
            fontWeight: "700",
            flex: 1,
          }}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
        <Pressable
          onPress={openFilters}
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.colors.border,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.colors.background,
          }}
        >
          <View style={{ gap: 4 }}>
            <View style={{ width: 16, height: 2, backgroundColor: theme.colors.text }} />
            <View style={{ width: 16, height: 2, backgroundColor: theme.colors.text }} />
            <View style={{ width: 16, height: 2, backgroundColor: theme.colors.text }} />
          </View>
          {activeFilterCount > 0 && (
            <View
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                minWidth: 18,
                height: 18,
                borderRadius: 999,
                backgroundColor: theme.colors.primary,
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 4,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 11, fontWeight: "900" }}>
                {activeFilterCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {filterSummary.length > 0 && (
        <Text style={{ color: theme.colors.muted, marginTop: 6 }}>
          Filters: {filterSummary}
        </Text>
      )}

      <View style={{ marginTop: 10, alignSelf: "flex-start" }}>
        <Text style={{ color: theme.colors.muted, fontWeight: "800", fontSize: 12 }}>Region</Text>
        <View
          style={{
            marginTop: 6,
            alignSelf: "flex-start",
            borderRadius: 999,
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
            paddingVertical: 6,
            paddingHorizontal: 12,
          }}
        >
          <Text style={{ color: theme.colors.text, fontWeight: "800" }}>{region}</Text>
        </View>
      </View>

      {recentSearches.length > 0 && dq.length === 0 && (
        <View style={{ marginTop: 14 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: theme.colors.text, fontWeight: "800" }}>Recent searches</Text>
            <Pressable onPress={() => clearRecentSearches()}>
              <Text style={{ color: theme.colors.primary, fontWeight: "800" }}>Clear</Text>
            </Pressable>
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
            {recentSearches.map((term) => (
              <Pressable
                key={term}
                onPress={() => setQ(term)}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                }}
              >
                <Text style={{ color: theme.colors.text, fontWeight: "800" }}>{term}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {dq.length === 0 && (
        <View style={{ marginTop: 18 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 18 }}>
              Browse {currentCategoryLabel}
            </Text>
            <Pressable onPress={() => openFilters()}>
              <Text style={{ color: theme.colors.primary, fontWeight: "800" }}>Filters</Text>
            </Pressable>
          </View>
          <Text style={{ color: theme.colors.muted, marginTop: 4 }}>
            Showing {contentType === "movie" ? "movies" : "series"} based on your filters
          </Text>

          {homeQuery.isLoading && (
            <View style={{ marginTop: 12 }}>
              <Loader />
            </View>
          )}

          {!homeQuery.isLoading && previewItems.length > 0 && (
            <FlatList
              style={{ marginTop: 12 }}
              data={previewItems}
              keyExtractor={(item) => String(item.id)}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: "space-between" }}
              renderItem={({ item }) => (
                <View style={{ marginBottom: 16 }}>
                  <MovieCard movie={item} size="large" onPress={() => openDetails(item.id)} />
                </View>
              )}
              initialNumToRender={10}
              windowSize={7}
              removeClippedSubviews
            />
          )}

          {!homeQuery.isLoading && previewItems.length === 0 && (
            <Text style={{ color: theme.colors.muted, marginTop: 12 }}>
              No items found for current filters.
            </Text>
          )}
        </View>
      )}

      <Modal visible={filtersOpen} transparent animationType="fade" onRequestClose={() => setFiltersOpen(false)}>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.55)",
            padding: 20,
            justifyContent: "center",
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.background,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: theme.colors.border,
              padding: 16,
              maxHeight: "80%",
            }}
          >
            <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 16 }}>
              Filters
            </Text>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.colors.muted, fontWeight: "800", fontSize: 12 }}>
                  Min Rating
                </Text>
                <TextInput
                  value={minRating !== null ? String(minRating) : ""}
                  onChangeText={(v) => {
                    const n = Number(v);
                    if (!v) return setMinRating(null);
                    if (!Number.isFinite(n)) return;
                    setMinRating(Math.max(0, Math.min(10, n)));
                  }}
                  placeholder="e.g. 7"
                  placeholderTextColor={theme.colors.muted}
                  keyboardType="numeric"
                  style={{
                    marginTop: 6,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    borderRadius: 10,
                    paddingVertical: 8,
                    paddingHorizontal: 10,
                    color: theme.colors.text,
                    backgroundColor: theme.colors.surface,
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.colors.muted, fontWeight: "800", fontSize: 12 }}>
                  Year
                </Text>
                <TextInput
                  value={year !== null ? String(year) : ""}
                  onChangeText={(v) => {
                    const n = Number(v);
                    if (!v) return setYear(null);
                    if (!Number.isFinite(n)) return;
                    setYear(Math.max(1900, Math.min(new Date().getFullYear(), n)));
                  }}
                  placeholder="e.g. 2022"
                  placeholderTextColor={theme.colors.muted}
                  keyboardType="numeric"
                  style={{
                    marginTop: 6,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    borderRadius: 10,
                    paddingVertical: 8,
                    paddingHorizontal: 10,
                    color: theme.colors.text,
                    backgroundColor: theme.colors.surface,
                  }}
                />
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
              {["category", "genres", "sort"].map((tab) => {
                const active = filtersTab === tab;
                return (
                  <Pressable
                    key={tab}
                    onPress={() => setFiltersTab(tab as ModalTab)}
                    style={{
                      flex: 1,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: active ? theme.colors.primary : theme.colors.border,
                      backgroundColor: active ? theme.colors.primary : theme.colors.surface,
                      paddingVertical: 8,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: active ? "#fff" : theme.colors.text, fontWeight: "800" }}>
                      {tab === "category" ? currentCategoryLabel : tab === "genres" ? "Genres" : currentSortLabel}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <ScrollView style={{ marginTop: 12 }}>
              {filtersTab === "category" &&
                categoryOptions.map((c) => {
                  const active = currentCategory === c.key;
                  return (
                    <Pressable
                      key={c.key}
                      onPress={() => setCategory(c.key)}
                      style={{
                        paddingVertical: 10,
                        borderBottomWidth: 1,
                        borderColor: theme.colors.border,
                      }}
                    >
                      <Text style={{ color: active ? theme.colors.primary : theme.colors.text, fontWeight: "800" }}>
                        {c.label}
                      </Text>
                    </Pressable>
                  );
                })}

              {filtersTab === "sort" &&
                sortOptions.map((s) => {
                  const active = filters.sort === s.key;
                  return (
                    <Pressable
                      key={s.key}
                      onPress={() => setSort(s.key)}
                      style={{
                        paddingVertical: 10,
                        borderBottomWidth: 1,
                        borderColor: theme.colors.border,
                      }}
                    >
                      <Text style={{ color: active ? theme.colors.primary : theme.colors.text, fontWeight: "800" }}>
                        {s.label}
                      </Text>
                    </Pressable>
                  );
                })}

              {filtersTab === "genres" &&
                (genresQuery.data?.genres ?? []).map((g) => {
                  const included = filters.genreIds.includes(g.id);
                  const excluded = excludedGenreIds.includes(g.id);
                  return (
                    <View
                      key={g.id}
                      style={{
                        paddingVertical: 10,
                        borderBottomWidth: 1,
                        borderColor: theme.colors.border,
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <Text style={{ color: theme.colors.text, fontWeight: "800", flex: 1 }}>
                        {g.name}
                      </Text>
                      <Pressable
                        onPress={() => {
                          if (excluded) setExcludedGenreIds((prev) => prev.filter((id) => id !== g.id));
                          toggleGenre(g.id);
                        }}
                        style={{
                          paddingVertical: 6,
                          paddingHorizontal: 10,
                          borderRadius: 999,
                          borderWidth: 1,
                          borderColor: included ? theme.colors.primary : theme.colors.border,
                          backgroundColor: included ? theme.colors.primary : theme.colors.surface,
                        }}
                      >
                        <Text style={{ color: included ? "#fff" : theme.colors.text, fontWeight: "800" }}>
                          Include
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => toggleExcludeGenre(g.id)}
                        style={{
                          paddingVertical: 6,
                          paddingHorizontal: 10,
                          borderRadius: 999,
                          borderWidth: 1,
                          borderColor: excluded ? "#d97706" : theme.colors.border,
                          backgroundColor: excluded ? "#d97706" : theme.colors.surface,
                        }}
                      >
                        <Text style={{ color: excluded ? "#fff" : theme.colors.text, fontWeight: "800" }}>
                          Exclude
                        </Text>
                      </Pressable>
                    </View>
                  );
                })}
            </ScrollView>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
              {filtersTab === "genres" && (
                <Pressable
                  onPress={() => {
                    clearGenres();
                    setExcludedGenreIds([]);
                  }}
                  style={{
                    flex: 1,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    paddingVertical: 10,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: theme.colors.text, fontWeight: "900" }}>Clear</Text>
                </Pressable>
              )}
              <Pressable
                onPress={() => {
                  resetFilters();
                  clearLocalFilters();
                }}
                style={{
                  flex: 1,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  paddingVertical: 10,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: theme.colors.text, fontWeight: "900" }}>Reset</Text>
              </Pressable>
              <Pressable
                onPress={() => setFiltersOpen(false)}
                style={{
                  flex: 1,
                  borderRadius: 12,
                  backgroundColor: theme.colors.primary,
                  paddingVertical: 10,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "900" }}>Done</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

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
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
            {EMPTY_SUGGESTIONS.map((term) => (
              <Pressable
                key={term}
                onPress={() => setQ(term)}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                }}
              >
                <Text style={{ color: theme.colors.text, fontWeight: "800" }}>{term}</Text>
              </Pressable>
            ))}
          </View>
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
              <MovieCard movie={item} size="large" onPress={() => openDetails(item.id)} />
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


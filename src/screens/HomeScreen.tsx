import React, { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, ScrollView, Text, View, Dimensions, Pressable } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";

import type { RootStackParamList } from "../navigation/types";
import { useHomeCategory, useGenres } from "../services/tmdb/hooks";

import SectionHeader from "../components/SectionHeader";
import MovieCard from "../components/MovieCard";
import Loader from "../components/Loader";
import ErrorState from "../components/ErrorState";
import Screen from "../components/Screen";
import ContentTypeToggle from "../components/ContentTypeToggle";
import FilterBar from "../components/FilterBar";

import { useTheme } from "../theme/useTheme";
import { useAppStore } from "../store/useAppStore";
import { recommendMovies } from "../utils/recommend";

import type { MediaItem } from "../services/tmdb/types";
import { posterUrl, getMediaTitle, getMediaDate } from "../utils/format";
import type { HomeCategory } from "../services/tmdb/endpoints";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HERO_SIDE_PADDING = 16;
const HERO_GAP = 12;
const HERO_CARD_WIDTH = SCREEN_WIDTH - HERO_SIDE_PADDING * 2; // full width look
const HERO_CARD_HEIGHT = 210;

function HorizontalRow({
  title,
  subtitle,
  items,
  onPressItem,
}: {
  title: string;
  subtitle?: string;
  items: MediaItem[];
  onPressItem: (id: number) => void;
}) {
  return (
    <View style={{ marginTop: 10 }}>
      <SectionHeader title={title} subtitle={subtitle} />
      <FlatList
        horizontal
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <MovieCard movie={item} size="large" onPress={() => onPressItem(item.id)} />
        )}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 6 }}
        showsHorizontalScrollIndicator={false}
        initialNumToRender={8}
        windowSize={5}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
      />
    </View>
  );
}

function TrendingHeroCarousel({
  items,
  onPressItem,
}: {
  items: MediaItem[];
  onPressItem: (id: number) => void;
}) {
  const { theme } = useTheme();
  const listRef = useRef<FlatList<MediaItem>>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [index, setIndex] = useState(0);
  const heroItems = useMemo(() => items.slice(0, 8), [items]);

  const startAuto = () => {
    stopAuto();
    if (heroItems.length <= 1) return;

    timerRef.current = setInterval(() => {
      setIndex((prev) => {
        const next = (prev + 1) % heroItems.length;
        listRef.current?.scrollToOffset({
          offset: next * (HERO_CARD_WIDTH + HERO_GAP),
          animated: true,
        });
        return next;
      });
    }, 3500);
  };

  const stopAuto = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  useEffect(() => {
    startAuto();
    return () => stopAuto();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heroItems.length]);

  if (heroItems.length === 0) return null;

  return (
    <View style={{ marginTop: 10 }}>
      <View style={{ paddingHorizontal: 16, marginBottom: 10 }}>
        <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "900" }}>
          Trending Now
        </Text>
      </View>

      <FlatList
        ref={listRef}
        horizontal
        data={heroItems}
        keyExtractor={(item) => `hero-${item.id}`}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: HERO_SIDE_PADDING }}
        snapToInterval={HERO_CARD_WIDTH + HERO_GAP}
        decelerationRate="fast"
        ItemSeparatorComponent={() => <View style={{ width: HERO_GAP }} />}
        onTouchStart={stopAuto}
        onMomentumScrollEnd={(e) => {
          const x = e.nativeEvent.contentOffset.x;
          const nextIndex = Math.round(x / (HERO_CARD_WIDTH + HERO_GAP));
          setIndex(nextIndex);
          startAuto();
        }}
        renderItem={({ item }) => {
          const img = posterUrl(item.backdrop_path ?? item.poster_path ?? null, "w780");

          return (
            <Pressable
              onPress={() => onPressItem(item.id)}
              style={{
                width: HERO_CARD_WIDTH,
                height: HERO_CARD_HEIGHT,
                borderRadius: 18,
                overflow: "hidden",
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderWidth: 1,
              }}
            >
              <View style={{ flex: 1 }} />

              {img ? (
                <React.Fragment>
                  {(() => {
                    const { Image } = require("react-native");
                    return (
                      <Image
                        source={{ uri: img }}
                        style={{ width: "100%", height: "100%" }}
                        resizeMode="cover"
                      />
                    );
                  })()}
                </React.Fragment>
              ) : (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: theme.colors.surface,
                  }}
                >
                  <Text style={{ color: theme.colors.muted, fontWeight: "800" }}>No image</Text>
                </View>
              )}

              <View
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  padding: 12,
                  backgroundColor: "rgba(0,0,0,0.45)",
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{ color: "#fff", fontWeight: "900", fontSize: 16 }}
                >
                  {getMediaTitle(item)}
                </Text>
                <Text numberOfLines={2} style={{ color: "rgba(255,255,255,0.85)", marginTop: 2 }}>
                  {item.overview || "Tap to view details"}
                </Text>
              </View>

              <View
                style={{
                  position: "absolute",
                  top: 10,
                  right: 12,
                  flexDirection: "row",
                  gap: 6,
                  backgroundColor: "rgba(0,0,0,0.35)",
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 999,
                }}
              >
                {heroItems.map((_, i) => (
                  <View
                    key={`dot-${i}`}
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 999,
                      backgroundColor: i === index ? "#fff" : "rgba(255,255,255,0.45)",
                    }}
                  />
                ))}
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

function applyFilters(items: MediaItem[], genreIds: number[], sort: string) {
  let out = items.slice();

  if (genreIds.length > 0) {
    out = out.filter((m) => (m.genre_ids ?? []).some((g) => genreIds.includes(g)));
  }

  if (sort === "rating_desc") {
    out.sort((a, b) => b.vote_average - a.vote_average);
  } else if (sort === "date_desc") {
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

export default function HomeScreen() {
  const nav = useNavigation<Nav>();
  const { theme } = useTheme();

  // Load persisted liked/watchlist
  const loadPersisted = useAppStore((s) => s.loadPersisted);
  const liked = useAppStore((s) => s.liked);
  const watchlist = useAppStore((s) => s.watchlist);
  const contentType = useAppStore((s) => s.contentType);
  const filters = useAppStore((s) => s.filters);
  const region = useAppStore((s) => s.region);

  useEffect(() => {
    loadPersisted();
  }, [loadPersisted]);

  const currentCategory = filters.categoryByType[contentType] as HomeCategory;

  const categoryQuery = useHomeCategory(contentType, currentCategory, region);
  const genresQuery = useGenres(contentType);

  const anyLoading = categoryQuery.isLoading || genresQuery.isLoading;
  const anyError = categoryQuery.error || genresQuery.error;

  const list = useMemo(() => {
    const base = categoryQuery.data?.results ?? [];
    return applyFilters(base, filters.genreIds, filters.sort);
  }, [categoryQuery.data, filters.genreIds, filters.sort]);

  const likedByType = useMemo(() => {
    const map: Record<number, MediaItem> = {};
    Object.entries(liked).forEach(([key, value]) => {
      if (key.startsWith(`${contentType}:`)) map[value.id] = value;
    });
    return map;
  }, [liked, contentType]);

  const watchlistByType = useMemo(() => {
    const map: Record<number, MediaItem> = {};
    Object.entries(watchlist).forEach(([key, value]) => {
      if (key.startsWith(`${contentType}:`)) map[value.id] = value;
    });
    return map;
  }, [watchlist, contentType]);

  const recommended = useMemo(
    () => recommendMovies({ candidates: list, liked: likedByType, watchlist: watchlistByType, limit: 20 }),
    [list, likedByType, watchlistByType]
  );

  const openDetails = (id: number) => {
    nav.navigate("MovieDetails", { id, type: contentType, from: "Home" });
  };

  if (anyLoading) {
    return (
      <Screen>
        <Loader />
      </Screen>
    );
  }

  if (anyError) {
    return (
      <Screen>
        <ErrorState
          title="Couldn’t load Home"
          message={(anyError as Error)?.message}
          onRetry={() => {
            categoryQuery.refetch();
            genresQuery.refetch();
          }}
        />
      </Screen>
    );
  }

  if (list.length === 0) {
    return (
      <Screen>
        <ErrorState
          title="No results"
          message="This category returned 0 results. Try changing filters."
          onRetry={() => categoryQuery.refetch()}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View style={{ paddingHorizontal: 16, paddingTop: 18, paddingBottom: 6 }}>
          <Text style={{ color: theme.colors.text, fontSize: 28, fontWeight: "900" }}>
            MovieReco
          </Text>
          <Text style={{ color: theme.colors.muted, marginTop: 6 }}>
            Smart recommendations for movies & TV
          </Text>
          <View style={{ marginTop: 12 }}>
            <ContentTypeToggle />
          </View>
          <FilterBar genres={genresQuery.data?.genres ?? []} />
        </View>

        <TrendingHeroCarousel items={list} onPressItem={openDetails} />

        <HorizontalRow
          title="Recommended for you"
          subtitle="Based on your likes + rating + popularity"
          items={recommended}
          onPressItem={openDetails}
        />

        <HorizontalRow
          title="Browse"
          subtitle={currentCategory.replace(/_/g, " ")}
          items={list}
          onPressItem={openDetails}
        />

        <View style={{ height: 28 }} />
      </ScrollView>
    </Screen>
  );
}

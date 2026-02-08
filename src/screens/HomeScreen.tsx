import React, { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, ScrollView, Text, View, Dimensions, Pressable } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";

import type { RootStackParamList } from "../navigation/types";
import { useHomeCategory } from "../services/tmdb/hooks";

import SectionHeader from "../components/SectionHeader";
import MovieCard from "../components/MovieCard";
import Loader from "../components/Loader";
import ErrorState from "../components/ErrorState";
import Screen from "../components/Screen";

import { useTheme } from "../theme/useTheme";
import { useAppStore } from "../store/useAppStore";
import { recommendMovies } from "../utils/recommend";

import type { Movie } from "../services/tmdb/types";
import { posterUrl } from "../utils/format";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HERO_SIDE_PADDING = 16;
const HERO_GAP = 12;
const HERO_CARD_WIDTH = SCREEN_WIDTH - HERO_SIDE_PADDING * 2; // full width look
const HERO_CARD_HEIGHT = 210;

function HorizontalRow({
  title,
  subtitle,
  movies,
  onPressMovie,
}: {
  title: string;
  subtitle?: string;
  movies: Movie[];
  onPressMovie: (id: number) => void;
}) {
  return (
    <View style={{ marginTop: 10 }}>
      <SectionHeader title={title} subtitle={subtitle} />
      <FlatList
        horizontal
        data={movies}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <MovieCard movie={item} size="large" onPress={() => onPressMovie(item.id)} />
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
  movies,
  onPressMovie,
}: {
  movies: Movie[];
  onPressMovie: (id: number) => void;
}) {
  const { theme } = useTheme();
  const listRef = useRef<FlatList<Movie>>(null);
  const timerRef = useRef<any>(null);

  const [index, setIndex] = useState(0);
  const heroMovies = useMemo(() => movies.slice(0, 8), [movies]);

  const startAuto = () => {
    stopAuto();
    if (heroMovies.length <= 1) return;

    timerRef.current = setInterval(() => {
      setIndex((prev) => {
        const next = (prev + 1) % heroMovies.length;
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
  }, [heroMovies.length]);

  if (heroMovies.length === 0) return null;

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
        data={heroMovies}
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
              onPress={() => onPressMovie(item.id)}
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
              {/* Image */}
              <View style={{ flex: 1 }}>
                {/* Using ImageBackground is optional; keep simple with MovieCard? 
                    We'll use RN Image for best control */}
                {/* eslint-disable-next-line @typescript-eslint/no-var-requires */}
                {/* Using <Image> directly */}
              </View>

              {/* We’ll render the image using Image below */}
              {/* NOTE: keep imports small; use require not needed */}
              {/* Inline import */}
              {/* @ts-ignore */}
              {img ? (
                // @ts-ignore
                <React.Fragment>
                  {/* @ts-ignore */}
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

              {/* Overlay */}
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
                  {item.title}
                </Text>
                <Text numberOfLines={2} style={{ color: "rgba(255,255,255,0.85)", marginTop: 2 }}>
                  {item.overview || "Tap to view details"}
                </Text>
              </View>

              {/* Dots */}
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
                {heroMovies.map((_, i) => (
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

export default function HomeScreen() {
  const nav = useNavigation<Nav>();
  const { theme } = useTheme();

  // Load persisted liked/watchlist
  const loadPersisted = useAppStore((s) => s.loadPersisted);
  const liked = useAppStore((s) => s.liked);
  const watchlist = useAppStore((s) => s.watchlist);

  useEffect(() => {
    loadPersisted();
  }, [loadPersisted]);

  // TMDB categories
  const trending = useHomeCategory("trending");
  const popular = useHomeCategory("popular");
  const topRated = useHomeCategory("top_rated");
  const upcoming = useHomeCategory("upcoming");

  const anyLoading =
    trending.isLoading || popular.isLoading || topRated.isLoading || upcoming.isLoading;

  const anyError = trending.error || popular.error || topRated.error || upcoming.error;

  // Lists
  const trendingList = trending.data?.results ?? [];
  const popularList = popular.data?.results ?? [];
  const topRatedList = topRated.data?.results ?? [];
  const upcomingList = upcoming.data?.results ?? [];

  // Candidate pool for recommendations (merge all + de-dupe)
  const candidates = useMemo(() => {
    const all = [...trendingList, ...topRatedList, ...popularList, ...upcomingList];
    const map = new Map<number, Movie>();
    all.forEach((m) => map.set(m.id, m));
    return Array.from(map.values());
  }, [trendingList, topRatedList, popularList, upcomingList]);

  const recommended = useMemo(
    () => recommendMovies({ candidates, liked, watchlist, limit: 20 }),
    [candidates, liked, watchlist]
  );

  const openDetails = (movieId: number) => {
    nav.navigate("MovieDetails", { movieId, from: "Home" });
  };

  // Loading
  if (anyLoading) {
    return (
      <Screen>
        <Loader />
      </Screen>
    );
  }

  // Error
  if (anyError) {
    return (
      <Screen>
        <ErrorState
          title="Couldn’t load Home"
          message={(anyError as Error)?.message}
          onRetry={() => {
            trending.refetch();
            popular.refetch();
            topRated.refetch();
            upcoming.refetch();
          }}
        />
      </Screen>
    );
  }

  // Empty
  const allEmpty =
    trendingList.length === 0 &&
    popularList.length === 0 &&
    topRatedList.length === 0 &&
    upcomingList.length === 0;

  if (allEmpty) {
    return (
      <Screen>
        <ErrorState
          title="No movies loaded"
          message="All categories returned 0 results. Check proxy/API mode."
          onRetry={() => {
            trending.refetch();
            popular.refetch();
            topRated.refetch();
            upcoming.refetch();
          }}
        />
      </Screen>
    );
  }

  // Main UI
  return (
    <Screen>
      <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 16, paddingTop: 18, paddingBottom: 6 }}>
          <Text style={{ color: theme.colors.text, fontSize: 28, fontWeight: "900" }}>
            MovieReco
          </Text>
          <Text style={{ color: theme.colors.muted, marginTop: 6 }}>
            Smart movie recommendations
          </Text>
        </View>

        {/* ✅ Auto sliding hero at top */}
        <TrendingHeroCarousel movies={trendingList} onPressMovie={openDetails} />

        {/* Rows */}
        <HorizontalRow
          title="Recommended for you"
          subtitle="Based on your likes + rating + popularity"
          movies={recommended}
          onPressMovie={openDetails}
        />

        <HorizontalRow title="Popular" movies={popularList} onPressMovie={openDetails} />
        <HorizontalRow title="Top Rated" movies={topRatedList} onPressMovie={openDetails} />
        <HorizontalRow title="Upcoming" movies={upcomingList} onPressMovie={openDetails} />

        <View style={{ height: 28 }} />
      </ScrollView>
    </Screen>
  );
}

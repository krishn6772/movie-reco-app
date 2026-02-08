import React, { useEffect, useMemo } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";

import type { RootStackParamList } from "../navigation/types";
import { useMovieCredits, useMovieDetails } from "../services/tmdb/hooks";

import Screen from "../components/Screen";
import Loader from "../components/Loader";
import ErrorState from "../components/ErrorState";

import { useTheme } from "../theme/useTheme";
import { posterUrl, formatRuntime, yearFromDate } from "../utils/format"; // yearFromDate exists in your utils/format earlier
import { useAppStore } from "../store/useAppStore";
import type { Movie } from "../services/tmdb/types";

type R = RouteProp<RootStackParamList, "MovieDetails">;

function Chip({ label }: { label: string }) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 999,
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderWidth: 1,
      }}
    >
      <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: "800" }}>{label}</Text>
    </View>
  );
}

function InfoLine({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <Text style={{ color: theme.colors.muted, marginTop: 6, lineHeight: 18 }} numberOfLines={2}>
      {children}
    </Text>
  );
}

export default function MovieDetailsScreen() {
  const { theme } = useTheme();
  const route = useRoute<R>();
  const movieId = route.params?.movieId;

  const details = useMovieDetails(movieId);
  const credits = useMovieCredits(movieId);

  const loadPersisted = useAppStore((s) => s.loadPersisted);
  const liked = useAppStore((s) => s.liked);
  const watchlist = useAppStore((s) => s.watchlist);
  const toggleLike = useAppStore((s) => s.toggleLike);
  const toggleWatchlist = useAppStore((s) => s.toggleWatchlist);

  useEffect(() => {
    loadPersisted();
  }, [loadPersisted]);

  const movie = details.data;

  // ✅ SAFE computed fields (no crashes)
  const title = movie?.title ?? movie?.original_title ?? "Untitled";
  const rating =
    typeof movie?.vote_average === "number" && Number.isFinite(movie.vote_average)
      ? movie.vote_average.toFixed(1)
      : "—";
  const runtime = movie?.runtime ? formatRuntime(movie.runtime) : "—";
  const release = movie?.release_date ?? "";
  const releaseYear = release ? yearFromDate(release) : "—";
  const overview = movie?.overview?.trim() ? movie.overview : "No overview available.";

  const genres = Array.isArray(movie?.genres) ? movie!.genres : [];

  // Prefer backdrop/large poster for nice look
  const heroImage = useMemo(() => {
    if (!movie) return null;
    const path = movie.poster_path ?? null;
    // use w780 for quality, works for poster
    return posterUrl(path, "w780");
  }, [movie]);

  const cast = useMemo(() => {
    const arr = credits.data?.cast;
    if (!Array.isArray(arr)) return [];
    return arr.slice(0, 10);
  }, [credits.data]);

  const isLiked = !!(movie && liked[movie.id]);
  const inWatchlist = !!(movie && watchlist[movie.id]);

  // Loading
  if (details.isLoading) {
    return (
      <Screen>
        <Loader />
      </Screen>
    );
  }

  // Error
  if (details.isError) {
    return (
      <Screen>
        <ErrorState
          title="Couldn’t load details"
          message={(details.error as Error)?.message}
          onRetry={() => details.refetch()}
        />
      </Screen>
    );
  }

  if (!movie) {
    return (
      <Screen>
        <ErrorState title="Movie not found" message="No details available." />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={{ paddingBottom: 26 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ✅ HERO POSTER CARD (fixes overlap + better spacing) */}
        <View style={{ paddingHorizontal: 16, paddingTop: 14 }}>
          <View
            style={{
              borderRadius: 20,
              overflow: "hidden",
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderWidth: 1,
            }}
          >
            {heroImage ? (
              <Image
                source={{ uri: heroImage }}
                style={{ width: "100%", height: 460 }}
                resizeMode="cover"
              />
            ) : (
              <View
                style={{
                  height: 460,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: theme.colors.surface,
                }}
              >
                <Text style={{ color: theme.colors.muted, fontWeight: "900" }}>No poster</Text>
              </View>
            )}
          </View>
        </View>

        {/* ✅ TITLE + META */}
        <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 26,
              fontWeight: "900",
              letterSpacing: 0.2,
            }}
            numberOfLines={2}
          >
            {title}
          </Text>

          <InfoLine>
            ★ {rating} • {runtime} • {releaseYear}
          </InfoLine>

          {/* ✅ GENRES */}
          {genres.length > 0 && (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
              {genres.slice(0, 6).map((g) => (
                <Chip key={g.id} label={g.name} />
              ))}
            </View>
          )}
        </View>

        {/* ✅ ACTION BUTTONS */}
        <View style={{ paddingHorizontal: 16, marginTop: 14, flexDirection: "row", gap: 10 }}>
          <Pressable
            onPress={() => toggleLike(movie as unknown as Movie)}
            style={{
              flex: 1,
              backgroundColor: isLiked ? theme.colors.primary : theme.colors.surface,
              borderColor: isLiked ? theme.colors.primary : theme.colors.border,
              borderWidth: 1,
              paddingVertical: 14,
              borderRadius: 16,
              alignItems: "center",
            }}
          >
            <Text style={{ color: isLiked ? "#fff" : theme.colors.text, fontWeight: "900" }}>
              {isLiked ? "Liked" : "Like"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => toggleWatchlist(movie as unknown as Movie)}
            style={{
              flex: 1,
              backgroundColor: inWatchlist ? theme.colors.primary : theme.colors.surface,
              borderColor: inWatchlist ? theme.colors.primary : theme.colors.border,
              borderWidth: 1,
              paddingVertical: 14,
              borderRadius: 16,
              alignItems: "center",
            }}
          >
            <Text style={{ color: inWatchlist ? "#fff" : theme.colors.text, fontWeight: "900" }}>
              {inWatchlist ? "In Watchlist" : "Add to Watchlist"}
            </Text>
          </Pressable>
        </View>

        {/* ✅ OVERVIEW */}
        <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderWidth: 1,
              padding: 14,
              borderRadius: 16,
            }}
          >
            <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 16 }}>
              Overview
            </Text>
            <Text style={{ color: theme.colors.muted, marginTop: 10, lineHeight: 21 }}>
              {overview}
            </Text>
          </View>
        </View>

        {/* ✅ CAST */}
        <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderWidth: 1,
              padding: 14,
              borderRadius: 16,
            }}
          >
            <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 16 }}>Cast</Text>

            {credits.isLoading ? (
              <Text style={{ color: theme.colors.muted, marginTop: 10 }}>Loading cast...</Text>
            ) : cast.length === 0 ? (
              <Text style={{ color: theme.colors.muted, marginTop: 10 }}>Cast not available.</Text>
            ) : (
              <View style={{ marginTop: 10, gap: 10 }}>
                {cast.map((c) => (
                  <View
                    key={c.id}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <Text style={{ color: theme.colors.text, fontWeight: "800", flex: 1 }}>
                      {c.name ?? "—"}
                    </Text>
                    <Text style={{ color: theme.colors.muted, flex: 1, textAlign: "right" }}>
                      {c.character ?? "—"}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

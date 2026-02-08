import React, { useEffect, useMemo, useState } from "react";
import { Image, Linking, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";

import type { RootStackParamList } from "../navigation/types";
import {
  useMediaCredits,
  useMediaDetails,
  useMediaVideos,
  useWatchProviders,
} from "../services/tmdb/hooks";

import Screen from "../components/Screen";
import Loader from "../components/Loader";
import ErrorState from "../components/ErrorState";

import { useTheme } from "../theme/useTheme";
import {
  posterUrl,
  formatRating,
  getMediaTitle,
  getRuntimeLabel,
  getMediaYear,
} from "../utils/format";
import { useAppStore } from "../store/useAppStore";
import type { ContentType, MediaItem, TmdbVideo, WatchProvider, Genre } from "../services/tmdb/types";

let YoutubePlayer: React.ComponentType<{ height: number; play?: boolean; videoId: string }> | null =
  null;
let WebView: React.ComponentType<{ source: { uri: string }; style?: { height: number } }> | null =
  null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  YoutubePlayer = require("react-native-youtube-iframe").default;
} catch (e) {
  YoutubePlayer = null;
}
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  WebView = require("react-native-webview").WebView;
} catch (e) {
  WebView = null;
}

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

const REGION_OPTIONS = ["IN", "US", "GB", "CA", "AU", "DE", "FR", "JP"];

function pickBestTrailer(videos: TmdbVideo[]) {
  const yt = videos.filter((v) => v.site === "YouTube");
  const trailer = yt.find((v) => v.type === "Trailer") ?? yt.find((v) => v.type === "Teaser");
  return trailer ?? null;
}

function uniqueProviders(list?: WatchProvider[]) {
  if (!list) return [];
  const map = new Map<number, WatchProvider>();
  list.forEach((p) => map.set(p.provider_id, p));
  return Array.from(map.values()).sort((a, b) => a.display_priority - b.display_priority);
}

export default function MovieDetailsScreen() {
  const { theme } = useTheme();
  const route = useRoute<R>();
  const id = route.params?.id ?? 0;
  const type = (route.params?.type as ContentType) ?? "movie";

  const details = useMediaDetails(type, id);
  const credits = useMediaCredits(type, id);
  const videos = useMediaVideos(type, id);
  const providers = useWatchProviders(type, id);

  const loadPersisted = useAppStore((s) => s.loadPersisted);
  const liked = useAppStore((s) => s.liked);
  const watchlist = useAppStore((s) => s.watchlist);
  const toggleLike = useAppStore((s) => s.toggleLike);
  const toggleWatchlist = useAppStore((s) => s.toggleWatchlist);
  const region = useAppStore((s) => s.region);
  const setRegion = useAppStore((s) => s.setRegion);

  const [showTrailer, setShowTrailer] = useState(false);
  const [showRegionPicker, setShowRegionPicker] = useState(false);

  useEffect(() => {
    loadPersisted();
  }, [loadPersisted]);

  const media = details.data;

  const cast = useMemo(() => {
    const arr = credits.data?.cast;
    if (!Array.isArray(arr)) return [];
    return arr.slice(0, 10);
  }, [credits.data]);

  const key = `${type}:${id}`;
  const isLiked = !!(media && liked[key]);
  const inWatchlist = !!(media && watchlist[key]);

  const trailer = useMemo(() => pickBestTrailer(videos.data?.results ?? []), [videos.data]);

  const regionData = providers.data?.results?.[region] ?? null;
  const providerLink = regionData?.link;
  const providerItems = useMemo(() => {
    return uniqueProviders([
      ...(regionData?.flatrate ?? []),
      ...(regionData?.rent ?? []),
      ...(regionData?.buy ?? []),
    ]);
  }, [regionData]);

  if (details.isLoading) {
    return (
      <Screen>
        <Loader />
      </Screen>
    );
  }

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

  const title = media ? getMediaTitle(media) : "Untitled";
  const rating = media ? formatRating(media.vote_average) : "—";
  const runtime = media ? getRuntimeLabel(media, type) : "—";
  const releaseYear = media ? getMediaYear(media) : "—";
  const overview = media?.overview?.trim() ? media.overview : "No overview available.";

  const genres = media && "genres" in media ? media.genres : [];
  const heroImage = media ? posterUrl(media.poster_path ?? null, "w780") : null;

  if (!media) {
    return (
      <Screen>
        <ErrorState title="Not found" message="No details available." />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={{ paddingBottom: 26, paddingTop: 12 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 16, paddingTop: 18, marginTop: 6 }}>
          <View
            style={{
              borderRadius: 20,
              overflow: "hidden",
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderWidth: 1,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.18,
              shadowRadius: 16,
              elevation: 8,
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

        <View style={{ paddingHorizontal: 16, marginTop: 16, alignItems: "center" }}>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 28,
              fontWeight: "900",
              letterSpacing: 0.2,
              textAlign: "center",
            }}
            numberOfLines={2}
          >
            {title}
          </Text>

          <Text style={{ color: theme.colors.muted, marginTop: 8, fontSize: 14, textAlign: "center" }}>
            ★ {rating} • {runtime} • {releaseYear}
          </Text>

          {type === "tv" && "number_of_seasons" in media && "number_of_episodes" in media && (
            <InfoLine>
              {media.number_of_seasons ?? "—"} seasons • {media.number_of_episodes ?? "—"} episodes
            </InfoLine>
          )}

          {genres.length > 0 && (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 14, justifyContent: "center" }}>
              {genres.slice(0, 6).map((g: Genre) => (
                <Chip key={g.id} label={g.name} />
              ))}
            </View>
          )}
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 18, flexDirection: "row", gap: 12 }}>
          <Pressable
            onPress={() => toggleLike(media as unknown as MediaItem, type)}
            style={{
              flex: 1,
              backgroundColor: isLiked ? theme.colors.primary : theme.colors.surface,
              borderColor: isLiked ? theme.colors.primary : theme.colors.border,
              borderWidth: 1,
              paddingVertical: 16,
              borderRadius: 999,
              alignItems: "center",
            }}
          >
            <Text style={{ color: isLiked ? "#fff" : theme.colors.text, fontWeight: "900" }}>
              {isLiked ? "Liked" : "Like"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => toggleWatchlist(media as unknown as MediaItem, type)}
            style={{
              flex: 1,
              backgroundColor: inWatchlist ? theme.colors.primary : theme.colors.surface,
              borderColor: inWatchlist ? theme.colors.primary : theme.colors.border,
              borderWidth: 1,
              paddingVertical: 16,
              borderRadius: 999,
              alignItems: "center",
            }}
          >
            <Text style={{ color: inWatchlist ? "#fff" : theme.colors.text, fontWeight: "900" }}>
              {inWatchlist ? "In Watchlist" : "Add to Watchlist"}
            </Text>
          </Pressable>
        </View>

        {trailer && (
          <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
            <Pressable
              onPress={() => setShowTrailer((v) => !v)}
              style={{
                backgroundColor: theme.colors.primary,
                borderRadius: 16,
                paddingVertical: 14,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "900" }}>
                {showTrailer ? "Hide Trailer" : "Watch Trailer"}
              </Text>
            </Pressable>

            {showTrailer && (
              <View style={{ marginTop: 12 }}>
                {YoutubePlayer ? (
                  <YoutubePlayer height={210} play={false} videoId={trailer.key} />
                ) : WebView ? (
                  <WebView
                    style={{ height: 210 }}
                    source={{ uri: `https://www.youtube.com/embed/${trailer.key}` }}
                  />
                ) : (
                  <Text style={{ color: theme.colors.muted }}>
                    Trailer playback is unavailable. Install a YouTube player or WebView.
                  </Text>
                )}
              </View>
            )}
          </View>
        )}

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
              Where to Watch
            </Text>
            <Pressable onPress={() => setShowRegionPicker(true)} style={{ marginTop: 8 }}>
              <Text style={{ color: theme.colors.primary, fontWeight: "800" }}>Region: {region}</Text>
            </Pressable>

            {providers.isLoading ? (
              <Text style={{ color: theme.colors.muted, marginTop: 10 }}>Loading providers...</Text>
            ) : providerItems.length === 0 ? (
              <Text style={{ color: theme.colors.muted, marginTop: 10 }}>
                Not available in your region. Try switching the region.
              </Text>
            ) : (
              <View style={{ marginTop: 10, gap: 10 }}>
                {providerItems.map((p) => {
                  const logo = posterUrl(p.logo_path ?? null, "w92");
                  return (
                    <Pressable
                      key={p.provider_id}
                      onPress={() => {
                        if (providerLink) Linking.openURL(providerLink);
                      }}
                      style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
                    >
                      {logo ? (
                        <Image
                          source={{ uri: logo }}
                          style={{ width: 40, height: 40, borderRadius: 8 }}
                        />
                      ) : (
                        <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: theme.colors.border }} />
                      )}
                      <Text style={{ color: theme.colors.text, fontWeight: "800" }}>{p.provider_name}</Text>
                    </Pressable>
                  );
                })}
                {!providerLink && (
                  <Text style={{ color: theme.colors.muted }}>
                    Provider link not available for this region.
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>

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

      <Modal
        visible={showRegionPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRegionPicker(false)}
      >
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
            }}
          >
            <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 16 }}>Select region</Text>
            <View style={{ marginTop: 12 }}>
              {REGION_OPTIONS.map((r) => (
                <Pressable
                  key={r}
                  onPress={() => {
                    setRegion(r);
                    setShowRegionPicker(false);
                  }}
                  style={{ paddingVertical: 10 }}
                >
                  <Text style={{ color: r === region ? theme.colors.primary : theme.colors.text, fontWeight: "800" }}>
                    {r}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Pressable
              onPress={() => setShowRegionPicker(false)}
              style={{
                marginTop: 10,
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
      </Modal>
    </Screen>
  );
}

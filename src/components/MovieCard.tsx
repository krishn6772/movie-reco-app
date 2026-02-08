import React, { useMemo } from "react";
import { Image, Pressable, Text, View } from "react-native";
import type { MediaItem } from "../services/tmdb/types";
import { useTheme } from "../theme/useTheme";
import RatingBadge from "./RatingBadge";
import { posterUrl, getMediaTitle, getMediaYear } from "../utils/format";

type Size = "large" | "small";

export default function MovieCard({
  movie,
  onPress,
  size = "large",
}: {
  movie: MediaItem;
  onPress?: () => void;
  size?: Size;
}) {
  const { theme } = useTheme();

  const w = size === "large" ? 170 : 120;
  const h = size === "large" ? 250 : 180;

  const poster = useMemo(() => posterUrl(movie.poster_path ?? null, "w500"), [movie.poster_path]);

  return (
    <Pressable onPress={onPress} style={{ width: w, marginRight: 12 }}>
      <View
        style={{
          borderRadius: 18,
          overflow: "hidden",
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderWidth: 1,
        }}
      >
        {poster ? (
          <Image source={{ uri: poster }} style={{ width: w, height: h }} resizeMode="cover" />
        ) : (
          <View style={{ width: w, height: h, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: theme.colors.muted, fontWeight: "800" }}>No Poster</Text>
          </View>
        )}

        <View style={{ position: "absolute", top: 10, left: 10 }}>
          <RatingBadge value={movie.vote_average ?? 0} />
        </View>
      </View>

      <View style={{ marginTop: 10 }}>
        <Text numberOfLines={1} style={{ color: theme.colors.text, fontWeight: "900", fontSize: 14 }}>
          {getMediaTitle(movie)}
        </Text>
        <Text style={{ color: theme.colors.muted, marginTop: 4, fontSize: 12 }}>
          {getMediaYear(movie)}
        </Text>
      </View>
    </Pressable>
  );
}

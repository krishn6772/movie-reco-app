import React, { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import type { Genre } from "../services/tmdb/types";
import { useTheme } from "../theme/useTheme";
import { useAppStore, type SortOption } from "../store/useAppStore";

type ModalType = "category" | "genres" | "sort" | null;

const movieCategories = [
  { key: "trending", label: "Trending" },
  { key: "popular", label: "Popular" },
  { key: "top_rated", label: "Top Rated" },
  { key: "upcoming", label: "Upcoming" },
] as const;

const tvCategories = [
  { key: "trending", label: "Trending" },
  { key: "popular", label: "Popular" },
  { key: "top_rated", label: "Top Rated" },
  { key: "on_the_air", label: "On The Air" },
  { key: "airing_today", label: "Airing Today" },
] as const;

const sortOptions: { key: SortOption; label: string }[] = [
  { key: "popularity_desc", label: "Popularity" },
  { key: "rating_desc", label: "Rating" },
  { key: "date_desc", label: "Release Date" },
];

export default function FilterBar({ genres }: { genres: Genre[] }) {
  const { theme } = useTheme();
  const contentType = useAppStore((s) => s.contentType);
  const filters = useAppStore((s) => s.filters);
  const setCategory = useAppStore((s) => s.setCategory);
  const toggleGenre = useAppStore((s) => s.toggleGenre);
  const clearGenres = useAppStore((s) => s.clearGenres);
  const setSort = useAppStore((s) => s.setSort);
  const resetFilters = useAppStore((s) => s.resetFilters);

  const [open, setOpen] = useState<ModalType>(null);

  const categoryOptions = contentType === "movie" ? movieCategories : tvCategories;
  const currentCategory = filters.categoryByType[contentType];
  const currentCategoryLabel =
    categoryOptions.find((c) => c.key === currentCategory)?.label ?? "Category";
  const currentSortLabel =
    sortOptions.find((s) => s.key === filters.sort)?.label ?? "Sort";

  const genreLabel = useMemo(() => {
    if (filters.genreIds.length === 0) return "Genres";
    const names = genres
      .filter((g) => filters.genreIds.includes(g.id))
      .map((g) => g.name);
    if (names.length <= 2) return names.join(", ");
    return `${names.slice(0, 2).join(", ")} +${names.length - 2}`;
  }, [filters.genreIds, genres]);

  const hasActiveFilters =
    filters.genreIds.length > 0 || filters.sort !== "popularity_desc" ||
    (contentType === "movie"
      ? filters.categoryByType.movie !== "trending"
      : filters.categoryByType.tv !== "trending");

  return (
    <View style={{ marginTop: 12 }}>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <Pressable
          onPress={() => setOpen("category")}
          style={{
            flex: 1,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
            paddingVertical: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
            {currentCategoryLabel}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setOpen("genres")}
          style={{
            flex: 1,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
            paddingVertical: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ color: theme.colors.text, fontWeight: "800" }}>{genreLabel}</Text>
        </Pressable>

        {hasActiveFilters && (
          <Pressable
            onPress={() => resetFilters()}
            style={{
              paddingHorizontal: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
              justifyContent: "center",
            }}
          >
            <Text style={{ color: theme.colors.text, fontWeight: "900" }}>Reset</Text>
          </Pressable>
        )}

        <Pressable
          onPress={() => setOpen("sort")}
          style={{
            flex: 1,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
            paddingVertical: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ color: theme.colors.text, fontWeight: "800" }}>{currentSortLabel}</Text>
        </Pressable>
      </View>

      <Modal visible={open !== null} transparent animationType="fade" onRequestClose={() => setOpen(null)}>
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
              {open === "category" ? "Category" : open === "genres" ? "Genres" : "Sort"}
            </Text>

            <ScrollView style={{ marginTop: 12 }}>
              {open === "category" &&
                categoryOptions.map((c) => {
                  const active = currentCategory === c.key;
                  return (
                    <Pressable
                      key={c.key}
                      onPress={() => {
                        setCategory(c.key);
                        setOpen(null);
                      }}
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

              {open === "sort" &&
                sortOptions.map((s) => {
                  const active = filters.sort === s.key;
                  return (
                    <Pressable
                      key={s.key}
                      onPress={() => {
                        setSort(s.key);
                        setOpen(null);
                      }}
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

              {open === "genres" &&
                genres.map((g) => {
                  const active = filters.genreIds.includes(g.id);
                  return (
                    <Pressable
                      key={g.id}
                      onPress={() => toggleGenre(g.id)}
                      style={{
                        paddingVertical: 10,
                        borderBottomWidth: 1,
                        borderColor: theme.colors.border,
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text style={{ color: theme.colors.text, fontWeight: "800" }}>{g.name}</Text>
                      <Text style={{ color: active ? theme.colors.primary : theme.colors.muted }}>
                        {active ? "Selected" : "Tap"}
                      </Text>
                    </Pressable>
                  );
                })}
            </ScrollView>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
          {open === "genres" && (
            <Pressable
                  onPress={() => clearGenres()}
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
                onPress={() => setOpen(null)}
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
    </View>
  );
}

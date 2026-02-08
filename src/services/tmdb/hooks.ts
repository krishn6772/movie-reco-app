import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { tmdb } from "./client";
import type { HomeCategory } from "./endpoints";
import type { ContentType } from "./types";

export function useHomeCategory(type: ContentType, category: HomeCategory, region?: string) {
  return useQuery({
    queryKey: ["home", type, category, region],
    queryFn: () => tmdb.listByCategory(type, category, 1, region),
  });
}

export function useMediaDetails(type: ContentType, id: number) {
  return useQuery({
    queryKey: ["mediaDetails", type, id],
    queryFn: () => tmdb.getDetails(type, id),
    enabled: Number.isFinite(id),
  });
}

export function useMediaCredits(type: ContentType, id: number) {
  return useQuery({
    queryKey: ["mediaCredits", type, id],
    queryFn: () => tmdb.getCredits(type, id),
    enabled: Number.isFinite(id),
  });
}

export function useSearchMedia(
  type: ContentType,
  query: string,
  opts?: { region?: string; year?: number | null }
) {
  return useInfiniteQuery({
    queryKey: ["search", type, query, opts?.region, opts?.year ?? null],
    queryFn: ({ pageParam }) => tmdb.search(type, query, pageParam as number, opts),
    initialPageParam: 1,
    enabled: query.trim().length > 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.page >= lastPage.total_pages) return undefined;
      return lastPage.page + 1;
    },
  });
}

export function useMediaVideos(type: ContentType, id: number) {
  return useQuery({
    queryKey: ["mediaVideos", type, id],
    queryFn: () => tmdb.getVideos(type, id),
    enabled: Number.isFinite(id),
  });
}

export function useWatchProviders(type: ContentType, id: number) {
  return useQuery({
    queryKey: ["watchProviders", type, id],
    queryFn: () => tmdb.getWatchProviders(type, id),
    enabled: Number.isFinite(id),
  });
}

export function useGenres(type: ContentType) {
  return useQuery({
    queryKey: ["genres", type],
    queryFn: () => tmdb.getGenres(type),
  });
}

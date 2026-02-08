import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { tmdb } from "./client";
import type { HomeCategory } from "./endpoints";

export function useHomeCategory(category: HomeCategory) {
  return useQuery({
    queryKey: ["home", category],
    queryFn: () => tmdb.listMovies(category, 1),
  });
}

export function useMovieDetails(movieId: number) {
  return useQuery({
    queryKey: ["movieDetails", movieId],
    queryFn: () => tmdb.getMovieDetails(movieId),
    enabled: Number.isFinite(movieId),
  });
}

export function useMovieCredits(movieId: number) {
  return useQuery({
    queryKey: ["movieCredits", movieId],
    queryFn: () => tmdb.getMovieCredits(movieId),
    enabled: Number.isFinite(movieId),
  });
}

export function useSearchMovies(query: string) {
  return useInfiniteQuery({
    queryKey: ["search", query],
    queryFn: ({ pageParam }) => tmdb.searchMovies(query, pageParam as number),
    initialPageParam: 1,
    enabled: query.trim().length > 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.page >= lastPage.total_pages) return undefined;
      return lastPage.page + 1;
    },
  });
}

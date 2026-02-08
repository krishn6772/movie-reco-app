import type { ContentType } from "./types";

export type MovieCategory = "trending" | "popular" | "top_rated" | "upcoming";
export type TvCategory = "trending" | "popular" | "top_rated" | "on_the_air" | "airing_today";
export type HomeCategory = MovieCategory | TvCategory;

export const endpoints = {
  trending: (type: ContentType) => `/trending/${type}/week`,
  category: (type: ContentType, category: HomeCategory) => `/${type}/${category}`,
  search: (type: ContentType) => `/search/${type}`,
  details: (type: ContentType, id: number) => `/${type}/${id}`,
  credits: (type: ContentType, id: number) => `/${type}/${id}/credits`,
  videos: (type: ContentType, id: number) => `/${type}/${id}/videos`,
  watchProviders: (type: ContentType, id: number) => `/${type}/${id}/watch/providers`,
  genres: (type: ContentType) => `/genre/${type}/list`,
};

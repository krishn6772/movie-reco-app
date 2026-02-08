export type HomeCategory = "trending" | "popular" | "top_rated" | "upcoming";

export const endpoints = {
  trending: () => `/trending/movie/week`,
  popular: () => `/movie/popular`,
  top_rated: () => `/movie/top_rated`,
  upcoming: () => `/movie/upcoming`,
  search: () => `/search/movie`,
  details: (id: number) => `/movie/${id}`,
  credits: (id: number) => `/movie/${id}/credits`,
};

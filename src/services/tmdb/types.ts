export type TmdbListResponse<T> = {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
};

export type ContentType = "movie" | "tv";

export type Genre = { id: number; name: string };

export type MediaBase = {
  id: number;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  popularity: number;
  original_language?: string;
  genre_ids: number[];
  media_type?: ContentType;
};

export type Movie = MediaBase & {
  title: string;
  original_title: string;
  release_date: string;
};

export type TvSeries = MediaBase & {
  name: string;
  original_name: string;
  first_air_date: string;
};

export type MediaItem = Movie | TvSeries;

export type MovieDetails = Omit<Movie, "genre_ids"> & {
  genres: Genre[];
  runtime: number | null;
};

export type TvDetails = Omit<TvSeries, "genre_ids"> & {
  genres: Genre[];
  episode_run_time: number[];
  number_of_seasons: number;
  number_of_episodes: number;
  status: string;
};

export type MediaDetails = MovieDetails | TvDetails;

export type CastMember = {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
};

export type CreditsResponse = {
  id: number;
  cast: CastMember[];
};

export type TmdbVideo = {
  id: string;
  key: string;
  name: string;
  site: "YouTube" | "Vimeo" | string;
  type: string;
  official: boolean;
  published_at: string;
};

export type TmdbVideosResponse = {
  id: number;
  results: TmdbVideo[];
};

export type WatchProvider = {
  display_priority: number;
  logo_path: string | null;
  provider_id: number;
  provider_name: string;
};

export type WatchProviderRegion = {
  link?: string;
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
};

export type WatchProvidersResponse = {
  id: number;
  results: Record<string, WatchProviderRegion>;
};

export type GenresResponse = {
  genres: Genre[];
};

export type TmdbConfig = {
  imageBaseUrl: string; // from ENV
};






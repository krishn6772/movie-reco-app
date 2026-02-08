export type TmdbListResponse<T> = {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
};

export type Genre = { id: number; name: string };

export type Movie = {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
};

export type MovieDetails = Omit<Movie, "genre_ids"> & {
  genres: Genre[];
  runtime: number | null;
};

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

export type TmdbConfig = {
  imageBaseUrl: string; // from ENV
};

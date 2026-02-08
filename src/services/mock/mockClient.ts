import type {
  CreditsResponse,
  MovieDetails,
  TmdbListResponse,
  Movie,
  TvDetails,
  TmdbVideosResponse,
  WatchProvidersResponse,
  GenresResponse,
  MediaItem,
} from "../tmdb/types";
import { mockMovies, mockDetailsById, mockCreditsById } from "./mockData";

function toListResponse(items: MediaItem[], page: number): TmdbListResponse<MediaItem> {
  const pageSize = 20;
  const start = (page - 1) * pageSize;
  const slice = items.slice(start, start + pageSize);

  return {
    page,
    results: slice,
    total_pages: Math.max(1, Math.ceil(items.length / pageSize)),
    total_results: items.length,
  };
}

function includesPath(path: string, target: string) {
  return path.includes(target);
}

export const mockTmdb = {
  async fetch(path: string, params: Record<string, string | number | undefined> = {}) {
    const page = Number(params.page ?? 1);

    // HOME categories
    if (includesPath(path, "/trending/movie/week")) {
      return toListResponse(mockMovies.trending, page) as TmdbListResponse<Movie>;
    }
    if (includesPath(path, "/movie/popular")) {
      return toListResponse(mockMovies.popular, page) as TmdbListResponse<Movie>;
    }
    if (includesPath(path, "/movie/top_rated")) {
      return toListResponse(mockMovies.topRated, page) as TmdbListResponse<Movie>;
    }
    if (includesPath(path, "/movie/upcoming")) {
      return toListResponse(mockMovies.upcoming, page) as TmdbListResponse<Movie>;
    }

    // TV placeholders (reuse movie mocks)
    if (includesPath(path, "/trending/tv/week")) {
      return toListResponse(mockMovies.trending, page) as TmdbListResponse<Movie>;
    }
    if (includesPath(path, "/tv/popular")) {
      return toListResponse(mockMovies.popular, page) as TmdbListResponse<Movie>;
    }
    if (includesPath(path, "/tv/top_rated")) {
      return toListResponse(mockMovies.topRated, page) as TmdbListResponse<Movie>;
    }
    if (includesPath(path, "/tv/on_the_air")) {
      return toListResponse(mockMovies.upcoming, page) as TmdbListResponse<Movie>;
    }
    if (includesPath(path, "/tv/airing_today")) {
      return toListResponse(mockMovies.upcoming, page) as TmdbListResponse<Movie>;
    }

    // SEARCH
    if (includesPath(path, "/search/movie")) {
      const q = String(params.query ?? "").trim().toLowerCase();
      const all = mockMovies.all;
      const filtered = q
        ? all.filter((m) => m.title.toLowerCase().includes(q))
        : [];
      return toListResponse(filtered, page) as TmdbListResponse<Movie>;
    }
    if (includesPath(path, "/search/tv")) {
      const q = String(params.query ?? "").trim().toLowerCase();
      const all = mockMovies.all;
      const filtered = q
        ? all.filter((m) => m.title.toLowerCase().includes(q))
        : [];
      return toListResponse(filtered, page) as TmdbListResponse<Movie>;
    }

    // DETAILS
    const movieIdMatch = path.match(/\/movie\/(\d+)$/);
    const tvIdMatch = path.match(/\/tv\/(\d+)$/);
    if (movieIdMatch || tvIdMatch) {
      const id = Number((movieIdMatch ?? tvIdMatch)![1]);
      const details = mockDetailsById[id];
      if (details) return details as MovieDetails;
      // fallback: convert base movie into details-like shape
      const base = mockMovies.all.find((m) => m.id === id);
      if (!base) throw new Error(`Mock details not found for id=${id}`);
      if (movieIdMatch) {
        return {
          ...base,
          genres: base.genre_ids.map((gid) => ({ id: gid, name: `Genre ${gid}` })),
          runtime: 110,
        } as MovieDetails;
      }
      return {
        ...base,
        name: base.title,
        original_name: base.original_title,
        first_air_date: base.release_date,
        genres: base.genre_ids.map((gid) => ({ id: gid, name: `Genre ${gid}` })),
        episode_run_time: [45],
        number_of_seasons: 2,
        number_of_episodes: 16,
        status: "Returning Series",
      } as TvDetails;
    }

    // CREDITS
    const creditsMatch = path.match(/\/movie\/(\d+)\/credits$/);
    if (creditsMatch) {
      const id = Number(creditsMatch[1]);
      const credits = mockCreditsById[id];
      if (credits) return credits as CreditsResponse;
      return {
        id,
        cast: [],
        crew: [],
      } as CreditsResponse;
    }
    const creditsTvMatch = path.match(/\/tv\/(\d+)\/credits$/);
    if (creditsTvMatch) {
      const id = Number(creditsTvMatch[1]);
      return {
        id,
        cast: [],
        crew: [],
      } as CreditsResponse;
    }

    // VIDEOS
    const videosMatch = path.match(/\/(movie|tv)\/(\d+)\/videos$/);
    if (videosMatch) {
      const id = Number(videosMatch[2]);
      return {
        id,
        results: [],
      } as TmdbVideosResponse;
    }

    // WATCH PROVIDERS
    const providersMatch = path.match(/\/(movie|tv)\/(\d+)\/watch\/providers$/);
    if (providersMatch) {
      const id = Number(providersMatch[2]);
      return {
        id,
        results: {
          IN: {
            link: "https://www.justwatch.com/in",
            flatrate: [],
            rent: [],
            buy: [],
          },
        },
      } as WatchProvidersResponse;
    }

    // GENRES
    const genresMatch = path.match(/\/genre\/(movie|tv)\/list$/);
    if (genresMatch) {
      return {
        genres: [
          { id: 28, name: "Action" },
          { id: 12, name: "Adventure" },
          { id: 16, name: "Animation" },
        ],
      } as GenresResponse;
    }

    throw new Error(`Mock route not implemented for path: ${path}`);
  },
};

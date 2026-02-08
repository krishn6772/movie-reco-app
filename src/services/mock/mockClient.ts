import type { CreditsResponse, MovieDetails, TmdbListResponse, Movie } from "../tmdb/types";
import { mockMovies, mockDetailsById, mockCreditsById } from "./mockData";

function toListResponse(items: Movie[], page: number): TmdbListResponse<Movie> {
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

    // SEARCH
    if (includesPath(path, "/search/movie")) {
      const q = String(params.query ?? "").trim().toLowerCase();
      const all = mockMovies.all;
      const filtered = q
        ? all.filter((m) => m.title.toLowerCase().includes(q))
        : [];
      return toListResponse(filtered, page) as TmdbListResponse<Movie>;
    }

    // DETAILS
    const movieIdMatch = path.match(/\/movie\/(\d+)$/);
    if (movieIdMatch) {
      const id = Number(movieIdMatch[1]);
      const details = mockDetailsById[id];
      if (details) return details as MovieDetails;
      // fallback: convert base movie into details-like shape
      const base = mockMovies.all.find((m) => m.id === id);
      if (!base) throw new Error(`Mock details not found for id=${id}`);
      return {
        ...base,
        genres: base.genre_ids.map((gid) => ({ id: gid, name: `Genre ${gid}` })),
        runtime: 110,
      } as MovieDetails;
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

    throw new Error(`Mock route not implemented for path: ${path}`);
  },
};

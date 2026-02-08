import { ENV, hasRealTmdb } from "../../config/env";
import type { MovieDetails, CreditsResponse, TmdbListResponse, Movie } from "./types";
import { endpoints, type HomeCategory } from "./endpoints";
import { mockTmdb } from "../mock/mockClient";

type FetchJSON = <T>(
  path: string,
  params?: Record<string, string | number | undefined>
) => Promise<T>;

const fetchJSON: FetchJSON = async (path, params = {}) => {
  // ✅ If proxy missing → mock
  if (!hasRealTmdb()) {
    console.log("✅ Using MOCK TMDB (proxy missing)", path);
    return mockTmdb.fetch(path, params) as Promise<any>;
  }

  // ✅ Proxy call
  console.log("✅ Using REAL TMDB (PROXY)", path);

  const base = ENV.tmdbProxyBaseUrl!.replace(/\/$/, ""); // remove trailing slash
  const url = new URL(`${base}${path}`);

  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined) return;
    url.searchParams.set(k, String(v));
  });

  let res: Response;
  try {
    res = await fetch(url.toString());
  } catch (error) {
    console.log("❌ TMDB NETWORK ERROR", { error: String(error), path });
    throw error;
  }

  if (!res.ok) {
    const text = await res.text();
    console.log("❌ TMDB HTTP ERROR", { status: res.status, body: text, path });
    throw new Error(`TMDB request failed (${res.status}): ${text}`);
  }

  return (await res.json()) as T;
};

export const tmdb = {
  listMovies: (category: HomeCategory, page: number = 1) =>
    fetchJSON<TmdbListResponse<Movie>>(endpoints[category](), { page }),

  searchMovies: (query: string, page: number = 1) =>
    fetchJSON<TmdbListResponse<Movie>>(endpoints.search(), {
      query,
      page,
      include_adult: 0,
    }),

  getMovieDetails: (id: number) => fetchJSON<MovieDetails>(endpoints.details(id)),
  getMovieCredits: (id: number) => fetchJSON<CreditsResponse>(endpoints.credits(id)),
};

import { ENV, hasRealTmdb } from "../../config/env";
import type {
  ContentType,
  MediaDetails,
  CreditsResponse,
  TmdbListResponse,
  MediaItem,
  TmdbVideosResponse,
  WatchProvidersResponse,
  GenresResponse,
} from "./types";
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
    return mockTmdb.fetch(path, params) as Promise<T>;
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
  listByCategory: (type: ContentType, category: HomeCategory, page: number = 1, region?: string) => {
    if (category === "trending") {
      return fetchJSON<TmdbListResponse<MediaItem>>(endpoints.trending(type), { page });
    }
    return fetchJSON<TmdbListResponse<MediaItem>>(endpoints.category(type, category), {
      page,
      region: type === "movie" ? region : undefined,
    });
  },

  search: (
    type: ContentType,
    query: string,
    page: number = 1,
    opts?: { region?: string; year?: number | null }
  ) =>
    fetchJSON<TmdbListResponse<MediaItem>>(endpoints.search(type), {
      query,
      page,
      include_adult: 0,
      region: type === "movie" ? opts?.region : undefined,
      year: type === "movie" ? opts?.year ?? undefined : undefined,
      first_air_date_year: type === "tv" ? opts?.year ?? undefined : undefined,
    }),

  getDetails: (type: ContentType, id: number) =>
    fetchJSON<MediaDetails>(endpoints.details(type, id)),
  getCredits: (type: ContentType, id: number) =>
    fetchJSON<CreditsResponse>(endpoints.credits(type, id)),
  getVideos: (type: ContentType, id: number) =>
    fetchJSON<TmdbVideosResponse>(endpoints.videos(type, id)),
  getWatchProviders: (type: ContentType, id: number) =>
    fetchJSON<WatchProvidersResponse>(endpoints.watchProviders(type, id)),
  getGenres: (type: ContentType) => fetchJSON<GenresResponse>(endpoints.genres(type)),
};

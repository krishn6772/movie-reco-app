import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ContentType, MediaItem } from "../services/tmdb/types";
import type { MovieCategory, TvCategory } from "../services/tmdb/endpoints";
import type { ThemeMode } from "../theme/colors";
import { useAuthStore } from "./useAuthStore";
import { loadUserData, saveUserData } from "../services/firebase/userData";

type MediaMap = Record<string, MediaItem>;

export type SortOption = "popularity_desc" | "rating_desc" | "date_desc";

type FiltersState = {
  categoryByType: { movie: MovieCategory; tv: TvCategory };
  genreIds: number[];
  sort: SortOption;
};

type PersistedPayload = {
  liked: MediaMap;
  watchlist: MediaMap;
  themeMode: ThemeMode;
  contentType: ContentType;
  filters: FiltersState;
  region: string;
  recentSearches: string[];
};

type AppState = {
  liked: MediaMap;
  watchlist: MediaMap;

  themeMode: ThemeMode;
  contentType: ContentType;
  filters: FiltersState;
  region: string;
  recentSearches: string[];

  setContentType: (type: ContentType) => Promise<void>;
  setCategory: (category: MovieCategory | TvCategory) => Promise<void>;
  setSort: (sort: SortOption) => Promise<void>;
  toggleGenre: (genreId: number) => Promise<void>;
  clearGenres: () => Promise<void>;
  resetFilters: () => Promise<void>;
  setRegion: (region: string) => Promise<void>;
  addRecentSearch: (query: string) => Promise<void>;
  clearRecentSearches: () => Promise<void>;

  toggleLike: (media: MediaItem, type: ContentType) => Promise<void>;
  toggleWatchlist: (media: MediaItem, type: ContentType) => Promise<void>;

  setThemeMode: (mode: ThemeMode) => Promise<void>;
  loadThemeMode: () => Promise<void>;

  loadPersisted: () => Promise<void>;
  persistAll: () => Promise<void>;

  clearAll: () => Promise<void>;
  clearWatchlist: () => Promise<void>;
};

const STORAGE_KEY = "movie_reco_store_v2";

function makeMediaKey(type: ContentType, id: number) {
  return `${type}:${id}`;
}

function normalizeMediaMap(map: Record<string, MediaItem> | Record<number, MediaItem>) {
  const next: MediaMap = {};
  Object.entries(map as Record<string, MediaItem>).forEach(([k, v]) => {
    if (/^\d+$/.test(k)) {
      next[makeMediaKey("movie", Number(k))] = { ...v, media_type: "movie" };
      return;
    }
    next[k] = v;
  });
  return next;
}

export const useAppStore = create<AppState>((set, get) => ({
  liked: {},
  watchlist: {},
  themeMode: "dark",
  contentType: "movie",
  filters: {
    categoryByType: { movie: "trending", tv: "trending" },
    genreIds: [],
    sort: "popularity_desc",
  },
  region: "IN",
  recentSearches: [],

  // ----------------------------
  // Persist (local)
  // ----------------------------
  persistAll: async () => {
    try {
      const state = get();
      const payload: PersistedPayload = {
        liked: state.liked,
        watchlist: state.watchlist,
        themeMode: state.themeMode,
        contentType: state.contentType,
        filters: state.filters,
        region: state.region,
        recentSearches: state.recentSearches,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.log("❌ persistAll error", e);
    }
  },

  // ----------------------------
  // Theme
  // ----------------------------
  setThemeMode: async (mode) => {
    set({ themeMode: mode });
    await get().persistAll();
  },

  loadThemeMode: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as Partial<PersistedPayload>;
      if (parsed.themeMode === "dark" || parsed.themeMode === "light") {
        set({ themeMode: parsed.themeMode });
      }
    } catch (e) {
      console.log("❌ loadThemeMode error", e);
    }
  },

  // ----------------------------
  // Load persisted (local + remote)
  // ----------------------------
  loadPersisted: async () => {
    try {
      // 1) load local first
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PersistedPayload>;
        const inferredRegion = inferRegionFromLocale() ?? "IN";
        set({
          liked: parsed.liked ? normalizeMediaMap(parsed.liked) : {},
          watchlist: parsed.watchlist ? normalizeMediaMap(parsed.watchlist) : {},
          themeMode: parsed.themeMode === "light" ? "light" : "dark",
          contentType: parsed.contentType === "tv" ? "tv" : "movie",
          filters: parsed.filters ?? {
            categoryByType: { movie: "trending", tv: "trending" },
            genreIds: [],
            sort: "popularity_desc",
          },
          region: parsed.region ?? inferredRegion,
          recentSearches: parsed.recentSearches ?? [],
        });
      }

      // 2) if logged in, load Firestore (remote is source of truth)
      const user = useAuthStore.getState().user;
      if (user) {
        const remote = await loadUserData(user.uid);
        if (remote) {
          set({
            liked: remote.liked ? normalizeMediaMap(remote.liked) : {},
            watchlist: remote.watchlist ? normalizeMediaMap(remote.watchlist) : {},
          });

          // keep local updated too
          await get().persistAll();
          console.log("✅ Loaded likes/watchlist from Firestore");
        } else {
          // user doc doesn't exist yet -> create it based on local
          const s = get();
          await saveUserData(user.uid, s.liked, s.watchlist);
          console.log("✅ Created Firestore user doc");
        }
      }
    } catch (e) {
      console.log("❌ loadPersisted error", e);
    }
  },

  // ----------------------------
  // Filters + Content Type
  // ----------------------------
  setContentType: async (type) => {
    set({ contentType: type });
    await get().persistAll();
  },

  setCategory: async (category) => {
    const state = get();
    const next = {
      ...state.filters,
      categoryByType: {
        ...state.filters.categoryByType,
        [state.contentType]: category,
      },
    };
    set({ filters: next });
    await get().persistAll();
  },

  setSort: async (sort) => {
    set({ filters: { ...get().filters, sort } });
    await get().persistAll();
  },

  toggleGenre: async (genreId) => {
    const state = get();
    const exists = state.filters.genreIds.includes(genreId);
    const genreIds = exists
      ? state.filters.genreIds.filter((g) => g !== genreId)
      : [...state.filters.genreIds, genreId];
    set({ filters: { ...state.filters, genreIds } });
    await get().persistAll();
  },

  clearGenres: async () => {
    set({ filters: { ...get().filters, genreIds: [] } });
    await get().persistAll();
  },

  resetFilters: async () => {
    set({
      filters: {
        categoryByType: { movie: "trending", tv: "trending" },
        genreIds: [],
        sort: "popularity_desc",
      },
    });
    await get().persistAll();
  },

  setRegion: async (region) => {
    set({ region });
    await get().persistAll();
  },

  addRecentSearch: async (query) => {
    const q = query.trim();
    if (!q) return;
    const state = get();
    const next = [q, ...state.recentSearches.filter((s) => s.toLowerCase() !== q.toLowerCase())].slice(0, 10);
    set({ recentSearches: next });
    await get().persistAll();
  },

  clearRecentSearches: async () => {
    set({ recentSearches: [] });
    await get().persistAll();
  },

  // ----------------------------
  // Likes + Watchlist (local + remote sync)
  // ----------------------------
  toggleLike: async (media, type) => {
    const { liked } = get();
    const next = { ...liked };
    const key = makeMediaKey(type, media.id);

    if (next[key]) delete next[key];
    else next[key] = { ...media, media_type: type };

    set({ liked: next });
    await get().persistAll();

    // sync to Firestore if logged in
    const user = useAuthStore.getState().user;
    if (user) {
      const s = get();
      await saveUserData(user.uid, s.liked, s.watchlist);
    }
  },

  toggleWatchlist: async (media, type) => {
    const { watchlist } = get();
    const next = { ...watchlist };
    const key = makeMediaKey(type, media.id);

    if (next[key]) delete next[key];
    else next[key] = { ...media, media_type: type };

    set({ watchlist: next });
    await get().persistAll();

    // sync to Firestore if logged in
    const user = useAuthStore.getState().user;
    if (user) {
      const s = get();
      await saveUserData(user.uid, s.liked, s.watchlist);
    }
  },

  // ----------------------------
  // Clear (fix not clearing bug)
  // ----------------------------
  clearAll: async () => {
    try {
      // 1) clear store state (forces UI re-render)
      set({ liked: {}, watchlist: {} });

      // 2) update AsyncStorage but keep themeMode
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as Partial<PersistedPayload>) : {};
      const payload: PersistedPayload = {
        liked: {},
        watchlist: {},
        themeMode: parsed.themeMode === "light" ? "light" : "dark",
        contentType: parsed.contentType === "tv" ? "tv" : "movie",
        filters:
          parsed.filters ??
          ({
            categoryByType: { movie: "trending", tv: "trending" },
            genreIds: [],
            sort: "popularity_desc",
          } as FiltersState),
        region: parsed.region ?? "IN",
        recentSearches: parsed.recentSearches ?? [],
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

      // 3) clear Firestore for this user (if logged in)
      const user = useAuthStore.getState().user;
      if (user) {
        await saveUserData(user.uid, {}, {});
      }

      console.log("✅ Cleared likes + watchlist (local + Firestore)");
    } catch (e) {
      console.log("❌ clearAll error", e);
    }
  },

  clearWatchlist: async () => {
    set({ watchlist: {} });
    await get().persistAll();

    const user = useAuthStore.getState().user;
    if (user) {
      const s = get();
      await saveUserData(user.uid, s.liked, {});
    }
  },
}));

function inferRegionFromLocale() {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    const parts = locale.split("-");
    return parts.length > 1 ? parts[1].toUpperCase() : null;
  } catch {
    return null;
  }
}

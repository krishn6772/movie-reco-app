import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Movie } from "../services/tmdb/types";
import type { ThemeMode } from "../theme/colors";
import { useAuthStore } from "./useAuthStore";
import { loadUserData, saveUserData } from "../services/firebase/userData";

type MovieMap = Record<number, Movie>;

type PersistedPayload = {
  liked: MovieMap;
  watchlist: MovieMap;
  themeMode: ThemeMode;
};

type AppState = {
  liked: MovieMap;
  watchlist: MovieMap;

  themeMode: ThemeMode;

  toggleLike: (movie: Movie) => Promise<void>;
  toggleWatchlist: (movie: Movie) => Promise<void>;

  setThemeMode: (mode: ThemeMode) => Promise<void>;
  loadThemeMode: () => Promise<void>;

  loadPersisted: () => Promise<void>;
  persistAll: () => Promise<void>;

  clearAll: () => Promise<void>;
};

const STORAGE_KEY = "movie_reco_store_v2";

export const useAppStore = create<AppState>((set, get) => ({
  liked: {},
  watchlist: {},
  themeMode: "dark",

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
        set({
          liked: parsed.liked ?? {},
          watchlist: parsed.watchlist ?? {},
          themeMode: parsed.themeMode === "light" ? "light" : "dark",
        });
      }

      // 2) if logged in, load Firestore (remote is source of truth)
      const user = useAuthStore.getState().user;
      if (user) {
        const remote = await loadUserData(user.uid);
        if (remote) {
          set({
            liked: (remote.liked as any) ?? {},
            watchlist: (remote.watchlist as any) ?? {},
          });

          // keep local updated too
          await get().persistAll();
          console.log("✅ Loaded likes/watchlist from Firestore");
        } else {
          // user doc doesn't exist yet -> create it based on local
          const s = get();
          await saveUserData(user.uid, s.liked as any, s.watchlist as any);
          console.log("✅ Created Firestore user doc");
        }
      }
    } catch (e) {
      console.log("❌ loadPersisted error", e);
    }
  },

  // ----------------------------
  // Likes + Watchlist (local + remote sync)
  // ----------------------------
  toggleLike: async (movie) => {
    const { liked } = get();
    const next = { ...liked };

    if (next[movie.id]) delete next[movie.id];
    else next[movie.id] = movie;

    set({ liked: next });
    await get().persistAll();

    // sync to Firestore if logged in
    const user = useAuthStore.getState().user;
    if (user) {
      const s = get();
      await saveUserData(user.uid, s.liked as any, s.watchlist as any);
    }
  },

  toggleWatchlist: async (movie) => {
    const { watchlist } = get();
    const next = { ...watchlist };

    if (next[movie.id]) delete next[movie.id];
    else next[movie.id] = movie;

    set({ watchlist: next });
    await get().persistAll();

    // sync to Firestore if logged in
    const user = useAuthStore.getState().user;
    if (user) {
      const s = get();
      await saveUserData(user.uid, s.liked as any, s.watchlist as any);
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
}));

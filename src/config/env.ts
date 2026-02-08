import Constants from "expo-constants";

type Env = {
  // TMDB
  tmdbProxyBaseUrl?: string;     // e.g. https://tmdb-proxy.xxx.workers.dev/tmdb
  tmdbImageBaseUrl: string;      // https://image.tmdb.org/t/p

  // Firebase
  firebaseApiKey: string;
  firebaseAuthDomain: string;
  firebaseProjectId: string;
  firebaseStorageBucket: string;
  firebaseMessagingSenderId: string;
  firebaseAppId: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>;

export const ENV: Env = {
  tmdbProxyBaseUrl: extra.TMDB_PROXY_BASE_URL,
  tmdbImageBaseUrl: extra.TMDB_IMAGE_BASE_URL ?? "https://image.tmdb.org/t/p",

  firebaseApiKey: extra.FIREBASE_API_KEY ?? "",
  firebaseAuthDomain: extra.FIREBASE_AUTH_DOMAIN ?? "",
  firebaseProjectId: extra.FIREBASE_PROJECT_ID ?? "",
  firebaseStorageBucket: extra.FIREBASE_STORAGE_BUCKET ?? "",
  firebaseMessagingSenderId: extra.FIREBASE_MESSAGING_SENDER_ID ?? "",
  firebaseAppId: extra.FIREBASE_APP_ID ?? "",
};

export function hasFirebaseConfig() {
  return !!ENV.firebaseApiKey && !!ENV.firebaseProjectId && !!ENV.firebaseAppId;
}

// ✅ THIS is what your app is trying to call
export function hasRealTmdb() {
  // In your project “real tmdb” means: proxy exists
  return !!ENV.tmdbProxyBaseUrl && ENV.tmdbProxyBaseUrl.startsWith("http");
}

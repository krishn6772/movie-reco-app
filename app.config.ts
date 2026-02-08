import "dotenv/config";
import type { ExpoConfig } from "expo/config";

export default ({ config }: { config: ExpoConfig }) => {
  return {
    ...config,

    name: "movie-reco-app",
    slug: "movies-rec",

    // ✅ REQUIRED for EAS builds
    android: {
      ...(config.android ?? {}),
      package: "com.swaraj.moviereco",
    },

    // (Optional now) only needed if you build iOS later
    ios: {
      ...(config.ios ?? {}),
      bundleIdentifier: "com.swaraj.moviereco",
    },

    extra: {
      ...(config.extra ?? {}),

      // ✅ REQUIRED for EAS project linking
      eas: {
        projectId: "e2444f7b-794f-409c-bb59-c8eca26f0236",
      },

      TMDB_PROXY_BASE_URL: process.env.TMDB_PROXY_BASE_URL,
      TMDB_IMAGE_BASE_URL: process.env.TMDB_IMAGE_BASE_URL,

      FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
      FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
      FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
      FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
    },
  };
};

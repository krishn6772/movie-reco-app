import "dotenv/config";

export default {
  expo: {
    name: "movie-reco-app",
    slug: "movie-reco-app",
    extra: {
      TMDB_PROXY_BASE_URL: process.env.TMDB_PROXY_BASE_URL,
      TMDB_IMAGE_BASE_URL: process.env.TMDB_IMAGE_BASE_URL,

      FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
      FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
      FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
      FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
    },
  },
};

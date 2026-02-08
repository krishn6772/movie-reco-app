# MovieReco App

MovieReco is a React Native (Expo) app that recommends and tracks Movies and TV Series using TMDB.

## Features
- Movies + TV Series toggle across Home, Search, and Watchlist
- Category filters (Trending, Popular, Top Rated, etc.)
- Genre multi-select filtering and sorting
- Trailer playback (YouTube)
- Where to Watch providers with deep links
- Likes + Watchlist synced to Firestore (when logged in)
- Region selector for provider availability

## Tech Stack
- Expo + React Native
- TypeScript
- React Navigation
- React Query
- Zustand
- Firebase Auth + Firestore
- TMDB API via proxy

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Ensure `.env` is configured:
   - `TMDB_PROXY_BASE_URL`
   - `TMDB_IMAGE_BASE_URL`

3. (Optional) Enable trailer playback:
   ```bash
   npm i react-native-youtube-iframe
   npx expo install react-native-webview
   ```

## Run
```bash
npm run start
```

## Notes
- If `TMDB_PROXY_BASE_URL` is not set, the app uses mock data.
- Provider availability depends on the selected region.

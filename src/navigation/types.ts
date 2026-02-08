import type { ContentType } from "../services/tmdb/types";

export type RootStackParamList = {
  Root?: undefined;
  Tabs?: undefined;
  Login?: undefined;
  Register?: undefined;
  MovieDetails: { id: number; type: ContentType; from?: "Home" | "Search" | "Watchlist" };
};

export type TabsParamList = {
  Home: undefined;
  Search: undefined;
  Watchlist: undefined;
  Profile: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

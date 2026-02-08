export type RootStackParamList = {
  Tabs: undefined;
  MovieDetails: { movieId: number; from?: "Home" | "Search" | "Watchlist" };
};

export type TabsParamList = {
  Home: undefined;
  Search: undefined;
  Watchlist: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Root: undefined;
  MovieDetails: { movieId: number; from?: string };
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

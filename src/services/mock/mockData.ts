import type { Movie, MovieDetails, CreditsResponse } from "../tmdb/types";

// Real image URLs so posters show even in mock mode
const poster = (seed: string) => `https://picsum.photos/seed/${seed}/500/750`;

const base: Movie[] = [
  {
    id: 101,
    title: "Mock: Neon Horizon",
    original_title: "Mock: Neon Horizon",
    overview: "A sci-fi courier discovers a conspiracy across a neon megacity.",
    poster_path: poster("neon-horizon"),
    backdrop_path: null,
    release_date: "2024-11-08",
    vote_average: 7.8,
    vote_count: 1200,
    popularity: 180.5,
    genre_ids: [878, 53],
  },
  {
    id: 102,
    title: "Mock: The Last Ticket",
    original_title: "Mock: The Last Ticket",
    overview: "A drama about second chances on a cross-country train ride.",
    poster_path: poster("last-ticket"),
    backdrop_path: null,
    release_date: "2023-06-14",
    vote_average: 7.2,
    vote_count: 800,
    popularity: 95.2,
    genre_ids: [18],
  },
  {
    id: 103,
    title: "Mock: Laugh Riot",
    original_title: "Mock: Laugh Riot",
    overview: "A stand-up comic accidentally becomes a viral activist.",
    poster_path: poster("laugh-riot"),
    backdrop_path: null,
    release_date: "2022-02-10",
    vote_average: 6.9,
    vote_count: 560,
    popularity: 70.0,
    genre_ids: [35],
  },
  {
    id: 104,
    title: "Mock: Ember Protocol",
    original_title: "Mock: Ember Protocol",
    overview: "An elite unit races to stop an AI-driven cyber attack.",
    poster_path: poster("ember-protocol"),
    backdrop_path: null,
    release_date: "2025-01-20",
    vote_average: 8.1,
    vote_count: 2100,
    popularity: 220.1,
    genre_ids: [28, 53],
  },
];

// Category buckets (Netflix-like sections)
const trending = [base[0], base[3], base[2], base[1]];
const popular = [base[3], base[0], base[1], base[2]];
const topRated = [base[3], base[0], base[1]];
const upcoming: Movie[] = [
  {
    ...base[0],
    id: 201,
    title: "Mock: Neon Horizon 2",
    original_title: "Mock: Neon Horizon 2",
    release_date: "2026-05-18",
    poster_path: poster("neon-horizon-2"),
    popularity: 260.4,
    vote_average: 8.3,
    vote_count: 400,
    genre_ids: [878, 28, 53],
  },
];

const all = [...base, ...upcoming];

export const mockMovies = {
  trending,
  popular,
  topRated,
  upcoming,
  all,
};

// ✅ must match mockClient.ts name: mockDetailsById
export const mockDetailsById: Record<number, MovieDetails> = Object.fromEntries(
  all.map((m) => [
    m.id,
    {
      ...m,
      // Provide details-only fields:
      genres: (m.genre_ids ?? []).map((id) => ({ id, name: `Genre ${id}` })),
      runtime: 95 + (m.id % 40),
    } as MovieDetails,
  ])
);

// ✅ must match mockClient.ts name: mockCreditsById
export const mockCreditsById: Record<number, CreditsResponse> = {
  101: {
    id: 101,
    cast: [
      { id: 1, name: "Asha Verma", character: "Mira", profile_path: null, order: 0 },
      { id: 2, name: "Liam Chen", character: "Kade", profile_path: null, order: 1 },
    ],
    crew: [],
  },
  104: {
    id: 104,
    cast: [
      { id: 3, name: "Noah Patel", character: "Rex", profile_path: null, order: 0 },
      { id: 4, name: "Elena Cruz", character: "Sable", profile_path: null, order: 1 },
    ],
    crew: [],
  },
};

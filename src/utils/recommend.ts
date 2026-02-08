import type { Movie } from "../services/tmdb/types";

function clamp(x: number, min: number, max: number) {
  return Math.max(min, Math.min(max, x));
}

/**
 * Recommendation scoring (exact formula):
 * G = |genres(m) ∩ preferredGenres| / max(1, |genres(m)|)
 * V = clamp(vote_average/10, 0..1)
 * P = clamp(log10(1+popularity)/3, 0..1)
 * score = 0.55*G + 0.30*V + 0.15*P
 */
export function scoreMovie(m: Movie, preferredGenres: Set<number>) {
  const genres = m.genre_ids ?? [];
  const overlap = genres.filter((g) => preferredGenres.has(g)).length;
  const G = overlap / Math.max(1, genres.length);
  const V = clamp((m.vote_average ?? 0) / 10, 0, 1);
  const P = clamp(Math.log10(1 + (m.popularity ?? 0)) / 3, 0, 1);
  const score = 0.55 * G + 0.30 * V + 0.15 * P;
  return score;
}

export function recommendMovies(args: {
  candidates: Movie[];
  liked: Record<number, Movie>;
  watchlist: Record<number, Movie>;
  limit?: number;
}) {
  const { candidates, liked, watchlist, limit = 20 } = args;
  const likedIds = new Set(Object.keys(liked).map(Number));
  const watchIds = new Set(Object.keys(watchlist).map(Number));

  const likedMovies = Object.values(liked);

  // Cold start: no likes => pick from candidates by vote_average then popularity
  if (likedMovies.length === 0) {
    return candidates
      .filter((m) => !likedIds.has(m.id) && !watchIds.has(m.id))
      .slice()
      .sort((a, b) => (b.vote_average - a.vote_average) || (b.popularity - a.popularity))
      .slice(0, limit);
  }

  // Preferred genres from liked movies
  const preferredGenres = new Set<number>();
  likedMovies.forEach((m) => (m.genre_ids ?? []).forEach((g) => preferredGenres.add(g)));

  return candidates
    .filter((m) => !likedIds.has(m.id) && !watchIds.has(m.id))
    .map((m) => ({ m, s: scoreMovie(m, preferredGenres) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.m);
}

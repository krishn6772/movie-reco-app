import { ENV } from "../config/env";

/**
 * Build a poster URL.
 * - In mock mode we may store full URLs (picsum) → return as-is.
 * - In real TMDB mode we get /path.jpg → build TMDB CDN URL.
 */
export function posterUrl(
  path: string | null | undefined,
  size: "w342" | "w500" | "w780" = "w500"
) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${ENV.tmdbImageBaseUrl}/${size}${path}`;
}

/** Extract year from date string like "2024-02-03" */
export function yearFromDate(date: string | null | undefined) {
  if (!date) return "";
  const year = String(date).slice(0, 4);
  return /^\d{4}$/.test(year) ? year : "";
}

/** Format runtime minutes into "2h 10m" */
export function formatRuntime(runtimeMinutes: number | null | undefined) {
  if (!runtimeMinutes || runtimeMinutes <= 0) return "—";
  const h = Math.floor(runtimeMinutes / 60);
  const m = runtimeMinutes % 60;
  if (h <= 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** Clamp rating 0..10 and format nicely */
export function formatRating(voteAverage: number | null | undefined) {
  if (voteAverage === null || voteAverage === undefined) return "—";
  const v = Math.max(0, Math.min(10, voteAverage));
  return v.toFixed(1);
}

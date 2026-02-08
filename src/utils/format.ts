import { ENV } from "../config/env";
import type { MediaItem, MediaDetails, ContentType } from "../services/tmdb/types";

/**
 * Build a poster URL.
 * - In mock mode we may store full URLs (picsum) → return as-is.
 * - In real TMDB mode we get /path.jpg → build TMDB CDN URL.
 */
export function posterUrl(
  path: string | null | undefined,
  size: "w92" | "w342" | "w500" | "w780" = "w500"
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

export function getMediaTitle(media: MediaItem | MediaDetails) {
  if ("title" in media) return media.title ?? media.original_title ?? "Untitled";
  if ("name" in media) return media.name ?? media.original_name ?? "Untitled";
  return "Untitled";
}

export function getMediaDate(media: MediaItem | MediaDetails) {
  if ("release_date" in media) return media.release_date ?? "";
  if ("first_air_date" in media) return media.first_air_date ?? "";
  return "";
}

export function getMediaYear(media: MediaItem | MediaDetails) {
  return yearFromDate(getMediaDate(media));
}

export function getRuntimeLabel(media: MediaDetails, type: ContentType) {
  if (type === "movie" && "runtime" in media) {
    return media.runtime ? formatRuntime(media.runtime) : "â€”";
  }
  if (type === "tv" && "episode_run_time" in media) {
    const runtime = Array.isArray(media.episode_run_time) && media.episode_run_time.length > 0
      ? media.episode_run_time[0]
      : null;
    return runtime ? formatRuntime(runtime) : "â€”";
  }
  return "â€”";
}

import AsyncStorage from "@react-native-async-storage/async-storage";

export type StorageKey = "likedMovies" | "watchlistMovies" | "themeMode";

export async function setJSON<T>(key: StorageKey, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function getJSON<T>(key: StorageKey): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function remove(key: StorageKey): Promise<void> {
  await AsyncStorage.removeItem(key);
}

export async function clearAll(): Promise<void> {
  await AsyncStorage.multiRemove(["likedMovies", "watchlistMovies", "themeMode"]);
}

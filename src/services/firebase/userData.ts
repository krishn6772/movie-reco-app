import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import type { Movie } from "../tmdb/types";

export type UserMovieMap = Record<number, Movie>;

type UserDoc = {
  liked: Record<number, Movie>;
  watchlist: Record<number, Movie>;
  updatedAt: number;
};

function isPermissionError(err: unknown) {
  const msg = String((err as any)?.message ?? "");
  const code = String((err as any)?.code ?? "");
  return code.includes("permission-denied") || msg.includes("Missing or insufficient permissions");
}

export async function loadUserData(uid: string): Promise<UserDoc | null> {
  try {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data() as UserDoc;
  } catch (err) {
    if (isPermissionError(err)) {
      console.log("⚠️ Firestore read blocked by rules. Using local AsyncStorage only.");
      return null;
    }
    throw err;
  }
}

export async function saveUserData(uid: string, liked: UserMovieMap, watchlist: UserMovieMap) {
  try {
    const ref = doc(db, "users", uid);
    await setDoc(
      ref,
      {
        liked,
        watchlist,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (err) {
    if (isPermissionError(err)) {
      console.log("⚠️ Firestore write blocked by rules. Saved locally only.");
      return;
    }
    throw err;
  }
}

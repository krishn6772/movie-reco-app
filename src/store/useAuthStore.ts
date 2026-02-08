import { create } from "zustand";
import type { User } from "firebase/auth";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../services/firebase/firebase";

type AuthState = {
  user: User | null;
  isAuthReady: boolean;
  error?: string;

  initAuthListener: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  clearError: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthReady: false,
  error: undefined,

  clearError: () => set({ error: undefined }),

  initAuthListener: () => {
    // Prevent double listener
    if (get().isAuthReady) return;

    onAuthStateChanged(auth, (user) => {
      set({ user, isAuthReady: true });
    });
  },

  login: async (email, password) => {
    try {
      set({ error: undefined });
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (e: any) {
      set({ error: e?.message ?? "Login failed" });
    }
  },

  register: async (email, password) => {
    try {
      set({ error: undefined });
      await createUserWithEmailAndPassword(auth, email.trim(), password);
    } catch (e: any) {
      set({ error: e?.message ?? "Register failed" });
    }
  },
}));

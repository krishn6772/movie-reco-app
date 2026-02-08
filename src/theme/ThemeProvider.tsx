import React, { createContext, useEffect, useMemo } from "react";
import { darkTheme, lightTheme, type AppTheme, type ThemeMode } from "./colors";
import { useAppStore } from "../store/useAppStore";

type ThemeContextValue = {
  theme: AppTheme;
  mode: ThemeMode;
  toggle: () => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const storedMode = useAppStore((s) => s.themeMode);
  const loadTheme = useAppStore((s) => s.loadThemeMode);
  const setMode = useAppStore((s) => s.setThemeMode);

  // Always provide a valid mode (default dark)
  const mode: ThemeMode = storedMode ?? "dark";

  const theme = useMemo(() => (mode === "dark" ? darkTheme : lightTheme), [mode]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      mode,
      toggle: () => setMode(mode === "dark" ? "light" : "dark"),
    }),
    [theme, mode, setMode]
  );

  useEffect(() => {
    // Load persisted theme, but DON'T block rendering the provider.
    loadTheme();
  }, [loadTheme]);

  // Debug (now actually runs)
  console.log("✅ ThemeProvider mounted. mode=", mode);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// Optional: make importing foolproof (named + default both supported)
export default ThemeProvider;

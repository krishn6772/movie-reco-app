export type ThemeMode = "dark" | "light";

export type AppTheme = {
  mode: ThemeMode;
  colors: {
    background: string;
    surface: string;
    text: string;
    muted: string;
    border: string;
    primary: string;
    danger: string;
  };
};

export const darkTheme: AppTheme = {
  mode: "dark",
  colors: {
    background: "#0B0B0F",
    surface: "#13131A",
    text: "#FFFFFF",
    muted: "#A0A0B2",
    border: "#23232E",
    primary: "#E50914", // Netflix-ish accent
    danger: "#FF4D4D",
  },
};

export const lightTheme: AppTheme = {
  mode: "light",
  colors: {
    background: "#FFFFFF",
    surface: "#F6F6F8",
    text: "#111111",
    muted: "#666677",
    border: "#E6E6EE",
    primary: "#E50914",
    danger: "#D93636",
  },
};

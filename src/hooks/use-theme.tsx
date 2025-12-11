import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark";
type AccentColor = "blue" | "green" | "purple" | "orange";

interface ThemeContextType {
  theme: Theme;
  accentColor: AccentColor;
  setTheme: (theme: Theme) => void;
  setAccentColor: (color: AccentColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const accentColors = {
  blue: {
    secondary: "204 70% 53%",
    accent: "204 70% 53%",
    ring: "204 70% 53%",
  },
  green: {
    secondary: "145 63% 42%",
    accent: "145 63% 42%",
    ring: "145 63% 42%",
  },
  purple: {
    secondary: "280 60% 50%",
    accent: "280 60% 50%",
    ring: "280 60% 50%",
  },
  orange: {
    secondary: "36 100% 50%",
    accent: "36 100% 50%",
    ring: "36 100% 50%",
  },
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem("theme");
    return (stored as Theme) || "light";
  });

  const [accentColor, setAccentColorState] = useState<AccentColor>(() => {
    const stored = localStorage.getItem("accentColor");
    return (stored as AccentColor) || "blue";
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Apply theme
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    const colors = accentColors[accentColor];
    
    // Apply accent color
    root.style.setProperty("--secondary", colors.secondary);
    root.style.setProperty("--accent", colors.accent);
    root.style.setProperty("--ring", colors.ring);
    root.style.setProperty("--sidebar-primary", colors.secondary);
    root.style.setProperty("--sidebar-ring", colors.ring);
    root.style.setProperty("--chart-1", colors.secondary);
    
    localStorage.setItem("accentColor", accentColor);
  }, [accentColor]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const setAccentColor = (color: AccentColor) => {
    setAccentColorState(color);
  };

  return (
    <ThemeContext.Provider value={{ theme, accentColor, setTheme, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

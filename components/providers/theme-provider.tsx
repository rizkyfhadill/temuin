"use client";

import * as React from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextShape {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  systemTheme: "light" | "dark";
  setTheme: (t: Theme) => void;
}

const ThemeContext = React.createContext<ThemeContextShape | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>(() => {
    try {
      const v = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
      return (v as Theme) || "system";
    } catch {
      return "system";
    }
  });

  const getSystem = () =>
    typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

  const [systemTheme, setSystemTheme] = React.useState<"light" | "dark">(getSystem());

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const m = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setSystemTheme(m.matches ? "dark" : "light");
    if (m.addEventListener) m.addEventListener("change", handler);
    else m.addListener(handler as any);
    return () => {
      if (m.removeEventListener) m.removeEventListener("change", handler);
      else m.removeListener(handler as any);
    };
  }, []);

  const resolvedTheme: "light" | "dark" = theme === "system" ? systemTheme : theme;

  React.useEffect(() => {
    if (typeof document === "undefined") return;
    if (resolvedTheme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");

    try {
      localStorage.setItem("theme", theme);
    } catch {}
  }, [resolvedTheme, theme]);

  const value = React.useMemo(
    () => ({ theme, setTheme: setThemeState, resolvedTheme, systemTheme }),
    [theme, resolvedTheme, systemTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (ctx) return ctx;
  return {
    theme: "system" as Theme,
    resolvedTheme: "light",
    systemTheme: "light",
    setTheme: () => {},
  };
}

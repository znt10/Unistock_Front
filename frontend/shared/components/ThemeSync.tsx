"use client";
import { useEffect } from "react";
import { useTheme } from "next-themes";

export function ThemeSync() {
  const { theme } = useTheme();

  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.setAttribute("data-theme", "dark-blue");
    } else {
      root.removeAttribute("data-theme");
    }
  }, [theme]);

  return null;
}

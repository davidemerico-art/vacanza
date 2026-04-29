"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    return (localStorage.getItem("theme") as Theme | null) || "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className="fixed right-4 bottom-4 z-50 px-4 py-2 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors"
      aria-label="Cambia tema"
    >
      {theme === "light" ? "Dark Mode" : "Light Mode"}
    </button>
  );
}

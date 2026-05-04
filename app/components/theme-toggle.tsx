"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/lib/localeContext";
type Theme = "light" | "dark";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const { locale, setLocale } = useLocale();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedTheme = (localStorage.getItem("theme") as Theme | null) || "light";
    setTheme(storedTheme);
    document.documentElement.classList.toggle("dark", storedTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", nextTheme);
    }
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  };

  const toggleLocale = () => {
    const nextLocale = locale === "en" ? "it" : "en";
    setLocale(nextLocale);
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-full bg-white/90 p-2 shadow-xl backdrop-blur-md dark:bg-slate-900/90">
      <button
        onClick={toggleLocale}
        className="px-3 py-2 rounded-full border border-slate-200 bg-slate-50 text-slate-800 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
        aria-label="Cambia lingua"
      >
        {locale === "en" ? "EN" : "IT"}
      </button>
      <button
        onClick={toggleTheme}
        className="px-3 py-2 rounded-full border border-slate-200 bg-slate-50 text-slate-800 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
        aria-label={theme === "light" ? "Attiva tema scuro" : "Attiva tema chiaro"}
      >
        {theme === "light" ? "🌙" : "☀️"}
      </button>
    </div>
  );
}

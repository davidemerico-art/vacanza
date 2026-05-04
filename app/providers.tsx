"use client";

import { ReactNode } from "react";
import { LocaleProvider } from "@/lib/localeContext";
import ThemeToggle from "./components/theme-toggle";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <LocaleProvider>
      {children}
      <ThemeToggle />
    </LocaleProvider>
  );
}

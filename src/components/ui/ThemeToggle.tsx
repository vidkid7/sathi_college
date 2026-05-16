"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const current = mounted ? (theme === "system" ? resolvedTheme : theme) : "dark";
  const next = current === "dark" ? "light" : "dark";

  return (
    <button
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} mode`}
      className="glass relative inline-flex h-10 w-10 items-center justify-center rounded-xl no-tap transition hover:scale-105"
    >
      <Sun className={`absolute h-5 w-5 transition-all ${current === "light" ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"}`} />
      <Moon className={`absolute h-5 w-5 transition-all ${current === "dark" ? "opacity-100 rotate-0" : "opacity-0 rotate-90"}`} />
    </button>
  );
}

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

function getInitial(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem("soltani-theme") as Theme | null;
  if (stored === "light" || stored === "dark") return stored;
  return "dark";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = getInitial();
    setTheme(t);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("soltani-theme", theme);
  }, [theme, mounted]);

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Activer le mode clair" : "Activer le mode sombre"}
      className="group relative inline-flex h-9 w-[68px] items-center rounded-full border border-gold/40 bg-secondary/60 transition-all duration-300 hover:border-gold hover:shadow-gold"
    >
      <span
        className={`absolute top-1/2 -translate-y-1/2 grid h-7 w-7 place-items-center rounded-full bg-gradient-gold text-ink shadow-md transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isDark ? "translate-x-1" : "translate-x-[34px]"
        } group-hover:scale-110`}
      >
        {isDark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
      </span>
      <span className="flex w-full items-center justify-between px-2.5 text-gold/60">
        <Sun className={`h-3.5 w-3.5 transition-opacity ${isDark ? "opacity-50" : "opacity-0"}`} />
        <Moon className={`h-3.5 w-3.5 transition-opacity ${isDark ? "opacity-0" : "opacity-50"}`} />
      </span>
    </button>
  );
}

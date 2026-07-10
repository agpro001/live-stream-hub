import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Search, Heart, History, Radio, Sun, Moon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

function useTheme() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  useEffect(() => {
    const saved = (localStorage.getItem("streamhub:theme") as "dark" | "light") ?? "dark";
    setTheme(saved);
    document.documentElement.classList.toggle("light", saved === "light");
  }, []);
  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("streamhub:theme", next);
    document.documentElement.classList.toggle("light", next === "light");
  };
  return { theme, toggle };
}

export function Header() {
  const nav = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const { theme, toggle } = useTheme();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    nav({ to: "/browse", search: query ? { q: query } : {} });
  };

  const navItem = (to: string, label: string) => (
    <Link
      to={to}
      className={cn(
        "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors",
        pathname === to && "text-foreground",
      )}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 backdrop-blur-2xl bg-background/50 border-b border-white/10">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-[color:var(--color-brand)] text-black shadow-[0_0_24px_color-mix(in_oklab,var(--color-brand)_60%,transparent)]">
            <Radio className="h-4 w-4" aria-hidden />
          </span>
          <span>Stream<span className="text-gradient">Hub</span></span>
        </Link>

        <nav className="ml-6 hidden items-center gap-6 md:flex" aria-label="Primary">
          {navItem("/", "Home")}
          {navItem("/browse", "Browse")}
          {navItem("/favorites", "Favorites")}
          {navItem("/recent", "Recent")}
        </nav>

        <form onSubmit={onSubmit} role="search" className="ml-auto flex-1 max-w-md">
          <label className="sr-only" htmlFor="global-search">Search matches</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <input
              id="global-search"
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search teams, leagues, sports…  ( press / )"
              className="w-full rounded-full border border-border bg-secondary/50 py-2 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </form>

        <div className="flex items-center gap-1">
          <Link
            to="/favorites"
            aria-label="Favorites"
            className="hidden rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground md:inline-flex"
          >
            <Heart className="h-4 w-4" />
          </Link>
          <Link
            to="/recent"
            aria-label="Recently viewed"
            className="hidden rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground md:inline-flex"
          >
            <History className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={toggle}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
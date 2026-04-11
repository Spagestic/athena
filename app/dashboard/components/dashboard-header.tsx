"use client";

import { useTheme } from "next-themes";
import { Flame, LogOut, Moon, Search, Settings, Sun } from "lucide-react";
import { useMemo, useSyncExternalStore } from "react";

import { userInitial, streakCount } from "../dashboard-data";

type DashboardHeaderProps = {
  isScrolled: boolean;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
};

function subscribeToMount() {
  return () => undefined;
}

export function DashboardHeader({
  isScrolled,
  searchQuery,
  onSearchQueryChange,
}: DashboardHeaderProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const isMounted = useSyncExternalStore(
    subscribeToMount,
    () => true,
    () => false,
  );
  const isDarkMode = useMemo(
    () => isMounted && resolvedTheme === "dark",
    [isMounted, resolvedTheme],
  );

  return (
    <header
      className={`sticky top-0 z-20 px-4 pt-4 transition-all duration-500 md:px-8 ${
        isScrolled ? "bg-background/95 backdrop-blur-sm" : "bg-transparent"
      }`}
    >
      <div
        className={`flex flex-col gap-4 pb-4 transition-all duration-500 md:flex-row md:items-center md:justify-between ${
          isScrolled
            ? "border-b-2 border-foreground/30"
            : "border-b-2 border-foreground/20"
        }`}
      >
        <label className="flex w-full max-w-3xl items-center gap-3 border-2 border-foreground bg-background/85 px-4 py-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)] backdrop-blur-sm">
          <Search className="h-5 w-5 shrink-0" />
          <input
            type="search"
            placeholder="Search notes, modules, deadlines..."
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            className="w-full bg-transparent text-sm font-mono uppercase tracking-[0.14em] placeholder:text-muted-foreground focus:outline-none"
          />
        </label>

        <div className="flex items-center justify-end gap-3">
          <div className="flex h-14 items-center gap-2 border-2 border-orange-500 bg-background px-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            <Flame className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Streak
              </p>
              <p className="text-lg font-black leading-none">{streakCount}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setTheme(isDarkMode ? "light" : "dark")}
            className="flex h-14 items-center gap-2 border-2 border-foreground bg-background px-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5"
            aria-label={
              isDarkMode ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span className="text-xs font-mono uppercase tracking-[0.14em]">
              {isDarkMode ? "Light" : "Dark"}
            </span>
          </button>

          <details className="relative">
            <summary className="flex h-14 w-14 cursor-pointer list-none items-center justify-center border-2 border-foreground bg-background text-lg font-black uppercase shadow-[4px_4px_0_0_rgba(0,0,0,1)] [&::-webkit-details-marker]:hidden">
              {userInitial}
            </summary>
            <div className="absolute right-0 mt-3 flex min-w-44 flex-col border-2 border-foreground bg-background shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
              <button className="flex items-center gap-2 border-b-2 border-foreground px-4 py-3 text-left text-sm font-mono uppercase tracking-[0.12em] transition-colors hover:bg-accent">
                <Settings className="h-4 w-4" />
                Setting
              </button>
              <button className="flex items-center gap-2 px-4 py-3 text-left text-sm font-mono uppercase tracking-[0.12em] transition-colors hover:bg-accent">
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}

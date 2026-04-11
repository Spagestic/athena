"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { ArrowLeft, Flame, LogOut, Moon, Settings, Sun } from "lucide-react";
import { useMemo, useSyncExternalStore } from "react";

import { streakCount, userInitial } from "@/app/dashboard/dashboard-data";

type ModuleHeaderProps = {
  isScrolled: boolean;
  moduleCode: string;
};

function subscribeToMount() {
  return () => undefined;
}

export function ModuleHeader({ isScrolled, moduleCode }: ModuleHeaderProps) {
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
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex h-14 items-center gap-2 border-2 border-foreground bg-background px-4 text-sm font-mono uppercase tracking-[0.14em] shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <div className="hidden border-2 border-foreground bg-background px-4 py-3 text-xs font-bold uppercase tracking-[0.24em] shadow-[4px_4px_0_0_rgba(0,0,0,1)] md:block">
            {moduleCode}
          </div>
        </div>

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

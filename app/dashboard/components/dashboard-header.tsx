"use client";

import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { Bell, Flame, LogOut, Search, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  type DashboardNotification,
  type DashboardUser,
} from "../dashboard-data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type DashboardHeaderProps = {
  isScrolled: boolean;
  notifications: DashboardNotification[];
  searchQuery: string;
  streakCount: number;
  user: DashboardUser | null;
  onSearchQueryChange: (value: string) => void;
};

export function DashboardHeader({
  isScrolled,
  notifications,
  searchQuery,
  streakCount,
  user,
  onSearchQueryChange,
}: DashboardHeaderProps) {
  const router = useRouter();
  const { signOut } = useAuthActions();

  const handleSignOut = () => {
    void signOut().then(() => {
      router.push("/login");
    });
  };

  const userInitial = user?.name?.charAt(0).toUpperCase() ?? "U";

  return (
    <header
      className={`sticky top-0 z-20 px-4 pt-4 transition-all duration-500 md:px-8 bg-background`}
    >
      <div
        className={`flex flex-col gap-4 pb-4 transition-all duration-500 md:flex-row md:items-center md:justify-between ${
          isScrolled
            ? "border-b-2 border-foreground/30"
            : "border-b-2 border-foreground/20"
        }`}
      >
        <Link href="/" className="flex items-center group">
          <Image
            alt="Logo"
            className="h-10 w-10 pixel-crisp"
            height={40}
            src="/logo_.png"
            width={40}
          />
          <span className="text-md font-mono tracking-[0.15em] uppercase font-bold">
            Athena
          </span>
        </Link>
        <label className="flex w-full max-w-3xl items-center gap-3 border-2 border-foreground bg-background/85 px-4 py-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)] backdrop-blur-sm">
          <Search className="h-5 w-5 shrink-0" />
          <input
            type="search"
            placeholder="Search courses, notes, focus items..."
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

          <DropdownMenu>
            <DropdownMenuTrigger
              className="relative flex h-14 w-14 items-center justify-center border-2 border-foreground bg-background text-lg font-black uppercase shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-colors hover:bg-accent"
              aria-label="Open notifications"
            >
              <Bell className="h-5 w-5" />
              {notifications.length > 0 ? (
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-background" />
              ) : null}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0">
              <div className="flex flex-col px-2 py-4">
                {notifications.length > 0 ? (
                  notifications.map((notification, index) => (
                    <div
                      key={notification.title}
                      className="flex flex-col px-3"
                    >
                      <div className="flex items-start">
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground normal-case tracking-normal">
                            {notification.detail}
                          </p>
                        </div>
                      </div>
                      {index < notifications.length - 1 ? (
                        <DropdownMenuSeparator className="my-3 w-full" />
                      ) : null}
                    </div>
                  ))
                ) : (
                  <div className="px-3 text-sm text-muted-foreground">
                    All caught up for now.
                  </div>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <details className="relative">
            <summary className="flex h-14 w-14 cursor-pointer list-none items-stretch justify-stretch overflow-hidden border-2 border-foreground bg-background text-lg font-black uppercase shadow-[4px_4px_0_0_rgba(0,0,0,1)] [&::-webkit-details-marker]:hidden">
              {user?.image ? (
                <Image
                  alt={user.name ?? "User profile"}
                  className="h-full w-full object-cover"
                  height={56}
                  src={user.image}
                  width={56}
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center">
                  {userInitial}
                </span>
              )}
            </summary>
            <div className="absolute right-0 mt-3 flex min-w-44 flex-col border-2 border-foreground bg-background shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
              <button className="flex items-center gap-2 border-b-2 border-foreground px-4 py-3 text-left text-sm font-mono uppercase tracking-[0.12em] transition-colors hover:bg-accent">
                <Settings className="h-4 w-4" />
                Setting
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-3 text-left text-sm font-mono uppercase tracking-[0.12em] transition-colors hover:bg-accent"
              >
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

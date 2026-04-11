"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import {
  Bell,
  LogOut,
  Search,
  Settings,
  ArrowLeft,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  type DashboardNotification,
  type DashboardUser,
} from "@/app/dashboard/dashboard-data";
import { api } from "@/convex/_generated/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StreakInsightsTrigger } from "@/components/streak-insights-trigger";

type DashboardHeaderProps = {
  isScrolled: boolean;
  moduleCode?: string;
  notifications?: DashboardNotification[];
  searchQuery: string;
  streakCount: number;
  user: DashboardUser | null;
  onSearchQueryChange: (value: string) => void;
};

export function ModuleHeader({
  isScrolled,
  moduleCode,
  notifications,
  searchQuery,
  streakCount,
  user,
  onSearchQueryChange,
}: DashboardHeaderProps) {
  const router = useRouter();
  const deleteFolder = useMutation(api.folders.deleteFolder);
  const { signOut } = useAuthActions();
  const [isDeleting, setIsDeleting] = useState(false);
  const safeNotifications = notifications ?? [];

  const handleSignOut = () => {
    void signOut().then(() => {
      router.push("/login");
    });
  };

  const handleDeleteClass = async () => {
    if (!moduleCode) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteFolder({ folderId: moduleCode as never });
      router.push("/dashboard");
    } finally {
      setIsDeleting(false);
    }
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
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex h-14 items-center gap-2 border-2 border-foreground bg-background px-4 text-sm font-mono uppercase tracking-[0.14em] shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </div>

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
          <StreakInsightsTrigger streakCount={streakCount} />

          <DropdownMenu>
            <DropdownMenuTrigger
              className="relative flex h-14 w-14 items-center justify-center border-2 border-foreground bg-background text-lg font-black uppercase shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-colors hover:bg-accent"
              aria-label="Open notifications"
            >
              <Bell className="h-5 w-5" />
              {safeNotifications.length > 0 ? (
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-background" />
              ) : null}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0">
              <div className="flex flex-col px-2 py-4">
                {safeNotifications.length > 0 ? (
                  safeNotifications.map((notification, index) => (
                    <div
                      key={notification.id}
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
                      {index < safeNotifications.length - 1 ? (
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
              {moduleCode ? (
                <AlertDialog>
                  <AlertDialogTrigger className="flex items-center gap-2 border-b-2 border-foreground px-4 py-3 text-left text-sm font-mono uppercase tracking-[0.12em] transition-colors hover:bg-accent">
                    <Trash2 className="h-4 w-4" />
                    Delete class
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this class?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently remove the class and all of its
                        notes, quizzes, scores, and progress data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isDeleting}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => void handleDeleteClass()}
                        disabled={isDeleting}
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : null}
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

"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import {
  BookCopy,
  Clock3,
  Flame,
  LogOut,
  MoreHorizontal,
  Moon,
  Search,
  Settings,
  Sparkles,
  Sun,
  Trash2,
} from "lucide-react";
import {
  dashboardModules,
  deadlineTasks,
  streakCount,
  userFirstName,
  userInitial,
  type DeadlineTask,
  type DeadlineUrgency,
} from "./dashboard-data";

type GreetingState = {
  greeting: string;
};

const defaultGreetingState: GreetingState = {
  greeting: "Good day",
};

let cachedGreetingState: GreetingState | null = null;

const urgencyStyles: Record<
  DeadlineUrgency,
  {
    badge: string;
    bar: string;
    card: string;
    label: string;
  }
> = {
  critical: {
    badge: "bg-red-500 text-white",
    bar: "bg-red-500 animate-pulse",
    card: "border-red-500/80 bg-red-500/10",
    label: "Urgent",
  },
  medium: {
    badge: "bg-orange-400 text-black",
    bar: "bg-orange-400",
    card: "border-orange-400/90 bg-orange-400/10",
    label: "Medium",
  },
  low: {
    badge: "bg-lime-400 text-black",
    bar: "bg-lime-400",
    card: "border-lime-500/80 bg-lime-400/10",
    label: "Stable",
  },
};

function getGreetingState(): GreetingState {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return { greeting };
}

function getCachedGreetingState(): GreetingState {
  const nextState = getGreetingState();

  if (
    cachedGreetingState?.greeting === nextState.greeting
  ) {
    return cachedGreetingState;
  }

  cachedGreetingState = nextState;
  return cachedGreetingState;
}

function subscribeToGreeting() {
  return () => undefined;
}

function DeadlineCard({ task }: { task: DeadlineTask }) {
  const styles = urgencyStyles[task.urgency];

  return (
    <article
      className={`border-2 border-foreground bg-background px-3 py-2.5 shadow-[4px_4px_0_0_rgba(0,0,0,1)] ${styles.card}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="border border-foreground bg-background px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em]">
              {task.moduleCode}
            </span>
            <span
              className={`border border-foreground px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${styles.badge}`}
            >
              {styles.label}
            </span>
          </div>
          <div>
            <h3 className="text-base font-black uppercase leading-tight md:text-lg">
              {task.title}
            </h3>
            <p className="text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground md:text-sm">
              {task.dueLabel}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 border-2 border-foreground bg-background px-2.5 py-2 text-xs font-mono uppercase tracking-[0.14em] md:text-sm">
          <Clock3 className="h-4 w-4" />
          Risk {task.effortScore}
        </div>
      </div>

      <div className="mt-2 space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          <span>Deadline window</span>
          <span>{task.progress}% remaining</span>
        </div>
        <div className="h-3.5 border-2 border-foreground bg-background p-0.5">
          <div
            className={`h-full transition-all duration-500 ${styles.bar}`}
            style={{ width: `${Math.max(task.progress, 8)}%` }}
          />
        </div>
      </div>
    </article>
  );
}

export function DashboardPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const greetingState = useSyncExternalStore(
    subscribeToGreeting,
    getCachedGreetingState,
    () => defaultGreetingState,
  );
  const isMounted = useSyncExternalStore(
    subscribeToGreeting,
    () => true,
    () => false,
  );
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredTasks = useMemo(() => {
    if (!normalizedQuery) {
      return deadlineTasks;
    }

    return deadlineTasks.filter((task) =>
      [task.title, task.moduleCode, task.dueLabel].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      ),
    );
  }, [normalizedQuery]);

  const filteredModules = useMemo(() => {
    if (!normalizedQuery) {
      return dashboardModules;
    }

    return dashboardModules.filter((module) =>
      [module.code, module.title, module.professor].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      ),
    );
  }, [normalizedQuery]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const isDarkMode = isMounted && resolvedTheme === "dark";

  return (
    <div className="min-h-screen bg-background text-foreground dot-grid-bg">
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
              onChange={(event) => setSearchQuery(event.target.value)}
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

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-8 md:py-10">
        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
              Focused workspace
            </p>
            <div className="space-y-3">
              <h1 className="text-5xl font-black uppercase leading-none md:text-7xl">
                {greetingState.greeting}, {userFirstName}
              </h1>
              <p className="max-w-2xl text-base font-medium text-muted-foreground md:text-lg">
                Surface the most urgent deadlines first, then move straight into
                the work that needs attention.
              </p>
            </div>
          </div>

          <aside className="flex flex-col justify-between gap-4 border-2 border-foreground bg-primary px-5 py-5 text-primary-foreground shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em]">
                Active focus
              </p>
              <h2 className="text-2xl font-black uppercase leading-tight">
                {filteredTasks.length} deadlines across {filteredModules.length}{" "}
                modules
              </h2>
            </div>
            <div className="flex items-center gap-3 border-2 border-primary-foreground bg-background px-4 py-3 text-foreground">
              <Sparkles className="h-5 w-5" />
              <p className="text-sm font-mono uppercase tracking-[0.12em]">
                Review blocks ready for your next study sprint
              </p>
            </div>
          </aside>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-muted-foreground">
                Deadline radar
              </p>
              <h2 className="text-3xl font-black uppercase md:text-4xl">
                Top 5 urgent tasks
              </h2>
            </div>
            <p className="text-sm font-mono uppercase tracking-[0.12em] text-muted-foreground">
              Bars shrink as due dates get closer
            </p>
          </div>

          <div className="grid gap-2.5">
            {filteredTasks.map((task) => (
              <DeadlineCard key={task.id} task={task} />
            ))}
            {filteredTasks.length === 0 ? (
              <div className="border-2 border-dashed border-foreground bg-background px-4 py-5 text-sm font-mono uppercase tracking-[0.14em] text-muted-foreground">
                No tasks match that filter.
              </div>
            ) : null}
          </div>
        </section>

        <section className="space-y-4 pb-8">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-muted-foreground">
                Modules
              </p>
              <h2 className="text-3xl font-black uppercase md:text-4xl">
                Your classes
              </h2>
            </div>
            <button className="border-2 border-foreground bg-background px-4 py-3 text-sm font-mono uppercase tracking-[0.12em] shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5">
              Add New
            </button>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {filteredModules.map((module) => (
              <article
                key={module.code}
                className="group relative flex h-full cursor-pointer flex-col justify-between gap-6 overflow-hidden border-2 border-foreground bg-card p-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
              >
                <div className="pointer-events-none absolute inset-0 z-0 origin-left scale-x-0 bg-zinc-400/45 transition-transform duration-150 ease-out group-hover:scale-x-100" />

                <details className="absolute right-4 top-4 z-20">
                  <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center border-2 border-foreground bg-background shadow-[4px_4px_0_0_rgba(0,0,0,1)] [&::-webkit-details-marker]:hidden">
                    <MoreHorizontal className="h-4 w-4" />
                  </summary>
                  <div className="absolute right-0 mt-3 flex min-w-40 flex-col border-2 border-foreground bg-background shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                    <button className="flex items-center gap-2 border-b-2 border-foreground px-4 py-3 text-left text-sm font-mono uppercase tracking-[0.12em] transition-colors hover:bg-accent">
                      <Settings className="h-4 w-4" />
                      Customize
                    </button>
                    <button className="flex items-center gap-2 px-4 py-3 text-left text-sm font-mono uppercase tracking-[0.12em] transition-colors hover:bg-accent">
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </details>

                <div className="relative z-10 space-y-4 pr-12">
                  <div className="inline-flex items-center gap-2 border border-foreground bg-accent px-3 py-2 text-xs font-bold uppercase tracking-[0.2em]">
                    <BookCopy className="h-4 w-4" />
                    {module.code}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black uppercase leading-tight">
                      {module.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {module.professor}
                    </p>
                  </div>
                </div>

                <div className="relative z-10 grid grid-cols-2 gap-3">
                  <div className="border-2 border-foreground bg-background px-3 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      Notes
                    </p>
                    <p className="mt-2 text-2xl font-black">{module.noteCount}</p>
                  </div>
                  <div className="border-2 border-foreground bg-background px-3 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      Tasks
                    </p>
                    <p className="mt-2 text-2xl font-black">
                      {module.pendingTasks}
                    </p>
                  </div>
                </div>
              </article>
            ))}
            {filteredModules.length === 0 ? (
              <div className="border-2 border-dashed border-foreground bg-background px-4 py-5 text-sm font-mono uppercase tracking-[0.14em] text-muted-foreground lg:col-span-3">
                No modules match that filter.
              </div>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
}

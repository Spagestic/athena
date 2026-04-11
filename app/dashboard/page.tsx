"use client";

import { useQuery } from "convex/react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { api } from "@/convex/_generated/api";
import { DashboardHeader } from "./components/dashboard-header";
import { DashboardOverview } from "./components/dashboard-overview";
import { type DashboardNotification } from "./dashboard-data";
import { DeadlineRadar } from "./components/deadline-radar";
import { ModuleCards } from "./components/module-cards";

type GreetingState = {
  greeting: string;
};

const defaultGreetingState: GreetingState = {
  greeting: "Good day",
};

let cachedGreetingState: GreetingState | null = null;

function getGreetingState(): GreetingState {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return { greeting };
}

function getCachedGreetingState(): GreetingState {
  const nextState = getGreetingState();

  if (cachedGreetingState?.greeting === nextState.greeting) {
    return cachedGreetingState;
  }

  cachedGreetingState = nextState;
  return cachedGreetingState;
}

function subscribeToGreeting() {
  return () => undefined;
}

export default function DashboardPage() {
  const dashboard = useQuery(api.dashboard.getDashboard);
  const greetingState = useSyncExternalStore(
    subscribeToGreeting,
    getCachedGreetingState,
    () => defaultGreetingState,
  );
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const modules = dashboard?.modules;
  const tasks = dashboard?.tasks;
  const notifications = useMemo<DashboardNotification[]>(() => {
    if (!tasks || tasks.length === 0) {
      return [];
    }

    return tasks.slice(0, 2).map((task) => ({
      id: task.id,
      detail: `${task.moduleCode} · ${task.dueLabel}`,
      title: task.title,
    }));
  }, [tasks]);
  const userFirstName =
    dashboard?.user?.name?.trim().split(/\s+/)[0] ||
    (dashboard === null ? "there" : "Learner");

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredTasks = useMemo(() => {
    const sourceTasks = tasks ?? [];
    if (!normalizedQuery) {
      return sourceTasks;
    }

    return sourceTasks.filter((task) =>
      [task.title, task.moduleCode, task.dueLabel].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      ),
    );
  }, [normalizedQuery, tasks]);

  const filteredModules = useMemo(() => {
    const sourceModules = modules ?? [];
    if (!normalizedQuery) {
      return sourceModules;
    }

    return sourceModules.filter((module) =>
      [module.code, module.title, module.subtitle].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      ),
    );
  }, [modules, normalizedQuery]);

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

  return (
    <div className="min-h-screen bg-background text-foreground dot-grid-bg">
      <DashboardHeader
        isScrolled={isScrolled}
        notifications={notifications}
        searchQuery={searchQuery}
        streakCount={dashboard?.streakCount ?? 0}
        user={dashboard?.user ?? null}
        onSearchQueryChange={setSearchQuery}
      />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-8 md:py-10">
        <DashboardOverview
          greeting={greetingState.greeting}
          deadlineCount={filteredTasks.length}
          moduleCount={filteredModules.length}
          userFirstName={userFirstName}
        />

        <DeadlineRadar tasks={filteredTasks} />

        <ModuleCards modules={filteredModules} />
      </main>
    </div>
  );
}

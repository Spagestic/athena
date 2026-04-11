"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { DashboardHeader } from "./components/dashboard-header";
import { DashboardOverview } from "./components/dashboard-overview";
import { DeadlineRadar } from "./components/deadline-radar";
import { ModuleCards } from "./components/module-cards";
import { dashboardModules, deadlineTasks } from "./dashboard-data";

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
  const greetingState = useSyncExternalStore(
    subscribeToGreeting,
    getCachedGreetingState,
    () => defaultGreetingState,
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

  return (
    <div className="min-h-screen bg-background text-foreground dot-grid-bg">
      <DashboardHeader
        isScrolled={isScrolled}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-8 md:py-10">
        <DashboardOverview
          greeting={greetingState.greeting}
          deadlineCount={filteredTasks.length}
          moduleCount={filteredModules.length}
        />

        <DeadlineRadar tasks={filteredTasks} />

        <ModuleCards modules={filteredModules} />
      </main>
    </div>
  );
}

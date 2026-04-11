"use client";

import { useQuery } from "convex/react";
import { use } from "react";

import { api } from "@/convex/_generated/api";
import { ModulePageShell } from "../components/module-page-shell";

type ModulePageProps = {
  params: Promise<{
    moduleCode: string;
  }>;
};

export default function ModulePage({ params }: ModulePageProps) {
  const { moduleCode } = use(params);
  const moduleData = useQuery(api.modules.getModuleWorkspace, {
    moduleCode,
  });

  if (moduleData === undefined) {
    return (
      <div className="min-h-screen bg-background text-foreground dot-grid-bg">
        <main className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-10 md:px-8">
          <div className="border-2 border-foreground bg-card px-6 py-5 text-sm font-mono uppercase tracking-[0.14em] shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            Loading workspace...
          </div>
        </main>
      </div>
    );
  }

  if (moduleData === null) {
    return (
      <div className="min-h-screen bg-background text-foreground dot-grid-bg">
        <main className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-10 md:px-8">
          <div className="border-2 border-foreground bg-card px-6 py-5 text-sm font-mono uppercase tracking-[0.14em] shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            Module not found.
          </div>
        </main>
      </div>
    );
  }

  return <ModulePageShell module={moduleData} />;
}

import { BookCopy, MoreHorizontal, Settings, Trash2 } from "lucide-react";

import { type DashboardModule } from "../dashboard-data";

type ModuleCardsProps = {
  modules: DashboardModule[];
};

export function ModuleCards({ modules }: ModuleCardsProps) {
  return (
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
        {modules.map((module) => (
          <article
            key={module.code}
            className="group relative flex h-full cursor-pointer flex-col justify-between gap-6 overflow-hidden border-2 border-foreground bg-card p-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
          >
            <div className="pointer-events-none absolute inset-0 z-0 origin-left scale-x-0 bg-zinc-400/10 transition-transform duration-150 ease-out group-hover:scale-x-100" />

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
              <div className="inline-flex items-center gap-2 border border-foreground bg-primary text-primary-foreground px-3 py-2 text-xs font-bold uppercase tracking-[0.2em]">
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
        {modules.length === 0 ? (
          <div className="border-2 border-dashed border-foreground bg-background px-4 py-5 text-sm font-mono uppercase tracking-[0.14em] text-muted-foreground lg:col-span-3">
            No modules match that filter.
          </div>
        ) : null}
      </div>
    </section>
  );
}

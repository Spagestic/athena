import { Sparkles } from "lucide-react";

import { userFirstName } from "../dashboard-data";

type DashboardOverviewProps = {
  greeting: string;
  deadlineCount: number;
  moduleCount: number;
};

export function DashboardOverview({
  greeting,
  deadlineCount,
  moduleCount,
}: DashboardOverviewProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
      <div className="space-y-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
          Focused workspace
        </p>
        <div className="space-y-3">
          <h1 className="text-5xl font-black uppercase leading-none md:text-7xl">
            {greeting}, {userFirstName}
          </h1>
          <p className="max-w-2xl text-base font-medium text-muted-foreground md:text-lg">
            Surface the most urgent deadlines first, then move straight into the
            work that needs attention.
          </p>
        </div>
      </div>

      <aside className="flex flex-col justify-between gap-4 border-2 border-foreground bg-primary px-5 py-5 text-primary-foreground shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em]">
            Active focus
          </p>
          <h2 className="text-2xl font-black uppercase leading-tight">
            {deadlineCount} deadlines across {moduleCount} modules
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
  );
}

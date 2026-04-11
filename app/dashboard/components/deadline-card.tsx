import { Clock3 } from "lucide-react";

import { type DeadlineTask, type DeadlineUrgency } from "../dashboard-data";

type DeadlineCardProps = {
  task: DeadlineTask;
};

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

export function DeadlineCard({ task }: DeadlineCardProps) {
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
          Signal {task.signalScore}
        </div>
      </div>

      <div className="mt-2 space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          <span>Priority window</span>
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

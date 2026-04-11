import { DeadlineCard } from "./deadline-card";
import { type DeadlineTask } from "../dashboard-data";

type DeadlineRadarProps = {
  tasks: DeadlineTask[];
};

export function DeadlineRadar({ tasks }: DeadlineRadarProps) {
  return (
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
        {tasks.map((task) => (
          <DeadlineCard key={task.id} task={task} />
        ))}
        {tasks.length === 0 ? (
          <div className="border-2 border-dashed border-foreground bg-background px-4 py-5 text-sm font-mono uppercase tracking-[0.14em] text-muted-foreground">
            No tasks match that filter.
          </div>
        ) : null}
      </div>
    </section>
  );
}

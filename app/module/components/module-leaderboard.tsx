import { Flame } from "lucide-react";

import { type ModuleLeaderboardEntry } from "../module-data";

type ModuleLeaderboardProps = {
  entries: ModuleLeaderboardEntry[];
};

export function ModuleLeaderboard({ entries }: ModuleLeaderboardProps) {
  return (
    <section className="border-2 border-foreground bg-card p-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
      <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
        Leaderboard
      </p>
      <h2 className="mt-1 text-2xl font-black uppercase">Leaderboard</h2>

      <div className="mt-4 border-2 border-foreground bg-background">
        {entries.map((entry, index) => (
          <div
            key={`${entry.name}-${entry.streakCount}`}
            className="grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b-2 border-foreground px-4 py-3 last:border-b-0"
          >
            <span className="text-lg font-black">{index + 1}.</span>
            <span className="text-sm font-bold uppercase tracking-[0.14em]">
              {entry.name}
            </span>
            <span className="flex items-center gap-2 text-sm font-mono uppercase tracking-[0.12em] text-muted-foreground">
              <Flame
                className={`h-4 w-4 ${
                  index === 0 ? "animate-pulse text-orange-500" : "text-orange-400"
                }`}
              />
              {entry.streakCount}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

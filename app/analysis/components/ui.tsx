import { type ReactNode } from "react";
import type { LogEntry } from "./types";

export function StatusDot({ state }: { state: "on" | "off" | "warn" }) {
    const bg = state === "on" ? "bg-chart-4" : state === "warn" ? "bg-chart-5" : "bg-muted-foreground";
    return <span className={`inline-block w-2 h-2 mr-1.5 border border-foreground ${bg}`} />;
}

export function KpiCard({ label, value, sub, colorClass }: {
    label: string; value: string; sub: string; colorClass: string;
}) {
    return (
        <div className="border-2 border-foreground bg-card p-3 shadow-md">
            <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
            <p className={`text-3xl font-bold font-mono tabular-nums leading-none mt-1 ${colorClass}`}>{value}</p>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-1">{sub}</p>
        </div>
    );
}

export function ChartBox({ title, warn, children }: {
    title: string; warn?: string; children: ReactNode;
}) {
    return (
        <div className="border-2 border-foreground bg-card p-4 shadow-md">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground">{title}</h3>
                {warn && <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-destructive animate-pulse">{warn}</span>}
            </div>
            {children}
        </div>
    );
}

export const badgeCls = (t: string) => {
    switch (t) {
        case "good": return "bg-chart-4/20 text-chart-4 border border-chart-4";
        case "warn": return "bg-chart-5/20 text-chart-5 border border-chart-5";
        case "bad": return "bg-destructive/20 text-destructive border border-destructive";
        case "filler": return "bg-chart-5/20 text-chart-5 border border-chart-5";
        default: return "bg-muted text-muted-foreground border border-muted-foreground";
    }
};

export function LogLine({ entry }: { entry: LogEntry }) {
    return (
        <div className="flex gap-2 items-baseline py-1 border-b border-border text-[11px] font-mono">
            <span className="text-primary min-w-[46px] text-[10px]">{entry.ts}</span>
            <span className={`px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest ${badgeCls(entry.type)}`}>
                {entry.type.toUpperCase()}
            </span>
            <span className="uppercase">{entry.text}</span>
        </div>
    );
}

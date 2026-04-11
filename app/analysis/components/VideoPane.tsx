import type { RefObject } from "react";
import {
    LineChart, Line, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    ReferenceLine,
} from "recharts";
import type { ChartPoint, LogEntry, GazePoint, VideoKpis, EnergyComponents } from "./types";
import { C, tooltipStyle } from "./constants";
import { clamp } from "./helpers";
import { KpiCard, ChartBox, LogLine } from "./ui";

interface VideoPaneProps {
    eyeData: ChartPoint[];
    exprData: ChartPoint[];
    headData: ChartPoint[];
    yawnData: ChartPoint[];
    energyData: ChartPoint[];
    videoLog: LogEntry[];
    videoKpis: VideoKpis;
    energyComponents: EnergyComponents;
    vidRef: RefObject<HTMLVideoElement | null>;
    overlayRef: RefObject<HTMLCanvasElement | null>;
    vidWrapRef: RefObject<HTMLDivElement | null>;
    fpsBadgeRef: RefObject<HTMLSpanElement | null>;
    vLogRef: RefObject<HTMLDivElement | null>;
    gazePos: GazePoint | null;
}

function EnergyGauge({ energyData, energyComponents }: {
    energyData: ChartPoint[];
    energyComponents: EnergyComponents;
}) {
    const { energy, eye, expr, alertness, headStability } = energyComponents;
    const scoreColor = energy > 70 ? "#16a34a" : energy > 40 ? "var(--primary)" : "#dc2626";
    const scoreLabel = energy > 70 ? "HIGH ENERGY" : energy > 40 ? "MODERATE" : "LOW ENERGY";

    const bars = [
        { label: "EYE CONTACT", value: eye },
        { label: "EXPRESSION", value: expr },
        { label: "ALERTNESS", value: alertness },
        { label: "HEAD POSTURE", value: headStability },
    ];

    return (
        <div className="border-2 border-foreground bg-card shadow-md flex flex-col overflow-hidden" style={{ minHeight: "340px" }}>
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <h3 className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                    ⚡ ENERGY SCORE
                </h3>
                <span
                    className="text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 border-2 animate-pulse"
                    style={{ color: scoreColor, borderColor: scoreColor }}
                >
                    {scoreLabel}
                </span>
            </div>

            <div className="px-4 pb-2">
                {/* Big live number */}
                <div className="flex items-baseline gap-2 mb-2">
                    <span
                        className="font-bold font-mono tabular-nums leading-none transition-all duration-500"
                        style={{ fontSize: "5rem", color: scoreColor }}
                    >
                        {energy}
                    </span>
                    <span className="text-2xl font-mono text-muted-foreground">/100</span>
                </div>

                {/* Master fill bar */}
                <div className="h-4 bg-muted border-2 border-foreground mb-4">
                    <div
                        className="h-full transition-all duration-700 ease-out"
                        style={{ width: `${energy}%`, backgroundColor: scoreColor }}
                    />
                </div>

                {/* Sub-metric bars */}
                <div className="space-y-2">
                    {bars.map(bar => (
                        <div key={bar.label} className="grid items-center gap-2" style={{ gridTemplateColumns: "6.5rem 1fr 2.5rem" }}>
                            <span className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground truncate">
                                {bar.label}
                            </span>
                            <div className="h-2 bg-muted border border-foreground">
                                <div
                                    className="h-full transition-all duration-500 ease-out"
                                    style={{ width: `${bar.value}%`, backgroundColor: scoreColor, opacity: 0.75 }}
                                />
                            </div>
                            <span className="text-[10px] font-mono font-bold text-right" style={{ color: scoreColor }}>
                                {bar.value}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Trend area chart — fills remaining height */}
            <div className="flex-1 px-1 pb-1" style={{ minHeight: "80px" }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={energyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={scoreColor} stopOpacity={0.4} />
                                <stop offset="95%" stopColor={scoreColor} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={C.border} opacity={0.3} />
                        <XAxis dataKey="label" tick={{ fontSize: 8, fontFamily: "var(--font-mono)" }} interval="preserveStartEnd" />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 8, fontFamily: "var(--font-mono)" }} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Area
                            type="monotone"
                            dataKey="value"
                            name="ENERGY"
                            stroke={scoreColor}
                            fill="url(#energyGrad)"
                            strokeWidth={2.5}
                            dot={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export function VideoPane({
    eyeData, exprData, headData, yawnData, energyData, videoLog,
    videoKpis, energyComponents, vidRef, overlayRef, vidWrapRef, fpsBadgeRef, vLogRef, gazePos,
}: VideoPaneProps) {
    return (
        <div className="p-6 space-y-5">
            {/* KPI Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <KpiCard label="Eye Contact" value={videoKpis.eye} sub={videoKpis.eyeSub} colorClass={videoKpis.eyeColor} />
                <KpiCard label="Head Stability" value={videoKpis.stab} sub={videoKpis.stabSub} colorClass={videoKpis.stabColor} />
                <KpiCard label="Expressiveness" value={videoKpis.expr} sub={videoKpis.exprSub} colorClass="text-chart-3" />
                <KpiCard label="Yawn Alert" value={videoKpis.yawn} sub={videoKpis.yawnSub} colorClass={videoKpis.yawnColor} />
                <KpiCard label="Energy Score" value={videoKpis.energy} sub={videoKpis.energySub} colorClass={videoKpis.energyColor} />
            </div>

            {/* Main row: Video + Energy Score Gauge */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div ref={vidWrapRef} className="relative border-2 border-foreground bg-foreground overflow-hidden aspect-video shadow-md">
                    <video ref={vidRef} autoPlay muted playsInline className="w-full h-full object-cover absolute inset-0 scale-x-[-1]" />
                    <canvas ref={overlayRef} className="w-full h-full absolute inset-0 pointer-events-none scale-x-[-1]" />
                    <span ref={fpsBadgeRef} className="absolute top-2 right-2 z-10 bg-foreground text-background text-[10px] font-mono font-bold px-2 py-1 tracking-widest">&mdash; FPS</span>
                    {gazePos && (
                        <div
                            className="absolute z-20 w-5 h-5 pointer-events-none border-2 border-primary bg-primary/40"
                            style={{ left: clamp(gazePos.x, 0, 100) + "%", top: clamp(gazePos.y, 0, 100) + "%", transform: "translate(-50%,-50%)" }}
                        />
                    )}
                </div>
                <EnergyGauge energyData={energyData} energyComponents={energyComponents} />
            </div>

            {/* Secondary charts 2×2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ChartBox title="Facial Expression Over Time (%)">
                    <ResponsiveContainer width="100%" height={210}>
                        <LineChart data={exprData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                            <XAxis dataKey="label" tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }} interval="preserveStartEnd" />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Legend wrapperStyle={{ fontSize: 10, fontFamily: "var(--font-mono)" }} />
                            <Line type="monotone" dataKey="expr" name="EXPRESSIVENESS" stroke={C.chart5} dot={false} strokeWidth={2} />
                            <Line type="monotone" dataKey="brow" name="BROW TENSION" stroke={C.chart2} dot={false} strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartBox>

                <ChartBox title="Head Pose (Yaw &amp; Pitch)">
                    <ResponsiveContainer width="100%" height={210}>
                        <LineChart data={headData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                            <XAxis dataKey="label" tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }} interval="preserveStartEnd" />
                            <YAxis domain={[-30, 30]} tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Legend wrapperStyle={{ fontSize: 10, fontFamily: "var(--font-mono)" }} />
                            <ReferenceLine y={0} stroke={C.border} />
                            <Line type="monotone" dataKey="yaw" name="YAW" stroke={C.chart3} dot={false} strokeWidth={2} />
                            <Line type="monotone" dataKey="pitch" name="PITCH" stroke={C.chart1} dot={false} strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartBox>

                <ChartBox title="Eye Contact — 4-Second Rolling Average (%)">
                    <ResponsiveContainer width="100%" height={210}>
                        <AreaChart data={eyeData}>
                            <defs>
                                <linearGradient id="eyeGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={C.chart4} stopOpacity={0.35} />
                                    <stop offset="95%" stopColor={C.chart4} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                            <XAxis dataKey="label" tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }} interval="preserveStartEnd" />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Legend wrapperStyle={{ fontSize: 10, fontFamily: "var(--font-mono)" }} />
                            <Area type="monotone" dataKey="value" name="EYE CONTACT %" stroke={C.chart4} fill="url(#eyeGrad)" strokeWidth={2} dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartBox>

                <ChartBox title="Yawn Detection — Mouth Opening (%)">
                    <ResponsiveContainer width="100%" height={210}>
                        <AreaChart data={yawnData}>
                            <defs>
                                <linearGradient id="yawnGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={C.chart5} stopOpacity={0.35} />
                                    <stop offset="95%" stopColor={C.chart5} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                            <XAxis dataKey="label" tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }} interval="preserveStartEnd" />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Legend wrapperStyle={{ fontSize: 10, fontFamily: "var(--font-mono)" }} />
                            <Area type="monotone" dataKey="value" name="YAWN %" stroke={C.chart5} fill="url(#yawnGrad)" strokeWidth={2} dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartBox>
            </div>

            {/* Video Events Log */}
            <div ref={vLogRef} className="border-2 border-foreground bg-card p-4 max-h-[280px] overflow-y-auto shadow-md">
                <h3 className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-2">VIDEO EVENTS TIMELINE</h3>
                {videoLog.length === 0 && <p className="text-muted-foreground text-[10px] font-mono uppercase">No events yet.</p>}
                {videoLog.map((entry, i) => <LogLine key={i} entry={entry} />)}
            </div>
        </div>
    );
}

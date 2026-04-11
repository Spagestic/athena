import type { RefObject } from "react";
import {
    LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import type { ChartPoint, LogEntry, AudioKpis } from "./types";
import { C, tooltipStyle } from "./constants";
import { KpiCard, ChartBox, LogLine } from "./ui";

interface AudioPaneProps {
    wpmData: ChartPoint[];
    volData: ChartPoint[];
    pitchData: ChartPoint[];
    fillerData: ChartPoint[];
    audioLog: LogEntry[];
    fillerLog: LogEntry[];
    audioKpis: AudioKpis;
    aLogRef: RefObject<HTMLDivElement | null>;
    fLogRef: RefObject<HTMLDivElement | null>;
}

export function AudioPane({
    wpmData, volData, pitchData, fillerData, audioLog, fillerLog,
    audioKpis, aLogRef, fLogRef,
}: AudioPaneProps) {
    return (
        <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                <KpiCard label="Words Spoken" value={String(audioKpis.words)} sub={audioKpis.wordsSub} colorClass="text-accent" />
                <KpiCard label="Filler Words" value={String(audioKpis.fillers)} sub={audioKpis.fillersSub} colorClass="text-destructive" />
                <KpiCard label="Volume" value={audioKpis.volume} sub={audioKpis.volumeSub} colorClass="text-accent" />
                <KpiCard label="Pitch" value={audioKpis.pitch} sub={audioKpis.pitchSub} colorClass="text-secondary" />
                <KpiCard label="Monotone" value={audioKpis.mono ? "LOW" : "OK"} sub={audioKpis.mono ? "TRY VARYING PITCH" : "GOOD VARIATION"} colorClass={audioKpis.mono ? "text-destructive" : "text-chart-4"} />
                <KpiCard label="Turns" value={String(audioKpis.turns)} sub={audioKpis.turnsSub} colorClass="text-accent" />
                <KpiCard label="Stutters" value={String(audioKpis.stutters)} sub="REPEATED WORDS" colorClass="text-chart-5" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* WPM Chart */}
                <ChartBox title="Speaking Speed (WPM per Turn)">
                    <ResponsiveContainer width="100%" height={210}>
                        <LineChart data={wpmData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                            <XAxis dataKey="label" tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }} />
                            <YAxis domain={[0, 300]} tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Legend wrapperStyle={{ fontSize: 10, fontFamily: "var(--font-mono)" }} />
                            <Line type="monotone" dataKey="value" name="YOUR WPM" stroke={C.chart3} dot={false} strokeWidth={2} />
                            <Line type="monotone" dataKey="ideal130" name="MIN 130" stroke={C.chart4} dot={false} strokeDasharray="6 4" strokeWidth={1} />
                            <Line type="monotone" dataKey="ideal170" name="MAX 170" stroke={C.chart4} dot={false} strokeDasharray="6 4" strokeWidth={1} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartBox>
                {/* Volume Chart */}
                <ChartBox title="Volume Level (dB per Frame)">
                    <ResponsiveContainer width="100%" height={210}>
                        <LineChart data={volData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                            <XAxis dataKey="label" tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }} interval="preserveStartEnd" />
                            <YAxis domain={[-60, 0]} tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Legend wrapperStyle={{ fontSize: 10, fontFamily: "var(--font-mono)" }} />
                            <Line type="monotone" dataKey="value" name="VOLUME dB" stroke={C.chart3} dot={false} strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartBox>
                {/* Pitch Chart */}
                <ChartBox title="Pitch (Hz per Frame)" warn={audioKpis.mono ? "MONOTONE DETECTED!" : undefined}>
                    <ResponsiveContainer width="100%" height={210}>
                        <LineChart data={pitchData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                            <XAxis dataKey="label" tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }} interval="preserveStartEnd" />
                            <YAxis domain={[0, 350]} tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Legend wrapperStyle={{ fontSize: 10, fontFamily: "var(--font-mono)" }} />
                            <Line type="monotone" dataKey="hz" name="PITCH Hz" stroke={C.chart5} dot={false} strokeWidth={2} />
                            <Line type="monotone" dataKey="std" name="VARIATION" stroke={C.chart1} dot={false} strokeWidth={1} strokeDasharray="4 2" />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartBox>
                {/* Filler Chart */}
                <ChartBox title="Cumulative Fillers">
                    <ResponsiveContainer width="100%" height={210}>
                        <BarChart data={fillerData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                            <XAxis dataKey="label" tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }} />
                            <YAxis domain={[0, 10]} tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Legend wrapperStyle={{ fontSize: 10, fontFamily: "var(--font-mono)" }} />
                            <Bar dataKey="inTurn" name="IN TURN" fill={C.primary} stroke={C.chart1} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartBox>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Turn Log */}
                <div ref={aLogRef} className="border-2 border-foreground bg-card p-4 max-h-[280px] overflow-y-auto shadow-md">
                    <h3 className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-2">TURN-BY-TURN LOG</h3>
                    {audioLog.length === 0 && <p className="text-muted-foreground text-[10px] font-mono uppercase">No turns yet.</p>}
                    {audioLog.map((entry, i) => <LogLine key={i} entry={entry} />)}
                </div>
                {/* Filler Log */}
                <div ref={fLogRef} className="border-2 border-foreground bg-card p-4 max-h-[280px] overflow-y-auto shadow-md">
                    <h3 className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-2">FILLER WORD BREAKDOWN</h3>
                    {fillerLog.length === 0 && <p className="text-muted-foreground text-[10px] font-mono uppercase">No filler words detected.</p>}
                    {fillerLog.map((entry, i) => <LogLine key={i} entry={entry} />)}
                </div>
            </div>
        </div>
    );
}
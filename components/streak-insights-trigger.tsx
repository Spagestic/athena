"use client";

import { Flame } from "lucide-react";
import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type InsightDetail = {
  label: string;
  minutes: number;
};

type StudyBreakdownItem = {
  kind: "note" | "task";
  moduleCode: "COMP1021" | "MATH1014";
  title: string;
  minutes: number;
};

type InsightPoint = {
  axisLabel: string;
  dayLabel: string;
  fullLabel: string;
  qualityTime: number;
  intensity: "peak" | "steady" | "drift";
  details: InsightDetail[];
  breakdown: StudyBreakdownItem[];
  driftReason: string;
  recommendation: string;
};

type StreakInsightsTriggerProps = {
  streakCount: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;

const chartConfig = {
  qualityTime: {
    label: "Quality Time",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const focusBlocks = [
  "Lecture notes",
  "Practice quiz",
  "Flash review",
  "Problem set",
  "Slides recap",
  "Concept cleanup",
];

const driftReasons = [
  "Long meetings fragmented your focus blocks.",
  "You switched contexts too often before a deep session started.",
  "A late study start cut your sustained review window short.",
  "Admin tasks ate into the time you planned for revision.",
];

const recommendations = [
  "Start with a 25 minute note warm-up before opening harder tasks.",
  "Block a single topic first, then stack quiz practice after momentum builds.",
  "Protect one distraction-free hour earlier in the day.",
  "Pair review notes with one retrieval round to lock in recall.",
];

const moduleBreakdownTemplates: StudyBreakdownItem[] = [
  {
    kind: "note",
    moduleCode: "COMP1021",
    title: "Recursion lecture notes",
    minutes: 0,
  },
  {
    kind: "task",
    moduleCode: "COMP1021",
    title: "Lab checkpoint review",
    minutes: 0,
  },
  {
    kind: "note",
    moduleCode: "MATH1014",
    title: "Integration techniques summary",
    minutes: 0,
  },
  {
    kind: "task",
    moduleCode: "MATH1014",
    title: "Problem set corrections",
    minutes: 0,
  },
];

function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

function buildBreakdown(baseMinutes: number, seed: number) {
  const templatePool = [
    moduleBreakdownTemplates[seed % moduleBreakdownTemplates.length],
    moduleBreakdownTemplates[(seed + 1) % moduleBreakdownTemplates.length],
    moduleBreakdownTemplates[(seed + 2) % moduleBreakdownTemplates.length],
  ];
  const weights = [0.42, 0.33, 0.25];

  return templatePool.map((item, index) => ({
    ...item,
    minutes: Math.max(18, Math.round(baseMinutes * weights[index])),
  }));
}

function buildInsights(days: number, streakCount: number) {
  const today = new Date();

  return Array.from({ length: days }, (_, index) => {
    const daysAgo = days - index - 1;
    const date = new Date(today.getTime() - daysAgo * DAY_MS);
    const wave = Math.sin((index + streakCount) * 0.82);
    const rebound = Math.cos((index + streakCount) * 0.37);
    const boost = (index + streakCount) % 5 === 2 ? 1.2 : 0;
    const dip = (index + streakCount) % 7 === 0 ? 2.2 : 0;
    const qualityTime = Number(
      Math.max(0.7, 2.6 + wave * 1.1 + rebound * 0.7 + boost - dip).toFixed(1),
    );

    const intensity =
      qualityTime >= 4.5 ? "peak" : qualityTime <= 1.5 ? "drift" : "steady";
    const detailCount = intensity === "peak" ? 3 : intensity === "steady" ? 2 : 1;
    const detailSeed = index + streakCount;
    const baseMinutes = Math.round(qualityTime * 60);
    const detailWeights =
      detailCount === 3 ? [0.42, 0.33, 0.25] : detailCount === 2 ? [0.56, 0.44] : [1];
    const details = detailWeights.map((weight, detailIndex) => ({
      label: focusBlocks[(detailSeed + detailIndex) % focusBlocks.length],
      minutes: Math.max(20, Math.round(baseMinutes * weight)),
    }));
    const breakdown = buildBreakdown(baseMinutes, detailSeed);

    const dateLabel =
      days === 7
        ? date.toLocaleDateString("en-US", { weekday: "short" })
        : date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const axisLabel =
      days === 30 && index !== days - 1 && index % 5 !== 0 ? "" : dateLabel;

    return {
      axisLabel,
      breakdown,
      dayLabel: dateLabel,
      details,
      driftReason: driftReasons[detailSeed % driftReasons.length],
      fullLabel: date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      }),
      intensity,
      qualityTime,
      recommendation: recommendations[detailSeed % recommendations.length],
    } satisfies InsightPoint;
  });
}

function renderFlameDot({
  cx,
  cy,
  payload,
}: {
  cx?: number;
  cy?: number;
  payload?: InsightPoint;
}) {
  if (cx === undefined || cy === undefined || !payload) {
    return null;
  }

  const flame = payload.intensity === "peak" ? "🔥" : payload.intensity === "drift" ? "🔥" : "";
  if (!flame) {
    return null;
  }

  return (
    <text
      x={cx}
      y={cy - 12}
      textAnchor="middle"
      fontSize="16"
      opacity={payload.intensity === "drift" ? 0.45 : 1}
    >
      {flame}
    </text>
  );
}

export function StreakInsightsTrigger({
  streakCount,
}: StreakInsightsTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDayLabel, setSelectedDayLabel] = useState<string | null>(null);
  const activeSeries = useMemo(() => buildInsights(7, streakCount), [streakCount]);
  const averageQuality = useMemo(
    () =>
      Number(
        (
          activeSeries.reduce((total, point) => total + point.qualityTime, 0) /
          activeSeries.length
        ).toFixed(1),
      ),
    [activeSeries],
  );
  const selectedPoint = useMemo(
    () =>
      selectedDayLabel
        ? activeSeries.find((point) => point.fullLabel === selectedDayLabel) ?? null
        : null,
    [activeSeries, selectedDayLabel],
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="streak-orbit relative flex h-14 items-center gap-2 border-2 border-orange-500 bg-background px-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5"
        aria-label="Open streak insights"
      >
        <Flame className="h-5 w-5 text-orange-500" />
        <div className="text-left">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Streak
          </p>
          <p className="text-lg font-black leading-none">{streakCount}</p>
        </div>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-5xl overflow-y-auto border-2 border-foreground bg-background p-0 shadow-[8px_8px_0_0_rgba(0,0,0,1)] sm:w-[calc(100vw-3rem)] sm:max-w-5xl">
          <DialogHeader className="gap-4 border-b-2 border-foreground px-6 py-5">
            <div className="space-y-2">
              <DialogTitle className="text-3xl font-black uppercase tracking-[0.12em]">
                Streak momentum
              </DialogTitle>
              <DialogDescription className="max-w-2xl font-mono uppercase tracking-[0.08em] text-muted-foreground">
                Quality time trends, focus spikes, and drift cues around your last 7 study windows.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="space-y-5 px-6 py-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="border-2 border-foreground bg-primary px-5 py-4 text-primary-foreground shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em]">
                  Time window
                </p>
                <p className="mt-2 text-2xl font-black uppercase">Last 7 Days</p>
              </div>

              <div className="border-2 border-foreground bg-card px-5 py-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
                  Average quality
                </p>
                <p className="mt-2 text-2xl font-black">{averageQuality}h</p>
              </div>

              <div className="border-2 border-foreground bg-card px-5 py-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
                  Breakdown
                </p>
                <p className="mt-2 text-sm font-mono uppercase tracking-[0.12em]">
                  Select a day to reveal notes, tasks, and cue details below
                </p>
              </div>
            </div>

            <section className="border-2 border-foreground bg-card shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
              <div className="border-b-2 border-foreground px-5 py-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
                  Quality time
                </p>
                <h3 className="text-2xl font-black uppercase">Last 7 days</h3>
              </div>

              <div className="bg-background px-3 py-3">
                <ChartContainer
                  config={chartConfig}
                  className="aspect-auto h-72 w-full [&_.recharts-cartesian-grid_line]:stroke-foreground/15 [&_.recharts-layer]:font-mono [&_.recharts-text]:text-[10px]"
                >
                  <AreaChart
                    accessibilityLayer
                    data={activeSeries}
                    margin={{ left: 12, right: 12, top: 18 }}
                  >
                    <defs>
                      <linearGradient id="streak-quality-fill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-qualityTime)" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="var(--color-qualityTime)" stopOpacity={0.06} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      width={48}
                      label={{
                        angle: -90,
                        position: "insideLeft",
                        style: { fill: "currentColor", fontSize: 11, textTransform: "uppercase" },
                        value: "Quality Time",
                      }}
                    />
                    <XAxis
                      dataKey="axisLabel"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          indicator="line"
                          className="rounded-none border-2 border-foreground bg-background px-3 py-2 shadow-[4px_4px_0_0_rgba(0,0,0,1)] ring-0"
                          labelFormatter={(_, payload) => {
                            const point = payload?.[0]?.payload as InsightPoint | undefined;
                            if (!point) {
                              return "Momentum snapshot";
                            }

                            return (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 font-mono uppercase tracking-[0.12em] text-foreground">
                                  <Flame
                                    className={`h-4 w-4 ${
                                      point.intensity === "drift"
                                        ? "text-zinc-400"
                                        : "text-orange-500"
                                    }`}
                                  />
                                  <span>{point.fullLabel}</span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Quality time snapshot. Select this day below to inspect notes, tasks, and drift cues.
                                </p>
                              </div>
                            );
                          }}
                          formatter={(value) => (
                            <div className="flex w-full items-center justify-between gap-4 font-mono uppercase tracking-[0.12em]">
                              <span>Quality time</span>
                              <span className="font-black text-foreground">
                                {typeof value === "number" ? `${value.toFixed(1)}h` : String(value)}
                              </span>
                            </div>
                          )}
                        />
                      }
                    />
                    <Area
                      dataKey="qualityTime"
                      type="monotone"
                      stroke="var(--color-qualityTime)"
                      strokeWidth={3}
                      fill="url(#streak-quality-fill)"
                      dot={renderFlameDot}
                      activeDot={{
                        fill: "var(--color-qualityTime)",
                        r: 5,
                        stroke: "var(--background)",
                        strokeWidth: 2,
                      }}
                    />
                  </AreaChart>
                </ChartContainer>
              </div>

              <div className="border-t-2 border-foreground bg-card px-4 py-4">
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-7">
                  {activeSeries.map((point) => (
                    <button
                      key={point.fullLabel}
                      type="button"
                      onClick={() => setSelectedDayLabel(point.fullLabel)}
                      className={`border-2 px-3 py-2 text-left shadow-[3px_3px_0_0_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5 ${
                        selectedPoint?.fullLabel === point.fullLabel
                          ? "border-orange-500 bg-orange-500/10"
                          : "border-foreground bg-background"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-sm ${
                            point.intensity === "drift" ? "opacity-45" : ""
                          }`}
                        >
                          {point.intensity === "peak" || point.intensity === "drift"
                            ? "🔥"
                            : "•"}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                          {point.dayLabel}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-black uppercase">
                        {point.qualityTime.toFixed(1)}h
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {selectedPoint ? (
              <section className="space-y-4 border-2 border-foreground bg-card px-5 py-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xl ${
                        selectedPoint.intensity === "drift" ? "opacity-45" : ""
                      }`}
                    >
                      🔥
                    </span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
                        Selected day
                      </p>
                      <p className="text-lg font-black uppercase">
                        {selectedPoint.dayLabel}
                      </p>
                    </div>
                  </div>

                  <div className="border-2 border-foreground bg-background px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      Quality time
                    </p>
                    <p className="mt-1 text-2xl font-black">
                      {selectedPoint.qualityTime.toFixed(1)}h
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {selectedPoint.breakdown.map((item) => (
                    <div
                      key={`${selectedPoint.fullLabel}-${item.moduleCode}-${item.title}`}
                      className="border-2 border-foreground bg-background px-4 py-3 shadow-[3px_3px_0_0_rgba(0,0,0,1)]"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                            {item.moduleCode} / {item.kind}
                          </p>
                          <p className="text-sm font-black uppercase leading-tight">
                            {item.title}
                          </p>
                        </div>
                        <p className="text-sm font-mono uppercase tracking-[0.12em]">
                          {formatMinutes(item.minutes)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="border-2 border-foreground bg-background px-4 py-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
                      Cue
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {selectedPoint.intensity === "drift"
                        ? selectedPoint.driftReason
                        : `You stayed on track across ${selectedPoint.details
                            .map((detail) => detail.label)
                            .join(", ")}.`}
                    </p>
                  </div>

                  <div className="border-2 border-foreground bg-background px-4 py-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
                      Recommendation
                    </p>
                    <p className="mt-2 text-sm font-medium">
                      {selectedPoint.recommendation}
                    </p>
                  </div>
                </div>
              </section>
            ) : (
              <section className="border-2 border-dashed border-foreground bg-card px-5 py-6 text-center shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
                  Day breakdown
                </p>
                <p className="mt-3 text-lg font-black uppercase">
                  Select a day
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Pick one of the 7 days under the chart to reveal the notes, tasks, and cue details here.
                </p>
              </section>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

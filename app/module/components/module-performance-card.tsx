import { TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

import { type ModulePerformancePoint } from "../module-data";

type ModulePerformanceCardProps = {
  performance: ModulePerformancePoint[];
};

type TimeRange = "7d" | "30d" | "3m" | "6m";

const chartConfig = {
  user: {
    label: "Your performance",
    color: "var(--chart-1)",
  },
  aggregate: {
    label: "Agg. anon perf.",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function ModulePerformanceCard({
  performance,
}: ModulePerformanceCardProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  const filteredPerformance = useMemo(() => {
    const maxDaysAgo =
      timeRange === "7d"
        ? 7
        : timeRange === "30d"
          ? 30
          : timeRange === "3m"
            ? 90
            : 180;

    return performance.filter((point) => point.daysAgo <= maxDaysAgo);
  }, [performance, timeRange]);

  const trendDelta = useMemo(() => {
    if (filteredPerformance.length < 2) {
      return 0;
    }

    const firstPoint = filteredPerformance[0];
    const lastPoint = filteredPerformance[filteredPerformance.length - 1];

    return Math.round(((lastPoint.user - firstPoint.user) / firstPoint.user) * 100);
  }, [filteredPerformance]);

  return (
    <Card className="gap-0 rounded-none border-2 border-foreground bg-card py-0 shadow-[4px_4px_0_0_rgba(0,0,0,1)] ring-0">
      <CardHeader className="gap-2 rounded-none border-b-2 border-foreground px-5 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle className="text-[11px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
              Performance graph
            </CardTitle>
            <CardDescription className="text-2xl font-black uppercase text-foreground">
              Module momentum
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              ["7d", "Last 7 Days"],
              ["30d", "Last 30 Days"],
              ["3m", "Last 3 Months"],
              ["6m", "Last 6 Months"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setTimeRange(value as TimeRange)}
                className={`border-2 border-foreground px-3 py-2 text-xs font-mono uppercase tracking-[0.12em] shadow-[3px_3px_0_0_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5 ${
                  timeRange === value ? "bg-foreground text-background" : "bg-background"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <div className="border-b-2 border-foreground bg-background px-3 py-3">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-72 w-full [&_.recharts-cartesian-grid_line]:stroke-foreground/15 [&_.recharts-curve]:stroke-[3px] [&_.recharts-layer]:font-mono [&_.recharts-text]:text-[10px]"
          >
            <LineChart
              accessibilityLayer
              data={filteredPerformance}
              margin={{
                left: 12,
                right: 12,
                top: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={36}
              />
              <XAxis
                dataKey="label"
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
                    labelFormatter={(_, payload) =>
                      payload?.[0]?.payload?.fullLabel ?? "Performance snapshot"
                    }
                    formatter={(value, name) => (
                      <div className="flex w-full items-center justify-between gap-4 font-mono uppercase tracking-[0.12em]">
                        <span>{name === "user" ? "Your performance" : "Agg. anon perf."}</span>
                        <span className="font-black text-foreground">
                          {String(value)}
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <Line
                dataKey="aggregate"
                type="monotone"
                stroke="var(--color-aggregate)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="user"
                type="monotone"
                stroke="var(--color-user)"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </div>
      </CardContent>
      <CardFooter className="rounded-none border-t-0 bg-card px-5 py-4">
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-1">
            <div className="flex items-center gap-2 font-medium uppercase">
              Trending up by {trendDelta}% <TrendingUp className="h-4 w-4" />
            </div>
            <div className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Comparing your selected time window against the anonymous class average
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

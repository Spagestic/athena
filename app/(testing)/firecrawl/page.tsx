"use client";

import { useMemo, useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

type FirecrawlMode = "scrape" | "search" | "map" | "crawl";

const defaultPayloads: Record<FirecrawlMode, string> = {
  scrape: JSON.stringify(
    {
      url: "https://firecrawl.dev",
      formats: ["markdown", "links"],
      onlyMainContent: true,
    },
    null,
    2,
  ),
  search: JSON.stringify(
    {
      query: "Convex Firecrawl",
      limit: 5,
      sources: ["web"],
    },
    null,
    2,
  ),
  map: JSON.stringify(
    {
      url: "https://firecrawl.dev",
      limit: 10,
    },
    null,
    2,
  ),
  crawl: JSON.stringify(
    {
      url: "https://firecrawl.dev",
      limit: 5,
      crawlEntireDomain: false,
      scrapeOptions: {
        formats: ["markdown"],
        onlyMainContent: true,
      },
    },
    null,
    2,
  ),
};

export default function Page() {
  const scrape = useAction(api.firecrawl.scrapeAction as never);
  const search = useAction(api.firecrawl.searchAction as never);
  const map = useAction(api.firecrawl.mapAction as never);
  const crawl = useAction(api.firecrawl.crawlAction as never);

  const [mode, setMode] = useState<FirecrawlMode>("scrape");
  const [payload, setPayload] = useState(defaultPayloads.scrape);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<string>("");

  const helperText = useMemo(() => {
    switch (mode) {
      case "scrape":
        return "Tests convex/firecrawl/scrape.ts with a URL and scrape options.";
      case "search":
        return "Tests convex/firecrawl/search.ts with query-based discovery.";
      case "map":
        return "Tests convex/firecrawl/map.ts to discover URLs on a site.";
      case "crawl":
        return "Tests convex/firecrawl/crawl.ts for multi-page crawling.";
    }
  }, [mode]);

  const payloadPreview = useMemo(() => {
    try {
      return JSON.stringify(JSON.parse(payload), null, 2);
    } catch {
      return payload;
    }
  }, [payload]);

  function handleModeChange(nextMode: FirecrawlMode) {
    setMode(nextMode);
    setPayload(defaultPayloads[nextMode]);
    setError("");
    setResult("");
  }

  async function handleRun() {
    setLoading(true);
    setError("");
    setResult("");

    try {
      const parsed = JSON.parse(payload) as Record<string, unknown>;

      const response =
        mode === "scrape"
          ? await scrape(parsed as never)
          : mode === "search"
            ? await search(parsed as never)
            : mode === "map"
              ? await map(parsed as never)
              : await crawl(parsed as never);

      setResult(JSON.stringify(response, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Firecrawl request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">
          Firecrawl test page
        </h1>
        <p className="text-sm text-muted-foreground">
          Use this page to exercise the Convex Firecrawl actions directly from
          the app.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="mode">
              Action
            </label>
            <select
              id="mode"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring"
              value={mode}
              onChange={(event) =>
                handleModeChange(event.target.value as FirecrawlMode)
              }
            >
              <option value="scrape">Scrape</option>
              <option value="search">Search</option>
              <option value="map">Map</option>
              <option value="crawl">Crawl</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="payload">
              JSON payload
            </label>
            <textarea
              id="payload"
              className="min-h-80 w-full rounded-md border bg-background px-3 py-2 font-mono text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring"
              value={payload}
              onChange={(event) => setPayload(event.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleRun}
              disabled={loading}
              type="button"
            >
              {loading ? "Running…" : `Run ${mode}`}
            </button>
            <button
              className="inline-flex items-center justify-center rounded-md border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
              onClick={() => setPayload(defaultPayloads[mode])}
              disabled={loading}
              type="button"
            >
              Reset payload
            </button>
          </div>

          <p className="text-sm text-muted-foreground">{helperText}</p>

          {error ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </div>

        <div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold">Request preview</h2>
            <p className="text-sm text-muted-foreground">
              The parsed payload that will be passed to the Convex action.
            </p>
          </div>
          <pre className="overflow-auto rounded-md bg-muted p-4 text-xs leading-6">
            {payloadPreview}
          </pre>

          <div>
            <h2 className="text-lg font-semibold">Response</h2>
            <p className="text-sm text-muted-foreground">
              Raw JSON returned by the selected Firecrawl action.
            </p>
          </div>
          <pre className="min-h-52 overflow-auto rounded-md bg-muted p-4 text-xs leading-6">
            {result || "Run a request to see the response here."}
          </pre>
        </div>
      </section>
    </main>
  );
}

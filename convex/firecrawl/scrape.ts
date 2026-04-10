import { action } from "../_generated/server";
import { v } from "convex/values";

const FIRECRAWL_BASE_URL = "https://api.firecrawl.dev/v2";

type FirecrawlScrapeResult = {
  success: boolean;
  data?: {
    markdown?: string;
    summary?: string | null;
    html?: string | null;
    rawHtml?: string | null;
    screenshot?: string | null;
    audio?: string | null;
    links?: string[];
    json?: Record<string, unknown> | null;
    images?: Array<Record<string, unknown>>;
    branding?: Record<string, unknown> | null;
    actions?: Record<string, unknown> | null;
    metadata?: Record<string, unknown>;
    warning?: string | null;
  };
  warning?: string | null;
  id?: string;
  creditsUsed?: number;
  [key: string]: unknown;
};

type FirecrawlInteractResult = {
  success: boolean;
  liveViewUrl?: string;
  interactiveLiveViewUrl?: string;
  output?: string;
  stdout?: string | null;
  result?: string | null;
  stderr?: string | null;
  exitCode?: number | null;
  killed?: boolean;
  error?: string | null;
  [key: string]: unknown;
};

function getApiKey(): string {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    throw new Error("Missing FIRECRAWL_API_KEY");
  }
  return apiKey;
}

async function readJson(response: Response) {
  const text = await response.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}

const formatValidator = v.union(
  v.literal("markdown"),
  v.literal("summary"),
  v.literal("html"),
  v.literal("rawHtml"),
  v.literal("screenshot"),
  v.literal("links"),
  v.literal("json"),
  v.literal("images"),
  v.literal("branding"),
  v.literal("audio"),
);

const jsonFormatValidator = v.object({
  type: v.literal("json"),
  schema: v.optional(v.any()),
  prompt: v.optional(v.string()),
});

const screenshotFormatValidator = v.object({
  type: v.literal("screenshot"),
  fullPage: v.optional(v.boolean()),
  quality: v.optional(v.number()),
  viewport: v.optional(
    v.object({
      width: v.number(),
      height: v.number(),
    }),
  ),
});

const formatItemValidator = v.union(
  formatValidator,
  jsonFormatValidator,
  screenshotFormatValidator,
);

const scrapeActionValidator = v.union(
  v.object({
    type: v.literal("wait"),
    milliseconds: v.optional(v.number()),
    selector: v.optional(v.string()),
  }),
  v.object({
    type: v.literal("click"),
    selector: v.string(),
    all: v.optional(v.boolean()),
  }),
  v.object({
    type: v.literal("write"),
    text: v.string(),
  }),
  v.object({
    type: v.literal("press"),
    key: v.string(),
  }),
  v.object({
    type: v.literal("scroll"),
    direction: v.optional(v.union(v.literal("up"), v.literal("down"))),
    selector: v.optional(v.string()),
  }),
  v.object({
    type: v.literal("scrape"),
  }),
  v.object({
    type: v.literal("executeJavascript"),
    script: v.string(),
  }),
  v.object({
    type: v.literal("pdf"),
    format: v.optional(
      v.union(
        v.literal("A0"),
        v.literal("A1"),
        v.literal("A2"),
        v.literal("A3"),
        v.literal("A4"),
        v.literal("A5"),
        v.literal("A6"),
        v.literal("Letter"),
        v.literal("Legal"),
        v.literal("Tabloid"),
        v.literal("Ledger"),
      ),
    ),
    landscape: v.optional(v.boolean()),
    scale: v.optional(v.number()),
  }),
);

export const scrape = action({
  args: {
    url: v.string(),
    formats: v.optional(v.array(formatItemValidator)),
    onlyMainContent: v.optional(v.boolean()),
    includeTags: v.optional(v.array(v.string())),
    excludeTags: v.optional(v.array(v.string())),
    maxAge: v.optional(v.number()),
    minAge: v.optional(v.number()),
    headers: v.optional(v.record(v.string(), v.string())),
    waitFor: v.optional(v.number()),
    mobile: v.optional(v.boolean()),
    skipTlsVerification: v.optional(v.boolean()),
    timeout: v.optional(v.number()),
    parsers: v.optional(v.array(v.any())),
    actions: v.optional(v.array(scrapeActionValidator)),
    location: v.optional(
      v.object({
        country: v.optional(v.string()),
        languages: v.optional(v.array(v.string())),
      }),
    ),
    removeBase64Images: v.optional(v.boolean()),
    blockAds: v.optional(v.boolean()),
    proxy: v.optional(
      v.union(v.literal("basic"), v.literal("enhanced"), v.literal("auto")),
    ),
    storeInCache: v.optional(v.boolean()),
    profile: v.optional(
      v.object({
        name: v.string(),
        saveChanges: v.optional(v.boolean()),
      }),
    ),
    zeroDataRetention: v.optional(v.boolean()),
  },
  handler: async (_ctx, args): Promise<FirecrawlScrapeResult> => {
    const body: Record<string, unknown> = {
      url: args.url,
      ...(args.formats !== undefined ? { formats: args.formats } : {}),
      ...(args.onlyMainContent !== undefined
        ? { onlyMainContent: args.onlyMainContent }
        : {}),
      ...(args.includeTags !== undefined
        ? { includeTags: args.includeTags }
        : {}),
      ...(args.excludeTags !== undefined
        ? { excludeTags: args.excludeTags }
        : {}),
      ...(args.maxAge !== undefined ? { maxAge: args.maxAge } : {}),
      ...(args.minAge !== undefined ? { minAge: args.minAge } : {}),
      ...(args.headers !== undefined ? { headers: args.headers } : {}),
      ...(args.waitFor !== undefined ? { waitFor: args.waitFor } : {}),
      ...(args.mobile !== undefined ? { mobile: args.mobile } : {}),
      ...(args.skipTlsVerification !== undefined
        ? { skipTlsVerification: args.skipTlsVerification }
        : {}),
      ...(args.timeout !== undefined ? { timeout: args.timeout } : {}),
      ...(args.parsers !== undefined ? { parsers: args.parsers } : {}),
      ...(args.actions !== undefined ? { actions: args.actions } : {}),
      ...(args.location !== undefined ? { location: args.location } : {}),
      ...(args.removeBase64Images !== undefined
        ? { removeBase64Images: args.removeBase64Images }
        : {}),
      ...(args.blockAds !== undefined ? { blockAds: args.blockAds } : {}),
      ...(args.proxy !== undefined ? { proxy: args.proxy } : {}),
      ...(args.storeInCache !== undefined
        ? { storeInCache: args.storeInCache }
        : {}),
      ...(args.profile !== undefined ? { profile: args.profile } : {}),
      ...(args.zeroDataRetention !== undefined
        ? { zeroDataRetention: args.zeroDataRetention }
        : {}),
    };

    const response = await fetch(`${FIRECRAWL_BASE_URL}/scrape`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getApiKey()}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await readJson(response);

    if (!response.ok) {
      throw new Error(
        typeof data === "object" && data && "error" in data
          ? String((data as { error?: unknown }).error)
          : "Firecrawl scrape request failed",
      );
    }

    return data as FirecrawlScrapeResult;
  },
});

export const interact = action({
  args: {
    scrapeId: v.string(),
    prompt: v.optional(v.string()),
    code: v.optional(v.string()),
    language: v.optional(
      v.union(v.literal("node"), v.literal("python"), v.literal("bash")),
    ),
    timeout: v.optional(v.number()),
    origin: v.optional(v.string()),
  },
  handler: async (_ctx, args): Promise<FirecrawlInteractResult> => {
    if (!args.prompt && !args.code) {
      throw new Error("Either prompt or code must be provided");
    }

    const body: Record<string, unknown> = {
      ...(args.prompt !== undefined ? { prompt: args.prompt } : {}),
      ...(args.code !== undefined ? { code: args.code } : {}),
      ...(args.language !== undefined ? { language: args.language } : {}),
      ...(args.timeout !== undefined ? { timeout: args.timeout } : {}),
      ...(args.origin !== undefined ? { origin: args.origin } : {}),
    };

    const response = await fetch(
      `${FIRECRAWL_BASE_URL}/scrape/${args.scrapeId}/interact`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getApiKey()}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    const data = await readJson(response);

    if (!response.ok) {
      throw new Error(
        typeof data === "object" && data && "error" in data
          ? String((data as { error?: unknown }).error)
          : "Firecrawl interact request failed",
      );
    }

    return data as FirecrawlInteractResult;
  },
});

export const stopInteraction = action({
  args: {
    scrapeId: v.string(),
  },
  handler: async (_ctx, args) => {
    const response = await fetch(
      `${FIRECRAWL_BASE_URL}/scrape/${args.scrapeId}/interact`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getApiKey()}`,
          Accept: "application/json",
        },
      },
    );

    const data = await readJson(response);

    if (!response.ok) {
      throw new Error(
        typeof data === "object" && data && "error" in data
          ? String((data as { error?: unknown }).error)
          : "Firecrawl stop interaction request failed",
      );
    }

    return data as {
      success: boolean;
      sessionDurationMs?: number;
      creditsBilled?: number;
      [key: string]: unknown;
    };
  },
});

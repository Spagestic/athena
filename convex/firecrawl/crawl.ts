import { action } from "../_generated/server";
import { v } from "convex/values";

const FIRECRAWL_BASE_URL = "https://api.firecrawl.dev/v2";

type FirecrawlCrawlResult = {
  success: boolean;
  status?: string;
  total?: number;
  completed?: number;
  creditsUsed?: number;
  expiresAt?: string;
  next?: string | null;
  id?: string;
  data?: Array<Record<string, unknown>>;
  warning?: string | null;
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

const crawlFormatValidator = v.union(
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

const crawlJsonFormatValidator = v.object({
  type: v.literal("json"),
  schema: v.optional(v.any()),
  prompt: v.optional(v.string()),
});

const crawlScreenshotFormatValidator = v.object({
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

const crawlFormatItemValidator = v.union(
  crawlFormatValidator,
  crawlJsonFormatValidator,
  crawlScreenshotFormatValidator,
);

const crawlActionValidator = v.union(
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

export const crawl = action({
  args: {
    url: v.string(),
    limit: v.optional(v.number()),
    maxDiscoveryDepth: v.optional(v.number()),
    includePaths: v.optional(v.array(v.string())),
    excludePaths: v.optional(v.array(v.string())),
    regexOnFullURL: v.optional(v.boolean()),
    crawlEntireDomain: v.optional(v.boolean()),
    allowSubdomains: v.optional(v.boolean()),
    allowExternalLinks: v.optional(v.boolean()),
    sitemap: v.optional(
      v.union(v.literal("include"), v.literal("skip"), v.literal("only")),
    ),
    ignoreQueryParameters: v.optional(v.boolean()),
    delay: v.optional(v.number()),
    maxConcurrency: v.optional(v.number()),
    scrapeOptions: v.optional(
      v.object({
        formats: v.optional(v.array(crawlFormatItemValidator)),
        onlyMainContent: v.optional(v.boolean()),
        includeTags: v.optional(v.array(v.string())),
        excludeTags: v.optional(v.array(v.string())),
        maxAge: v.optional(v.number()),
        minAge: v.optional(v.number()),
        headers: v.optional(v.record(v.string(), v.string())),
        waitFor: v.optional(v.number()),
        mobile: v.optional(v.boolean()),
        skipTlsVerification: v.optional(v.boolean()),
        parsers: v.optional(v.array(v.any())),
        actions: v.optional(v.array(crawlActionValidator)),
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
      }),
    ),
    webhook: v.optional(
      v.object({
        url: v.string(),
        metadata: v.optional(v.record(v.string(), v.any())),
        events: v.optional(
          v.array(
            v.union(
              v.literal("started"),
              v.literal("page"),
              v.literal("completed"),
            ),
          ),
        ),
      }),
    ),
    prompt: v.optional(v.string()),
  },
  handler: async (_ctx, args): Promise<FirecrawlCrawlResult> => {
    const body: Record<string, unknown> = {
      url: args.url,
      ...(args.limit !== undefined ? { limit: args.limit } : {}),
      ...(args.maxDiscoveryDepth !== undefined
        ? { maxDiscoveryDepth: args.maxDiscoveryDepth }
        : {}),
      ...(args.includePaths !== undefined
        ? { includePaths: args.includePaths }
        : {}),
      ...(args.excludePaths !== undefined
        ? { excludePaths: args.excludePaths }
        : {}),
      ...(args.regexOnFullURL !== undefined
        ? { regexOnFullURL: args.regexOnFullURL }
        : {}),
      ...(args.crawlEntireDomain !== undefined
        ? { crawlEntireDomain: args.crawlEntireDomain }
        : {}),
      ...(args.allowSubdomains !== undefined
        ? { allowSubdomains: args.allowSubdomains }
        : {}),
      ...(args.allowExternalLinks !== undefined
        ? { allowExternalLinks: args.allowExternalLinks }
        : {}),
      ...(args.sitemap !== undefined ? { sitemap: args.sitemap } : {}),
      ...(args.ignoreQueryParameters !== undefined
        ? { ignoreQueryParameters: args.ignoreQueryParameters }
        : {}),
      ...(args.delay !== undefined ? { delay: args.delay } : {}),
      ...(args.maxConcurrency !== undefined
        ? { maxConcurrency: args.maxConcurrency }
        : {}),
      ...(args.scrapeOptions !== undefined
        ? { scrapeOptions: args.scrapeOptions }
        : {}),
      ...(args.webhook !== undefined ? { webhook: args.webhook } : {}),
      ...(args.prompt !== undefined ? { prompt: args.prompt } : {}),
    };

    const response = await fetch(`${FIRECRAWL_BASE_URL}/crawl`, {
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
          : "Firecrawl crawl request failed",
      );
    }

    return data as FirecrawlCrawlResult;
  },
});

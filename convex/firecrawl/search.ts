import { action } from "../_generated/server";
import { v } from "convex/values";

const FIRECRAWL_BASE_URL = "https://api.firecrawl.dev/v2";

type FirecrawlSearchResult = {
  success: boolean;
  data?: {
    web?: Array<Record<string, unknown>>;
    images?: Array<Record<string, unknown>>;
    news?: Array<Record<string, unknown>>;
  };
  warning?: string | null;
  id?: string;
  creditsUsed?: number;
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

const sourceTypeValidator = v.union(
  v.literal("web"),
  v.literal("images"),
  v.literal("news"),
);

const categoryValidator = v.union(
  v.literal("github"),
  v.literal("research"),
  v.literal("pdf"),
);

const formatValidator = v.union(
  v.literal("markdown"),
  v.literal("summary"),
  v.literal("html"),
  v.literal("rawHtml"),
  v.literal("links"),
  v.literal("images"),
  v.literal("screenshot"),
  v.literal("json"),
  v.literal("changeTracking"),
  v.literal("branding"),
  v.literal("audio"),
);

const formatObjectValidator = v.object({
  type: formatValidator,
});

export const search = action({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
    sources: v.optional(v.array(sourceTypeValidator)),
    categories: v.optional(v.array(categoryValidator)),
    tbs: v.optional(v.string()),
    location: v.optional(v.string()),
    country: v.optional(v.string()),
    timeout: v.optional(v.number()),
    ignoreInvalidURLs: v.optional(v.boolean()),
    enterprise: v.optional(
      v.array(v.union(v.literal("anon"), v.literal("zdr"))),
    ),
    scrapeOptions: v.optional(
      v.object({
        formats: v.optional(
          v.array(v.union(formatValidator, formatObjectValidator)),
        ),
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
        actions: v.optional(v.array(v.any())),
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
      }),
    ),
  },
  handler: async (_ctx, args): Promise<FirecrawlSearchResult> => {
    const body: Record<string, unknown> = {
      query: args.query,
      ...(args.limit !== undefined ? { limit: args.limit } : {}),
      ...(args.sources !== undefined ? { sources: args.sources } : {}),
      ...(args.categories !== undefined ? { categories: args.categories } : {}),
      ...(args.tbs !== undefined ? { tbs: args.tbs } : {}),
      ...(args.location !== undefined ? { location: args.location } : {}),
      ...(args.country !== undefined ? { country: args.country } : {}),
      ...(args.timeout !== undefined ? { timeout: args.timeout } : {}),
      ...(args.ignoreInvalidURLs !== undefined
        ? { ignoreInvalidURLs: args.ignoreInvalidURLs }
        : {}),
      ...(args.enterprise !== undefined ? { enterprise: args.enterprise } : {}),
      ...(args.scrapeOptions !== undefined
        ? { scrapeOptions: args.scrapeOptions }
        : {}),
    };

    const response = await fetch(`${FIRECRAWL_BASE_URL}/search`, {
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
          : "Firecrawl search request failed",
      );
    }

    return data as FirecrawlSearchResult;
  },
});

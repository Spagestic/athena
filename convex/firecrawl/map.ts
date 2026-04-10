import { action } from "../_generated/server";
import { v } from "convex/values";

const FIRECRAWL_BASE_URL = "https://api.firecrawl.dev/v2";

type FirecrawlMapLink = {
  url: string;
  title?: string;
  description?: string;
  [key: string]: unknown;
};

type FirecrawlMapResult = {
  success: boolean;
  links?: FirecrawlMapLink[];
  status?: string;
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

export const map = action({
  args: {
    url: v.string(),
    limit: v.optional(v.number()),
    sitemap: v.optional(v.union(v.literal("include"), v.literal("skip"))),
    search: v.optional(v.string()),
    location: v.optional(
      v.object({
        country: v.optional(v.string()),
        languages: v.optional(v.array(v.string())),
      }),
    ),
  },
  handler: async (_ctx, args): Promise<FirecrawlMapResult> => {
    const body: Record<string, unknown> = {
      url: args.url,
      ...(args.limit !== undefined ? { limit: args.limit } : {}),
      ...(args.sitemap !== undefined ? { sitemap: args.sitemap } : {}),
      ...(args.search !== undefined ? { search: args.search } : {}),
      ...(args.location !== undefined ? { location: args.location } : {}),
    };

    const response = await fetch(`${FIRECRAWL_BASE_URL}/map`, {
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
          : "Firecrawl map request failed",
      );
    }

    return data as FirecrawlMapResult;
  },
});

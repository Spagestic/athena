import { action } from "./_generated/server";
import { v } from "convex/values";

export type OcrConfidenceScores = {
  average_page_confidence_score?: number;
  minimum_page_confidence_score?: number;
  word_confidence_scores?: Array<{
    text: string;
    confidence: number;
    start_index: number;
  }>;
};

export type OcrPage = {
  index: number;
  markdown: string;
  images: Array<{
    id: string;
    top_left_x?: number;
    top_left_y?: number;
    bottom_right_x?: number;
    bottom_right_y?: number;
    image_base64?: string;
    image_annotation?: unknown | null;
  }>;
  tables: Array<{
    id: string;
    content: string;
    format?: "html" | "markdown";
  }>;
  hyperlinks: string[];
  header: string | null;
  footer: string | null;
  dimensions: {
    dpi: number;
    height: number;
    width: number;
  };
  confidence_scores?: OcrConfidenceScores | null;
};

export type OcrResult = {
  pages: OcrPage[];
  model: string;
  document_annotation: unknown | null;
  usage_info: {
    pages_processed: number;
    doc_size_bytes: number;
  };
};

type DocumentInput =
  | {
      type: "document_url";
      documentUrl?: string;
      document_url?: string;
    }
  | {
      type: "image_url";
      imageUrl?: string;
      image_url?: string;
    };

function getApiKey(): string {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    throw new Error("Missing MISTRAL_API_KEY");
  }
  return apiKey;
}

function normalizeDocument(document?: DocumentInput) {
  if (!document) return null;

  if (document.type === "document_url") {
    const documentUrl = document.documentUrl ?? document.document_url;
    if (!documentUrl) return null;

    return {
      type: "document_url" as const,
      document_url: documentUrl,
    };
  }

  if (document.type === "image_url") {
    const imageUrl = document.imageUrl ?? document.image_url;
    if (!imageUrl) return null;

    return {
      type: "image_url" as const,
      image_url: imageUrl,
    };
  }

  return null;
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

export async function runOcrRequest(args: {
  model?: string;
  document?: DocumentInput;
  tableFormat?: "html" | "markdown" | null;
  table_format?: "html" | "markdown" | null;
  extractHeader?: boolean;
  extract_header?: boolean;
  extractFooter?: boolean;
  extract_footer?: boolean;
  includeImageBase64?: boolean;
  include_image_base64?: boolean;
}): Promise<OcrResult> {
  const document = normalizeDocument(args.document);

  if (!document) {
    throw new Error(
      'Provide document.type and a valid documentUrl/imageUrl. Example: { "document": { "type": "document_url", "documentUrl": "https://..." } }',
    );
  }

  const payload = {
    model: args.model ?? "mistral-ocr-latest",
    document,
    table_format: args.table_format ?? args.tableFormat ?? null,
    extract_header: args.extract_header ?? args.extractHeader ?? false,
    extract_footer: args.extract_footer ?? args.extractFooter ?? false,
    include_image_base64:
      args.include_image_base64 ?? args.includeImageBase64 ?? false,
  };

  try {
    const response = await fetch("https://api.mistral.ai/v1/ocr", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getApiKey()}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await readJson(response);

    if (!response.ok) {
      throw new Error(
        typeof data === "object" && data && "error" in data
          ? String((data as { error?: unknown }).error)
          : "Mistral OCR request failed",
      );
    }

    return data as OcrResult;
  } catch (error) {
    console.error("Mistral OCR action error:", error);
    throw new Error("Failed to reach Mistral OCR API");
  }
}

export const ocr = action({
  args: {
    model: v.optional(v.string()),
    document: v.optional(
      v.union(
        v.object({
          type: v.literal("document_url"),
          documentUrl: v.optional(v.string()),
          document_url: v.optional(v.string()),
        }),
        v.object({
          type: v.literal("image_url"),
          imageUrl: v.optional(v.string()),
          image_url: v.optional(v.string()),
        }),
      ),
    ),
    tableFormat: v.optional(
      v.union(v.literal("html"), v.literal("markdown"), v.null()),
    ),
    table_format: v.optional(
      v.union(v.literal("html"), v.literal("markdown"), v.null()),
    ),
    extractHeader: v.optional(v.boolean()),
    extract_header: v.optional(v.boolean()),
    extractFooter: v.optional(v.boolean()),
    extract_footer: v.optional(v.boolean()),
    includeImageBase64: v.optional(v.boolean()),
    include_image_base64: v.optional(v.boolean()),
  },
  handler: async (_ctx, args): Promise<OcrResult> => {
    return await runOcrRequest(args);
  },
});

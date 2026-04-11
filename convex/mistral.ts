import { action } from "./_generated/server";
import { v } from "convex/values";

export type MistralRole = "system" | "user" | "assistant" | "tool";

export type MistralChatMessage = {
  role: MistralRole;
  content: string;
  name?: string;
  prefix?: boolean;
  tool_call_id?: string;
};

export type MistralJsonSchemaResponseFormat = {
  type: "json_schema";
  json_schema: {
    schema: Record<string, unknown>;
    name: string;
    strict?: boolean;
  };
};

export type MistralResponseFormat = MistralJsonSchemaResponseFormat;

export type MistralChatChoice = {
  index: number;
  finish_reason: string | null;
  message: {
    role: "assistant";
    content: string | null;
    tool_calls?: unknown | null;
    prefix?: boolean;
  };
};

export type MistralChatUsage = {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
};

export type MistralChatResult = {
  id: string;
  object: "chat.completion";
  created: number;
  model: string;
  usage: MistralChatUsage;
  choices: MistralChatChoice[];
};

function getApiKey(): string {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    throw new Error("Missing MISTRAL_API_KEY");
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

function normalizeMessages(messages: MistralChatMessage[]) {
  return messages.map((message) => {
    const normalized: Record<string, unknown> = {
      role: message.role,
      content: message.content,
    };

    if (message.name !== undefined) normalized.name = message.name;
    if (message.prefix !== undefined) normalized.prefix = message.prefix;
    if (message.tool_call_id !== undefined)
      normalized.tool_call_id = message.tool_call_id;

    return normalized;
  });
}

type ChatCompleteArgs = {
  model?: string;
  messages: MistralChatMessage[];
  safe_prompt?: boolean;
  stop?: string[];
  responseFormat?: MistralResponseFormat;
};

export async function requestChatCompletion(
  args: ChatCompleteArgs,
): Promise<MistralChatResult> {
  const payload = {
    model: args.model ?? "mistral-large-latest",
    messages: normalizeMessages(args.messages),
    ...(args.safe_prompt !== undefined ? { safe_prompt: args.safe_prompt } : {}),
    ...(args.stop !== undefined ? { stop: args.stop } : {}),
    ...(args.responseFormat !== undefined
      ? { response_format: args.responseFormat }
      : {}),
  };

  try {
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${getApiKey()}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await readJson(response);

    if (!response.ok) {
      throw new Error(
        typeof data === "object" && data && "error" in data
          ? String((data as { error?: unknown }).error)
          : "Mistral chat completion request failed",
      );
    }

    return data as MistralChatResult;
  } catch (error) {
    console.error("Mistral chat completion action error:", error);
    throw new Error("Failed to reach Mistral chat completions API");
  }
}

export const chatComplete = action({
  args: {
    model: v.optional(v.string()),
    messages: v.array(
      v.object({
        role: v.union(
          v.literal("system"),
          v.literal("user"),
          v.literal("assistant"),
          v.literal("tool"),
        ),
        content: v.string(),
        name: v.optional(v.string()),
        prefix: v.optional(v.boolean()),
        tool_call_id: v.optional(v.string()),
      }),
    ),
    safe_prompt: v.optional(v.boolean()),
    stop: v.optional(v.array(v.string())),
    responseFormat: v.optional(v.any()),
  },
  handler: async (_ctx, args): Promise<MistralChatResult> =>
    requestChatCompletion({
      model: args.model,
      messages: args.messages,
      responseFormat: args.responseFormat as MistralResponseFormat | undefined,
      safe_prompt: args.safe_prompt,
      stop: args.stop,
    }),
});

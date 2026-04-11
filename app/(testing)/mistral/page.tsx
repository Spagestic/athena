"use client";

import { useMemo, useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

const defaultPrompt =
  "Extract the book information from: I recently read 'To Kill a Mockingbird' by Harper Lee.";

const defaultResponseFormat = {
  type: "json_schema" as const,
  json_schema: {
    name: "book",
    strict: true,
    schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        authors: {
          type: "array",
          items: { type: "string" },
        },
      },
      required: ["name", "authors"],
      additionalProperties: false,
    },
  },
};

export default function Page() {
  const chatComplete = useAction(api.mistral.chatComplete);
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [model, setModel] = useState("ministral-8b-latest");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");

  const payloadPreview = useMemo(
    () =>
      JSON.stringify(
        {
          model,
          messages: [
            { role: "system", content: "Extract the books information." },
            { role: "user", content: prompt },
          ],
          responseFormat: defaultResponseFormat,
          safe_prompt: true,
        },
        null,
        2,
      ),
    [model, prompt],
  );

  async function handleRun() {
    setLoading(true);
    setError("");
    setResult("");

    try {
      const response = await chatComplete({
        model,
        messages: [
          { role: "system", content: "Extract the books information." },
          { role: "user", content: prompt },
        ],
        responseFormat: defaultResponseFormat,
        safe_prompt: true,
      });

      setResult(JSON.stringify(response, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-10">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">
          Mistral test page
        </h1>
        <p className="text-sm text-muted-foreground">
          Use this page to test `convex/mistral.ts` and custom structured
          outputs.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="model">
              Model
            </label>
            <input
              id="model"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring"
              value={model}
              onChange={(event) => setModel(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="prompt">
              Prompt
            </label>
            <textarea
              id="prompt"
              className="min-h-40 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
            />
          </div>

          <button
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleRun}
            disabled={loading}
          >
            {loading ? "Running…" : "Run structured output test"}
          </button>

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
              This is the payload sent to the Convex action.
            </p>
          </div>
          <pre className="overflow-auto rounded-md bg-muted p-4 text-xs leading-6">
            {payloadPreview}
          </pre>

          <div>
            <h2 className="text-lg font-semibold">Response</h2>
            <p className="text-sm text-muted-foreground">
              Raw JSON from the Mistral completion.
            </p>
          </div>
          <pre className="min-h-40 overflow-auto rounded-md bg-muted p-4 text-xs leading-6">
            {result || "Run the test to see the response here."}
          </pre>
        </div>
      </section>
    </main>
  );
}

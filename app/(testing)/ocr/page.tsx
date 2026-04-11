"use client";

import { useMemo, useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { OcrResult } from "@/convex/ocr";

export default function Page() {
  const ocr = useAction(api.ocr.ocr);
  const [documentUrl, setDocumentUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OcrResult | null>(null);

  const canSubmit = useMemo(
    () => documentUrl.trim().length > 0 && !loading,
    [documentUrl, loading],
  );

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await ocr({
        document: {
          type: "document_url",
          documentUrl: documentUrl.trim(),
        },
        tableFormat: "markdown",
        extractHeader: false,
        extractFooter: false,
        includeImageBase64: false,
      });

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "OCR request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10">
      <section className="space-y-2">
        <h1 className="font-semibold text-3xl tracking-tight">
          Mistral OCR test
        </h1>
        <p className="text-muted-foreground text-sm">
          Paste a public document URL, then run the Convex OCR action.
        </p>
      </section>

      <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <label
          className="mb-2 block font-medium text-sm"
          htmlFor="document-url"
        >
          Document URL
        </label>
        <input
          id="document-url"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          onChange={(e) => setDocumentUrl(e.target.value)}
          placeholder="https://example.com/document.pdf"
          value={documentUrl}
        />

        <button
          className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition-colors hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
          disabled={!canSubmit}
          onClick={handleRun}
          type="button"
        >
          {loading ? "Running OCR..." : "Run OCR"}
        </button>

        {error ? (
          <p className="mt-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-red-600 text-sm">
            {error}
          </p>
        ) : null}
      </section>

      <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h2 className="mb-3 font-medium text-lg">Result</h2>
        <pre className="max-h-120 overflow-auto rounded-lg bg-muted p-4 text-xs leading-relaxed">
          {result ? JSON.stringify(result, null, 2) : "No result yet."}
        </pre>
      </section>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";

const FILE_TYPES = [
  { label: "PDF", color: "bg-red-600" },
  { label: "DOC", color: "bg-blue-600" },
  { label: "TXT", color: "bg-orange-500" },
];

export function TerminalCard() {
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setPulse((p) => (p + 1) % 3), 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-foreground px-4 py-2">
        <span className="text-[10px] tracking-widest text-muted-foreground uppercase font-mono">
          ATHENA.ASK
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 bg-[#ea580c] animate-pulse" />
          <span className="text-[10px] tracking-widest text-[#ea580c] uppercase font-mono">
            LIVE
          </span>
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-5">
        <p className="text-xs font-mono font-bold uppercase tracking-widest text-foreground mb-1">
          Upload anything
        </p>
        <p className="text-[10px] font-mono text-muted-foreground mb-6 leading-relaxed">
          Upload PDFs, YouTube videos, websites, or text. Athena&apos;s
          intelligent ingestion pipeline processes every source so your notebook
          is fully searchable and connected.
        </p>

        {/* Diagram */}
        <div className="flex flex-col items-center gap-0 flex-1 justify-center">
          {/* Source file icons row */}
          <div className="flex items-end justify-center gap-8 mb-0">
            {FILE_TYPES.map(({ label, color }, i) => (
              <div key={label} className="flex flex-col items-center gap-0">
                {/* file card */}
                <div
                  className="w-10 h-13 border border-border bg-background flex flex-col items-start p-1 relative"
                  style={{ height: 52 }}
                >
                  <div className="absolute top-0 right-0 w-3 h-3 border-l border-b border-border bg-muted" />
                  <div className="mt-3 space-y-0.5 w-full">
                    <div className="h-[2px] bg-muted-foreground/20 w-full" />
                    <div className="h-[2px] bg-muted-foreground/20 w-3/4" />
                    <div className="h-[2px] bg-muted-foreground/20 w-full" />
                  </div>
                  <span
                    className={`absolute bottom-1 left-1 text-[7px] font-mono font-bold px-1 py-0.5 ${color} text-white`}
                  >
                    {label}
                  </span>
                </div>
                {/* connector */}
                <div
                  className="w-[1px] h-5"
                  style={{
                    backgroundColor:
                      pulse === i ? "#ea580c" : "hsl(var(--border))",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Athena node */}
          <div className="flex flex-col items-center">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-full border-2 border-[#ea580c] bg-gradient-to-br from-[#ea580c] to-[#f97316] shadow-[0_0_16px_rgba(234,88,12,0.4)]">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
                <path d="M12 3L3 21h18L12 3zm0 4l6 12H6l6-12z" fill="white" />
              </svg>
              <span className="absolute inset-0 rounded-full border border-[#ea580c] animate-ping opacity-20" />
            </div>
            {/* fan lines */}
            <div className="relative w-36 h-6">
              <div className="absolute left-1/2 top-0 w-[1px] h-full bg-border" />
              <div
                className="absolute"
                style={{
                  left: "32%",
                  top: 0,
                  width: 1,
                  height: "100%",
                  backgroundColor: "hsl(var(--border))",
                  transform: "rotate(-18deg)",
                  transformOrigin: "top center",
                }}
              />
              <div
                className="absolute"
                style={{
                  left: "68%",
                  top: 0,
                  width: 1,
                  height: "100%",
                  backgroundColor: "hsl(var(--border))",
                  transform: "rotate(18deg)",
                  transformOrigin: "top center",
                }}
              />
            </div>
          </div>

          {/* Output chips */}
          <div className="flex items-center justify-center gap-2">
            {[
              ["⊞", "Flashcards"],
              ["◎", "Mindmap"],
              ["≡", "Tests"],
            ].map(([icon, label]) => (
              <div
                key={label}
                className="flex items-center gap-1.5 border border-border px-2.5 py-1.5 bg-background text-[10px] font-mono text-foreground"
              >
                <span className="text-[#ea580c]">{icon}</span>
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

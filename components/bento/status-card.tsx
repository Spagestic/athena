"use client"

import { useEffect, useState } from "react"
import { ChevronDown, ArrowUp } from "lucide-react"

const MODELS = [
  { name: "Athena-1", multiplier: "1x" },
  { name: "GPT-5.2", multiplier: "4x" },
  { name: "GPT-4.1", multiplier: "3x" },
  { name: "DeepSeek V3.2", multiplier: "2x" },
  { name: "Claude Sonnet 4.6", multiplier: "5x" },
]

export function StatusCard() {
  const [selectedModel, setSelectedModel] = useState("Claude Opus 4.5")
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b-2 border-foreground px-4 py-2">
        <span className="text-[10px] tracking-widest text-muted-foreground uppercase">
          ai_models.status
        </span>
        <span className="text-[10px] tracking-widest text-muted-foreground font-mono">
          {`TICK:${String(tick).padStart(4, "0")}`}
        </span>
      </div>

      <div className="flex-1 flex flex-col p-4">
        <p className="text-xs font-mono font-bold uppercase tracking-widest text-foreground mb-1">
          Ask anything, get grounded answers
        </p>
        <p className="text-[10px] font-mono text-muted-foreground mb-4 leading-relaxed">
          Choose from Claude, DeepSeek, ChatGPT, Gemini, or Athena-1.
          Get answers with citations to exact pages or timestamps,
          grounded in your uploaded sources.
        </p>

        {/* Model list */}
        <div className="border border-border divide-y divide-border mb-3">
          {MODELS.map((m) => (
            <div key={m.name} className="flex items-center justify-between px-3 py-1.5 text-[11px] font-mono hover:bg-muted/30 transition-colors">
              <span className="text-muted-foreground">{m.name}</span>
              <span className="text-muted-foreground">{m.multiplier}</span>
            </div>
          ))}
        </div>

        {/* Composer bar */}
        <div className="mt-auto relative">
          <div className="border border-border flex items-center gap-2 px-3 py-2">
            <span className="text-[9px] font-mono text-muted-foreground border border-border px-1.5 py-0.5 whitespace-nowrap">Plan, Build</span>
            <span className="text-[9px] font-mono text-muted-foreground">∞ Agent</span>
            <button
              className="flex items-center gap-1 border border-border px-2 py-0.5 cursor-pointer hover:border-[#ea580c] transition-colors ml-1"
              onClick={() => setDropdownOpen((v) => !v)}
            >
              <span className="text-[10px] font-mono text-foreground">{selectedModel}</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
            <button className="ml-auto flex items-center justify-center w-6 h-6 border border-border hover:border-[#ea580c] hover:text-[#ea580c] transition-colors">
              <ArrowUp className="h-3 w-3" />
            </button>
          </div>
          {dropdownOpen && (
            <div className="absolute bottom-full left-0 right-0 border border-border bg-background divide-y divide-border z-10 mb-1">
              {["Claude Opus 4.5", "Claude Sonnet 4.6", "GPT-5.2", "Athena-1"].map((m) => (
                <div
                  key={m}
                  className="px-3 py-1.5 cursor-pointer hover:bg-muted/30 flex items-center justify-between text-[10px] font-mono"
                  onClick={() => { setSelectedModel(m); setDropdownOpen(false) }}
                >
                  <span className={m === selectedModel ? "text-[#ea580c]" : "text-foreground"}>{m}</span>
                  {m === selectedModel && <span className="text-[#ea580c]">✓</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

"use client"

const TABLE_ROWS = [
  {
    feature: "Mechanism",
    cardiac: ["Pulmonary", "congestion [1]"],
    respiratory: ["Airway/lung", "obstruction [2]"],
  },
  {
    feature: "Night Sx",
    cardiac: ["PND ✓ [1]"],
    respiratory: ["Rare [2]"],
  },
  {
    feature: "Position",
    cardiac: ["Orthopnoea ✓"],
    respiratory: ["Any position"],
  },
  {
    feature: "Onset",
    cardiac: ["Gradual/acute"],
    respiratory: ["Episodic/slow"],
  },
]

export function DitherCard() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-foreground px-4 py-2">
        <span className="text-[10px] tracking-widest text-muted-foreground uppercase font-mono">
          GROUNDED_ANSWER.MD
        </span>
        <span className="text-[10px] tracking-widest text-muted-foreground font-mono">v1.0</span>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-4 gap-3 overflow-auto bg-background">
        <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#ea580c]">
          COMPARISON OVERVIEW
        </p>

        {/* Brutalist table */}
        <div className="border-2 border-foreground text-[10px] font-mono">
          <div className="grid grid-cols-3 bg-foreground text-background px-2 py-1.5 tracking-[0.1em] uppercase">
            <span>FEATURE</span>
            <span>CARDIAC</span>
            <span>RESPIRATORY</span>
          </div>

          {TABLE_ROWS.map((row, i) => (
            <div
              key={row.feature}
              className={`grid grid-cols-3 px-2 py-2 ${
                i < TABLE_ROWS.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <span className="text-muted-foreground uppercase tracking-wide text-[9px] self-center">
                {row.feature}
              </span>
              <div className="flex flex-col gap-0.5">
                {row.cardiac.map((t, j) => (
                  <span key={j} className={t.includes("[1]") ? "text-[#ea580c]" : "text-foreground"}>
                    {t}
                  </span>
                ))}
              </div>
              <div className="flex flex-col gap-0.5">
                {row.respiratory.map((t, j) => (
                  <span key={j} className={t.includes("[2]") ? "text-[#ea580c]" : "text-foreground"}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Citation footnotes */}
        <div className="flex flex-col gap-1 border-t border-border pt-2">
          <p className="text-[9px] font-mono text-muted-foreground">
            <span className="text-[#ea580c]">[1]</span> cardiology.pdf · p.14
          </p>
          <p className="text-[9px] font-mono text-muted-foreground">
            <span className="text-[#ea580c]">[2]</span> respiratory.pdf · p.22
          </p>
        </div>
      </div>
    </div>
  )
}
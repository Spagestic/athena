export function DashboardPreview() {
  const modules = [
    {
      code: "COMP1021",
      title: "INTRODUCTION TO\nCOMPUTER SCIENCE",
      sub: "Refine lab notes into flashcards",
      stats: [
        ["NOTES", "18"],
        ["TASKS", "4"],
        ["AGENTS", "3"],
      ],
    },
    {
      code: "MATH1014",
      title: "CALCULUS 2",
      sub: "Summarize integration techniques",
      stats: [
        ["NOTES", "11"],
        ["TASKS", "3"],
        ["AGENTS", "2"],
      ],
    },
    {
      code: "PHYS1112",
      title: "GENERAL PHYSICS 1",
      sub: "Draft a clean wave motion cheat sheet",
      stats: [
        ["NOTES", "14"],
        ["TASKS", "2"],
        ["AGENTS", "4"],
      ],
    },
  ];

  return (
    <div className="relative overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
      {/* Label bar above dashboard */}
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[10px] font-mono text-[#888] tracking-[0.2em] uppercase">
          ATHENA.DASHBOARD
        </span>
        <span className="flex items-center gap-1.5 text-[10px] font-mono text-primary tracking-widest uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          LIVE PREVIEW
        </span>
      </div>

      {/* Dashboard box — 2px black border, light mode */}
      <div className="relative border-2 border-black bg-white overflow-hidden shadow-2xl min-w-[900px] lg:min-w-0 text-black">
        {/* Search bar + avatar + streak */}
        <div className="flex items-center gap-3 border-b border-black/10 px-4 py-3">
          <div className="flex-1 border border-black px-3 py-2">
            <span className="text-[10px] font-mono text-black/30 tracking-[0.15em] uppercase">
              SEARCH NOTES, MODULES, DEADLINES...
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="border border-black w-9 h-9 flex items-center justify-center bg-white">
              <span className="text-xs font-mono text-black font-bold">M</span>
            </div>
            <div className="border border-black px-3 h-9 flex items-center gap-1.5 bg-white">
              <span className="text-sm">🔥</span>
              <span className="text-[10px] font-mono text-primary tracking-widest">
                STREAK 67
              </span>
            </div>
          </div>
        </div>

        {/* Row 1: Agentic Workspace + Deadline Radar */}
        <div className="grid grid-cols-5 border-b border-black/10 divide-x divide-black/10">
          {/* Panel 1: Agentic Workspace */}
          <div className="col-span-2 p-5">
            <span className="text-[9px] font-mono text-black/40 tracking-[0.2em] uppercase block mb-3">
              AGENTIC WORKSPACE
            </span>
            <h2 className="text-2xl font-mono font-bold text-black uppercase mb-3">
              GOOD EVENING
            </h2>
            <p className="text-[11px] font-mono text-black/50 leading-relaxed mb-5">
              Your workspace is tuned to Asia/Hong Kong.
              <br />
              Surface the most urgent deadlines first.
            </p>
            {/* Orange accent box */}
            <div className="bg-[#ea580c] p-3">
              <span className="text-[9px] font-mono text-white/70 tracking-[0.2em] uppercase block mb-1">
                ACTIVE FOCUS
              </span>
              <p className="text-sm font-mono text-white font-bold uppercase mb-2">
                5 DEADLINES ACROSS 3 MODULES
              </p>
              <div className="flex items-center gap-1.5 border-t border-white/20 pt-2 mt-1 bg-white/10 -mx-3 -mb-3 px-3 py-2">
                <span className="text-white text-[10px]">✦</span>
                <span className="text-[9px] font-mono text-white/80 uppercase tracking-wide">
                  NOTES AGENT READY TO PRIORITIZE REVIEW BLOCKS
                </span>
              </div>
            </div>
          </div>

          {/* Panel 2: Deadline Radar */}
          <div className="col-span-3 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[9px] font-mono text-black/40 tracking-[0.2em] uppercase block mb-1">
                  DEADLINE RADAR
                </span>
                <p className="text-sm font-mono font-bold text-black uppercase">
                  TOP 5 URGENT TASKS
                </p>
              </div>
              <span className="text-[9px] font-mono text-black/30 uppercase tracking-wide text-right max-w-[160px] leading-tight">
                BARS SHRINK AS DUE DATES GET CLOSER
              </span>
            </div>

            <div className="space-y-2">
              {/* Card 1 — RED */}
              <div className="border border-red-500 bg-red-50 p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="border border-black/20 px-1.5 py-0.5 text-[8px] font-mono text-black/60">
                      COMP1021
                    </span>
                    <span
                      className="bg-red-600 px-1.5 py-0.5 text-[8px] font-mono text-white"
                      style={{ borderRadius: 2 }}
                    >
                      URGENT
                    </span>
                  </div>
                  <span className="border border-red-500 text-[9px] font-mono text-red-600 px-1.5 py-0.5">
                    ⊙ RISK 93
                  </span>
                </div>
                <p className="text-xs font-mono text-black font-bold uppercase mb-0.5">
                  LAB CHECKPOINT UPLOAD
                </p>
                <p className="text-[9px] font-mono text-black/50 uppercase mb-2">
                  DUE IN 4 HOURS
                </p>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[8px] font-mono text-black/30 uppercase tracking-wider">
                    DEADLINE WINDOW
                  </span>
                  <span className="text-[8px] font-mono text-red-600">
                    12% REMAINING
                  </span>
                </div>
                <div className="h-[3px] bg-black/10">
                  <div className="h-full bg-red-500" style={{ width: "12%" }} />
                </div>
              </div>

              {/* Card 2 — AMBER */}
              <div className="border border-orange-500 bg-orange-50 p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="border border-black/20 px-1.5 py-0.5 text-[8px] font-mono text-black/60">
                      MATH1014
                    </span>
                    <span
                      className="bg-orange-500 px-1.5 py-0.5 text-[8px] font-mono text-white"
                      style={{ borderRadius: 2 }}
                    >
                      MEDIUM
                    </span>
                  </div>
                  <span className="border border-orange-500 text-[9px] font-mono text-orange-600 px-1.5 py-0.5">
                    ⊙ RISK 71
                  </span>
                </div>
                <p className="text-xs font-mono text-black font-bold uppercase mb-0.5">
                  PROBLEM SET 06
                </p>
                <p className="text-[9px] font-mono text-black/50 uppercase mb-2">
                  DUE IN 1 DAY
                </p>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[8px] font-mono text-black/30 uppercase tracking-wider">
                    DEADLINE WINDOW
                  </span>
                  <span className="text-[8px] font-mono text-orange-600">
                    38% REMAINING
                  </span>
                </div>
                <div className="h-[3px] bg-black/10">
                  <div
                    className="h-full bg-orange-500"
                    style={{ width: "38%" }}
                  />
                </div>
              </div>

              {/* Card 3 — GREEN */}
              <div className="border border-[#84cc16] bg-lime-50 p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="border border-black/20 px-1.5 py-0.5 text-[8px] font-mono text-black/60">
                      PHYS1112
                    </span>
                    <span
                      className="bg-[#84cc16] px-1.5 py-0.5 text-[8px] font-mono text-white"
                      style={{ borderRadius: 2 }}
                    >
                      STABLE
                    </span>
                  </div>
                  <span className="border border-[#84cc16] text-[9px] font-mono text-[#65a30d] px-1.5 py-0.5">
                    ⊙ RISK 28
                  </span>
                </div>
                <p className="text-xs font-mono text-black font-bold uppercase mb-0.5">
                  OPTICS SUMMARY SHEET
                </p>
                <p className="text-[9px] font-mono text-black/50 uppercase mb-2">
                  DUE IN 6 DAYS
                </p>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[8px] font-mono text-black/30 uppercase tracking-wider">
                    DEADLINE WINDOW
                  </span>
                  <span className="text-[8px] font-mono text-[#65a30d]">
                    91% REMAINING
                  </span>
                </div>
                <div className="h-[3px] bg-black/10">
                  <div
                    className="h-full bg-[#84cc16]"
                    style={{ width: "91%" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Enrolled Modules */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[9px] font-mono text-black/40 tracking-[0.2em] uppercase block mb-1">
                ENROLLED MODULES
              </span>
              <p className="text-sm font-mono font-bold text-black uppercase">
                YOUR CLASSES
              </p>
            </div>
            <span className="text-[9px] font-mono text-black/30 uppercase tracking-wide">
              QUICK ACTIONS STAY ATTACHED TO EACH MODULE
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {modules.map(({ code, title, sub, stats }) => (
              <div key={code} className="border border-black/20 p-4 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px]">📋</span>
                    <span className="text-[9px] font-mono text-black/55 tracking-widest uppercase">
                      {code}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-black/25">
                    ···
                  </span>
                </div>
                <p className="text-xs font-mono text-black font-bold uppercase leading-tight mb-1 whitespace-pre-line">
                  {title}
                </p>
                <p className="text-[9px] font-mono text-black/40 mb-3">{sub}</p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {stats.map(([k, v]) => (
                    <span
                      key={k}
                      className="border border-black/20 px-1.5 py-0.5 text-[8px] font-mono text-black/50"
                    >
                      {k} {v}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

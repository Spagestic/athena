"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const entrance = [0.16, 1, 0.3, 1] as const;

const features = [
  {
    id: "studio",
    label: "STUDIO",
    tag: "01 / STUDIO",
    title: "ONE WORKSPACE,\nMULTIPLE OUTPUT FORMATS",
    description:
      "Athena Studio turns your sources into notes, mind maps, tutor sessions, practice tests, podcasts, and more. Pick the format that fits how you learn and switch between them instantly.",
    specs: [
      "FLASHCARDS",
      "PRACTICE TESTS",
      "MIND MAPS",
      "TUTOR",
      "NOTES",
      "PODCASTS",
    ],
  },
  {
    id: "flashcards",
    label: "FLASHCARDS",
    tag: "02 / FLASHCARDS",
    title: "Master every card with\nmultiple review styles",
    description:
      "Move between column, toggle, list, typing, and learn workflows without leaving your deck. An AI agent reads your sources, picks what matters, and generates cited cards linked to exact pages.",
    specs: [
      "COLUMN VIEW",
      "TOGGLE + LIST",
      "TYPING MODE",
      "LEARN MODE",
      "AI GENERATION",
    ],
  },
  {
    id: "track",
    label: "TRACK",
    tag: "03 / TRACK",
    title: "Let AI walk you through\nyour documents",
    description:
      "Track mode transforms dense documents into guided walkthroughs. Voice explanations, interactive Q&A, and comprehension checks — like having an expert narrate your reading in 32+ languages.",
    specs: [
      "VOICE TUTORING",
      "AUTO PAGE-FLIP",
      "COMPREHENSION CHECKS",
      "32+ LANGUAGES",
      "VISUAL NARRATION",
    ],
  },
  {
    id: "notes",
    label: "NOTES",
    tag: "04 / NOTES",
    title: "Block-based editor with\nAI-powered writing",
    description:
      "Write, organize, and expand your notes with an AI co-author grounded in your uploaded sources. Every suggestion is cited — no hallucinations, just your material made clearer.",
    specs: [
      "BLOCK EDITOR",
      "AI AUTOCOMPLETE",
      "SOURCE CITATIONS",
      "RICH FORMATTING",
      "EXPORT",
    ],
  },
  {
    id: "mindmap",
    label: "MINDMAP",
    tag: "05 / MINDMAP",
    title: "Map key concepts and\nrelationships at a glance",
    description:
      "Auto-generate visual knowledge maps from any source. See how ideas connect, expand branches to explore deeper, and export the map as a study reference or presentation asset.",
    specs: [
      "AUTO-GENERATION",
      "INTERACTIVE NODES",
      "CONCEPT LINKING",
      "ZOOM + PAN",
      "EXPORT",
    ],
  },
  {
    id: "practice-test",
    label: "PRACTICE TEST",
    tag: "06 / PRACTICE TEST",
    title: "Generate MCQs and\nshort-answer exams",
    description:
      "Build full practice tests from your sources in seconds. Questions are grounded in your material with difficulty scaling, automatic marking, and targeted feedback.",
    specs: [
      "MCQ GENERATION",
      "SHORT ANSWER",
      "AUTO-MARKING",
      "DIFFICULTY SCALING",
      "CITED FEEDBACK",
    ],
  },
];

// ─── Wireframe mockups per tab ─────────────────────────────────────────────

function WireframeStudio() {
  return (
    <div
      className="font-mono text-[11px] bg-[#0a0a0a] text-white w-full h-full flex flex-col border border-white/20"
      style={{ minHeight: 340 }}
    >
      {/* header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/20 bg-[#111]">
        <span className="tracking-widest text-white/80 text-[10px]">
          ATHENA STUDIO
        </span>
        <span className="flex items-center gap-1.5 text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c] animate-pulse" />
          <span className="text-[#ea580c]">LIVE</span>
        </span>
      </div>
      {/* output chips grid */}
      <div className="grid grid-cols-3 gap-1.5 p-3 border-b border-white/10">
        {[
          ["Flashcards", "✎"],
          ["Mind Map", "✎"],
          ["Notes", "✎"],
          ["Practice Test", ""],
          ["Tutor", "✎"],
          ["Track", "✎"],
          ["Infographic", ""],
          ["Podcast", "✎"],
          ["More", "···"],
        ].map(([label, icon]) => (
          <div
            key={label}
            className="flex items-center gap-1 px-1.5 py-1 border border-white/20 bg-white/5 text-[9px] text-white/70"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white/30 flex-shrink-0" />
            <span className="truncate">{label}</span>
            {icon && (
              <span className="ml-auto text-white/40 text-[9px]">{icon}</span>
            )}
          </div>
        ))}
      </div>
      {/* bottom item row */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-white/40">▼</span>
          <span className="text-white/80">Flashcards (1)</span>
        </div>
        <span className="text-[9px] border border-white/20 px-2 py-0.5 text-white/60">
          Learn All
        </span>
      </div>
      <div className="px-3 py-2.5 flex-1">
        <p className="text-white/80 mb-1">
          Flashcards: Head &amp; Neck Anatomy
        </p>
        <p className="text-[9px] text-white/40">
          FLASHCARDS · 131 items · 1 day ago
        </p>
      </div>
      {/* corner brackets decoration */}
      <div className="relative pointer-events-none">
        <span className="absolute top-0 left-0 w-3 h-3 border-l border-t border-white/20" />
        <span className="absolute top-0 right-0 w-3 h-3 border-r border-t border-white/20" />
      </div>
    </div>
  );
}

function WireframeFlashcards() {
  return (
    <div
      className="font-mono text-[11px] bg-[#0a0a0a] text-white w-full h-full flex flex-col border border-white/20"
      style={{ minHeight: 340 }}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/20 bg-[#111]">
        <span className="tracking-widest text-white/80 text-[10px]">
          ATHENA.FLASHCARDS
        </span>
        <span className="flex items-center gap-1.5 text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c] animate-pulse" />
          <span className="text-[#ea580c]">20 DUE</span>
        </span>
      </div>
      <div className="flex-1 flex flex-col justify-center px-5 py-4 gap-4">
        <span className="text-[9px] text-white/40 tracking-widest">
          CARD 12 OF 48
        </span>
        <div className="border border-white/20 p-4 bg-[#111]">
          <div className="border-b border-white/10 pb-3 mb-3 text-white/90 leading-snug">
            What is the mechanism of action
            <br />
            of beta-blockers?
          </div>
          <button className="w-full border border-white/20 py-2 text-[10px] text-white/50 tracking-widest hover:border-white/40 transition-colors">
            TAP TO REVEAL ANSWER
          </button>
        </div>
        <div className="grid grid-cols-4 gap-1.5 mt-1">
          {["← AGAIN", "HARD", "GOOD", "EASY →"].map((label) => (
            <button
              key={label}
              className={`border py-1.5 text-[9px] tracking-wide transition-colors ${label === "GOOD" ? "border-[#ea580c] text-[#ea580c]" : "border-white/20 text-white/50 hover:border-white/40"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function WireframeNotes() {
  return (
    <div
      className="font-mono text-[11px] bg-[#0a0a0a] text-white w-full h-full flex flex-col border border-white/20"
      style={{ minHeight: 340 }}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/20 bg-[#111]">
        <span className="tracking-widest text-white/80 text-[10px]">
          ATHENA.NOTES
        </span>
        <span className="text-[10px] text-green-400">✓ SAVED</span>
      </div>
      <div className="flex-1 px-4 py-3 space-y-2 leading-relaxed">
        <p className="text-white/90 font-bold">## Respiratory System</p>
        <p className="text-white/40 text-[9px]">&nbsp;</p>
        <p className="text-white/80">
          <span className="text-white font-bold">**Dyspnoea**</span> —
          unexpected awareness
        </p>
        <p className="text-white/80">
          of breathing. <span className="text-[#ea580c]">[1]</span>
        </p>
        <p className="text-white/40 text-[9px]">&nbsp;</p>
        <p className="text-white/60">• MRC Grade 1-5 scale</p>
        <p className="text-white/60">• Cardiac vs Respiratory origin</p>
        <p className="text-white/60">• Key distinguishing features...</p>
        <p className="text-white/40 text-[9px]">&nbsp;</p>
        <div className="border-t border-white/10 pt-2">
          <p className="text-[9px] text-white/40">
            SOURCE: respiratory.pdf · pg.4{" "}
            <span className="text-[#ea580c]">[1]</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function WireframePracticeTest() {
  return (
    <div
      className="font-mono text-[11px] bg-[#0a0a0a] text-white w-full h-full flex flex-col border border-white/20"
      style={{ minHeight: 340 }}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/20 bg-[#111]">
        <span className="tracking-widest text-white/80 text-[10px]">
          ATHENA.TEST
        </span>
        <span className="text-[10px] text-white/50">Q 3 OF 12</span>
      </div>
      <div className="flex-1 px-4 py-3 flex flex-col gap-3">
        <p className="text-white/90 leading-snug">
          A 65-year-old presents with
          <br />
          orthopnoea and PND. Most likely
          <br />
          diagnosis?
        </p>
        <div className="border-t border-white/10" />
        <div className="space-y-2">
          {[
            { letter: "A", label: "Asthma", selected: false },
            {
              letter: "B",
              label: "Cardiac failure",
              selected: true,
              cite: "[1]",
            },
            { letter: "C", label: "COPD", selected: false },
            { letter: "D", label: "Pulmonary embolism", selected: false },
          ].map(({ letter, label, selected, cite }) => (
            <div
              key={letter}
              className={`flex items-center justify-between px-2 py-1.5 border ${selected ? "border-[#ea580c] bg-[#ea580c]/10" : "border-white/10"}`}
            >
              <span
                className={`flex items-center gap-2 ${selected ? "text-white" : "text-white/50"}`}
              >
                <span>{selected ? "●" : "○"}</span>
                <span>
                  {letter}. {label}
                </span>
              </span>
              {cite && (
                <span className="text-[9px] text-[#ea580c]">← {cite}</span>
              )}
            </div>
          ))}
        </div>
        <div className="mt-auto pt-2 border-t border-white/10 flex items-center gap-3">
          <span className="text-[9px] text-white/50">SCORE: 2/2</span>
          <div className="flex-1 flex gap-0.5">
            {[1, 1, 1, 1, 0, 0, 0, 0].map((filled, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 ${filled ? "bg-[#ea580c]" : "bg-white/10"}`}
              />
            ))}
          </div>
          <span className="text-[9px] text-white/60 font-bold">67%</span>
        </div>
      </div>
    </div>
  );
}

function WireframeMindMap() {
  return (
    <div
      className="font-mono text-[11px] bg-[#0a0a0a] text-white w-full h-full flex flex-col border border-white/20"
      style={{ minHeight: 340 }}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/20 bg-[#111]">
        <span className="tracking-widest text-white/80 text-[10px]">
          ATHENA.MINDMAP
        </span>
        <span className="text-[10px] text-white/50">AUTO-GEN</span>
      </div>
      <div className="flex-1 relative p-4 overflow-hidden">
        {/* SVG mind map sketch */}
        <svg className="w-full h-full" viewBox="0 0 320 240" fill="none">
          {/* center node */}
          <rect
            x="110"
            y="100"
            width="100"
            height="28"
            rx="2"
            fill="#1a1a1a"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1"
          />
          <text
            x="160"
            y="119"
            textAnchor="middle"
            fill="rgba(255,255,255,0.9)"
            fontSize="9"
            fontFamily="monospace"
          >
            Respiratory
          </text>
          {/* branches */}
          {[
            { x: 20, y: 50, label: "Dyspnoea" },
            { x: 240, y: 50, label: "Causes" },
            { x: 20, y: 160, label: "MRC Grade" },
            { x: 240, y: 160, label: "Diagnosis" },
          ].map(({ x, y, label }) => (
            <g key={label}>
              <line
                x1="160"
                y1="114"
                x2={x + 50}
                y2={y + 12}
                stroke="rgba(234,88,12,0.5)"
                strokeWidth="1"
              />
              <rect
                x={x}
                y={y}
                width="100"
                height="24"
                rx="2"
                fill="#111"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="1"
              />
              <text
                x={x + 50}
                y={y + 15}
                textAnchor="middle"
                fill="rgba(255,255,255,0.6)"
                fontSize="8"
                fontFamily="monospace"
              >
                {label}
              </text>
            </g>
          ))}
          {/* leaf nodes */}
          <rect
            x="0"
            y="30"
            width="70"
            height="18"
            rx="2"
            fill="#0d0d0d"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />
          <text
            x="35"
            y="42"
            textAnchor="middle"
            fill="rgba(255,255,255,0.35)"
            fontSize="7"
            fontFamily="monospace"
          >
            Awareness
          </text>
          <line
            x1="20"
            y1="60"
            x2="35"
            y2="48"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />
        </svg>
        {/* labels */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
          <span className="text-[9px] text-white/30">respiratory.pdf</span>
          <span className="ml-auto text-[9px] border border-white/10 px-2 py-0.5 text-white/40">
            Export ↗
          </span>
        </div>
      </div>
    </div>
  );
}

function WireframeTutor() {
  return (
    <div
      className="font-mono text-[11px] bg-[#0a0a0a] text-white w-full h-full flex flex-col border border-white/20"
      style={{ minHeight: 340 }}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/20 bg-[#111]">
        <span className="tracking-widest text-white/80 text-[10px]">
          ATHENA.TUTOR
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-green-400">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          SESSION ACTIVE
        </span>
      </div>
      <div className="flex-1 flex flex-col gap-3 px-4 py-3">
        {/* AI message */}
        <div className="flex items-start gap-2">
          <div className="w-6 h-6 bg-[#ea580c]/20 border border-[#ea580c]/40 flex items-center justify-center flex-shrink-0 text-[8px] text-[#ea580c]">
            AI
          </div>
          <div className="bg-[#111] border border-white/10 px-2.5 py-2 text-white/80 leading-snug max-w-[85%]">
            Let&apos;s look at <span className="text-[#ea580c]">dyspnoea</span>.
            It&apos;s the unexpected
            <br />
            awareness of breathing — page 4 of your PDF.
            <br />
            <span className="text-white/40 text-[9px] mt-1 block">
              pg. 4 · respiratory.pdf
            </span>
          </div>
        </div>
        {/* user message */}
        <div className="flex items-start gap-2 flex-row-reverse">
          <div className="w-6 h-6 bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0 text-[8px] text-white/50">
            ME
          </div>
          <div className="bg-[#181818] border border-white/10 px-2.5 py-2 text-white/70 max-w-[85%]">
            What&apos;s the difference between cardiac
            <br />
            and respiratory dyspnoea?
          </div>
        </div>
        {/* AI typing */}
        <div className="flex items-start gap-2">
          <div className="w-6 h-6 bg-[#ea580c]/20 border border-[#ea580c]/40 flex items-center justify-center flex-shrink-0 text-[8px] text-[#ea580c]">
            AI
          </div>
          <div className="bg-[#111] border border-white/10 px-2.5 py-2">
            <span className="inline-flex gap-1 items-center">
              <span
                className="w-1 h-1 bg-white/40 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="w-1 h-1 bg-white/40 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="w-1 h-1 bg-white/40 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </span>
          </div>
        </div>
        {/* progress bar */}
        <div className="mt-auto border-t border-white/10 pt-2 flex items-center gap-2">
          <span className="text-[9px] text-white/40">pg. 4 / 24</span>
          <div className="flex-1 bg-white/10 h-1">
            <div className="bg-[#ea580c] h-full" style={{ width: "17%" }} />
          </div>
          <span className="text-[9px] text-white/40">17%</span>
        </div>
      </div>
    </div>
  );
}

const WIREFRAMES: Record<string, React.FC> = {
  studio: WireframeStudio,
  flashcards: WireframeFlashcards,
  notes: WireframeNotes,
  "practice-test": WireframePracticeTest,
  mindmap: WireframeMindMap,
  track: WireframeTutor,
};

export function FeatureDemo() {
  const [active, setActive] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const feature = features[active];

  return (
    <section className="border-t-2 border-foreground">
      {/* Section header */}
      <div className="flex items-center justify-between px-4 lg:px-8 py-3 border-b-2 border-foreground">
        <span className="text-[10px] font-mono tracking-[0.2em] text-muted-foreground">
          {"// SECTION: FEATURE_DEMO"}
        </span>
        <span className="text-[10px] font-mono tracking-[0.2em] text-muted-foreground uppercase">
          Content Studio
        </span>
      </div>

      <div className="px-4 lg:px-8 pt-10 pb-4">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: entrance }}
          className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#ea580c] mb-3"
        >
          Formats
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.6, ease: entrance }}
          className="text-3xl lg:text-5xl font-mono font-bold uppercase leading-[1.05] tracking-tight mb-8"
        >
          Everything you need
          <br />
          <span className="text-[#ea580c]">in one place.</span>
        </motion.h2>
      </div>

      {/* Tab pills */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.5, ease: entrance }}
        className="flex items-center gap-0 px-4 lg:px-8 overflow-x-auto scrollbar-none border-b-2 border-foreground"
      >
        {features.map((f, i) => (
          <button
            key={f.id}
            onClick={() => setActive(i)}
            className={`relative flex-shrink-0 px-4 py-3 text-[10px] font-mono tracking-[0.15em] uppercase transition-colors duration-150 border-r-2 border-foreground last:border-r-0 ${
              active === i
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
            }`}
          >
            {f.label}
            {active === i && (
              <motion.span
                layoutId="tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#ea580c]"
                transition={{ duration: 0.2 }}
              />
            )}
          </button>
        ))}
      </motion.div>

      {/* Content area */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] border-b-2 border-foreground">
        {/* Left: text */}
        <AnimatePresence mode="wait">
          <motion.div
            key={feature.id + "-text"}
            initial={prefersReducedMotion ? false : { opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={prefersReducedMotion ? {} : { opacity: 0, x: -8 }}
            transition={{ duration: 0.3, ease: entrance }}
            className="flex flex-col gap-6 p-6 lg:p-10 border-b-2 lg:border-b-0 lg:border-r-2 border-foreground"
          >
            <span className="text-[10px] font-mono tracking-[0.2em] text-[#ea580c] uppercase">
              {feature.tag}
            </span>

            <h3 className="text-xl lg:text-2xl font-mono font-bold uppercase leading-tight whitespace-pre-line">
              {feature.title}
            </h3>

            <p className="text-xs font-mono text-muted-foreground leading-relaxed">
              {feature.description}
            </p>

            {/* Spec list */}
            <ul className="flex flex-col gap-1.5">
              {feature.specs.map((spec) => (
                <li key={spec} className="flex items-center gap-2">
                  <span className="h-1 w-1 bg-[#ea580c] flex-shrink-0" />
                  <span className="text-[10px] font-mono tracking-[0.15em] text-muted-foreground uppercase">
                    {spec}
                  </span>
                </li>
              ))}
            </ul>

            <button className="group relative overflow-hidden self-start px-5 py-2.5 border-2 border-foreground text-[10px] font-mono tracking-[0.2em] uppercase transition-colors duration-300">
              <span className="absolute inset-0 bg-foreground translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
              <span className="relative z-10 group-hover:text-background transition-colors duration-300">
                GET STARTED FREE
              </span>
            </button>
          </motion.div>
        </AnimatePresence>

        {/* Right: wireframe mockup */}
        <AnimatePresence mode="wait">
          <motion.div
            key={feature.id + "-mockup"}
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={prefersReducedMotion ? {} : { opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.35, ease: entrance }}
            className="relative flex flex-col"
          >
            {/* Wireframe area */}
            <div
              className="relative flex-1 bg-[#0a0a0a] overflow-hidden"
              style={{ minHeight: "340px" }}
            >
              {/* Corner brackets */}
              <span className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-white/20 pointer-events-none z-10" />
              <span className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-white/20 pointer-events-none z-10" />
              <span className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-white/20 pointer-events-none z-10" />
              <span className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-white/20 pointer-events-none z-10" />

              <div className="p-5 h-full">
                {(() => {
                  const Mockup = WIREFRAMES[feature.id] ?? WireframeStudio;
                  return <Mockup />;
                })()}
              </div>
            </div>

            {/* Bottom label strip */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t-2 border-foreground">
              <span className="text-[10px] font-mono tracking-[0.15em] text-muted-foreground uppercase">
                ATHENA / {feature.label}
              </span>
              <a
                href="https://athena.cards"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-mono tracking-[0.15em] text-[#ea580c] uppercase hover:underline"
              >
                → TRY LIVE DEMO
              </a>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

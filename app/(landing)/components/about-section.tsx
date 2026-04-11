"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

const entrance = [0.16, 1, 0.3, 1] as const;

/* ΓöÇΓöÇ animated number counter ΓöÇΓöÇ */
function AnimatedCounter({
  value,
  suffix = "",
  duration = 1200,
}: {
  value: number;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (!inView) return;
    let frameId = 0;
    if (prefersReduced) {
      frameId = requestAnimationFrame(() => setCount(value));
      return;
    }
    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, [inView, value, duration, prefersReduced]);

  return (
    <span ref={ref} style={{ fontVariantNumeric: "tabular-nums" }}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ΓöÇΓöÇ scramble text reveal ΓöÇΓöÇ */
function ScrambleText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const [display, setDisplay] = useState(text);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_./:";

  useEffect(() => {
    if (!inView) return;
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplay(
        text
          .split("")
          .map((char, i) => {
            if (char === " ") return " ";
            if (i < iteration) return text[i];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join(""),
      );
      iteration += 0.5;
      if (iteration >= text.length) {
        setDisplay(text);
        clearInterval(interval);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [inView, text]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}

/* ΓöÇΓöÇ blinking cursor ΓöÇΓöÇ */
function BlinkDot() {
  return <span className="inline-block h-2 w-2 bg-[#ea580c] animate-blink" />;
}

/* ΓöÇΓöÇ notebooks created today counter ΓöÇΓöÇ */
function NotebooksCounter() {
  const [count, setCount] = useState(4821);

  useEffect(() => {
    const interval = setInterval(() => setCount((c) => c + 1), 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className="font-mono text-[#ea580c]"
      style={{ fontVariantNumeric: "tabular-nums" }}
    >
      {count.toLocaleString()}
    </span>
  );
}

/* ΓöÇΓöÇ SVG notebook wireframe illustration ΓöÇΓöÇ */
function NotebookIllustration() {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-8">
      <svg
        viewBox="0 0 300 230"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        style={{ stroke: "rgba(255,255,255,0.7)" }}
        aria-label="Athena notebook UI wireframe showing source cards and AI chat"
        role="img"
      >
        {/* Outer notebook frame */}
        <rect x="1" y="1" width="298" height="228" strokeWidth="2" />

        {/* Chrome bar */}
        <line x1="1" y1="18" x2="299" y2="18" strokeWidth="1.5" />
        <circle
          cx="11"
          cy="10"
          r="2.5"
          fill="rgba(255,255,255,0.85)"
          strokeWidth="0"
        />
        <circle
          cx="20"
          cy="10"
          r="2.5"
          fill="rgba(255,255,255,0.85)"
          strokeWidth="0"
        />
        <circle cx="29" cy="10" r="2.5" strokeWidth="1" />
        <text
          x="215"
          y="13"
          fontSize="6"
          fontFamily="monospace"
          fill="rgba(255,255,255,0.85)"
          stroke="none"
          letterSpacing="2"
        >
          ATHENA.APP
        </text>

        {/* Left / right divider */}
        <line x1="100" y1="18" x2="100" y2="212" strokeWidth="1.5" />

        {/* LEFT PANEL label */}
        <text
          x="8"
          y="31"
          fontSize="5"
          fontFamily="monospace"
          fill="rgba(255,255,255,0.45)"
          stroke="none"
          letterSpacing="2"
          opacity="0.45"
        >
          SOURCES
        </text>

        {/* PDF card */}
        <rect x="6" y="36" width="86" height="38" strokeWidth="1.5" />
        <rect x="10" y="40" width="10" height="13" strokeWidth="1" />
        <text
          x="11"
          y="49"
          fontSize="4.5"
          fontFamily="monospace"
          fill="rgba(255,255,255,0.85)"
          stroke="none"
        >
          PDF
        </text>
        <line x1="24" y1="43" x2="88" y2="43" strokeWidth="1" opacity="0.25" />
        <line x1="24" y1="48" x2="88" y2="48" strokeWidth="1" opacity="0.25" />
        <line x1="24" y1="53" x2="75" y2="53" strokeWidth="1" opacity="0.25" />
        <text
          x="10"
          y="68"
          fontSize="4.5"
          fontFamily="monospace"
          fill="rgba(255,255,255,0.4)"
          stroke="none"
          opacity="0.4"
        >
          cardiology.pdf
        </text>

        {/* VIDEO card */}
        <rect x="6" y="82" width="86" height="38" strokeWidth="1.5" />
        <polygon points="10,87 10,100 22,93" fill="none" strokeWidth="1" />
        <line x1="27" y1="89" x2="88" y2="89" strokeWidth="1" opacity="0.25" />
        <line x1="27" y1="94" x2="88" y2="94" strokeWidth="1" opacity="0.25" />
        <line x1="27" y1="99" x2="78" y2="99" strokeWidth="1" opacity="0.25" />
        <text
          x="10"
          y="114"
          fontSize="4.5"
          fontFamily="monospace"
          fill="rgba(255,255,255,0.4)"
          stroke="none"
          opacity="0.4"
        >
          lecture.mp4
        </text>

        {/* WEB card */}
        <rect x="6" y="128" width="86" height="38" strokeWidth="1.5" />
        <circle cx="16" cy="140" r="7" strokeWidth="1" />
        <line
          x1="16"
          y1="133"
          x2="16"
          y2="147"
          strokeWidth="0.8"
          opacity="0.45"
        />
        <line
          x1="9"
          y1="140"
          x2="23"
          y2="140"
          strokeWidth="0.8"
          opacity="0.45"
        />
        <line
          x1="27"
          y1="136"
          x2="88"
          y2="136"
          strokeWidth="1"
          opacity="0.25"
        />
        <line
          x1="27"
          y1="141"
          x2="88"
          y2="141"
          strokeWidth="1"
          opacity="0.25"
        />
        <line
          x1="27"
          y1="146"
          x2="80"
          y2="146"
          strokeWidth="1"
          opacity="0.25"
        />
        <text
          x="10"
          y="160"
          fontSize="4.5"
          fontFamily="monospace"
          fill="rgba(255,255,255,0.4)"
          stroke="none"
          opacity="0.4"
        >
          pubmed.ncbi.nlm
        </text>

        {/* RIGHT PANEL label */}
        <text
          x="108"
          y="31"
          fontSize="5"
          fontFamily="monospace"
          fill="rgba(255,255,255,0.45)"
          stroke="none"
          letterSpacing="2"
          opacity="0.45"
        >
          CHAT
        </text>

        {/* User question bubble ΓÇö orange border */}
        <rect
          x="136"
          y="36"
          width="156"
          height="32"
          strokeWidth="1.5"
          stroke="#ea580c"
        />
        <text
          x="143"
          y="49"
          fontSize="5.5"
          fontFamily="monospace"
          fill="rgba(255,255,255,0.85)"
          stroke="none"
        >
          What causes cardiac
        </text>
        <text
          x="143"
          y="60"
          fontSize="5.5"
          fontFamily="monospace"
          fill="rgba(255,255,255,0.85)"
          stroke="none"
        >
          dyspnoea?
        </text>
        <text
          x="258"
          y="35"
          fontSize="4"
          fontFamily="monospace"
          fill="rgba(255,255,255,0.35)"
          stroke="none"
          opacity="0.35"
        >
          USER
        </text>

        {/* Answer block */}
        <rect x="104" y="78" width="188" height="88" strokeWidth="1.5" />
        <text
          x="112"
          y="91"
          fontSize="5"
          fontFamily="monospace"
          fill="rgba(255,255,255,0.65)"
          stroke="none"
          opacity="0.65"
        >
          Cardiac dyspnoea arises from
        </text>
        <text
          x="112"
          y="101"
          fontSize="5"
          fontFamily="monospace"
          fill="rgba(255,255,255,0.65)"
          stroke="none"
          opacity="0.65"
        >
          elevated pulmonary venous
        </text>
        <text
          x="112"
          y="111"
          fontSize="5"
          fontFamily="monospace"
          fill="rgba(255,255,255,0.65)"
          stroke="none"
          opacity="0.65"
        >
          pressure, causing fluid
        </text>
        <text
          x="112"
          y="121"
          fontSize="5"
          fontFamily="monospace"
          fill="rgba(255,255,255,0.65)"
          stroke="none"
          opacity="0.65"
        >
          accumulation in lung tissue.
        </text>

        {/* Citation badges */}
        <rect
          x="112"
          y="130"
          width="15"
          height="12"
          strokeWidth="1"
          stroke="#ea580c"
        />
        <text
          x="117"
          y="139"
          fontSize="6"
          fontFamily="monospace"
          fill="#ea580c"
          stroke="none"
        >
          1
        </text>
        <rect
          x="132"
          y="130"
          width="15"
          height="12"
          strokeWidth="1"
          stroke="#ea580c"
        />
        <text
          x="137"
          y="139"
          fontSize="6"
          fontFamily="monospace"
          fill="#ea580c"
          stroke="none"
        >
          2
        </text>
        <text
          x="152"
          y="139"
          fontSize="4.5"
          fontFamily="monospace"
          fill="rgba(255,255,255,0.35)"
          stroke="none"
          opacity="0.35"
        >
          CITED SOURCES
        </text>

        {/* Bottom bar */}
        <line x1="1" y1="212" x2="299" y2="212" strokeWidth="1.5" />
        <text
          x="8"
          y="225"
          fontSize="5.5"
          fontFamily="monospace"
          fill="rgba(255,255,255,0.85)"
          stroke="none"
          letterSpacing="1.5"
        >
          ATHENA STUDIO
        </text>
        <circle cx="250" cy="221" r="3" fill="#ea580c" stroke="none" />
        <text
          x="257"
          y="225"
          fontSize="5.5"
          fontFamily="monospace"
          fill="#ea580c"
          stroke="none"
        >
          LIVE
        </text>
      </svg>
    </div>
  );
}

/* ΓöÇΓöÇ stat block with animated counter ΓöÇΓöÇ */
const STATS = [
  { label: "LEARNERS", value: 300000, display: "300K+", suffix: "+" },
  { label: "COUNTRIES", value: 106, display: "106+", suffix: "+" },
  { label: "LANGUAGES", value: 32, display: "32+", suffix: "+" },
  { label: "AI_MODELS", value: 5, display: "5+", suffix: "+" },
];

function StatBlock({
  label,
  value,
  suffix,
  index,
}: {
  label: string;
  value: number;
  suffix: string;
  index: number;
}) {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      initial={
        prefersReduced ? false : { opacity: 0, y: 16, filter: "blur(4px)" }
      }
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ delay: 0.15 + index * 0.08, duration: 0.5, ease: entrance }}
      className="flex flex-col gap-1 border-2 border-foreground px-4 py-3"
    >
      <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
        {label}
      </span>
      <span className="text-xl lg:text-2xl font-mono font-bold tracking-tight">
        {value >= 1000 ? (
          <ScrambleText
            text={value >= 300000 ? "300K+" : `${value}${suffix}`}
          />
        ) : (
          <AnimatedCounter value={value} suffix={suffix} />
        )}
      </span>
    </motion.div>
  );
}

/* ΓöÇΓöÇ main about section ΓöÇΓöÇ */
export function AboutSection() {
  return (
    <section className="w-full px-6 py-20 lg:px-12">
      {/* Section label */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: entrance }}
        className="flex items-center gap-4 mb-8"
      >
        <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
          {"// SECTION: ABOUT_ATHENA"}
        </span>
        <div className="flex-1 border-t border-border" />
        <BlinkDot />
        <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
          005
        </span>
      </motion.div>

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-0 border-2 border-foreground">
        {/* Left: Image */}
        <motion.div
          initial={{ opacity: 0, x: -30, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: entrance }}
          className="relative w-full lg:w-1/2 min-h-75 lg:min-h-125 border-b-2 lg:border-b-0 lg:border-r-2 border-foreground overflow-hidden bg-[#111]"
        >
          {/* Illustration label overlay */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2 bg-black/80 backdrop-blur-sm">
            <span className="text-[10px] tracking-[0.2em] uppercase text-white/60 font-mono">
              RENDER: ATHENA_NOTEBOOK.UI
            </span>
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#ea580c] font-mono">
              LIVE
            </span>
          </div>

          {/* SVG wireframe notebook illustration */}
          <NotebookIllustration />

          {/* Bottom label */}
          <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2 bg-black/80 backdrop-blur-sm">
            <span className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-mono">
              ATHENA.STUDIO
            </span>
            <span className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-mono">
              NOTEBOOK.v1
            </span>
          </div>
        </motion.div>

        {/* Right: Content */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.1, ease: entrance }}
          className="flex flex-col w-full lg:w-1/2"
        >
          {/* Header bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b-2 border-foreground">
            <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
              MANIFEST.md
            </span>
            <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
              v3.1.0
            </span>
          </div>

          {/* Content body */}
          <div className="flex-1 flex flex-col justify-between px-5 py-6 lg:py-8">
            <div className="flex flex-col gap-6">
              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: 0.2, ease: entrance }}
                className="text-2xl lg:text-3xl font-mono font-bold tracking-tight uppercase text-balance"
              >
                Infrastructure built for
                <br />
                <span className="text-[#ea580c]">deep understanding</span>
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ delay: 0.3, duration: 0.5, ease: entrance }}
                className="flex flex-col gap-4"
              >
                <p className="text-xs lg:text-sm font-mono text-muted-foreground leading-relaxed">
                  Two medical students. Hundreds of pages of dense material. No
                  good tools to actually retain it. So we built AthenaΓÇöan AI
                  workspace that turns any source into something you can
                  actually understand and remember.
                </p>
                <p className="text-xs lg:text-sm font-mono text-muted-foreground leading-relaxed">
                  Used by 300,000+ learners, educators, researchers, and
                  professionals in 106+ countries.
                </p>
              </motion.div>

              {/* Uptime line */}
              <motion.div
                initial={{ opacity: 0, scaleX: 0.8 }}
                whileInView={{ opacity: 1, scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5, ease: entrance }}
                style={{ transformOrigin: "left" }}
                className="flex items-center gap-3 py-3 border-t-2 border-b-2 border-foreground"
              >
                <span className="h-1.5 w-1.5 bg-[#ea580c]" />
                <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
                  NOTEBOOKS CREATED TODAY:
                </span>
                <NotebooksCounter />
              </motion.div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-0 mt-6">
              {STATS.map((stat, i) => (
                <StatBlock
                  key={stat.label}
                  label={stat.label}
                  value={stat.value}
                  suffix={stat.suffix}
                  index={i}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

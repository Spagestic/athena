"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ─── types ─────────────────────────────────────────────────── */
type ConnStatus = "idle" | "connecting" | "connected" | "tracking" | "error";
type Phase = "study" | "quiz" | "result";
type Quad = "tl" | "tr" | "bl" | "br";

interface GazePos {
  normX: number;
  normY: number;
}
interface QOption {
  quad: Quad;
  label: string;
  text: string;
  correct: boolean;
}
interface Question {
  id: number;
  q: string;
  options: QOption[];
}

/* ─── study content ─────────────────────────────────────────── */
const SECTIONS = [
  {
    id: "star",
    num: "01",
    title: "THE STAR METHOD",
    lines: [
      "The STAR method is the gold standard for behavioural interview responses. Recruiters at top firms explicitly look for this structure — without it, answers feel vague and hard to evaluate.",
      "SITUATION — Set the scene. Briefly describe context: team size, company stage, timeline. One to two sentences maximum.",
      "TASK — Define your specific responsibility. What were you personally accountable for? Distinguish your role from the team.",
      "ACTION — Describe the concrete steps you took. Use active verbs. Avoid 'we did...' — focus on what you individually did.",
      "RESULT — Quantify the outcome. Numbers, percentages, time saved, revenue generated. A result without numbers is a missed opportunity.",
    ],
  },
  {
    id: "eyecontact",
    num: "02",
    title: "EYE CONTACT & CAMERA PRESENCE",
    lines: [
      "Eye contact signals confidence, honesty, and genuine engagement. In video interviews (now the norm), look at the camera lens — NOT the interviewer's face on screen.",
      "Hold natural eye contact: roughly 70% direct attention, 30% natural breaks. Unblinking sustained staring reads as intensity or anxiety — neither is desirable.",
      "In panel interviews, distribute attention across all interviewers when answering. Start and end looking at the person who asked the question.",
      "Studies show candidates who maintain appropriate eye contact are perceived as 34% more credible (Journal of Business Psychology, 2022).",
    ],
  },
  {
    id: "body",
    num: "03",
    title: "NON-VERBAL COMMUNICATION",
    lines: [
      "55% of communication is non-verbal (Mehrabian, 1971). Your posture, gestures, and micro-expressions constantly transmit signals — even when you are silent.",
      "POSTURE: Sit upright, slightly forward. Leaning back signals disengagement. Feet flat, hands visible on the desk or table.",
      "GESTURES: Controlled hand movements reinforce key points. Avoid self-touching (hair, face, neck) — classic anxiety tells.",
      "EXPRESSIONS: Mirror the emotional register of the conversation. A slight nod while listening, a natural smile when describing achievements.",
    ],
  },
  {
    id: "questions",
    num: "04",
    title: "HANDLING TOUGH QUESTIONS",
    lines: [
      "Employment gap? Be direct, brief, and pivot: 'I used that time to [skill/project]. That experience directly strengthened my ability to...'",
      "The weakness question tests self-awareness. Choose a real weakness you are actively working on. Do not say 'I work too hard.'",
      "Salary expectations: research your market range first. Provide a range rather than a single number. Anchor toward the upper end.",
      "Do you have questions for us? Always yes. Prepare 3-5 thoughtful questions. Avoid asking about salary before receiving an offer.",
    ],
  },
];

const QUIZ: Question[] = [
  {
    id: 1,
    q: "In STAR, what does the letter 'A' stand for?",
    options: [
      {
        quad: "tl",
        label: "A",
        text: "Ambition\n— your goal entering the role",
        correct: false,
      },
      {
        quad: "tr",
        label: "B",
        text: "Action\n— the specific steps you personally took",
        correct: true,
      },
      {
        quad: "bl",
        label: "C",
        text: "Analysis\n— your assessment of the situation",
        correct: false,
      },
      {
        quad: "br",
        label: "D",
        text: "Achievement\n— your final result",
        correct: false,
      },
    ],
  },
  {
    id: 2,
    q: "Where should you look during a VIDEO interview?",
    options: [
      {
        quad: "tl",
        label: "A",
        text: "At the interviewer's face on screen",
        correct: false,
      },
      {
        quad: "tr",
        label: "B",
        text: "At the camera lens itself",
        correct: true,
      },
      {
        quad: "bl",
        label: "C",
        text: "Slightly down at your notes",
        correct: false,
      },
      {
        quad: "br",
        label: "D",
        text: "At your own face in the preview",
        correct: false,
      },
    ],
  },
  {
    id: 3,
    q: "What percentage of communication is non-verbal (Mehrabian)?",
    options: [
      {
        quad: "tl",
        label: "A",
        text: "38%\n— vocal tone only",
        correct: false,
      },
      { quad: "tr", label: "B", text: "7%\n— words alone", correct: false },
      {
        quad: "bl",
        label: "C",
        text: "55%\n— body language and expressions",
        correct: true,
      },
      { quad: "br", label: "D", text: "71%\n— full combined", correct: false },
    ],
  },
];

const DWELL_MS = 1800;
const READ_MS = 3500;

const STATUS_LABEL: Record<ConnStatus, string> = {
  idle: "NOT CONNECTED",
  connecting: "CONNECTING...",
  connected: "CONNECTED",
  tracking: "TRACKING",
  error: "ERROR",
};

const STATUS_COLOR: Record<ConnStatus, string> = {
  idle: "text-muted-foreground",
  connecting: "text-yellow-500",
  connected: "text-blue-400",
  tracking: "text-green-400",
  error: "text-red-500",
};

export default function EyeTraxStudy() {
  const vidRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cnvRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const dwellQuadRef = useRef<Quad | null>(null);
  const dwellStartRef = useRef<number | null>(null);
  const dwellRafRef = useRef<number>(0);
  const sectionTimeoutRef = useRef<
    Record<string, ReturnType<typeof setTimeout> | null>
  >({});
  const framesRef = useRef(0);
  const gazeHitsRef = useRef(0);

  const [status, setStatus] = useState<ConnStatus>("idle");
  const [gaze, setGaze] = useState<GazePos | null>(null);
  const [flipX, setFlipX] = useState(false);
  const [readSet, setReadSet] = useState<Set<string>>(new Set());
  const [gazeSection, setGazeSection] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("study");
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<Record<number, Quad>>({});
  const [dwellQuad, setDwellQuad] = useState<Quad | null>(null);
  const [dwellPct, setDwellPct] = useState(0);
  const [frames, setFrames] = useState(0);
  const [gazeHits, setGazeHits] = useState(0);

  const startCamera = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        width: { ideal: 640 },
        height: { ideal: 480 },
      },
      audio: false,
    });
    streamRef.current = stream;
    if (vidRef.current) {
      vidRef.current.srcObject = stream;
      await vidRef.current.play();
    }
  }, []);

  const startFrames = useCallback(() => {
    if (!cnvRef.current) {
      cnvRef.current = document.createElement("canvas");
      ctxRef.current = cnvRef.current.getContext("2d");
    }
    timerRef.current = setInterval(() => {
      const v = vidRef.current,
        ws = wsRef.current;
      const cnv = cnvRef.current,
        ctx = ctxRef.current;
      if (!v || !ws || ws.readyState !== WebSocket.OPEN || !cnv || !ctx) return;
      const w = v.videoWidth,
        h = v.videoHeight;
      if (!w || !h) return;
      cnv.width = w;
      cnv.height = h;
      ctx.drawImage(v, 0, 0);
      const b64 = cnv.toDataURL("image/jpeg", 0.6).split(",")[1];
      ws.send(JSON.stringify({ type: "frame", data: b64 }));
      framesRef.current++;
      setFrames(framesRef.current);
    }, 100);
  }, []);

  const stopFrames = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const connect = useCallback(async () => {
    try {
      await startCamera();
    } catch {
      setStatus("error");
      return;
    }
    setStatus("connecting");
    const ws = new WebSocket("ws://localhost:8766");
    wsRef.current = ws;
    ws.onopen = () => {
      setStatus("connected");
      startFrames();
    };
    ws.onmessage = (e) => {
      try {
        const d = JSON.parse(e.data as string);
        if (d.type === "gaze") {
          setStatus("tracking");
          gazeHitsRef.current++;
          setGazeHits(gazeHitsRef.current);
          setGaze({ normX: d.x, normY: d.y });
        }
      } catch {
        /**/
      }
    };
    ws.onclose = () => {
      setStatus("idle");
      stopFrames();
      setGaze(null);
    };
    ws.onerror = () => setStatus("error");
  }, [startCamera, startFrames, stopFrames]);

  const disconnect = useCallback(() => {
    stopFrames();
    wsRef.current?.close();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (vidRef.current) vidRef.current.srcObject = null;
    streamRef.current = null;
    setGaze(null);
    setStatus("idle");
  }, [stopFrames]);

  useEffect(
    () => () => {
      stopFrames();
      wsRef.current?.close();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    },
    [stopFrames],
  );

  const dispX = gaze ? (flipX ? 1 - gaze.normX : gaze.normX) : null;
  const dispY = gaze ? gaze.normY : null;

  useEffect(() => {
    if (dispX === null || dispY === null || phase !== "study") return;
    const gx = dispX * window.innerWidth;
    const gy = dispY * window.innerHeight;
    let hit: string | null = null;
    for (const [id, el] of Object.entries(sectionRefs.current)) {
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (gx >= r.left && gx <= r.right && gy >= r.top && gy <= r.bottom) {
        hit = id;
        break;
      }
    }
    setGazeSection(hit);
    if (hit && !sectionTimeoutRef.current[hit]) {
      sectionTimeoutRef.current[hit] = setTimeout(() => {
        setReadSet((prev) => new Set([...prev, hit!]));
        sectionTimeoutRef.current[hit!] = null;
      }, READ_MS);
    }
  }, [dispX, dispY, phase]);

  useEffect(() => {
    if (phase !== "quiz" || dispX === null || dispY === null) return;
    const quad: Quad =
      dispX < 0.5 ? (dispY < 0.5 ? "tl" : "bl") : dispY < 0.5 ? "tr" : "br";
    if (quad !== dwellQuadRef.current) {
      cancelAnimationFrame(dwellRafRef.current);
      dwellQuadRef.current = quad;
      dwellStartRef.current = performance.now();
      setDwellQuad(quad);
      setDwellPct(0);
    }
    const tick = () => {
      const elapsed =
        performance.now() - (dwellStartRef.current ?? performance.now());
      const pct = Math.min(elapsed / DWELL_MS, 1);
      setDwellPct(pct);
      if (pct < 1) {
        dwellRafRef.current = requestAnimationFrame(tick);
      } else {
        const q = QUIZ[qIndex];
        const sel = q.options.find((o) => o.quad === dwellQuadRef.current);
        if (sel) {
          setAnswered((prev) => ({ ...prev, [q.id]: dwellQuadRef.current! }));
          if (sel.correct) setScore((s) => s + 1);
          setTimeout(() => {
            if (qIndex < QUIZ.length - 1) {
              setQIndex((qi) => qi + 1);
              dwellQuadRef.current = null;
              dwellStartRef.current = null;
              setDwellQuad(null);
              setDwellPct(0);
            } else {
              setPhase("result");
            }
          }, 600);
        }
      }
    };
    dwellRafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(dwellRafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispX, dispY, phase, qIndex]);

  const isConnected = status !== "idle" && status !== "error";
  const readCount = readSet.size;
  const readPct = Math.round((readCount / SECTIONS.length) * 100);

  return (
    <div className="min-h-screen bg-background text-foreground font-mono select-none">
      {dispX !== null && dispY !== null && (
        <div
          className="pointer-events-none fixed z-[9999]"
          style={{
            left: `${dispX * 100}vw`,
            top: `${dispY * 100}vh`,
            transform: "translate(-50%,-50%)",
          }}
        >
          <div
            className="w-6 h-6 rounded-full border-2 border-white opacity-90"
            style={{
              background: "rgba(34,197,94,0.55)",
              boxShadow: "0 0 14px 5px rgba(34,197,94,0.6)",
            }}
          />
        </div>
      )}

      <header className="border-b-2 border-foreground px-6 py-3 flex items-center justify-between bg-background z-50 sticky top-0">
        <div className="flex items-center gap-4">
          <span className="text-[11px] tracking-[0.3em] uppercase font-bold text-primary">
            Athena
          </span>
          <span className="text-muted-foreground text-[11px]">/</span>
          <span className="text-[11px] tracking-widest uppercase">
            Attention Tracker
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setFlipX((f) => !f)}
            className={`text-[10px] px-2 py-1 border uppercase tracking-widest transition-colors ${flipX ? "border-primary text-primary" : "border-muted-foreground text-muted-foreground"}`}
          >
            FLIP-X {flipX ? "ON" : "OFF"}
          </button>
          <span
            className={`text-[11px] font-bold tracking-widest ${STATUS_COLOR[status]}`}
          >
            {status === "tracking" ? "● " : ""}
            {STATUS_LABEL[status]}
          </span>
          <button
            onClick={isConnected ? disconnect : connect}
            className="text-[11px] font-bold uppercase tracking-widest border-2 border-foreground px-3 py-1.5 hover:bg-foreground hover:text-background transition-colors"
            style={{ boxShadow: "3px 3px 0 0 var(--foreground)" }}
          >
            {isConnected ? "DISCONNECT" : "CONNECT EYETRAX"}
          </button>
        </div>
      </header>

      {phase === "study" && (
        <div className="flex gap-0 min-h-[calc(100vh-57px)]">
          <main className="flex-1 p-8 space-y-10 overflow-y-auto border-r-2 border-foreground">
            <div className="max-w-2xl">
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] mb-1">
                Study Module — Interview Fundamentals
              </p>
              <h1 className="text-2xl font-bold tracking-tight">
                Read the material below.
              </h1>
              <p className="text-[12px] text-muted-foreground mt-2">
                EyeTrax is tracking your gaze. Sections turn green once you have
                held your gaze on them. Read all 4 to unlock the quiz.
              </p>
            </div>
            {SECTIONS.map((s) => {
              const isRead = readSet.has(s.id);
              const isActive = gazeSection === s.id;
              return (
                <div
                  key={s.id}
                  ref={(el) => {
                    sectionRefs.current[s.id] = el;
                  }}
                  className="border-2 p-6 transition-all duration-200"
                  style={{
                    boxShadow: isRead
                      ? "4px 4px 0 0 #22c55e"
                      : isActive
                        ? "4px 4px 0 0 var(--primary)"
                        : "4px 4px 0 0 var(--foreground)",
                    borderColor: isRead
                      ? "#22c55e"
                      : isActive
                        ? "var(--primary)"
                        : "var(--foreground)",
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 border-2"
                        style={{
                          borderColor: isRead ? "#22c55e" : "var(--foreground)",
                          color: isRead ? "#22c55e" : "var(--foreground)",
                        }}
                      >
                        {s.num}
                      </span>
                      <h2 className="text-sm font-bold tracking-widest">
                        {s.title}
                      </h2>
                    </div>
                    {isRead && (
                      <span className="text-[10px] font-bold text-green-400 tracking-widest">
                        DONE
                      </span>
                    )}
                    {!isRead && isActive && (
                      <span className="text-[10px] text-primary tracking-widest animate-pulse">
                        READING...
                      </span>
                    )}
                  </div>
                  <div className="space-y-3">
                    {s.lines.map((line, i) => (
                      <p
                        key={i}
                        className="text-[13px] leading-relaxed text-muted-foreground"
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              );
            })}
          </main>

          <aside className="w-72 p-6 flex flex-col gap-6 bg-card sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto">
            <div>
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-2">
                Camera Feed
              </p>
              <div
                className="border-2 border-foreground overflow-hidden bg-black aspect-video relative"
                style={{ boxShadow: "3px 3px 0 0 var(--foreground)" }}
              >
                <video
                  ref={vidRef}
                  muted
                  playsInline
                  autoPlay
                  className="w-full h-full object-cover"
                  style={{ transform: "scaleX(-1)" }}
                />
                {!isConnected && (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-[10px] bg-black/80">
                    NOT CONNECTED
                  </div>
                )}
                {dispX !== null && dispY !== null && (
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      left: `${(1 - dispX) * 100}%`,
                      top: `${dispY * 100}%`,
                      transform: "translate(-50%,-50%)",
                    }}
                  >
                    <div
                      className="w-3 h-3 rounded-full border border-white"
                      style={{ background: "rgba(34,197,94,0.7)" }}
                    />
                  </div>
                )}
              </div>
              <div className="mt-1.5 flex justify-between text-[9px] text-muted-foreground">
                <span>FRAMES: {frames}</span>
                <span className="text-green-400">HITS: {gazeHits}</span>
              </div>
            </div>

            <div
              className="border-2 border-foreground p-4"
              style={{ boxShadow: "3px 3px 0 0 var(--foreground)" }}
            >
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-3">
                Reading Progress
              </p>
              <div className="flex items-end gap-2 mb-3">
                <span
                  className="text-3xl font-bold"
                  style={{
                    color: readPct === 100 ? "#22c55e" : "var(--primary)",
                  }}
                >
                  {readPct}%
                </span>
                <span className="text-[10px] text-muted-foreground mb-1">
                  {readCount}/{SECTIONS.length}
                </span>
              </div>
              <div className="h-2 border border-foreground bg-muted overflow-hidden">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${readPct}%`,
                    background: readPct === 100 ? "#22c55e" : "var(--primary)",
                  }}
                />
              </div>
              <div className="mt-3 space-y-1.5">
                {SECTIONS.map((s) => (
                  <div key={s.id} className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${readSet.has(s.id) ? "bg-green-400" : gazeSection === s.id ? "bg-primary animate-pulse" : "bg-muted-foreground/30"}`}
                    />
                    <span
                      className={`text-[9px] uppercase tracking-wider ${readSet.has(s.id) ? "text-green-400" : gazeSection === s.id ? "text-primary" : "text-muted-foreground"}`}
                    >
                      {s.num} {s.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto space-y-2">
              <button
                onClick={() => setPhase("quiz")}
                disabled={readCount < SECTIONS.length}
                className="w-full py-3 text-[11px] font-bold uppercase tracking-widest border-2 border-foreground transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={
                  readCount === SECTIONS.length
                    ? {
                        background: "var(--primary)",
                        color: "var(--primary-foreground)",
                        boxShadow: "4px 4px 0 0 var(--foreground)",
                      }
                    : {}
                }
              >
                {readCount < SECTIONS.length
                  ? `${SECTIONS.length - readCount} MORE TO READ`
                  : "START QUIZ"}
              </button>
              <button
                onClick={() => setPhase("quiz")}
                className="w-full py-1.5 text-[10px] text-muted-foreground uppercase tracking-widest border border-muted-foreground/30 hover:border-foreground transition-colors"
              >
                Skip to quiz (demo)
              </button>
            </div>
          </aside>
        </div>
      )}

      {phase === "quiz" && (
        <div className="fixed inset-0 top-[57px] grid grid-cols-2 grid-rows-2 bg-background z-10">
          <div className="absolute top-0 left-0 right-0 z-20 border-b-2 border-foreground bg-background px-8 py-4 flex flex-col items-center gap-1">
            <p className="text-[9px] text-muted-foreground uppercase tracking-widest">
              Question {qIndex + 1} of {QUIZ.length} — Look at your answer for{" "}
              {DWELL_MS / 1000}s to select
            </p>
            <p className="text-base font-bold tracking-tight text-center">
              {QUIZ[qIndex].q}
            </p>
          </div>
          {QUIZ[qIndex].options.map((opt) => {
            const isSelected = dwellQuad === opt.quad;
            const isAnswered = QUIZ[qIndex].id in answered;
            const wasChosen = answered[QUIZ[qIndex].id] === opt.quad;
            return (
              <div
                key={opt.quad}
                className="border-2 border-foreground flex flex-col items-center justify-center p-8 transition-all duration-150 relative"
                style={{
                  background: isAnswered
                    ? wasChosen
                      ? opt.correct
                        ? "rgba(34,197,94,0.12)"
                        : "rgba(239,68,68,0.12)"
                      : "transparent"
                    : isSelected
                      ? "rgba(234,88,12,0.07)"
                      : "transparent",
                  boxShadow: isSelected
                    ? "inset 0 0 0 3px var(--primary)"
                    : undefined,
                }}
              >
                <span
                  className="text-[10px] font-bold px-2 py-0.5 border-2 mb-4"
                  style={{
                    borderColor: isSelected
                      ? "var(--primary)"
                      : "var(--muted-foreground)",
                  }}
                >
                  {opt.label}
                </span>
                <p className="text-sm font-bold text-center tracking-wide whitespace-pre-line">
                  {opt.text}
                </p>
                {isSelected && !isAnswered && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-20 h-2 border border-foreground bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary transition-none"
                      style={{ width: `${dwellPct * 100}%` }}
                    />
                  </div>
                )}
                {isAnswered && wasChosen && (
                  <div
                    className={`absolute top-3 right-3 text-[10px] font-bold ${opt.correct ? "text-green-400" : "text-red-400"}`}
                  >
                    {opt.correct ? "CORRECT" : "WRONG"}
                  </div>
                )}
                {isAnswered && !wasChosen && opt.correct && (
                  <div className="absolute top-3 right-3 text-[10px] text-green-400/60">
                    CORRECT ANSWER
                  </div>
                )}
                <span className="absolute top-2 left-2 text-[9px] text-muted-foreground/30 uppercase">
                  {opt.quad}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {phase === "result" && (
        <div className="min-h-[calc(100vh-57px)] flex items-center justify-center p-8">
          <div
            className="border-2 border-foreground p-10 max-w-lg w-full text-center"
            style={{ boxShadow: "6px 6px 0 0 var(--foreground)" }}
          >
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] mb-6">
              Quiz Complete
            </p>
            <div
              className="text-7xl font-bold mb-2"
              style={{
                color:
                  score === QUIZ.length
                    ? "#22c55e"
                    : score >= QUIZ.length / 2
                      ? "var(--primary)"
                      : "#ef4444",
              }}
            >
              {score}/{QUIZ.length}
            </div>
            <p className="text-sm text-muted-foreground mb-8 tracking-wide">
              {score === QUIZ.length
                ? "PERFECT — You read carefully."
                : score >= QUIZ.length / 2
                  ? "GOOD — Review the missed sections."
                  : "NEEDS WORK — Go back and re-read."}
            </p>
            <div className="border-t-2 border-foreground pt-6 mb-8 text-left space-y-4">
              {QUIZ.map((q) => {
                const chosen = answered[q.id];
                const sel = q.options.find((o) => o.quad === chosen);
                const correct = sel?.correct ?? false;
                return (
                  <div key={q.id} className="space-y-1">
                    <p className="text-[11px] font-bold">{q.q}</p>
                    <p
                      className={`text-[11px] ${correct ? "text-green-400" : "text-red-400"}`}
                    >
                      {correct ? "CORRECT" : "WRONG"}:{" "}
                      {sel?.text.split("\n")[0] ?? "—"}
                    </p>
                    {!correct && (
                      <p className="text-[10px] text-muted-foreground">
                        Answer:{" "}
                        {q.options.find((o) => o.correct)?.text.split("\n")[0]}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="border-t-2 border-foreground pt-6 mb-8">
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-3">
                Sections Read
              </p>
              <div className="flex justify-center gap-2">
                {SECTIONS.map((s) => (
                  <div
                    key={s.id}
                    className={`text-[9px] px-2 py-0.5 border ${readSet.has(s.id) ? "border-green-400 text-green-400" : "border-muted-foreground/30 text-muted-foreground"}`}
                  >
                    {s.num}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setPhase("study");
                  setQIndex(0);
                  setScore(0);
                  setAnswered({});
                  setReadSet(new Set());
                  sectionTimeoutRef.current = {};
                  dwellQuadRef.current = null;
                  setDwellQuad(null);
                  setDwellPct(0);
                }}
                className="px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest border-2 border-foreground hover:bg-foreground hover:text-background transition-colors"
                style={{ boxShadow: "3px 3px 0 0 var(--foreground)" }}
              >
                RESTART
              </button>
              <button
                onClick={() => {
                  setPhase("quiz");
                  setQIndex(0);
                  setScore(0);
                  setAnswered({});
                  dwellQuadRef.current = null;
                  setDwellQuad(null);
                  setDwellPct(0);
                }}
                className="px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest border-2 border-foreground hover:bg-foreground hover:text-background transition-colors"
                style={{ boxShadow: "3px 3px 0 0 var(--foreground)" }}
              >
                RETRY QUIZ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChartPoint, LogEntry, GazePoint, EyetraxStatus, VideoKpis, AudioKpis, EnergyComponents } from "./components/types";
import { FACE_MS, DATA_THROTTLE_MS, FILLERS, L_EYE, R_EYE, L_IRIS, R_IRIS, BROW_L, BROW_R, LIPS_U, LIPS_D, NOSE_TIP } from "./components/constants";
import { clamp, push, dist, avg, fmtTime } from "./components/helpers";
import { StatusDot } from "./components/ui";
import { VideoPane } from "./components/VideoPane";
import { AudioPane } from "./components/AudioPane";
import { ControlBar } from "./components/ControlBar";

/* eslint-disable @typescript-eslint/no-explicit-any */
type SpeechRecognitionCompat = any;
type SpeechRecognitionEventCompat = any;
/* eslint-enable @typescript-eslint/no-explicit-any */

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */

export default function AnalysisDashboard() {
    /* refs */
    const vidRef = useRef<HTMLVideoElement>(null);
    const overlayRef = useRef<HTMLCanvasElement>(null);
    const vidWrapRef = useRef<HTMLDivElement>(null);
    const fpsBadgeRef = useRef<HTMLSpanElement>(null);
    const vLogRef = useRef<HTMLDivElement>(null);
    const aLogRef = useRef<HTMLDivElement>(null);
    const fLogRef = useRef<HTMLDivElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const speechRef = useRef<SpeechRecognitionCompat | null>(null);
    const faceMeshRef = useRef<unknown>(null);
    const faceReqRef = useRef(0);
    const fpsFrames = useRef(0);
    const fpsLast = useRef(performance.now());
    const eyetraxWsRef = useRef<WebSocket | null>(null);
    const eyetraxIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    /* timing refs — avoids stale-closure bug in face-mesh callback */
    const secondsRef = useRef(0);
    const lastDataUpdateRef = useRef(0);
    /* rolling buffers for 4-second smoothing (@10fps = 40 frames) */
    const eyeContactBufferRef = useRef<number[]>([]);
    const yawnBufferRef = useRef<number[]>([]);

    /* state */
    const [running, setRunning] = useState(false);
    const [liveStopped, setLiveStopped] = useState(true);
    const [activeTab, setActiveTab] = useState<"video" | "audio">("video");
    const [seconds, setSeconds] = useState(0);
    const [wsConnected, setWsConnected] = useState(false);
    const timer = fmtTime(seconds);

    const [eyeData, setEyeData] = useState<ChartPoint[]>([]);
    const [exprData, setExprData] = useState<ChartPoint[]>([]);
    const [headData, setHeadData] = useState<ChartPoint[]>([]);
    const [yawnData, setYawnData] = useState<ChartPoint[]>([]);
    const [energyData, setEnergyData] = useState<ChartPoint[]>([]);
    const [energyComponents, setEnergyComponents] = useState<EnergyComponents>({ energy: 0, eye: 0, expr: 0, alertness: 0, headStability: 0 });
    const [wpmData, setWpmData] = useState<ChartPoint[]>([]);
    const [volData, setVolData] = useState<ChartPoint[]>([]);
    const [pitchData, setPitchData] = useState<ChartPoint[]>([]);
    const [fillerData, setFillerData] = useState<ChartPoint[]>([]);

    const [videoLog, setVideoLog] = useState<LogEntry[]>([]);
    const [audioLog, setAudioLog] = useState<LogEntry[]>([]);
    const [fillerLog, setFillerLog] = useState<LogEntry[]>([]);
    const [gazePos, setGazePos] = useState<GazePoint | null>(null);
    const [eyetraxStatus, setEyetraxStatus] = useState<EyetraxStatus>("disconnected");

    /* derived KPIs */
    const videoKpis: VideoKpis = (() => {
        const eyeVal = eyeData.at(-1) ? Number(eyeData.at(-1)!.value) : 0;
        const eyeOk = eyeVal >= 50 && eyeVal <= 90;
        const lastH = headData.at(-1);
        const yaw = lastH ? Math.abs(Number(lastH.yaw)) : 0;
        const pitch = lastH ? Math.abs(Number(lastH.pitch)) : 0;
        const stabOk = yaw < 10 && pitch < 10;
        const exprVal = exprData.at(-1) ? Number(exprData.at(-1)!.expr) : 0;
        const yawnVal = yawnData.at(-1) ? Number(yawnData.at(-1)!.value) : 0;
        const energyVal = energyComponents.energy;
        const energyColor = energyVal > 70 ? "text-chart-4" : energyVal > 40 ? "text-primary" : "text-destructive";
        const yawnColor = yawnVal > 50 ? "text-destructive" : yawnVal > 25 ? "text-chart-5" : "text-chart-4";
        return {
            eye: `${Math.round(eyeVal)}%`, eyeSub: eyeOk ? "GOOD CONTACT" : eyeVal < 50 ? "LOOK AT CAMERA" : "STARING", eyeColor: eyeOk ? "text-chart-4" : "text-destructive",
            stab: stabOk ? "STABLE" : "MOVING", stabSub: `YAW ${yaw.toFixed(0)}\u00b0 / PITCH ${pitch.toFixed(0)}\u00b0`, stabColor: stabOk ? "text-chart-4" : "text-chart-5",
            expr: `${Math.round(exprVal)}%`, exprSub: exprVal > 40 ? "EXPRESSIVE" : "FLAT",
            yawn: yawnVal > 50 ? "YAWNING" : yawnVal > 25 ? "TIRED?" : "ALERT", yawnSub: `${Math.round(yawnVal)}% MOUTH OPEN`, yawnColor,
            energy: `${energyVal}`, energySub: energyVal > 70 ? "HIGH ENERGY" : energyVal > 40 ? "MODERATE" : "LOW ENERGY", energyColor,
        };
    })();

    const audioKpis: AudioKpis = (() => {
        const wordsTotal = wpmData.reduce((s, d) => s + Number(d.value || 0), 0);
        const fillersTotal = fillerData.reduce((s, d) => s + Number(d.inTurn || 0), 0);
        const lastV = volData.at(-1);
        const volVal = lastV ? Number(lastV.value) : -60;
        const lastP = pitchData.at(-1);
        const pitchVal = lastP ? Number(lastP.hz) : 0;
        const pitchStd = lastP ? Number(lastP.std || 0) : 0;
        const mono = pitchStd < 15 && pitchData.length > 5;
        return {
            words: wordsTotal, wordsSub: `${wpmData.length} TURNS`,
            fillers: fillersTotal, fillersSub: fillersTotal > 5 ? "TOO MANY" : "ACCEPTABLE",
            volume: `${volVal.toFixed(0)}dB`, volumeSub: volVal > -20 ? "LOUD" : volVal > -40 ? "GOOD" : "QUIET",
            pitch: `${pitchVal.toFixed(0)}Hz`, pitchSub: pitchVal > 200 ? "HIGH" : pitchVal > 100 ? "NORMAL" : "LOW",
            mono, turns: wpmData.length, turnsSub: `AVG ${wpmData.length > 0 ? Math.round(wordsTotal / wpmData.length) : 0} WPM`,
            stutters: audioLog.filter(e => e.type === "warn" && e.text.toLowerCase().includes("repeat")).length,
        };
    })();

    const dots = {
        ws: wsConnected ? "on" as const : "off" as const,
        cam: streamRef.current ? "on" as const : "off" as const,
        mic: speechRef.current ? "on" as const : "off" as const,
        gaze: eyetraxStatus === "tracking" ? "on" as const : eyetraxStatus !== "disconnected" ? "warn" as const : "off" as const,
        face: faceMeshRef.current ? "on" as const : "off" as const,
    };

    /* ─── Face mesh callback ─── */
    const onFaceResults = useCallback((results: { multiFaceLandmarks?: { x: number; y: number; z: number }[][] }) => {
        fpsFrames.current++;
        const nowMs = performance.now();
        if (nowMs - fpsLast.current >= 1000) {
            if (fpsBadgeRef.current) fpsBadgeRef.current.textContent = `${fpsFrames.current} FPS`;
            fpsFrames.current = 0;
            fpsLast.current = nowMs;
        }

        const cnv = overlayRef.current;
        if (!cnv) return;
        const ctx = cnv.getContext("2d");
        if (!ctx) return;

        const vw = vidWrapRef.current;
        if (vw) { cnv.width = vw.clientWidth; cnv.height = vw.clientHeight; }
        ctx.clearRect(0, 0, cnv.width, cnv.height);

        const faces = results.multiFaceLandmarks;
        if (!faces || faces.length === 0) return;
        const lm = faces[0];

        /* draw mesh dots */
        ctx.fillStyle = "rgba(255,255,255,0.25)";
        for (const p of lm) {
            ctx.fillRect(p.x * cnv.width, p.y * cnv.height, 1.5, 1.5);
        }

        /* ── Head pose (needed by eye-contact + energy) ── */
        const noseTip = lm[NOSE_TIP];
        const yaw = (noseTip.x - 0.5) * 60;
        const pitch = (noseTip.y - 0.5) * 60;

        /* ── Eye contact: horizontal iris centering within eye corners ── */
        // Landmarks: L outer=33, L inner=133, R inner=362, R outer=263
        const lIrisC = avg(L_IRIS.map(i => lm[i]));
        const rIrisC = avg(R_IRIS.map(i => lm[i]));
        const lOuter = lm[33], lInner = lm[133];
        const rInner = lm[362], rOuter = lm[263];
        const lEyeW = dist(lOuter, lInner);
        const rEyeW = dist(rInner, rOuter);
        const lCenterX = (lOuter.x + lInner.x) / 2;
        const rCenterX = (rInner.x + rOuter.x) / 2;
        // Only horizontal offset — vertical is noisy and less meaningful for gaze-at-camera
        const lOffX = lEyeW > 0 ? Math.abs(lIrisC.x - lCenterX) / lEyeW : 0;
        const rOffX = rEyeW > 0 ? Math.abs(rIrisC.x - rCenterX) / rEyeW : 0;
        const hOff = (lOffX + rOffX) / 2;
        // Dead-zone: offsets < 0.08 count as perfect center; beyond that scale at 4x (not 8x)
        const eyeContactBase = clamp((1 - Math.max(0, hOff - 0.08) * 4) * 100, 0, 100);
        // Head-pose factor: gentler — only starts dropping past ±15°, never below 0.35
        const headFactor = clamp(1 - Math.abs(yaw) / 35, 0.35, 1);
        const eyeContactRaw = eyeContactBase * headFactor;

        // Push into 4s rolling buffer (10fps ≈ 40 frames)
        eyeContactBufferRef.current.push(eyeContactRaw);
        if (eyeContactBufferRef.current.length > 40) eyeContactBufferRef.current.shift();

        /* ── Expression: smile-driven score ── */
        // Primary: mouth-width / eye-span ratio — scale-invariant, largest signal for smiling
        // Smiling widens mouth significantly relative to eye distance
        const mouthW = dist(lm[61], lm[291]);
        const eyeSpan = dist(lm[33], lm[263]); // outer eye corners — stable reference
        // neutral ratio ~0.55-0.65, broad smile ~0.75-0.90
        const smileRatio = eyeSpan > 0 ? mouthW / eyeSpan : 0;
        const smileScore = clamp((smileRatio - 0.50) / 0.30 * 100, 0, 100);
        // Secondary: corner lift normalized by eye span (raw Y diff is too small to use unscaled)
        const midLipY = (lm[13].y + lm[14].y) / 2;
        const cornerAvgY = (lm[61].y + lm[291].y) / 2;
        const cornerLift = eyeSpan > 0 ? (midLipY - cornerAvgY) / eyeSpan : 0;
        // neutral: ~-0.05 to 0; big smile: ~0.05-0.10 (normalized)
        const liftScore = clamp((cornerLift + 0.05) / 0.10 * 100, 0, 100);
        // Brow raise (bonus engagement signal)
        const browLift = avg(BROW_L.map(i => lm[i])).y - avg(L_EYE.map(i => lm[i])).y;
        const browLiftR = avg(BROW_R.map(i => lm[i])).y - avg(R_EYE.map(i => lm[i])).y;
        const browRaise = clamp(Math.abs(browLift + browLiftR) * 300, 0, 25);
        // 60% mouth width, 25% corner lift, 15% brow — no smile → low score
        const exprScore = clamp(smileScore * 0.60 + liftScore * 0.25 + browRaise, 0, 100);

        /* ── Yawn detection: mouth aspect ratio ── */
        const yawnMouthH = dist(lm[13], lm[14]);
        const mar = mouthW > 0 ? yawnMouthH / mouthW : 0;
        // MAR: ~0.02 closed, ~0.15 talking, ~0.5+ yawning
        const yawnRaw = clamp((mar - 0.05) / 0.45 * 100, 0, 100);
        yawnBufferRef.current.push(yawnRaw);
        if (yawnBufferRef.current.length > 40) yawnBufferRef.current.shift();

        /* ── Throttle data writes to 1fps ── */
        if (nowMs - lastDataUpdateRef.current < DATA_THROTTLE_MS) return;
        lastDataUpdateRef.current = nowMs;

        const t = fmtTime(secondsRef.current); // use ref — avoids stale closure

        // Rolling averages
        const buf = eyeContactBufferRef.current;
        const eyeContactAvg = buf.length > 0 ? buf.reduce((a, b) => a + b, 0) / buf.length : 0;
        const yawnBuf = yawnBufferRef.current;
        const yawnAvg = yawnBuf.length > 0 ? yawnBuf.reduce((a, b) => a + b, 0) / yawnBuf.length : 0;

        // Energy score: average of 4 sub-metrics (yawn inverted = alertness)
        // Penalty is exaggerated for demo: ±10° yaw → 50%, ±20° yaw → 0%
        const headStability = clamp(100 - (Math.abs(yaw) + Math.abs(pitch)) * 5, 0, 100);
        const alertness = 100 - yawnAvg;
        const energyScore = Math.round((eyeContactAvg + exprScore + alertness + headStability) / 4);

        setEyeData(prev => push(prev, { label: t, value: Math.round(eyeContactAvg) }));
        setExprData(prev => push(prev, { label: t, expr: Math.round(exprScore), brow: Math.round(browRaise) }));
        setHeadData(prev => push(prev, { label: t, yaw: Math.round(yaw), pitch: Math.round(pitch) }));
        setYawnData(prev => push(prev, { label: t, value: Math.round(yawnAvg) }));
        setEnergyData(prev => push(prev, { label: t, value: energyScore }));
        setEnergyComponents({ energy: energyScore, eye: Math.round(eyeContactAvg), expr: Math.round(exprScore), alertness: Math.round(alertness), headStability: Math.round(headStability) });

        /* logging (1fps rate is sufficient) */
        if (eyeContactAvg < 35) {
            setVideoLog(prev => push(prev, { ts: t, type: "warn", text: `Low eye contact: ${Math.round(eyeContactAvg)}%` }, 200));
        } else if (eyeContactAvg > 65) {
            setVideoLog(prev => push(prev, { ts: t, type: "good", text: `Good eye contact: ${Math.round(eyeContactAvg)}%` }, 200));
        }
        if (Math.abs(yaw) > 20 || Math.abs(pitch) > 20) {
            setVideoLog(prev => push(prev, { ts: t, type: "warn", text: `Head off-axis: yaw ${yaw.toFixed(0)}\u00b0 pitch ${pitch.toFixed(0)}\u00b0` }, 200));
        }
        if (yawnAvg > 55) {
            setVideoLog(prev => push(prev, { ts: t, type: "warn", text: `Yawn detected \u2014 energy may be low (${Math.round(yawnAvg)}%)` }, 200));
        }
        if (energyScore > 72) {
            setVideoLog(prev => push(prev, { ts: t, type: "good", text: `High energy: ${energyScore}/100` }, 200));
        }
    }, []); // stable — reads secondsRef.current, no state deps

    /* auto-scroll logs */
    useEffect(() => { vLogRef.current?.scrollTo(0, vLogRef.current.scrollHeight); }, [videoLog]);
    useEffect(() => { aLogRef.current?.scrollTo(0, aLogRef.current.scrollHeight); }, [audioLog]);
    useEffect(() => { fLogRef.current?.scrollTo(0, fLogRef.current.scrollHeight); }, [fillerLog]);

    /* ─── Audio handlers ─── */
    const handleAudio = useCallback((data: { volume?: number; pitch?: number; pitch_std?: number }) => {
        const t = fmtTime(secondsRef.current);
        if (data.volume !== undefined) {
            setVolData(prev => push(prev, { label: t, value: data.volume! }));
        }
        if (data.pitch !== undefined) {
            setPitchData(prev => push(prev, { label: t, hz: data.pitch!, std: data.pitch_std || 0 }));
        }
    }, []); // stable — reads secondsRef.current

    const handleTranscript = useCallback((text: string) => {
        const t = fmtTime(secondsRef.current);
        const words = text.trim().split(/\s+/);
        const wpm = words.length * 4;
        setWpmData(prev => push(prev, { label: `T${prev.length + 1}`, value: wpm, ideal130: 130, ideal170: 170 }));

        let turnFillers = 0;
        const lower = text.toLowerCase();
        for (const f of FILLERS) {
            const re = new RegExp(`\\b${f}\\b`, "gi");
            const matches = lower.match(re);
            if (matches) {
                turnFillers += matches.length;
                for (const m of matches) {
                    setFillerLog(prev => push(prev, { ts: t, type: "filler", text: `"${m}" detected` }, 200));
                }
            }
        }
        setFillerData(prev => {
            const cum = prev.reduce((s, d) => s + Number(d.inTurn || 0), 0) + turnFillers;
            return push(prev, { label: `T${prev.length + 1}`, inTurn: turnFillers, cumulative: cum });
        });

        setAudioLog(prev => push(prev, { ts: t, type: turnFillers > 0 ? "warn" : "good", text: `${words.length} words, ${wpm} wpm${turnFillers > 0 ? `, ${turnFillers} fillers` : ""}` }, 200));

        /* stutter detection */
        for (let i = 1; i < words.length; i++) {
            if (words[i] === words[i - 1]) {
                setAudioLog(prev => push(prev, { ts: t, type: "warn", text: `Repeated word: "${words[i]}"` }, 200));
            }
        }
    }, []); // stable — reads secondsRef.current

    /* ─── Timer loop ─── */
    useEffect(() => {
        if (!running) return;
        const iv = setInterval(() => {
            secondsRef.current += 1;
            setSeconds(s => s + 1);
        }, 1000);
        return () => clearInterval(iv);
    }, [running]);

    /* ─── Face loop ─── */
    useEffect(() => {
        if (!running) return;
        const loop = () => {
            const video = vidRef.current;
            const fm = faceMeshRef.current as { send?: (opts: { image: HTMLVideoElement }) => void } | null;
            if (video && fm?.send && video.readyState >= 2) {
                fm.send({ image: video });
            }
            faceReqRef.current = window.setTimeout(loop, FACE_MS);
        };
        loop();
        return () => { clearTimeout(faceReqRef.current); };
    }, [running]);

    /* ─── Init FaceMesh ─── */
    const initFaceMesh = useCallback(() => {
        const w = window as unknown as Record<string, unknown>;
        const FaceMeshClass = w.FaceMesh as new (opts: { locateFile: (f: string) => string }) => {
            setOptions: (o: Record<string, unknown>) => void;
            onResults: (cb: (r: { multiFaceLandmarks?: { x: number; y: number; z: number }[][] }) => void) => void;
            initialize: () => Promise<void>;
        };
        if (!FaceMeshClass) return;
        const fm = new FaceMeshClass({
            locateFile: (f: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/${f}`,
        });
        fm.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
        fm.onResults(onFaceResults);
        fm.initialize().then(() => { faceMeshRef.current = fm; });
    }, [onFaceResults]);

    /* ─── Start audio WS ─── */
    const startAudio = useCallback(() => {
        const ws = new WebSocket("ws://localhost:8765");
        wsRef.current = ws;
        ws.onopen = () => {
            setWsConnected(true);
            navigator.mediaDevices.getUserMedia({ audio: true }).then(audioStream => {
                const actx = new AudioContext();
                const src = actx.createMediaStreamSource(audioStream);
                const proc = actx.createScriptProcessor(2048, 1, 1);
                src.connect(proc);
                proc.connect(actx.destination);
                proc.onaudioprocess = (e: AudioProcessingEvent) => {
                    if (ws.readyState === 1) {
                        const buf = e.inputBuffer.getChannelData(0);
                        ws.send(buf.buffer);
                    }
                };
            });
        };
        ws.onmessage = (e) => {
            try {
                const d = JSON.parse(e.data as string);
                handleAudio(d);
            } catch { /* ignore */ }
        };
        ws.onerror = () => { setWsConnected(false); };
        ws.onclose = () => { setWsConnected(false); };
    }, [handleAudio]);

    const connectWS = useCallback(() => { startAudio(); }, [startAudio]);

    /* ─── Speech recognition ─── */
    const startSpeech = useCallback(() => {
        const SR = (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionCompat; webkitSpeechRecognition?: new () => SpeechRecognitionCompat }).SpeechRecognition
            || (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionCompat }).webkitSpeechRecognition;
        if (!SR) return;
        const sr = new SR();
        sr.continuous = true;
        sr.interimResults = false;
        sr.lang = "en-US";
        sr.onresult = (ev: SpeechRecognitionEventCompat) => {
            for (let i = ev.resultIndex; i < ev.results.length; i++) {
                if (ev.results[i].isFinal) {
                    handleTranscript(ev.results[i][0].transcript);
                }
            }
        };
        sr.onerror = () => { /* ignore */ };
        sr.onend = () => { if (speechRef.current) sr.start(); };
        sr.start();
        speechRef.current = sr;
    }, [handleTranscript]);

    /* ─── EyeTrax integration ─── */
    const connectEyeTrax = useCallback(() => {
        console.log("[EyeTrax] Connecting to ws://localhost:8766...");
        const ws = new WebSocket("ws://localhost:8766");
        eyetraxWsRef.current = ws;
        ws.onopen = () => {
            console.log("[EyeTrax] WebSocket connected ✓");
            setEyetraxStatus("connected");
        };
        ws.onmessage = (e) => {
            try {
                const d = JSON.parse(e.data as string);
                console.log("[EyeTrax] msg:", d);
                if (d.type === "gaze") {
                    setGazePos({ x: d.x * 100, y: d.y * 100 });
                    setEyetraxStatus("tracking");
                } else if (d.type === "status") {
                    if (d.status === "calibrating") setEyetraxStatus("calibrating");
                    else if (d.status === "calibrated") setEyetraxStatus("tracking");
                } else if (d.type === "error") {
                    console.error("[EyeTrax] server error:", d.message);
                }
            } catch { /* ignore */ }
        };
        ws.onclose = (ev) => {
            console.warn("[EyeTrax] WebSocket closed", ev.code, ev.reason);
            setEyetraxStatus("disconnected"); eyetraxWsRef.current = null;
        };
        ws.onerror = (ev) => {
            console.error("[EyeTrax] WebSocket error — is eyetrax_server.py running?", ev);
            setEyetraxStatus("disconnected");
        };
    }, []);

    const startEyeTraxFrames = useCallback(() => {
        if (!eyetraxWsRef.current || !vidRef.current) return;
        const cnv = document.createElement("canvas");
        const ctx = cnv.getContext("2d");
        eyetraxIntervalRef.current = setInterval(() => {
            const v = vidRef.current;
            const ws = eyetraxWsRef.current;
            if (!v || !ws || ws.readyState !== 1 || !ctx) return;
            cnv.width = v.videoWidth;
            cnv.height = v.videoHeight;
            ctx.drawImage(v, 0, 0);
            const dataUrl = cnv.toDataURL("image/jpeg", 0.6);
            const base64 = dataUrl.split(",")[1];
            ws.send(JSON.stringify({ type: "frame", data: base64 }));
        }, 100);
    }, []);

    const stopEyeTraxFrames = useCallback(() => {
        if (eyetraxIntervalRef.current) {
            clearInterval(eyetraxIntervalRef.current);
            eyetraxIntervalRef.current = null;
        }
    }, []);

    const toggleEyeTrax = useCallback(() => {
        if (eyetraxStatus === "disconnected") {
            connectEyeTrax();
            setTimeout(() => startEyeTraxFrames(), 500);
        } else {
            stopEyeTraxFrames();
            eyetraxWsRef.current?.close();
            setEyetraxStatus("disconnected");
            setGazePos(null);
        }
    }, [eyetraxStatus, connectEyeTrax, startEyeTraxFrames, stopEyeTraxFrames]);

    const calibrateEyeTrax = useCallback(() => {
        if (eyetraxWsRef.current?.readyState === 1) {
            eyetraxWsRef.current.send(JSON.stringify({ type: "calibrate", method: "9-point" }));
            setEyetraxStatus("calibrating");
        }
    }, []);

    /* ─── Start / Stop ─── */
    const start = useCallback(async () => {
        setRunning(true);
        setLiveStopped(false);
        setSeconds(0);
        secondsRef.current = 0;
        lastDataUpdateRef.current = 0;
        eyeContactBufferRef.current = [];
        yawnBufferRef.current = [];
        setEyeData([]); setExprData([]); setHeadData([]);
        setYawnData([]); setEnergyData([]);
        setEnergyComponents({ energy: 0, eye: 0, expr: 0, alertness: 0, headStability: 0 });
        setWpmData([]); setVolData([]); setPitchData([]);
        setFillerData([]); setVideoLog([]); setAudioLog([]); setFillerLog([]);
        setGazePos(null);

        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = stream;
        if (vidRef.current) vidRef.current.srcObject = stream;

        initFaceMesh();
        connectWS();
        startSpeech();
    }, [initFaceMesh, connectWS, startSpeech]);

    const stop = useCallback(() => {
        setRunning(false);
        setLiveStopped(true);
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        wsRef.current?.close();
        wsRef.current = null;
        setWsConnected(false);
        if (speechRef.current) { speechRef.current.onend = null; speechRef.current.abort(); speechRef.current = null; }
        stopEyeTraxFrames();
        eyetraxWsRef.current?.close();
        setEyetraxStatus("disconnected");
        setGazePos(null);
    }, [stopEyeTraxFrames]);

    /* ─── Load mediapipe script ─── */
    useEffect(() => {
        if (document.querySelector('script[src*="face_mesh"]')) return;
        const s = document.createElement("script");
        s.src = "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/face_mesh.js";
        s.async = true;
        document.head.appendChild(s);
    }, []);

    /* ───────────────────── RENDER ───────────────────── */

    const liveClasses = liveStopped
        ? "border-muted-foreground text-muted-foreground"
        : "border-primary bg-primary text-primary-foreground animate-pulse";

    const tabCls = (tab: "video" | "audio") =>
        activeTab === tab
            ? "text-primary border-primary"
            : "text-muted-foreground border-transparent hover:text-foreground";

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground font-mono">
            {/* HEADER */}
            <div className="flex items-center justify-between px-6 py-3 bg-card border-b-2 border-foreground">
                <h1 className="text-sm font-bold tracking-[0.15em] uppercase">
                    <span className="text-primary">HKUSTEAM</span> LIVE DASHBOARD
                </h1>
                <div className="flex items-center gap-4">
                    <span className="text-3xl font-bold text-chart-4 tabular-nums">{timer}</span>
                    <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest border-2 ${liveClasses}`}>
                        {liveStopped ? "\u25cf STOPPED" : "\u25cf LIVE"}
                    </span>
                </div>
            </div>

            {/* STATUS BAR */}
            <div className="flex flex-wrap gap-4 px-6 py-2 bg-card border-b-2 border-foreground text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                <span><StatusDot state={dots.ws} />WEBSOCKET</span>
                <span><StatusDot state={dots.cam} />CAMERA</span>
                <span><StatusDot state={dots.mic} />MICROPHONE</span>
                <span><StatusDot state={dots.gaze} />EYETRAX {eyetraxStatus !== "disconnected" && `(${eyetraxStatus.toUpperCase()})`}</span>
                <span><StatusDot state={dots.face} />FACE MESH</span>
            </div>

            {/* TABS */}
            <div className="flex bg-card border-b-2 border-foreground px-6">
                {(["video", "audio"] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] border-b-[3px] transition-colors cursor-pointer ${tabCls(tab)}`}>
                        {tab === "video" ? "VIDEO ANALYSIS" : "AUDIO ANALYSIS"}
                    </button>
                ))}
            </div>

            {/* PANES */}
            <div className="flex-1 overflow-y-auto">
                {activeTab === "video" && (
                    <VideoPane
                        eyeData={eyeData} exprData={exprData} headData={headData}
                        yawnData={yawnData} energyData={energyData} videoLog={videoLog}
                        videoKpis={videoKpis} energyComponents={energyComponents}
                        vidRef={vidRef} overlayRef={overlayRef}
                        vidWrapRef={vidWrapRef} fpsBadgeRef={fpsBadgeRef} vLogRef={vLogRef}
                        gazePos={gazePos}
                    />
                )}
                {activeTab === "audio" && (
                    <AudioPane
                        wpmData={wpmData} volData={volData} pitchData={pitchData}
                        fillerData={fillerData} audioLog={audioLog} fillerLog={fillerLog}
                        audioKpis={audioKpis} aLogRef={aLogRef} fLogRef={fLogRef}
                    />
                )}
            </div>

            {/* CONTROLS */}
            <ControlBar
                running={running} start={start} stop={stop}
                eyetraxStatus={eyetraxStatus} toggleEyeTrax={toggleEyeTrax}
                calibrateEyeTrax={calibrateEyeTrax}
            />
        </div>
    );
}

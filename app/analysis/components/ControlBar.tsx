import type { EyetraxStatus } from "./types";

interface ControlBarProps {
    running: boolean;
    start: () => void;
    stop: () => void;
    eyetraxStatus: EyetraxStatus;
    toggleEyeTrax: () => void;
    calibrateEyeTrax: () => void;
}

export function ControlBar({ running, start, stop, eyetraxStatus, toggleEyeTrax, calibrateEyeTrax }: ControlBarProps) {
    const eyetraxBtnCls = eyetraxStatus !== "disconnected"
        ? "bg-chart-4 text-background"
        : "bg-card text-foreground hover:border-primary hover:text-primary";

    return (
        <div className="flex gap-3 px-6 py-3 bg-card border-t-2 border-foreground">
            <button onClick={start} disabled={running}
                className="px-5 py-2 bg-primary text-primary-foreground border-2 border-foreground font-mono text-[10px] font-bold uppercase tracking-[0.15em] shadow-md cursor-pointer hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity">
                &#9654; START ANALYSIS
            </button>
            <button onClick={stop} disabled={!running}
                className="px-5 py-2 bg-card text-destructive border-2 border-foreground font-mono text-[10px] font-bold uppercase tracking-[0.15em] shadow-md cursor-pointer hover:bg-destructive hover:text-destructive-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                &#9632; STOP
            </button>
            <button onClick={toggleEyeTrax}
                className={`px-5 py-2 border-2 border-foreground font-mono text-[10px] font-bold uppercase tracking-[0.15em] shadow-md cursor-pointer transition-colors ${eyetraxBtnCls}`}>
                &#9678; EYETRAX {eyetraxStatus !== "disconnected" ? "(ON)" : ""}
            </button>
            {eyetraxStatus !== "disconnected" && eyetraxStatus !== "calibrating" && (
                <button onClick={calibrateEyeTrax}
                    className="px-5 py-2 bg-card text-foreground border-2 border-foreground font-mono text-[10px] font-bold uppercase tracking-[0.15em] shadow-md cursor-pointer hover:border-primary hover:text-primary transition-colors">
                    &#8862; CALIBRATE
                </button>
            )}
        </div>
    );
}

import { useRouter } from "next/navigation";
import type { EyetraxStatus } from "./types";

interface ControlBarProps {
  running: boolean;
  start: () => void;
  stop: () => void;
  eyetraxStatus: EyetraxStatus;
  toggleEyeTrax: () => void;
  calibrateEyeTrax: () => void;
}

export function ControlBar({
  running,
  start,
  stop,
  eyetraxStatus,
  toggleEyeTrax,
  calibrateEyeTrax,
}: ControlBarProps) {
  const router = useRouter();

  return (
    <div className="flex gap-3 px-6 py-3 bg-card border-t-2 border-foreground">
      <button
        onClick={start}
        disabled={running}
        className="px-5 py-2 bg-primary text-primary-foreground border-2 border-foreground font-mono text-[10px] font-bold uppercase tracking-[0.15em] shadow-md cursor-pointer hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
      >
        &#9654; START ANALYSIS
      </button>
      <button
        onClick={stop}
        disabled={!running}
        className="px-5 py-2 bg-card text-destructive border-2 border-foreground font-mono text-[10px] font-bold uppercase tracking-[0.15em] shadow-md cursor-pointer hover:bg-destructive hover:text-destructive-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        &#9632; STOP
      </button>
      <button
        onClick={() => router.push("/eyetrax")}
        className="px-5 py-2 border-2 border-foreground bg-card text-foreground font-mono text-[10px] font-bold uppercase tracking-[0.15em] shadow-md cursor-pointer hover:border-primary hover:text-primary transition-colors"
      >
        &#9678; EYETRAX
      </button>
    </div>
  );
}

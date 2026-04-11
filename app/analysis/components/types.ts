export interface ChartPoint {
  label: string;
  [k: string]: string | number;
}
export interface ScatterPoint {
  x: number;
  y: number;
}
export interface LogEntry {
  ts: string;
  type: string;
  text: string;
}
export interface GazePoint {
  x: number;
  y: number;
}
export type EyetraxStatus =
  | "disconnected"
  | "connected"
  | "calibrating"
  | "tracking";

export interface VideoKpis {
  eye: string;
  eyeSub: string;
  eyeColor: string;
  stab: string;
  stabSub: string;
  stabColor: string;
  expr: string;
  exprSub: string;
  yawn: string;
  yawnSub: string;
  yawnColor: string;
  energy: string;
  energySub: string;
  energyColor: string;
}

export interface EnergyComponents {
  energy: number;
  eye: number;
  expr: number;
  alertness: number;
  headStability: number;
}

export interface AudioKpis {
  words: number;
  wordsSub: string;
  fillers: number;
  fillersSub: string;
  volume: string;
  volumeSub: string;
  pitch: string;
  pitchSub: string;
  mono: boolean;
  turns: number;
  turnsSub: string;
  stutters: number;
}

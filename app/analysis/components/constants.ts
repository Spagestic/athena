export const MAX_PTS = 120;
export const FACE_MS = 100;         // face-mesh loop rate (10fps for smooth overlay)
export const DATA_THROTTLE_MS = 1000; // chart data writes at 1 fps
export const FILLERS = ["um", "uh", "like", "you know", "basically", "actually", "literally", "right", "so", "well"];

export const C = {
    primary: "var(--primary)",
    chart1: "var(--chart-1)",
    chart2: "#4f46e5",   // indigo override — original var(--chart-2) is near-white on light bg
    chart3: "var(--chart-3)",
    chart4: "var(--chart-4)",
    chart5: "var(--chart-5)",
    border: "var(--border)",
} as const;

export const tooltipStyle = {
    backgroundColor: "var(--card)",
    border: "2px solid var(--foreground)",
    borderRadius: 0,
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
};

/* Landmark Indices */
export const L_EYE = [33, 133, 160, 159, 158, 144, 145, 153];
export const R_EYE = [362, 263, 387, 386, 385, 373, 374, 380];
export const L_IRIS = [468, 469, 470, 471];
export const R_IRIS = [473, 474, 475, 476];
export const BROW_L = [70, 63, 105, 66, 107];
export const BROW_R = [300, 293, 334, 296, 336];
export const LIPS_U = [13];
export const LIPS_D = [14];
export const NOSE_TIP = 1;

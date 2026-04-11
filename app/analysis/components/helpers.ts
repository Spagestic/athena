import { MAX_PTS } from "./constants";

export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export const push = <T,>(arr: T[], item: T, max = MAX_PTS) => {
    const out = [...arr, item];
    return out.length > max ? out.slice(out.length - max) : out;
};

export const dist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
    Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

export const avg = (pts: { x: number; y: number }[]) => ({
    x: pts.reduce((s, p) => s + p.x, 0) / pts.length,
    y: pts.reduce((s, p) => s + p.y, 0) / pts.length,
});

export const ear = (ids: number[], lm: { x: number; y: number; z: number }[]) => {
    const p = ids.map(i => lm[i]);
    const v1 = dist(p[1], p[5]);
    const v2 = dist(p[2], p[4]);
    const h = dist(p[0], p[3]);
    return (v1 + v2) / (2 * h);
};

export const irisRatio = (eyeIds: number[], irisIds: number[], lm: { x: number; y: number; z: number }[]) => {
    const eL = lm[eyeIds[0]], eR = lm[eyeIds[3]];
    const iris = avg(irisIds.map(i => lm[i]));
    const w = dist(eL, eR);
    return w > 0 ? (iris.x - eL.x) / w : 0.5;
};

export const fmtTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

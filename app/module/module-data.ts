import {
  type DashboardUser,
  type DeadlineTask,
} from "../dashboard/dashboard-data";

export type ModuleFriend = {
  id: string;
  name: string;
  initials: string;
};

export type ModuleLeaderboardEntry = {
  name: string;
  streakCount: number;
};

export type ModulePerformancePoint = {
  label: string;
  fullLabel: string;
  daysAgo: number;
  user: number;
  aggregate: number;
};

export type ModuleNoteRow = {
  fileUrl: string | null;
  id: string;
  lastUpdated: number;
  pages: number;
  processingStatus: "pending" | "processing" | "ready" | "failed";
  quizzes: number;
  sharedWith: string[];
  title: string;
};

export type ModuleTaskRow = DeadlineTask;

export type ModulePageData = {
  code: string;
  description: string;
  leaderboard: ModuleLeaderboardEntry[];
  noteCount: number;
  notes: ModuleNoteRow[];
  participantOverflow: number;
  participants: ModuleFriend[];
  pendingTasks: number;
  performance: ModulePerformancePoint[];
  professor: string;
  streakCount: number;
  tasks: ModuleTaskRow[];
  title: string;
  user: DashboardUser | null;
};

const performanceTemplate = [
  { label: "6M", fullLabel: "180 days ago", daysAgo: 180 },
  { label: "5M", fullLabel: "150 days ago", daysAgo: 150 },
  { label: "4M", fullLabel: "120 days ago", daysAgo: 120 },
  { label: "3M", fullLabel: "90 days ago", daysAgo: 90 },
  { label: "2M", fullLabel: "60 days ago", daysAgo: 60 },
  { label: "45D", fullLabel: "45 days ago", daysAgo: 45 },
  { label: "30D", fullLabel: "30 days ago", daysAgo: 30 },
  { label: "21D", fullLabel: "21 days ago", daysAgo: 21 },
  { label: "14D", fullLabel: "14 days ago", daysAgo: 14 },
  { label: "7D", fullLabel: "7 days ago", daysAgo: 7 },
  { label: "6D", fullLabel: "6 days ago", daysAgo: 6 },
  { label: "5D", fullLabel: "5 days ago", daysAgo: 5 },
  { label: "4D", fullLabel: "4 days ago", daysAgo: 4 },
  { label: "3D", fullLabel: "3 days ago", daysAgo: 3 },
  { label: "2D", fullLabel: "2 days ago", daysAgo: 2 },
  { label: "1D", fullLabel: "1 day ago", daysAgo: 1 },
] as const;

function buildPerformanceSeries(
  userValues: number[],
  aggregateValues: number[],
): ModulePerformancePoint[] {
  return performanceTemplate.map((point, index) => ({
    ...point,
    user: userValues[index],
    aggregate: aggregateValues[index],
  }));
}

export const moduleExtras: Record<
  string,
  Omit<
    ModulePageData,
    | "code"
    | "description"
    | "noteCount"
    | "notes"
    | "pendingTasks"
    | "professor"
    | "streakCount"
    | "tasks"
    | "title"
    | "user"
  >
> = {
  COMP1021: {
    participantOverflow: 24,
    participants: [
      { id: "ava-chen", name: "Ava Chen", initials: "AC" },
      { id: "ben-lee", name: "Ben Lee", initials: "BL" },
      { id: "cora-wong", name: "Cora Wong", initials: "CW" },
    ],
    leaderboard: [
      { name: "Alex Carter", streakCount: 93 },
      { name: "Sam Lee", streakCount: 88 },
      { name: "Jordan Ng", streakCount: 81 },
      { name: "Casey Wong", streakCount: 74 },
      { name: "Taylor Chan", streakCount: 69 },
      { name: "Morgan Tsui", streakCount: 67 },
      { name: "Avery Lam", streakCount: 63 },
      { name: "Jamie Ho", streakCount: 58 },
      { name: "Riley Yeung", streakCount: 54 },
      { name: "Parker Yip", streakCount: 49 },
    ],
    performance: buildPerformanceSeries(
      [16, 18, 21, 24, 29, 34, 39, 43, 47, 51, 53, 55, 57, 59, 61, 63],
      [14, 16, 18, 20, 24, 27, 30, 33, 35, 38, 40, 41, 42, 43, 44, 45],
    ),
  },
  MATH1014: {
    participantOverflow: 18,
    participants: [
      { id: "kai-lau", name: "Kai Lau", initials: "KL" },
      { id: "mia-cheung", name: "Mia Cheung", initials: "MC" },
      { id: "noah-hui", name: "Noah Hui", initials: "NH" },
    ],
    leaderboard: [
      { name: "Alex Carter", streakCount: 85 },
      { name: "Sam Lee", streakCount: 79 },
      { name: "Jordan Ng", streakCount: 72 },
      { name: "Casey Wong", streakCount: 67 },
      { name: "Avery Lam", streakCount: 63 },
      { name: "Morgan Tsui", streakCount: 61 },
      { name: "Riley Yeung", streakCount: 56 },
      { name: "Parker Yip", streakCount: 51 },
      { name: "Jamie Ho", streakCount: 46 },
      { name: "Taylor Chan", streakCount: 41 },
    ],
    performance: buildPerformanceSeries(
      [18, 20, 23, 27, 31, 35, 40, 44, 47, 50, 51, 53, 54, 56, 57, 58],
      [16, 18, 20, 23, 26, 29, 32, 35, 38, 41, 43, 44, 45, 46, 47, 48],
    ),
  },
  PHYS1112: {
    participantOverflow: 31,
    participants: [
      { id: "leo-chan", name: "Leo Chan", initials: "LC" },
      { id: "ivy-tam", name: "Ivy Tam", initials: "IT" },
      { id: "zoe-lam", name: "Zoe Lam", initials: "ZL" },
    ],
    leaderboard: [
      { name: "Alex Carter", streakCount: 90 },
      { name: "Sam Lee", streakCount: 83 },
      { name: "Jordan Ng", streakCount: 76 },
      { name: "Casey Wong", streakCount: 71 },
      { name: "Parker Yip", streakCount: 66 },
      { name: "Morgan Tsui", streakCount: 64 },
      { name: "Avery Lam", streakCount: 59 },
      { name: "Jamie Ho", streakCount: 55 },
      { name: "Riley Yeung", streakCount: 50 },
      { name: "Taylor Chan", streakCount: 45 },
    ],
    performance: buildPerformanceSeries(
      [14, 17, 19, 22, 26, 30, 34, 38, 42, 46, 48, 50, 52, 53, 55, 56],
      [13, 15, 17, 19, 22, 25, 28, 31, 34, 37, 39, 41, 42, 43, 44, 46],
    ),
  },
};

export function getModuleExtras(moduleCode: string) {
  return moduleExtras[moduleCode.toUpperCase()] ?? null;
}

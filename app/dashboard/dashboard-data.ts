export type DeadlineUrgency = "critical" | "medium" | "low";

export type DeadlineTask = {
  id: string;
  title: string;
  moduleCode: string;
  dueLabel: string;
  urgency: DeadlineUrgency;
  progress: number;
  signalScore: number;
};

export type DashboardModule = {
  id: string;
  code: string;
  title: string;
  noteCount: number;
  pendingTasks: number;
  subtitle: string;
};

export type DashboardUser = {
  name?: string | null;
  image?: string | null;
};

export type DashboardNotification = {
  title: string;
  detail: string;
};

export const streakCount = 67;
export const userInitial = "M";
export const userFirstName = "Morgan";

export const deadlineTasks: DeadlineTask[] = [
  {
    id: "comp-lab",
    title: "Lab checkpoint upload",
    moduleCode: "COMP1021",
    dueLabel: "Due in 4 hours",
    urgency: "critical",
    progress: 12,
    signalScore: 93,
  },
  {
    id: "math-problem-set",
    title: "Problem set 06",
    moduleCode: "MATH1014",
    dueLabel: "Due in 1 day",
    urgency: "medium",
    progress: 38,
    signalScore: 71,
  },
  {
    id: "phys-quiz",
    title: "Momentum quiz prep",
    moduleCode: "PHYS1112",
    dueLabel: "Due in 2 days",
    urgency: "medium",
    progress: 51,
    signalScore: 64,
  },
  {
    id: "comp-reading",
    title: "Recursion review notes",
    moduleCode: "COMP1021",
    dueLabel: "Due in 4 days",
    urgency: "low",
    progress: 79,
    signalScore: 42,
  },
  {
    id: "phys-summary",
    title: "Optics summary sheet",
    moduleCode: "PHYS1112",
    dueLabel: "Due in 6 days",
    urgency: "low",
    progress: 91,
    signalScore: 28,
  },
];

export const dashboardModules: DashboardModule[] = [
  {
    id: "comp1021",
    code: "COMP1021",
    title: "Introduction to Computer Science",
    noteCount: 18,
    pendingTasks: 4,
    subtitle: "Prof. Gibson Lam",
  },
  {
    id: "math1014",
    code: "MATH1014",
    title: "Calculus 2",
    noteCount: 11,
    pendingTasks: 3,
    subtitle: "Kam Hang Cheng",
  },
  {
    id: "phys1112",
    code: "PHYS1112",
    title: "General Physics 1",
    noteCount: 14,
    pendingTasks: 2,
    subtitle: "Kirill Prokofiev",
  },
];

export type DeadlineUrgency = "critical" | "medium" | "low";

export type DeadlineTask = {
  id: string;
  title: string;
  moduleCode: string;
  dueLabel: string;
  urgency: DeadlineUrgency;
  progress: number;
  effortScore: number;
};

export type DashboardModule = {
  code: string;
  title: string;
  noteCount: number;
  pendingTasks: number;
  professor: string;
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
    effortScore: 93,
  },
  {
    id: "math-problem-set",
    title: "Problem set 06",
    moduleCode: "MATH1014",
    dueLabel: "Due in 1 day",
    urgency: "medium",
    progress: 38,
    effortScore: 71,
  },
  {
    id: "phys-quiz",
    title: "Momentum quiz prep",
    moduleCode: "PHYS1112",
    dueLabel: "Due in 2 days",
    urgency: "medium",
    progress: 51,
    effortScore: 64,
  },
  {
    id: "comp-reading",
    title: "Recursion review notes",
    moduleCode: "COMP1021",
    dueLabel: "Due in 4 days",
    urgency: "low",
    progress: 79,
    effortScore: 42,
  },
  {
    id: "phys-summary",
    title: "Optics summary sheet",
    moduleCode: "PHYS1112",
    dueLabel: "Due in 6 days",
    urgency: "low",
    progress: 91,
    effortScore: 28,
  },
];

export const dashboardModules: DashboardModule[] = [
  {
    code: "COMP1021",
    title: "Introduction to Computer Science",
    noteCount: 18,
    pendingTasks: 4,
    professor: "Gibson Lam",
  },
  {
    code: "MATH1014",
    title: "Calculus 2",
    noteCount: 11,
    pendingTasks: 3,
    professor: "Kam Hang Cheng",
  },
  {
    code: "PHYS1112",
    title: "General Physics 1",
    noteCount: 14,
    pendingTasks: 2,
    professor: "Kirill Prokofiev",
  },
];

import { getAuthUserId } from "@convex-dev/auth/server";

import type { Doc, Id } from "./_generated/dataModel";
import { query, type QueryCtx } from "./_generated/server";
import { getCourseLabel } from "./courseLabels";
import { buildTaskId } from "./taskIds";

export const getDashboard = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthenticatedUserId(ctx);
    if (!userId) {
      return null;
    }

    return await getDashboardData(ctx, userId);
  },
});

async function getAuthenticatedUserId(ctx: QueryCtx): Promise<Id<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  return await getAuthUserId(ctx);
}

async function getDashboardData(ctx: QueryCtx, userId: Id<"users">) {
  const [user, userStats, ownedFolders, memberships, userAttempts] = await Promise.all([
    ctx.db.get(userId),
    ctx.db.query("userStats").withIndex("by_user", (q) => q.eq("userId", userId)).first(),
    ctx.db.query("folders").withIndex("by_owner", (q) => q.eq("ownerId", userId)).collect(),
    ctx.db
      .query("folderMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect(),
    ctx.db
      .query("quizAttempts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect(),
  ]);

  const memberFolders = await Promise.all(memberships.map((membership) => ctx.db.get(membership.folderId)));
  const folders = dedupeFolders([...ownedFolders, ...memberFolders.filter((folder) => folder !== null)]);
  const latestAttemptsByQuiz = buildLatestAttemptsByQuiz(userAttempts);

  const folderEntries = await Promise.all(
    folders.map((folder) => getFolderEntry(ctx, folder, latestAttemptsByQuiz, userId)),
  );

  const modules = folderEntries.map(({ module }) => module);
  const tasks = folderEntries
    .flatMap(({ tasks }) => tasks)
    .sort((a, b) => b.signalScore - a.signalScore)
    .slice(0, 5);

  if (folders.length === 0) {
    tasks.push({
      id: "getting-started",
      title: "Create your first course workspace",
      moduleCode: "ATHENA",
      dueLabel: "No courses yet",
      urgency: "medium",
      progress: 48,
      signalScore: 72,
    });
  }

  return {
    modules,
    streakCount: userStats?.currentStreak ?? 0,
    tasks,
    user: {
      image: user?.image ?? null,
      name: user?.name ?? null,
    },
  };
}

function dedupeFolders(folders: Doc<"folders">[]) {
  const uniqueFolders = new Map<string, Doc<"folders">>();

  for (const folder of folders) {
    uniqueFolders.set(folder._id, folder);
  }

  return [...uniqueFolders.values()].sort((a, b) => b.updatedAt - a.updatedAt);
}

function buildLatestAttemptsByQuiz(attempts: Doc<"quizAttempts">[]) {
  const latestAttempts = new Map<string, Doc<"quizAttempts">>();

  for (const attempt of attempts) {
    const current = latestAttempts.get(attempt.quizId);
    if (!current || attempt.startedAt > current.startedAt) {
      latestAttempts.set(attempt.quizId, attempt);
    }
  }

  return latestAttempts;
}

async function getFolderEntry(
  ctx: QueryCtx,
  folder: Doc<"folders">,
  latestAttemptsByQuiz: Map<string, Doc<"quizAttempts">>,
  currentUserId: Id<"users">,
) {
  const [notes, quizzes, members] = await Promise.all([
    ctx.db.query("notes").withIndex("by_folder", (q) => q.eq("folderId", folder._id)).collect(),
    ctx.db.query("quizzes").withIndex("by_folder", (q) => q.eq("folderId", folder._id)).collect(),
    ctx.db
      .query("folderMembers")
      .withIndex("by_folder", (q) => q.eq("folderId", folder._id))
      .collect(),
  ]);

  const tasks = buildFolderTasks(folder, notes, quizzes, latestAttemptsByQuiz);
  const { code, title } = getCourseLabel(folder);
  const collaboratorCount = new Set(members.map((member) => member.userId)).size;
  const isOwner = folder.ownerId === currentUserId;
  const subtitle =
    folder.description?.trim() ||
    (isOwner
      ? collaboratorCount > 0
        ? `${collaboratorCount + 1} learners in this workspace`
        : "Personal workspace"
      : "Shared workspace");

  return {
    module: {
      code,
      id: folder._id,
      noteCount: notes.length,
      pendingTasks: tasks.length,
      subtitle,
      title,
    },
    tasks,
  };
}

function buildFolderTasks(
  folder: Doc<"folders">,
  notes: Doc<"notes">[],
  quizzes: Doc<"quizzes">[],
  latestAttemptsByQuiz: Map<string, Doc<"quizAttempts">>,
) {
  const { code } = getCourseLabel(folder);
  const tasks: Array<{
    id: string;
    title: string;
    moduleCode: string;
    dueLabel: string;
    urgency: "critical" | "medium" | "low";
    progress: number;
    signalScore: number;
  }> = [];

  if (notes.length === 0) {
    tasks.push({
      id: buildTaskId(folder._id, code, "upload-first-note"),
      title: "Upload your first note",
      moduleCode: code,
      dueLabel: "No materials added yet",
      urgency: "medium",
      progress: 44,
      signalScore: 76,
    });
  }

  for (const note of notes) {
    if (note.processingStatus === "failed") {
      tasks.push({
        id: buildTaskId(folder._id, note._id, code, "retry-ingestion"),
        title: `Retry ${note.title}`,
        moduleCode: code,
        dueLabel: "Import needs attention",
        urgency: "critical",
        progress: 12,
        signalScore: 96,
      });
    }

    if (note.processingStatus === "pending" || note.processingStatus === "processing") {
      tasks.push({
        id: buildTaskId(folder._id, note._id, code, "processing"),
        title: `Review ${note.title}`,
        moduleCode: code,
        dueLabel: "Material still processing",
        urgency: "medium",
        progress: 38,
        signalScore: 74,
      });
    }
  }

  if (quizzes.length === 0 && notes.some((note) => note.processingStatus === "ready")) {
    tasks.push({
      id: buildTaskId(folder._id, code, "generate-quiz"),
      title: "Generate your first quiz",
      moduleCode: code,
      dueLabel: "Ready notes are waiting",
      urgency: "medium",
      progress: 52,
      signalScore: 70,
    });
  }

  for (const quiz of quizzes) {
    const latestAttempt = latestAttemptsByQuiz.get(quiz._id);
    if (!latestAttempt) {
      tasks.push({
        id: buildTaskId(folder._id, quiz._id, code, "start-quiz"),
        title: quiz.title,
        moduleCode: code,
        dueLabel: "No quiz attempt yet",
        urgency: "medium",
        progress: 56,
        signalScore: 68,
      });
      continue;
    }

    if (latestAttempt.status === "in_progress" || latestAttempt.status === "abandoned") {
      tasks.push({
        id: buildTaskId(folder._id, quiz._id, code, "resume-quiz"),
        title: `Resume ${quiz.title}`,
        moduleCode: code,
        dueLabel: "Previous attempt unfinished",
        urgency: "critical",
        progress: 20,
        signalScore: 90,
      });
    }
  }

  return tasks.slice(0, 3);
}


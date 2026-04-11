import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { action, internalMutation, mutation, query } from "./_generated/server";
import type { ActionCtx, MutationCtx, QueryCtx } from "./_generated/server";
import { getCourseLabel, normalizeCourseCode } from "./courseLabels";
import { runOcrRequest } from "./ocr";
import { buildTaskId } from "./taskIds";

export const getModuleWorkspace = query({
  args: {
    moduleCode: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx);
    if (!userId) {
      return null;
    }

    const [user, userStats, folder] = await Promise.all([
      ctx.db.get(userId),
      ctx.db
        .query("userStats")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first(),
      getAccessibleFolderByCode(ctx, userId, args.moduleCode),
    ]);

    if (!folder) {
      return null;
    }

    const [notes, quizzes, attempts, scores] = await Promise.all([
      ctx.db
        .query("notes")
        .withIndex("by_folder", (q) => q.eq("folderId", folder._id))
        .collect(),
      ctx.db
        .query("quizzes")
        .withIndex("by_folder", (q) => q.eq("folderId", folder._id))
        .collect(),
      ctx.db
        .query("quizAttempts")
        .withIndex("by_folder", (q) => q.eq("folderId", folder._id))
        .collect(),
      ctx.db
        .query("folderScores")
        .withIndex("by_folder", (q) => q.eq("folderId", folder._id))
        .collect(),
    ]);

    const parsedFolder = getCourseLabel(folder);
    const noteRows = await buildNoteRows(ctx, notes, quizzes);
    const tasks = buildFolderTasks(folder, notes, quizzes, attempts);

    return {
      code: parsedFolder.code,
      description:
        folder.description ??
        "Upload your course materials and let Athena turn them into quizzes.",
      leaderboard: buildLeaderboard(scores, user?.name ?? "You"),
      noteCount: notes.length,
      notes: noteRows,
      participantOverflow: 0,
      participants: [
        {
          id: userId,
          initials: initialsForName(user?.name),
          name: user?.name ?? "You",
        },
      ],
      pendingTasks: tasks.length,
      performance: buildPerformanceSeries(attempts),
      professor: folder.description ?? "Course workspace",
      streakCount: userStats?.currentStreak ?? 0,
      tasks,
      title: parsedFolder.title,
      user: {
        image: user?.image ?? null,
        name: user?.name ?? null,
      },
    };
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAuthenticatedUser(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const createUploadedNote = mutation({
  args: {
    mimeType: v.optional(v.string()),
    moduleCode: v.string(),
    originalFilename: v.string(),
    storageId: v.id("_storage"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthenticatedUser(ctx);
    const folder = await getAccessibleFolderByCode(ctx, userId, args.moduleCode);
    if (!folder) {
      throw new Error("Module not found");
    }

    const documentUrl = await ctx.storage.getUrl(args.storageId);
    if (!documentUrl) {
      throw new Error("Uploaded file could not be read from storage");
    }

    const now = Date.now();
    const noteId = await ctx.db.insert("notes", {
      createdAt: now,
      folderId: folder._id,
      mimeType: args.mimeType,
      originalFilename: args.originalFilename,
      ownerId: userId,
      processingStatus: "processing",
      storageId: args.storageId,
      title: args.title.trim() || args.originalFilename,
      updatedAt: now,
    });

    return { documentUrl, noteId };
  },
});

export const processUploadedNote = action({
  args: {
    documentUrl: v.string(),
    noteId: v.id("notes"),
  },
  handler: async (ctx, args) => {
    await requireAuthenticatedActionUser(ctx);

    try {
      const result = await runOcrRequest({
        document: {
          documentUrl: args.documentUrl,
          type: "document_url",
        },
      });

      const markdownContent = result.pages
        .map((page) => page.markdown.trim())
        .filter(Boolean)
        .join("\n\n---\n\n");

      await ctx.runMutation(internal.modules.saveOcrSuccess, {
        markdownContent,
        noteId: args.noteId,
        ocrPageCount: result.pages.length,
      });

      return {
        noteId: args.noteId,
        pageCount: result.pages.length,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "OCR failed";
      await ctx.runMutation(internal.modules.saveOcrFailure, {
        noteId: args.noteId,
        processingError: message,
      });
      throw error;
    }
  },
});

export const saveOcrSuccess = internalMutation({
  args: {
    markdownContent: v.string(),
    noteId: v.id("notes"),
    ocrPageCount: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.noteId, {
      markdownContent: args.markdownContent,
      ocrPageCount: args.ocrPageCount,
      processingStatus: "ready",
      updatedAt: Date.now(),
    });
  },
});

export const saveOcrFailure = internalMutation({
  args: {
    noteId: v.id("notes"),
    processingError: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.noteId, {
      processingError: args.processingError,
      processingStatus: "failed",
      updatedAt: Date.now(),
    });
  },
});

async function buildNoteRows(
  ctx: QueryCtx,
  notes: Doc<"notes">[],
  quizzes: Doc<"quizzes">[],
) {
  const quizCountByNoteId = new Map<string, number>();
  for (const quiz of quizzes) {
    if (!quiz.noteId) {
      continue;
    }
    quizCountByNoteId.set(
      quiz.noteId,
      (quizCountByNoteId.get(quiz.noteId) ?? 0) + 1,
    );
  }

  return await Promise.all(
    [...notes].sort((a, b) => b.updatedAt - a.updatedAt).map(async (note) => ({
      fileUrl: note.storageId ? await ctx.storage.getUrl(note.storageId) : null,
      id: note._id,
      lastUpdated: note.updatedAt,
      pages: note.ocrPageCount ?? 0,
      processingStatus: note.processingStatus,
      quizzes: quizCountByNoteId.get(note._id) ?? 0,
      sharedWith: [] as string[],
      title: note.title,
    })),
  );
}

async function getAuthenticatedUserId(ctx: QueryCtx): Promise<Id<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  return await getAuthUserId(ctx);
}

async function requireAuthenticatedUser(ctx: MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("User record not found");
  }

  return userId;
}

async function requireAuthenticatedActionUser(ctx: ActionCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("User record not found");
  }

  return userId;
}

async function getAccessibleFolderByCode(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  moduleCode: string,
) {
  const [ownedFolders, memberships] = await Promise.all([
    ctx.db
      .query("folders")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .collect(),
    ctx.db
      .query("folderMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect(),
  ]);

  const memberFolders = await Promise.all(
    memberships.map((membership) => ctx.db.get(membership.folderId)),
  );

  const normalizedCode = normalizeCourseCode(moduleCode);
  if (!normalizedCode) {
    return null;
  }
  return (
    [...ownedFolders, ...memberFolders.filter((folder) => folder !== null)].find(
      (folder) => getCourseLabel(folder).code === normalizedCode,
    ) ?? null
  );
}

function initialsForName(name: string | null | undefined) {
  if (!name) {
    return "YU";
  }

  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function buildLeaderboard(scores: Doc<"folderScores">[], currentUserName: string) {
  const sortedScores = [...scores].sort((a, b) => b.points - a.points);
  if (sortedScores.length === 0) {
    return [{ name: currentUserName, streakCount: 0 }];
  }

  return sortedScores.slice(0, 8).map((score, index) => ({
    name: index === 0 ? currentUserName : `Learner ${index + 1}`,
    streakCount: Math.max(1, Math.round(score.points / 20)),
  }));
}

function buildPerformanceSeries(attempts: Doc<"quizAttempts">[]) {
  const base = [180, 150, 120, 90, 60, 45, 30, 21, 14, 7, 6, 5, 4, 3, 2, 1];
  const completedCount = attempts.filter(
    (attempt) => attempt.status === "completed",
  ).length;

  return base.map((daysAgo, index) => ({
    aggregate: 18 + index * 2,
    daysAgo,
    fullLabel: `${daysAgo} days ago`,
    label: daysAgo >= 30 ? `${Math.round(daysAgo / 30)}M` : `${daysAgo}D`,
    user: Math.max(12, 20 + completedCount * 4 + index * 3),
  }));
}

function buildFolderTasks(
  folder: Doc<"folders">,
  notes: Doc<"notes">[],
  quizzes: Doc<"quizzes">[],
  attempts: Doc<"quizAttempts">[],
) {
  const latestAttemptsByQuiz = new Map<string, Doc<"quizAttempts">>();
  for (const attempt of attempts) {
    const current = latestAttemptsByQuiz.get(attempt.quizId);
    if (!current || attempt.startedAt > current.startedAt) {
      latestAttemptsByQuiz.set(attempt.quizId, attempt);
    }
  }

  const code = getCourseLabel(folder).code;
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
      dueLabel: "No materials added yet",
      id: buildTaskId(folder._id, code, "upload-first-note"),
      moduleCode: code,
      progress: 44,
      signalScore: 76,
      title: "Upload your first note",
      urgency: "medium",
    });
  }

  for (const note of notes) {
    if (note.processingStatus === "failed") {
      tasks.push({
        dueLabel: "Import needs attention",
        id: buildTaskId(folder._id, note._id, code, "retry-ingestion"),
        moduleCode: code,
        progress: 12,
        signalScore: 96,
        title: `Retry ${note.title}`,
        urgency: "critical",
      });
    }

    if (
      note.processingStatus === "pending" ||
      note.processingStatus === "processing"
    ) {
      tasks.push({
        dueLabel: "Material still processing",
        id: buildTaskId(folder._id, note._id, code, "processing"),
        moduleCode: code,
        progress: 38,
        signalScore: 74,
        title: `Review ${note.title}`,
        urgency: "medium",
      });
    }
  }

  if (quizzes.length === 0 && notes.some((note) => note.processingStatus === "ready")) {
    tasks.push({
      dueLabel: "Ready notes are waiting",
      id: buildTaskId(folder._id, code, "generate-quiz"),
      moduleCode: code,
      progress: 52,
      signalScore: 70,
      title: "Generate your first quiz",
      urgency: "medium",
    });
  }

  for (const quiz of quizzes) {
    const latestAttempt = latestAttemptsByQuiz.get(quiz._id);
    if (!latestAttempt) {
      tasks.push({
        dueLabel: "No quiz attempt yet",
        id: buildTaskId(folder._id, quiz._id, code, "start-quiz"),
        moduleCode: code,
        progress: 56,
        signalScore: 68,
        title: quiz.title,
        urgency: "medium",
      });
      continue;
    }

    if (
      latestAttempt.status === "in_progress" ||
      latestAttempt.status === "abandoned"
    ) {
      tasks.push({
        dueLabel: "Previous attempt unfinished",
        id: buildTaskId(folder._id, quiz._id, code, "resume-quiz"),
        moduleCode: code,
        progress: 20,
        signalScore: 90,
        title: `Resume ${quiz.title}`,
        urgency: "critical",
      });
    }
  }

  return tasks.slice(0, 5);
}

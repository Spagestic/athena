import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import type { Doc, Id } from "./_generated/dataModel";
import { internalMutation, mutation, type MutationCtx } from "./_generated/server";

const demoModules = [
  {
    code: "COMP1021",
    description: "Prof. Gibson Lam",
    noteCount: 18,
    pendingTasks: 4,
    quizCount: 5,
    title: "Introduction to Computer Science",
  },
  {
    code: "MATH1014",
    description: "Kam Hang Cheng",
    noteCount: 11,
    pendingTasks: 3,
    quizCount: 4,
    title: "Calculus 2",
  },
  {
    code: "PHYS1112",
    description: "Kirill Prokofiev",
    noteCount: 14,
    pendingTasks: 2,
    quizCount: 4,
    title: "General Physics 1",
  },
] as const;

const demoTasks = [
  {
    dueLabel: "Due in 4 hours",
    moduleCode: "COMP1021",
    progress: 12,
    signalScore: 93,
    title: "Lab checkpoint upload",
    urgency: "critical",
  },
  {
    dueLabel: "Due in 1 day",
    moduleCode: "MATH1014",
    progress: 38,
    signalScore: 71,
    title: "Problem set 06",
    urgency: "medium",
  },
  {
    dueLabel: "Due in 2 days",
    moduleCode: "PHYS1112",
    progress: 51,
    signalScore: 64,
    title: "Momentum quiz prep",
    urgency: "medium",
  },
  {
    dueLabel: "Due in 4 days",
    moduleCode: "COMP1021",
    progress: 79,
    signalScore: 42,
    title: "Recursion review notes",
    urgency: "low",
  },
  {
    dueLabel: "Due in 6 days",
    moduleCode: "PHYS1112",
    progress: 91,
    signalScore: 28,
    title: "Optics summary sheet",
    urgency: "low",
  },
] as const;

const questionsPerQuiz = 3;

export const seedMyDashboardDemo = mutation({
  args: {
    resetExisting: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthenticatedUser(ctx);
    return await seedDashboardDataForUser(ctx, userId, args.resetExisting ?? false);
  },
});

export const seedDashboardDemoForUser = internalMutation({
  args: {
    resetExisting: v.optional(v.boolean()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await seedDashboardDataForUser(ctx, args.userId, args.resetExisting ?? false);
  },
});

async function seedDashboardDataForUser(
  ctx: MutationCtx,
  userId: Id<"users">,
  resetExisting: boolean,
) {
  if (resetExisting) {
    await clearExistingDemoData(ctx, userId);
  }

  const existingFolders = await ctx.db
    .query("folders")
    .withIndex("by_owner", (q) => q.eq("ownerId", userId))
    .collect();
  if (existingFolders.length > 0 && !resetExisting) {
    return {
      created: false,
      message: "Demo data already exists for this user.",
    };
  }

  const now = Date.now();
  const folderIdsByCode = new Map<string, Id<"folders">>();
  let nextTimestamp = now;

    for (const course of demoModules) {
    const folderId = await ctx.db.insert("folders", {
      createdAt: nextTimestamp,
        description: course.description,
        name: `${course.code} - ${course.title}`,
      ownerId: userId,
      updatedAt: nextTimestamp,
    });
    folderIdsByCode.set(course.code, folderId);

    await ctx.db.insert("folderMembers", {
      folderId,
      joinedAt: nextTimestamp,
      role: "owner",
      userId,
    });

    for (let index = 0; index < course.noteCount; index += 1) {
      const noteTimestamp = nextTimestamp + index * 1_000;
      const status =
        index === 0 && course.code === "COMP1021"
          ? "processing"
          : index === 1 && course.code === "PHYS1112"
            ? "failed"
            : "ready";

      await ctx.db.insert("notes", {
        createdAt: noteTimestamp,
        folderId,
        markdownContent:
          status === "ready"
            ? `# ${course.title} Note ${index + 1}\n\nCore concepts and review prompts for ${course.code}.`
            : undefined,
        mimeType: "text/markdown",
        originalFilename: `${course.code.toLowerCase()}-lecture-${index + 1}.md`,
        ownerId: userId,
        processingError:
          status === "failed" ? "OCR import stalled on a scanned page." : undefined,
        processingStatus: status,
        title: `${course.code} Lecture ${index + 1}`,
        updatedAt: noteTimestamp,
      });
    }

    for (let quizIndex = 0; quizIndex < course.quizCount; quizIndex += 1) {
      const quizTimestamp = nextTimestamp + 10_000 + quizIndex * 1_000;
      const quizId = await ctx.db.insert("quizzes", {
        createdAt: quizTimestamp,
        creatorId: userId,
        folderId,
        title: `${course.code} Quiz ${quizIndex + 1}`,
        updatedAt: quizTimestamp,
      });

      for (let questionIndex = 0; questionIndex < questionsPerQuiz; questionIndex += 1) {
        await ctx.db.insert("quizQuestions", {
          choices: [
            "Correct concept",
            "Common misconception",
            "Needs review",
            "Not covered",
          ],
          conceptTag: `${course.code.toLowerCase()}-concept-${questionIndex + 1}`,
          correctIndex: 0,
          explanation: `Review the lecture notes for ${course.code} before retrying.`,
          order: questionIndex,
          prompt: `${course.title}: checkpoint question ${questionIndex + 1}`,
          quizId,
        });
      }
    }

    nextTimestamp += 100_000;
  }

  const createdAttempts = await createDemoAttempts(ctx, userId, folderIdsByCode, now);

  const currentStreak = 67;
  const existingStats = await ctx.db
    .query("userStats")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();

  if (existingStats) {
    await ctx.db.patch(existingStats._id, {
      currentStreak,
      longestStreak: Math.max(existingStats.longestStreak, currentStreak),
      totalPoints: 4_820,
      updatedAt: now,
    });
  } else {
    await ctx.db.insert("userStats", {
      currentStreak,
      lastActiveDay: new Date(now).toISOString().slice(0, 10),
      longestStreak: currentStreak,
      totalPoints: 4_820,
      updatedAt: now,
      userId,
    });
  }

  for (const course of demoModules) {
    const folderId = folderIdsByCode.get(course.code);
    if (!folderId) {
      continue;
    }

    await ctx.db.insert("folderScores", {
      folderId,
      points: scoreForModule(course.code),
      quizzesCompleted: completedQuizzesForModule(course.code),
      updatedAt: now,
      userId,
    });
  }

  return {
    created: true,
    folders: demoModules.length,
    notes: demoModules.reduce((sum, course) => sum + course.noteCount, 0),
    quizAttempts: createdAttempts,
  };
}

async function createDemoAttempts(
  ctx: MutationCtx,
  userId: Id<"users">,
  folderIdsByCode: Map<string, Id<"folders">>,
  now: number,
) {
  let createdAttempts = 0;

  for (const task of demoTasks) {
    const folderId = folderIdsByCode.get(task.moduleCode);
    if (!folderId) {
      continue;
    }

    const quiz = await ctx.db
      .query("quizzes")
      .withIndex("by_folder", (q) => q.eq("folderId", folderId))
      .first();
    if (!quiz) {
      continue;
    }

    const questionCount = questionsPerQuiz;
    const correctCount =
      task.urgency === "critical" ? 1 : task.urgency === "medium" ? 2 : 3;

    await ctx.db.insert("quizAttempts", {
      completedAt: task.urgency === "critical" ? undefined : now - task.progress * 1_000,
      correctCount: task.urgency === "critical" ? undefined : correctCount,
      folderId,
      questionCount,
      quizId: quiz._id,
      startedAt: now - task.progress * 2_000,
      status: task.urgency === "critical" ? "in_progress" : "completed",
      totalDurationMs:
        task.urgency === "critical" ? undefined : 90_000 + task.signalScore * 100,
      userId,
    });
    createdAttempts += 1;
  }

  return createdAttempts;
}

async function clearExistingDemoData(ctx: MutationCtx, userId: Id<"users">) {
  const folders = await ctx.db
    .query("folders")
    .withIndex("by_owner", (q) => q.eq("ownerId", userId))
    .collect();

  for (const folder of folders) {
    await deleteFolderGraph(ctx, folder);
  }

  const userStats = await ctx.db
    .query("userStats")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();
  if (userStats) {
    await ctx.db.delete(userStats._id);
  }
}

async function deleteFolderGraph(ctx: MutationCtx, folder: Doc<"folders">) {
  const [notes, members, quizzes, scores, attempts] = await Promise.all([
    ctx.db.query("notes").withIndex("by_folder", (q) => q.eq("folderId", folder._id)).collect(),
    ctx.db
      .query("folderMembers")
      .withIndex("by_folder", (q) => q.eq("folderId", folder._id))
      .collect(),
    ctx.db.query("quizzes").withIndex("by_folder", (q) => q.eq("folderId", folder._id)).collect(),
    ctx.db
      .query("folderScores")
      .withIndex("by_folder", (q) => q.eq("folderId", folder._id))
      .collect(),
    ctx.db
      .query("quizAttempts")
      .withIndex("by_folder", (q) => q.eq("folderId", folder._id))
      .collect(),
  ]);

  for (const note of notes) {
    await ctx.db.delete(note._id);
  }

  for (const member of members) {
    await ctx.db.delete(member._id);
  }

  for (const score of scores) {
    await ctx.db.delete(score._id);
  }

  for (const attempt of attempts) {
    const responses = await ctx.db
      .query("questionResponses")
      .withIndex("by_attempt", (q) => q.eq("attemptId", attempt._id))
      .collect();
    for (const response of responses) {
      await ctx.db.delete(response._id);
    }
    await ctx.db.delete(attempt._id);
  }

  for (const quiz of quizzes) {
    const questions = await ctx.db
      .query("quizQuestions")
      .withIndex("by_quiz", (q) => q.eq("quizId", quiz._id))
      .collect();
    for (const question of questions) {
      await ctx.db.delete(question._id);
    }
    await ctx.db.delete(quiz._id);
  }

  await ctx.db.delete(folder._id);
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

function scoreForModule(moduleCode: string) {
  switch (moduleCode) {
    case "COMP1021":
      return 1_840;
    case "MATH1014":
      return 1_620;
    case "PHYS1112":
      return 1_360;
    default:
      return 0;
  }
}

function completedQuizzesForModule(moduleCode: string) {
  switch (moduleCode) {
    case "COMP1021":
      return 4;
    case "MATH1014":
      return 3;
    case "PHYS1112":
      return 2;
    default:
      return 0;
  }
}

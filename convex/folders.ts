import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { mutation, type MutationCtx } from "./_generated/server";
import { getCourseLabel, normalizeCourseCode } from "./courseLabels";

export const createFolder = mutation({
  args: {
    code: v.string(),
    description: v.optional(v.string()),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthenticatedUser(ctx);
    const code = normalizeCourseCode(args.code);
    const name = args.name.trim();
    const description = args.description?.trim();

    if (name.length < 3) {
      throw new Error("Course name must be at least 3 characters.");
    }

    if (!code) {
      throw new Error("Course code is required.");
    }

    if (code.length > 8) {
      throw new Error("Course code must be 8 characters or fewer.");
    }

    if (!/^[A-Z0-9-]+$/.test(code)) {
      throw new Error("Course code can only contain letters, numbers, and hyphens.");
    }

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
    const hasConflict = [...ownedFolders, ...memberFolders.filter((folder) => folder !== null)].some(
      (folder) => getCourseLabel(folder).code === code,
    );

    if (hasConflict) {
      throw new Error("You already have a course with that code.");
    }

    const now = Date.now();
    const folderId = await ctx.db.insert("folders", {
      code,
      createdAt: now,
      description: description ? description : undefined,
      name,
      ownerId: userId,
      updatedAt: now,
    });

    await ctx.db.insert("folderMembers", {
      folderId,
      joinedAt: now,
      role: "owner",
      userId,
    });

    return folderId;
  },
});

export const deleteFolder = mutation({
  args: {
    folderId: v.id("folders"),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthenticatedUser(ctx);
    const folder = await ctx.db.get(args.folderId);

    if (!folder) {
      throw new Error("Course not found");
    }

    if (folder.ownerId !== userId) {
      throw new Error("Only the course owner can delete this class.");
    }

    const notes = await ctx.db
      .query("notes")
      .withIndex("by_folder", (q) => q.eq("folderId", args.folderId))
      .take(1000);
    for (const note of notes) {
      await ctx.db.delete(note._id);
    }

    const quizzes = await ctx.db
      .query("quizzes")
      .withIndex("by_folder", (q) => q.eq("folderId", args.folderId))
      .take(1000);
    for (const quiz of quizzes) {
      const questions = await ctx.db
        .query("quizQuestions")
        .withIndex("by_quiz", (q) => q.eq("quizId", quiz._id))
        .take(1000);
      for (const question of questions) {
        await ctx.db.delete(question._id);
      }
      await ctx.db.delete(quiz._id);
    }

    const attempts = await ctx.db
      .query("quizAttempts")
      .withIndex("by_folder", (q) => q.eq("folderId", args.folderId))
      .take(1000);
    for (const attempt of attempts) {
      const responses = await ctx.db
        .query("questionResponses")
        .withIndex("by_attempt", (q) => q.eq("attemptId", attempt._id))
        .take(1000);
      for (const response of responses) {
        await ctx.db.delete(response._id);
      }
      await ctx.db.delete(attempt._id);
    }

    const scores = await ctx.db
      .query("folderScores")
      .withIndex("by_folder", (q) => q.eq("folderId", args.folderId))
      .take(1000);
    for (const score of scores) {
      await ctx.db.delete(score._id);
    }

    const memberships = await ctx.db
      .query("folderMembers")
      .withIndex("by_folder", (q) => q.eq("folderId", args.folderId))
      .take(1000);
    for (const membership of memberships) {
      await ctx.db.delete(membership._id);
    }

    await ctx.db.delete(args.folderId);
    return { deleted: true };
  },
});

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

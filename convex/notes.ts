import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";

export const getNote = query({
  args: {
    id: v.id("notes"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx);
    if (!userId) {
      return null;
    }

    const note = await ctx.db.get(args.id);
    if (!note) {
      return null;
    }

    const hasAccess = await userHasFolderAccess(ctx, userId, note.folderId);
    if (!hasAccess) {
      return null;
    }

    const [folder, fileUrl, quiz] = await Promise.all([
      ctx.db.get(note.folderId),
      note.storageId ? ctx.storage.getUrl(note.storageId) : Promise.resolve(null),
      ctx.db
        .query("quizzes")
        .withIndex("by_note", (q) => q.eq("noteId", note._id))
        .first(),
    ]);

    const questions = quiz
      ? await ctx.db
          .query("quizQuestions")
          .withIndex("by_quiz", (q) => q.eq("quizId", quiz._id))
          .collect()
      : [];

    return {
      code: folder ? parseCourseLabel(folder.name).code : "NOTE",
      fileUrl,
      id: note._id,
      markdownContent: note.markdownContent ?? "",
      mimeType: note.mimeType ?? null,
      originalFilename: note.originalFilename ?? null,
      processingError: note.processingError ?? null,
      processingStatus: note.processingStatus,
      quiz: quiz
        ? {
            id: quiz._id,
            title: quiz.title,
            questions: questions.map((question) => ({
              choices: question.choices,
              conceptTag: question.conceptTag ?? null,
              correctIndex: question.correctIndex,
              explanation: question.explanation ?? null,
              id: question._id,
              order: question.order,
              prompt: question.prompt,
            })),
          }
        : null,
      title: note.title,
      updatedAt: note.updatedAt,
    };
  },
});

async function getAuthenticatedUserId(ctx: QueryCtx): Promise<Id<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  return await getAuthUserId(ctx);
}

async function userHasFolderAccess(
  ctx: QueryCtx,
  userId: Id<"users">,
  folderId: Id<"folders">,
) {
  const [folder, membership] = await Promise.all([
    ctx.db.get(folderId),
    ctx.db
      .query("folderMembers")
      .withIndex("by_folder_and_user", (q) =>
        q.eq("folderId", folderId).eq("userId", userId),
      )
      .first(),
  ]);

  return folder?.ownerId === userId || membership !== null;
}

function parseCourseLabel(name: string) {
  const [maybeCode, ...rest] = name.split(/\s[-–—]\s/);
  if (rest.length > 0 && looksLikeCourseCode(maybeCode)) {
    return {
      code: maybeCode.toUpperCase(),
      title: rest.join(" - "),
    };
  }

  return {
    code: name.slice(0, 6).toUpperCase(),
    title: name,
  };
}

function looksLikeCourseCode(value: string) {
  return /^[A-Za-z]{2,}\d{1,}[A-Za-z0-9-]*$/.test(value.replace(/\s+/g, ""));
}

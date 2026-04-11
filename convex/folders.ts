import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { mutation, type MutationCtx } from "./_generated/server";

export const createFolder = mutation({
  args: {
    description: v.optional(v.string()),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthenticatedUser(ctx);
    const name = args.name.trim();
    const description = args.description?.trim();

    if (name.length < 3) {
      throw new Error("Course name must be at least 3 characters.");
    }

    const now = Date.now();
    const folderId = await ctx.db.insert("folders", {
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

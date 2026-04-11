import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const processingStatus = v.union(
  v.literal("pending"),
  v.literal("processing"),
  v.literal("ready"),
  v.literal("failed"),
);

const quizAttemptStatus = v.union(
  v.literal("in_progress"),
  v.literal("completed"),
  v.literal("abandoned"),
);

const folderRole = v.union(v.literal("owner"), v.literal("member"));

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,

  users: defineTable({
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.float64()),
    image: v.optional(v.string()),
    isAnonymous: v.optional(v.boolean()),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.float64()),
  })
    .index("email", ["email"])
    .index("phone", ["phone"]),

  /** Course workspace (folder) per README; owner creates and uploads materials. */
  folders: defineTable({
    ownerId: v.id("users"),
    code: v.optional(v.string()),
    name: v.string(),
    description: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_code", ["code"]),

  /** Shared access for per-folder leaderboards and collaborative workspaces. */
  folderMembers: defineTable({
    folderId: v.id("folders"),
    userId: v.id("users"),
    role: folderRole,
    joinedAt: v.number(),
  })
    .index("by_folder", ["folderId"])
    .index("by_user", ["userId"])
    .index("by_folder_and_user", ["folderId", "userId"]),

  /** Lecture materials: OCR → Markdown, grounded quiz source. */
  notes: defineTable({
    folderId: v.id("folders"),
    ownerId: v.id("users"),
    title: v.string(),
    markdownContent: v.optional(v.string()),
    ocrPageCount: v.optional(v.number()),
    originalFilename: v.optional(v.string()),
    mimeType: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    processingStatus,
    processingError: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_folder", ["folderId"])
    .index("by_owner", ["ownerId"])
    .index("by_folder_and_status", ["folderId", "processingStatus"]),

  /** Quiz shell: per note or per folder (noteId unset = folder-level). */
  quizzes: defineTable({
    folderId: v.id("folders"),
    noteId: v.optional(v.id("notes")),
    creatorId: v.id("users"),
    title: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_folder", ["folderId"])
    .index("by_note", ["noteId"])
    .index("by_creator", ["creatorId"]),

  /** MCQ items; grounded in user materials, with optional concept tag for misconceptions. */
  quizQuestions: defineTable({
    quizId: v.id("quizzes"),
    order: v.number(),
    prompt: v.string(),
    choices: v.array(v.string()),
    correctIndex: v.number(),
    explanation: v.optional(v.string()),
    conceptTag: v.optional(v.string()),
  }).index("by_quiz", ["quizId", "order"]),

  /** One learner session on a quiz (accuracy, latency, skip signals). */
  quizAttempts: defineTable({
    quizId: v.id("quizzes"),
    userId: v.id("users"),
    folderId: v.id("folders"),
    status: quizAttemptStatus,
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    correctCount: v.optional(v.number()),
    questionCount: v.optional(v.number()),
    /** Total time on quiz in ms (engagement / drift signals). */
    totalDurationMs: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_quiz", ["quizId"])
    .index("by_user_and_quiz", ["userId", "quizId"])
    .index("by_folder", ["folderId"])
    .index("by_user_and_started", ["userId", "startedAt"]),

  /** Per-question telemetry for misconception detection and follow-up generation. */
  questionResponses: defineTable({
    attemptId: v.id("quizAttempts"),
    questionId: v.id("quizQuestions"),
    selectedIndex: v.number(),
    isCorrect: v.boolean(),
    latencyMs: v.optional(v.number()),
    skipped: v.boolean(),
    answeredAt: v.number(),
    /** Short targeted feedback after incorrect answers (agent-generated). */
    feedbackMarkdown: v.optional(v.string()),
  }).index("by_attempt", ["attemptId"]),

  /** Streaks, points, and momentum layer (one row per user). */
  userStats: defineTable({
    userId: v.id("users"),
    currentStreak: v.number(),
    longestStreak: v.number(),
    /** Calendar day (e.g. YYYY-MM-DD) of last counted activity for streak logic. */
    lastActiveDay: v.optional(v.string()),
    totalPoints: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  /** Per-folder totals for leaderboards among folder members. */
  folderScores: defineTable({
    folderId: v.id("folders"),
    userId: v.id("users"),
    points: v.number(),
    quizzesCompleted: v.number(),
    updatedAt: v.number(),
  })
    .index("by_folder", ["folderId"])
    .index("by_folder_and_user", ["folderId", "userId"])
    .index("by_folder_and_points", ["folderId", "points"]),
});

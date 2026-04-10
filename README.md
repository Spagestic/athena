# Athena – Learning Momentum Keeper

Athena is an agentic AI study companion that helps students maintain learning momentum by turning their course materials into adaptive quizzes that detect misconceptions early and nudge them back on track.

## What is Athena?

Athena is a simplified, education-focused clone of Memo AI, designed for the GDGOnCampus HKUST 2026 Hackathon under the **Education – Learning Momentum Keeper** track. Students upload their lecture materials, and Athena turns them into structured knowledge checks that continuously adapt based on learner performance.

Core idea: instead of waiting for students to ask for help, Athena identifies early signals of confusion (wrong answers, slow responses, repeated hesitation) and proactively reinforces the right concepts through targeted quizzes and feedback.

## Key features

- **Course workspaces (folders)**
  - Create folders for each course and upload lecture notes (PDF, PPTX, DOCX, etc.).
  - Files are automatically converted to Markdown and stored as structured knowledge units.

- **Mistral OCR–powered content ingestion**
  - Use Mistral OCR to extract text from uploaded documents.
  - Normalize content into clean Markdown that is easy to index, chunk, and quiz over.

- **Adaptive MCQ generation**
  - Automatically generate multiple-choice quizzes per note or per folder.
  - Questions are grounded strictly in the user’s own materials to match course context.

- **Misconception detection & feedback**
  - Track which questions the learner gets wrong and which ones take unusually long to answer.
  - Infer likely misconceptions and provide short, targeted explanations to “debug” the learner’s thinking.
  - Use this signal to generate follow-up questions that probe and fix specific misunderstandings.

- **Momentum and engagement layer**
  - Streaks for consecutive active days or completed quizzes.
  - Points for correct answers and difficulty-scaled rewards.
  - Per-folder leaderboards so friends can share a course workspace and compare progress.

- **Agentic behavior (Learning Momentum Keeper)**
  - Monitor a learner’s recent performance patterns (accuracy, latency, skipped quizzes).
  - Detect early drift (e.g., increasing time-to-answer, more errors on prerequisite concepts).
  - Autonomously propose short review sessions, targeted micro-quizzes, or concept refreshers before the learner explicitly asks for help.

## Tech stack

Athena is built on a modern full-stack TypeScript stack:

- **Convex** for backend database, real-time data, and server functions.
- **Next.js** for the frontend app and routing.
- **React** for UI components and interactivity.
- **Tailwind CSS** for styling and rapid UI development.
- **Convex Auth** for authentication and session management.
- **Mistral OCR + LLMs** for document text extraction, quiz generation, and misconception feedback.

## Getting started

If you just cloned this codebase and didn’t use `bun create convex`, run:

```bash
bun install
bun run dev
```

Then set up Convex Auth:

```bash
npx @convex-dev/auth
```

This will guide you through configuring authentication for your project.

Once the app is running:

1. Sign in with your configured auth provider.
2. Create a new folder for a course (e.g., “MATH101 – Calculus I”).
3. Upload a lecture file (PDF, PPTX, DOCX, etc.).
4. Let Athena process the file into Markdown and generate a quiz.
5. Take the quiz to start building your streak and let Athena learn your misconceptions.

## Project structure

High-level structure (may differ slightly as the project evolves):

- `convex/` – Convex schema, queries, and mutations for:
  - Users, folders, notes, quizzes, attempts, scores, and leaderboards.
- `app/` – Next.js routes and pages:
  - Auth flows, dashboard, folder view, quiz-taking UI.
- `components/` – Shared UI components:
  - Upload components, quiz UI, leaderboards, streak indicators, etc.
- `lib/` – Client-side utilities:
  - API hooks, quiz logic, timing and telemetry helpers.
- `styles/` – Tailwind and global styles.

## Learn more about Convex

To learn more about developing Athena with Convex and this template:

- The [Tour of Convex](https://docs.convex.dev/get-started) for a thorough introduction to Convex.
- The rest of the [Convex docs](https://docs.convex.dev/) for all Convex features.
- [Stack](https://stack.convex.dev/) for in-depth articles on advanced topics.
- [Convex Auth docs](https://labs.convex.dev/auth) for authentication details.

## Authentication configuration

To configure or switch authentication methods (e.g., providers, settings), see the [Convex Auth configuration guide](https://labs.convex.dev/auth/config).

## Contributing / Hackathon notes

This project is currently being developed for the **GDGOnCampus HKUST 2026 Hackathon**. During the event:

- Focus is on rapid iteration of:
  - Misconception detection quality.
  - Recovery strategies that feel helpful, not punitive.
  - Gamification that motivates without adding stress.
- Feel free to open issues or PRs during the hackathon to:
  - Improve the quiz UX.
  - Add new momentum signals (e.g., inactivity windows, topic-wise mastery).
  - Enhance dashboards, leaderboards, or analytics.

## Community

Join thousands of developers building full-stack apps with Convex:

- Join the [Convex Discord community](https://convex.dev/community) for help.
- Follow [Convex on GitHub](https://github.com/get-convex/) to star and contribute to Convex.

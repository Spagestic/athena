"use client"

import type { CSSProperties } from "react"
import { useMemo, useState } from "react"
import { useParams } from "next/navigation"
import {
  ChatContainerContent,
  ChatContainerRoot,
} from "@/components/prompt-kit/chat-container"
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
} from "@/components/prompt-kit/message"
import {
  PromptInput,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/prompt-kit/prompt-input"
import {
  Source,
  SourceContent,
  SourceTrigger,
} from "@/components/prompt-kit/source"
import { TextShimmerLoader } from "@/components/prompt-kit/loader"
import {
  Steps,
  StepsContent,
  StepsItem,
  StepsTrigger,
} from "@/components/prompt-kit/steps"
import { ScrollButton } from "@/components/prompt-kit/scroll-button"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import {
  ArrowUp,
  BookOpen,
  Brain,
  Clock3,
  Copy,
  FileText,
  ListChecks,
  MessageSquare,
  Sparkles,
  Tags,
} from "lucide-react"

type NoteSection = {
  title: string
  body: string[]
}

type NoteSource = {
  title: string
  detail: string
}

type NoteTemplate = {
  slugKeywords: string[]
  moduleCode: string
  title: string
  category: string
  updatedAt: string
  readingTime: string
  masteryLabel: string
  overview: string
  takeaways: string[]
  checklist: string[]
  tags: string[]
  sections: NoteSection[]
  sources: NoteSource[]
  chatPrompts: string[]
}

const noteTemplates: NoteTemplate[] = [
  {
    slugKeywords: ["calc", "integr", "math"],
    moduleCode: "MATH1014",
    title: "Integration Techniques Field Guide",
    category: "Revision note",
    updatedAt: "Updated today",
    readingTime: "8 min read",
    masteryLabel: "78% mastery",
    overview:
      "A compact study sheet that helps you identify which integration technique to use, what cue to look for, and where students usually lose marks.",
    takeaways: [
      "Start by simplifying algebraically before choosing a technique.",
      "Use substitution when the derivative of the inner expression is already visible.",
      "Reserve integration by parts for products that become simpler after differentiation.",
    ],
    checklist: [
      "Classify the integrand before expanding or rearranging anything.",
      "Write down the transformed integral after every substitution.",
      "Add the constant of integration on all indefinite integrals.",
      "Back-substitute immediately so the final answer returns to x.",
    ],
    tags: ["substitution", "parts", "partial fractions", "trig identities"],
    sections: [
      {
        title: "Decision process",
        body: [
          "Treat the first ten seconds as a classification step, not a solving step. Look for nested functions, products that split naturally, rational forms, or trig patterns before you move any symbols around.",
          "That pause matters because most weak solutions fail before the calculus begins. Students often choose a familiar technique too early, then force the algebra to match it instead of reading the structure of the integrand first.",
        ],
      },
      {
        title: "Substitution cues",
        body: [
          "Substitution is strongest when one part of the integrand behaves like the derivative of another. If you can point to an inner expression and say 'its derivative is almost here already', that is usually your first choice.",
          "When the derivative is off by a constant, adjust it deliberately rather than hoping the marker understands the shortcut. Explicit factor balancing keeps the method easy to follow and easier to verify.",
        ],
      },
      {
        title: "When parts wins",
        body: [
          "Use integration by parts when differentiation makes one factor simpler while the other remains integrable. Logarithms, inverse trig functions, and polynomial-exponential products are classic fits because the complexity steadily falls.",
          "Pick u for the term you want to simplify. The method works best when each pass reduces the problem instead of preserving the same difficulty under a new label.",
        ],
      },
      {
        title: "Checking your work",
        body: [
          "Differentiate your final line mentally if possible. A fast derivative check catches missing constants, sign flips, and unreturned substitutions faster than redoing the entire question.",
          "In timed work, this is the cheapest quality-control step you have. One derivative pass can recover several marks that would otherwise disappear to a careless finish.",
        ],
      },
    ],
    sources: [
      {
        title: "Lecture 07 worked examples",
        detail: "Past-paper style integrals with method annotations",
      },
      {
        title: "Tutorial sheet B",
        detail: "Comparison set for substitution vs parts",
      },
      {
        title: "Midterm error log",
        detail: "Common mistakes collected from peer review",
      },
    ],
    chatPrompts: [
      "Explain when substitution is better than integration by parts.",
      "Turn this note into a 5-question quiz.",
      "Summarize the main mistakes to avoid before the midterm.",
    ],
  },
  {
    slugKeywords: ["phys", "momentum", "impulse", "collision"],
    moduleCode: "PHYS1112",
    title: "Momentum and Collisions Studio Sheet",
    category: "Concept note",
    updatedAt: "Synced 2 hours ago",
    readingTime: "7 min read",
    masteryLabel: "82% mastery",
    overview:
      "A cleaner explanation of conservation of momentum, impulse, and collision reasoning, designed for quick review before tutorial and quiz work.",
    takeaways: [
      "Always define the system boundary before applying conservation laws.",
      "Impulse tracks force over time and links directly to momentum change.",
      "Energy may not be conserved in inelastic collisions even when momentum is.",
    ],
    checklist: [
      "Draw the before-and-after states with directions.",
      "Choose a positive axis and keep it consistent.",
      "Separate conservation of momentum from conservation of energy.",
      "State whether the collision is elastic, inelastic, or perfectly inelastic.",
    ],
    tags: ["impulse", "system boundary", "elasticity", "vector signs"],
    sections: [
      {
        title: "System thinking first",
        body: [
          "The quality of a momentum solution depends on the system you choose. If external forces are negligible over the interaction window, total momentum is conserved for the whole system even when internal forces are large.",
          "That is why collision questions feel simpler once the boundary is fixed. You stop chasing individual forces and focus on total change across the event.",
        ],
      },
      {
        title: "Impulse as a bridge",
        body: [
          "Impulse gives you the time-based story of a momentum change. A short, large force and a small force over a long duration can create the same impulse if the area under the force-time curve matches.",
          "This is useful because it lets you move between verbal descriptions, graphs, and algebra without changing the physical interpretation.",
        ],
      },
      {
        title: "Collision classification",
        body: [
          "Collision type tells you what extra constraint you can use after momentum conservation. Elastic collisions preserve kinetic energy, perfectly inelastic ones share a final velocity, and ordinary inelastic collisions sit between those extremes.",
          "If a question only states that objects stick together, that sentence is already the solving shortcut. It replaces two final velocities with one.",
        ],
      },
      {
        title: "Sign discipline",
        body: [
          "Most lost marks come from sign errors, not hard mechanics. Define a positive direction early and convert every velocity into that frame before substituting values.",
          "A consistent sign convention also makes your final result meaningful. A negative answer then becomes an interpretation, not a surprise.",
        ],
      },
    ],
    sources: [
      {
        title: "Collision demo recap",
        detail: "Low-friction cart notes from lab discussion",
      },
      {
        title: "Tutorial 04 solutions",
        detail: "Annotated impulse and momentum derivations",
      },
      {
        title: "Quiz correction sheet",
        detail: "Directional sign errors and recovery tips",
      },
    ],
    chatPrompts: [
      "Give me a quick quiz on elastic vs inelastic collisions.",
      "Summarize this note in plain English.",
      "Show a worked example using conservation of momentum.",
    ],
  },
  {
    slugKeywords: ["comp", "recursion", "algorithm", "cs"],
    moduleCode: "COMP1021",
    title: "Recursion Patterns and Tracing",
    category: "Study guide",
    updatedAt: "Reviewed yesterday",
    readingTime: "9 min read",
    masteryLabel: "74% mastery",
    overview:
      "A structured note for understanding recursive thinking, tracing stack frames, and spotting the difference between a base case, a recursive step, and an accidental infinite loop.",
    takeaways: [
      "Every recursive function needs a terminating base case you can reach.",
      "Trace arguments across calls rather than reading the function only once.",
      "Think of each call as waiting for a smaller subproblem to finish.",
    ],
    checklist: [
      "Identify the base case before tracing anything else.",
      "Check that each recursive call moves closer to termination.",
      "Write one stack frame per call when debugging.",
      "Verify the returned value on the unwind path, not just the call path.",
    ],
    tags: ["base case", "call stack", "trace table", "divide and conquer"],
    sections: [
      {
        title: "What recursion actually does",
        body: [
          "Recursion is not magic repetition. It is a function delegating part of its work to a smaller version of the same problem and then combining the result when control returns.",
          "That means understanding recursion is mostly about understanding problem size. If the subproblem is not measurably smaller, the code is not truly progressing.",
        ],
      },
      {
        title: "Base case discipline",
        body: [
          "The base case is the anchor that stops the chain of calls. A good base case is explicit, easy to hit, and returns something simple enough for the rest of the function to build on.",
          "Weak recursive code often hides the base case inside a complicated condition, which makes traces harder and bugs easier to miss.",
        ],
      },
      {
        title: "Tracing the stack",
        body: [
          "When a recursive function feels confusing, stop reading it linearly. Write down one frame per call with the current argument, the pending operation, and the return value once the deeper call finishes.",
          "This changes recursion from a mental blur into a table. Once the stack is visible, the execution order usually becomes obvious.",
        ],
      },
      {
        title: "Performance intuition",
        body: [
          "Correct recursive code is not automatically efficient. Some recursive definitions repeat identical subproblems and explode in runtime unless you memoize or reformulate the solution.",
          "That is why recursion should be judged twice: once for correctness and once for cost.",
        ],
      },
    ],
    sources: [
      {
        title: "Lab trace worksheet",
        detail: "Frame-by-frame recursion tracing practice",
      },
      {
        title: "Lecture examples",
        detail: "Factorial, Fibonacci, and tree traversal snippets",
      },
      {
        title: "Debug notes",
        detail: "Checklist for missing or unreachable base cases",
      },
    ],
    chatPrompts: [
      "Explain recursion like I am new to programming.",
      "Create a trace-table exercise from this note.",
      "What are the most common recursion bugs here?",
    ],
  },
]

function formatSlug(value: string) {
  return value
    .replace(/[-_]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function getNoteTemplate(noteId: string): NoteTemplate {
  const normalizedId = noteId.toLowerCase()
  const template = noteTemplates.find((item) =>
    item.slugKeywords.some((keyword) => normalizedId.includes(keyword))
  )

  if (template) {
    return template
  }

  const fallbackTitle = formatSlug(noteId || "Adaptive Study Note")

  return {
    slugKeywords: [],
    moduleCode: "ATHENA",
    title: fallbackTitle,
    category: "Workspace note",
    updatedAt: "Updated just now",
    readingTime: "6 min read",
    masteryLabel: "70% mastery",
    overview:
      "This page is now structured as a proper note workspace, with the note content on the page and the AI helper docked into the sidebar for grounded follow-up questions.",
    takeaways: [
      "Use the sidebar chat to expand, quiz, or simplify this note in context.",
      "Keep the main pane focused on the note itself, not the conversation list.",
      "Lean on short summaries and checklists when revising under time pressure.",
    ],
    checklist: [
      "Skim the overview and identify the main topic.",
      "Review the key sections from top to bottom.",
      "Use the AI sidebar for clarifications and quiz generation.",
      "End with a self-test before moving on.",
    ],
    tags: ["study flow", "ai copilot", "revision", "workspace"],
    sections: [
      {
        title: "Why this layout works",
        body: [
          "The note now owns the main pane, which keeps the reading experience stable and uncluttered. Chat support lives in the sidebar where it can stay available without competing with the content.",
          "That split makes the workspace feel more intentional. You read on the left, ask on the right, and keep both contexts visible at the same time.",
        ],
      },
      {
        title: "How to use the sidebar",
        body: [
          "Use quick prompts when you need a fast study action, such as a summary, a short quiz, or a list of mistakes to avoid. Type custom questions when you want a deeper explanation.",
          "Because the chat is docked beside the note, follow-up questions feel like part of the same study flow instead of a separate page.",
        ],
      },
      {
        title: "Revision rhythm",
        body: [
          "Work in short cycles: read a section, ask one clarifying question, then convert the answer into a takeaway or self-test. That pattern helps retention better than passive scrolling.",
          "The page styling reinforces that rhythm with clearer grouping, stronger visual hierarchy, and faster scanning cues.",
        ],
      },
    ],
    sources: [
      {
        title: "Workspace refresh",
        detail: "Notes page layout aligned with the global design system",
      },
      {
        title: "Study prompts",
        detail: "Suggested actions for summarizing and self-testing",
      },
    ],
    chatPrompts: [
      "Summarize this note in three bullets.",
      "Quiz me on the most important ideas here.",
      "Highlight what I should revise first.",
    ],
  }
}

type ToolSource = {
  url: string
  title: string
  description: string
}

function getToolSourceItems(result: unknown): ToolSource[] {
  if (!result || typeof result !== "object") return []

  const maybeSources =
    (result as { sources?: unknown; data?: unknown }).sources ??
    (result as { sources?: unknown; data?: unknown }).data

  if (!Array.isArray(maybeSources)) return []

  return maybeSources
    .flatMap((item) => {
      if (!item || typeof item !== "object") return null

      const source = item as {
        url?: unknown
        title?: unknown
        description?: unknown
      }

      if (typeof source.url !== "string") return null

      return {
        url: source.url,
        title: typeof source.title === "string" ? source.title : source.url,
        description:
          typeof source.description === "string" ? source.description : "",
      }
    })
    .filter((item): item is ToolSource => item !== null)
}

type ToolUIPart = {
  type: string
  toolCallId: string
  state: string
  input?: unknown
  output?: unknown
  errorText?: string
}

function isToolUIPart(part: unknown): part is ToolUIPart {
  return (
    typeof part === "object" &&
    part !== null &&
    "type" in part &&
    typeof (part as { type?: unknown }).type === "string" &&
    (part as { type: string }).type.startsWith("tool-")
  )
}

function renderToolStep(part: ToolUIPart) {
  const toolName = part.type.slice(5)
  const isSearchTool = toolName === "search" || toolName === "scrape"
  if (!isSearchTool) return null

  const isLoading =
    part.state === "input-streaming" || part.state === "input-available"

  const sourceItems =
    part.state === "output-available" ? getToolSourceItems(part.output) : []

  const stepLabel =
    toolName === "search"
      ? "Web search"
      : toolName === "scrape"
        ? "Scraping source"
        : toolName

  return (
    <Steps key={part.toolCallId} defaultOpen>
      <StepsTrigger>
        {isLoading ? (
          <TextShimmerLoader
            text={
              toolName === "search"
                ? "Searching across sources"
                : "Extracting key sections"
            }
            size="md"
          />
        ) : (
          stepLabel
        )}
      </StepsTrigger>
      <StepsContent>
        <div className="space-y-2">
          <StepsItem>
            {part.state === "input-streaming"
              ? "Preparing request…"
              : part.state === "input-available"
                ? "Running tool…"
                : part.state === "output-available"
                  ? "Reviewing results…"
                  : part.state === "output-error"
                    ? `Tool error: ${part.errorText ?? "Unknown error"}`
                    : "Working…"}
          </StepsItem>

          {part.state === "output-available" && sourceItems.length > 0 ? (
            <>
              <StepsItem>Top matches</StepsItem>
              <div className="flex flex-wrap gap-1.5">
                {sourceItems.map((source) => (
                  <Source key={source.url} href={source.url!}>
                    <SourceTrigger
                      label={source.url}
                      showFavicon
                      className="max-w-52"
                    />
                    <SourceContent
                      title={source.title ?? source.url!}
                      description={source.description ?? ""}
                    />
                  </Source>
                ))}
              </div>
            </>
          ) : null}

          <StepsItem>
            {part.state === "output-available"
              ? "Extracting key sections and summarizing…"
              : "Waiting for tool output…"}
          </StepsItem>
        </div>
      </StepsContent>
    </Steps>
  )
}

function getMessageText(parts: { type: string; text?: string }[]) {
  return parts
    .map((part) => (part.type === "text" ? part.text ?? "" : ""))
    .join("")
    .trim()
}

function NotesChatSidebar({ note }: { note: NoteTemplate }) {
  const [prompt, setPrompt] = useState("")

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  })

  const handleSubmit = (nextPrompt = prompt) => {
    const trimmedPrompt = nextPrompt.trim()
    if (!trimmedPrompt || status !== "ready") return

    sendMessage({ text: trimmedPrompt })
    setPrompt("")
  }

  const handlePromptSubmit = () => {
    handleSubmit(prompt)
  }

  const copyToClipboard = async (value: string) => {
    if (!value) return

    try {
      await navigator.clipboard.writeText(value)
    } catch {
      // Ignore clipboard failures so chat interactions never break.
    }
  }

  return (
    <Sidebar side="right">
      <SidebarHeader className="gap-4 border-b-2 border-sidebar-border bg-sidebar px-4 py-4">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center border-2 border-foreground bg-primary text-primary-foreground shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            <Sparkles className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground">
              AI note copilot
            </p>
            <h2 className="mt-1 text-lg font-black uppercase leading-tight">
              {note.moduleCode} / {note.title}
            </h2>
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              Ask for explanations, mini quizzes, or a cleaner summary while
              keeping the note visible.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="border-2 border-foreground bg-background px-3 py-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Status
            </p>
            <p className="mt-1 text-sm font-black uppercase">{note.updatedAt}</p>
          </div>
          <div className="border-2 border-foreground bg-accent px-3 py-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Revision signal
            </p>
            <p className="mt-1 text-sm font-black uppercase">
              {note.masteryLabel}
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="min-h-0 gap-0 overflow-hidden bg-sidebar">
        <div className="border-b-2 border-sidebar-border px-4 py-4">
          <p className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Quick prompts
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {note.chatPrompts.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSubmit(suggestion)}
                disabled={status !== "ready"}
                className="border-2 border-foreground bg-background px-3 py-2 text-left text-[11px] font-mono font-bold uppercase tracking-[0.1em] shadow-[3px_3px_0_0_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 p-4">
          <div className="flex h-full min-h-0 flex-col border-2 border-foreground bg-background shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            <ChatContainerRoot className="relative min-h-0 flex-1">
              <ChatContainerContent className="space-y-4 px-4 py-4">
                {messages.length === 0 ? (
                  <div className="flex min-h-full flex-col justify-center gap-4 py-8">
                    <div className="w-full border-2 border-foreground bg-card p-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                      <p className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground">
                        Chat dock ready
                      </p>
                      <h3 className="mt-2 text-xl font-black uppercase">
                        Ask directly from the note
                      </h3>
                      <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">
                        The conversation now lives in the sidebar, so you can
                        read, question, and revise without switching pages.
                      </p>
                    </div>

                    <div className="grid gap-3">
                      {note.takeaways.slice(0, 2).map((takeaway) => (
                        <div
                          key={takeaway}
                          className="border-2 border-dashed border-foreground bg-muted px-4 py-3 text-sm font-medium"
                        >
                          {takeaway}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isAssistant = message.role === "assistant"
                    const content = getMessageText(
                      message.parts as { type: string; text?: string }[]
                    )

                    return (
                      <Message
                        key={message.id}
                        className={cn(
                          "flex w-full flex-col gap-2",
                          isAssistant ? "items-start" : "items-end"
                        )}
                      >
                        {message.parts.map((part, index) =>
                          isToolUIPart(part) ? (
                            <div
                              key={`${message.id}-tool-${index}`}
                              className="w-full"
                            >
                              {renderToolStep(part)}
                            </div>
                          ) : null
                        )}

                        {content ? (
                          <div
                            className={cn(
                              "group flex max-w-[92%] flex-col gap-2",
                              isAssistant ? "w-full items-start" : "items-end"
                            )}
                          >
                            <MessageContent
                              className={cn(
                                "border-2 border-foreground px-4 py-3 text-sm font-medium leading-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)]",
                                isAssistant
                                  ? "prose prose-sm max-w-none bg-card text-foreground"
                                  : "bg-primary text-primary-foreground"
                              )}
                              markdown={isAssistant}
                            >
                              {content}
                            </MessageContent>

                            <MessageActions className="opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                              <MessageAction tooltip="Copy response">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-none border-2 border-foreground bg-background shadow-[3px_3px_0_0_rgba(0,0,0,1)]"
                                  onClick={() => void copyToClipboard(content)}
                                >
                                  <Copy className="size-4" />
                                </Button>
                              </MessageAction>
                            </MessageActions>
                          </div>
                        ) : null}
                      </Message>
                    )
                  })
                )}
              </ChatContainerContent>

              <div className="absolute right-4 bottom-4">
                <ScrollButton className="border-2 border-foreground bg-background shadow-[3px_3px_0_0_rgba(0,0,0,1)]" />
              </div>
            </ChatContainerRoot>
          </div>
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t-2 border-sidebar-border bg-sidebar p-4">
        <PromptInput
          isLoading={status !== "ready"}
          value={prompt}
          onValueChange={setPrompt}
          onSubmit={handlePromptSubmit}
          className="w-full border-2 border-foreground bg-background p-0 shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
        >
          <div className="flex flex-col">
            <PromptInputTextarea
              placeholder={`Ask Athena about ${note.title.toLowerCase()}`}
              className="min-h-24 px-4 pt-4 text-sm font-medium leading-6"
            />

            <PromptInputActions className="flex items-center justify-between gap-3 border-t-2 border-foreground px-3 py-3">
              <div className="text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Grounded in this note
              </div>
              <Button
                type="submit"
                size="icon"
                disabled={!prompt.trim() || status !== "ready"}
                className="size-10 rounded-none border-2 border-foreground bg-primary text-primary-foreground shadow-[3px_3px_0_0_rgba(0,0,0,1)]"
              >
                <ArrowUp className="size-4" />
              </Button>
            </PromptInputActions>
          </div>
        </PromptInput>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

function NotesPageContent({ note }: { note: NoteTemplate }) {
  return (
    <div className="min-h-screen bg-background text-foreground dot-grid-bg">
      <header className="sticky top-0 z-20 border-b-2 border-foreground bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <SidebarTrigger className="h-11 w-11 rounded-none border-2 border-foreground bg-background shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5 hover:bg-accent" />
            <div className="min-w-0">
              <p className="text-[11px] font-mono font-bold uppercase tracking-[0.22em] text-muted-foreground">
                Notes workspace
              </p>
              <h1 className="truncate text-lg font-black uppercase md:text-2xl">
                {note.moduleCode} / {note.title}
              </h1>
            </div>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <div className="border-2 border-foreground bg-background px-4 py-3 text-sm font-mono font-bold uppercase tracking-[0.14em] shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
              {note.category}
            </div>
            <div className="border-2 border-foreground bg-primary px-4 py-3 text-sm font-mono font-bold uppercase tracking-[0.14em] text-primary-foreground shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
              {note.readingTime}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-8 md:py-8">
        <section className="border-2 border-foreground bg-card p-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)] md:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl space-y-4">
              <p className="text-[11px] font-mono font-bold uppercase tracking-[0.24em] text-muted-foreground">
                Main note
              </p>
              <h2 className="text-3xl font-black uppercase leading-none md:text-5xl">
                {note.title}
              </h2>
              <p className="text-base font-medium leading-7 text-muted-foreground md:text-lg">
                {note.overview}
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    className="border-2 border-foreground bg-background px-3 py-2 text-[11px] font-mono font-bold uppercase tracking-[0.14em] shadow-[3px_3px_0_0_rgba(0,0,0,1)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:w-[24rem] xl:grid-cols-1">
              <div className="border-2 border-foreground bg-background p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <div className="flex items-center gap-3">
                  <BookOpen className="size-5" />
                  <div>
                    <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      Reading time
                    </p>
                    <p className="text-sm font-black uppercase">
                      {note.readingTime}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-2 border-foreground bg-accent p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <div className="flex items-center gap-3">
                  <Brain className="size-5" />
                  <div>
                    <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      Revision signal
                    </p>
                    <p className="text-sm font-black uppercase">
                      {note.masteryLabel}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-2 border-foreground bg-primary p-4 text-primary-foreground shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <div className="flex items-center gap-3">
                  <Clock3 className="size-5" />
                  <div>
                    <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-primary-foreground/80">
                      Last touched
                    </p>
                    <p className="text-sm font-black uppercase">
                      {note.updatedAt}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(18rem,0.95fr)]">
          <div className="space-y-6">
            <section className="border-2 border-foreground bg-card p-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)] md:p-8">
              <div className="flex flex-col gap-3 border-b-2 border-foreground pb-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    Structured content
                  </p>
                  <h3 className="mt-2 text-2xl font-black uppercase">
                    Lecture flow and explanation
                  </h3>
                </div>
                <div className="border-2 border-foreground bg-background px-4 py-2 text-[11px] font-mono font-bold uppercase tracking-[0.16em] shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
                  {note.sections.length} focused sections
                </div>
              </div>

              <div className="mt-6 space-y-8">
                {note.sections.map((section, index) => (
                  <section
                    key={section.title}
                    className={cn(
                      "space-y-4",
                      index > 0 && "border-t-2 border-foreground pt-8"
                    )}
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start">
                      <div className="inline-flex w-fit border-2 border-foreground bg-primary px-3 py-2 text-sm font-black uppercase text-primary-foreground shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-xl font-black uppercase md:text-2xl">
                          {section.title}
                        </h4>
                        <div className="space-y-4">
                          {section.body.map((paragraph) => (
                            <p
                              key={paragraph}
                              className="text-base font-medium leading-7 text-muted-foreground"
                            >
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>
                ))}
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="border-2 border-foreground bg-card p-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <div className="flex items-center gap-3">
                  <MessageSquare className="size-5" />
                  <div>
                    <p className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      Sidebar workflow
                    </p>
                    <h3 className="text-lg font-black uppercase">
                      Best ways to use the chat
                    </h3>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {note.chatPrompts.map((promptText) => (
                    <div
                      key={promptText}
                      className="border-2 border-dashed border-foreground bg-background px-4 py-3 text-sm font-medium leading-6"
                    >
                      {promptText}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-2 border-foreground bg-card p-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <div className="flex items-center gap-3">
                  <FileText className="size-5" />
                  <div>
                    <p className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      Source map
                    </p>
                    <h3 className="text-lg font-black uppercase">
                      What this note is built from
                    </h3>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {note.sources.map((source) => (
                    <div
                      key={source.title}
                      className="border-2 border-foreground bg-background p-4 shadow-[3px_3px_0_0_rgba(0,0,0,1)]"
                    >
                      <p className="text-sm font-black uppercase">
                        {source.title}
                      </p>
                      <p className="mt-2 text-sm font-medium text-muted-foreground">
                        {source.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
            <section className="border-2 border-foreground bg-card p-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
              <div className="flex items-center gap-3">
                <Brain className="size-5" />
                <div>
                  <p className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    Key takeaways
                  </p>
                  <h3 className="text-lg font-black uppercase">
                    What to remember
                  </h3>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {note.takeaways.map((takeaway, index) => (
                  <div
                    key={takeaway}
                    className="flex items-start gap-3 border-2 border-foreground bg-background px-4 py-3 shadow-[3px_3px_0_0_rgba(0,0,0,1)]"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center border-2 border-foreground bg-accent text-xs font-black">
                      {index + 1}
                    </div>
                    <p className="text-sm font-medium leading-6">{takeaway}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="border-2 border-foreground bg-card p-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
              <div className="flex items-center gap-3">
                <ListChecks className="size-5" />
                <div>
                  <p className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    Revision checklist
                  </p>
                  <h3 className="text-lg font-black uppercase">
                    Before you move on
                  </h3>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {note.checklist.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 border-2 border-dashed border-foreground bg-background px-4 py-3"
                  >
                    <div className="mt-1 h-4 w-4 border-2 border-foreground bg-primary" />
                    <p className="text-sm font-medium leading-6">{item}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="border-2 border-foreground bg-card p-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
              <div className="flex items-center gap-3">
                <Tags className="size-5" />
                <div>
                  <p className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    Topic labels
                  </p>
                  <h3 className="text-lg font-black uppercase">
                    Fast scanning
                  </h3>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    className="border-2 border-foreground bg-muted px-3 py-2 text-[11px] font-mono font-bold uppercase tracking-[0.14em]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  )
}

export default function NotePage() {
  const params = useParams<{ id?: string | string[] }>()
  const noteId = Array.isArray(params.id) ? params.id[0] : params.id ?? "study-note"
  const note = useMemo(() => getNoteTemplate(noteId), [noteId])

  return (
    <SidebarProvider
      defaultOpen
      style={
        {
          "--sidebar-width": "31rem",
        } as CSSProperties
      }
    >
      <NotesChatSidebar note={note} />
      <SidebarInset className="min-h-screen bg-transparent">
        <NotesPageContent note={note} />
      </SidebarInset>
    </SidebarProvider>
  )
}
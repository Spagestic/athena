export type NoteSection = {
  title: string
  body: string[]
}

export type NoteSource = {
  title: string
  detail: string
}

export type NoteTemplate = {
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

export function getNoteTemplate(noteId: string): NoteTemplate {
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

export function formatLastUpdated(timestamp: number) {
  const deltaMs = Date.now() - timestamp
  const deltaHours = Math.floor(deltaMs / (1000 * 60 * 60))
  const deltaDays = Math.floor(deltaHours / 24)

  if (deltaHours < 1) {
    return "Updated just now"
  }
  if (deltaHours < 24) {
    return `Updated ${deltaHours} hour${deltaHours === 1 ? "" : "s"} ago`
  }
  if (deltaDays < 7) {
    return `Updated ${deltaDays} day${deltaDays === 1 ? "" : "s"} ago`
  }

  return `Updated ${new Date(timestamp).toLocaleDateString()}`
}

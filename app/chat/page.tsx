"use client"

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
  PromptInputAction,
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
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import {
  ArrowUp,
  Copy,
  Mic,
  Pencil,
  Plus,
  PlusIcon,
  Search,
  ThumbsDown,
  ThumbsUp,
  Trash,
} from "lucide-react"
import { useState } from "react"

// Initial conversation history
const conversationHistory = [
  {
    period: "Today",
    conversations: [
      {
        id: "t1",
        title: "Project roadmap discussion",
        lastMessage:
          "Let's prioritize the authentication features for the next sprint.",
        timestamp: new Date().setHours(new Date().getHours() - 2),
      },
      {
        id: "t2",
        title: "API Documentation Review",
        lastMessage:
          "The endpoint descriptions need more detail about rate limiting.",
        timestamp: new Date().setHours(new Date().getHours() - 5),
      },
      {
        id: "t3",
        title: "Frontend Bug Analysis",
        lastMessage:
          "I found the issue - we need to handle the null state in the user profile component.",
        timestamp: new Date().setHours(new Date().getHours() - 8),
      },
    ],
  },
  {
    period: "Yesterday",
    conversations: [
      {
        id: "y1",
        title: "Database Schema Design",
        lastMessage:
          "Let's add indexes to improve query performance on these tables.",
        timestamp: new Date().setDate(new Date().getDate() - 1),
      },
      {
        id: "y2",
        title: "Performance Optimization",
        lastMessage:
          "The lazy loading implementation reduced initial load time by 40%.",
        timestamp: new Date().setDate(new Date().getDate() - 1),
      },
    ],
  },
  {
    period: "Last 7 days",
    conversations: [
      {
        id: "w1",
        title: "Authentication Flow",
        lastMessage: "We should implement the OAuth2 flow with refresh tokens.",
        timestamp: new Date().setDate(new Date().getDate() - 3),
      },
      {
        id: "w2",
        title: "Component Library",
        lastMessage:
          "These new UI components follow the design system guidelines perfectly.",
        timestamp: new Date().setDate(new Date().getDate() - 5),
      },
      {
        id: "w3",
        title: "UI/UX Feedback",
        lastMessage:
          "The navigation redesign received positive feedback from the test group.",
        timestamp: new Date().setDate(new Date().getDate() - 6),
      },
    ],
  },
  {
    period: "Last month",
    conversations: [
      {
        id: "m1",
        title: "Initial Project Setup",
        lastMessage:
          "All the development environments are now configured consistently.",
        timestamp: new Date().setDate(new Date().getDate() - 15),
      },
    ],
  },
]

function ChatSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="flex flex-row items-center justify-between gap-2 px-2 py-4">
        <div className="flex flex-row items-center gap-2 px-2">
          <div className="size-8 rounded-md bg-primary/10"></div>
          <div className="text-md font-base tracking-tight text-primary">
            Chat App
          </div>
        </div>
        <Button variant="ghost" className="size-8">
          <Search className="size-4" />
        </Button>
      </SidebarHeader>
      <SidebarContent className="pt-4">
        <div className="px-4">
          <Button
            variant="outline"
            className="mb-4 flex w-full items-center gap-2"
          >
            <PlusIcon className="size-4" />
            <span>New Chat</span>
          </Button>
        </div>
        {conversationHistory.map((group) => (
          <SidebarGroup key={group.period}>
            <SidebarGroupLabel>{group.period}</SidebarGroupLabel>
            <SidebarMenu>
              {group.conversations.map((conversation) => (
                <SidebarMenuButton key={conversation.id}>
                  <span>{conversation.title}</span>
                </SidebarMenuButton>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  )
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

function ChatContent() {
  const [prompt, setPrompt] = useState("")

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  })

  const handleSubmit = () => {
    if (!prompt.trim()) return

    sendMessage({ text: prompt.trim() })
    setPrompt("")
  }

  return (
    <main className="flex h-screen flex-col overflow-hidden">
      <header className="z-10 flex h-16 w-full shrink-0 items-center gap-2 border-b bg-background px-4">
        <SidebarTrigger className="-ml-1" />
        <div className="text-foreground">Project roadmap discussion</div>
      </header>

      <div className="relative flex-1 overflow-y-auto">
        <ChatContainerRoot className="h-full">
          <ChatContainerContent className="space-y-0 px-5 py-12">
            {messages.map((message, index) => {
              const isAssistant = message.role === "assistant"
              const isLastMessage = index === messages.length - 1
              const content = message.parts
                .map((part) => (part.type === "text" ? part.text : null))
                .join("")

              return (
                <Message
                  key={message.id}
                  className={cn(
                    "mx-auto flex w-full max-w-3xl flex-col gap-2 px-6",
                    isAssistant ? "items-start" : "items-end"
                  )}
                >
                  {isAssistant ? (
                    <div className="group flex w-full flex-col gap-0">
                      <div className="mb-3 space-y-3">
                        {message.parts.map((part, index) =>
                          isToolUIPart(part) ? (
                            <div key={`${message.id}-tool-${index}`}>
                              {renderToolStep(part)}
                            </div>
                          ) : null
                        )}
                      </div>
                      <MessageContent
                        className="prose flex-1 rounded-lg bg-transparent p-0 text-foreground"
                        markdown
                      >
                        {content}
                      </MessageContent>
                      <MessageActions
                        className={cn(
                          "-ml-2.5 flex gap-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100",
                          isLastMessage && "opacity-100"
                        )}
                      >
                        <MessageAction tooltip="Copy">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                          >
                            <Copy />
                          </Button>
                        </MessageAction>
                        <MessageAction tooltip="Upvote">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                          >
                            <ThumbsUp />
                          </Button>
                        </MessageAction>
                        <MessageAction tooltip="Downvote">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                          >
                            <ThumbsDown />
                          </Button>
                        </MessageAction>
                      </MessageActions>
                    </div>
                  ) : (
                    <div className="group flex flex-col items-end gap-1">
                      <MessageContent className="max-w-[85%] rounded-3xl bg-muted px-5 py-2.5 text-primary sm:max-w-[75%]">
                        {content}
                      </MessageContent>
                      <MessageActions
                        className={cn(
                          "flex gap-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                        )}
                      >
                        <MessageAction tooltip="Edit">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                          >
                            <Pencil />
                          </Button>
                        </MessageAction>
                        <MessageAction tooltip="Delete">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                          >
                            <Trash />
                          </Button>
                        </MessageAction>
                        <MessageAction tooltip="Copy">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                          >
                            <Copy />
                          </Button>
                        </MessageAction>
                      </MessageActions>
                    </div>
                  )}
                </Message>
              )
            })}
          </ChatContainerContent>
          <div className="absolute bottom-4 left-1/2 flex w-full max-w-3xl -translate-x-1/2 justify-end px-5">
            <ScrollButton className="shadow-sm" />
          </div>
        </ChatContainerRoot>
      </div>

      <div className="z-10 shrink-0 bg-background px-3 pb-3 md:px-5 md:pb-5">
        <div className="mx-auto max-w-3xl">
          <PromptInput
            isLoading={status !== "ready"}
            value={prompt}
            onValueChange={setPrompt}
            onSubmit={handleSubmit}
            className="relative z-10 w-full rounded-3xl border border-input bg-popover p-0 pt-1 shadow-xs"
          >
            <div className="flex flex-col">
              <PromptInputTextarea
                placeholder="Ask anything"
                className="min-h-11 pt-3 pl-4 text-base leading-[1.3] sm:text-base md:text-base"
              />

              <PromptInputActions className="mt-5 flex w-full items-center justify-between gap-2 px-3 pb-3">
                <div className="flex items-center gap-2">
                  <PromptInputAction tooltip="Add files or tools">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-9 rounded-full"
                    >
                      <Plus size={18} />
                    </Button>
                  </PromptInputAction>
                </div>
                <div className="flex items-center gap-2">
                  <PromptInputAction tooltip="Voice input">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-9 rounded-full"
                    >
                      <Mic size={18} />
                    </Button>
                  </PromptInputAction>

                  <Button
                    size="icon"
                    disabled={!prompt.trim() || status !== "ready"}
                    onClick={handleSubmit}
                    className="size-9 rounded-full"
                  >
                    {status === "ready" ? (
                      <ArrowUp size={18} />
                    ) : (
                      <span className="size-3 rounded-xs bg-white" />
                    )}
                  </Button>
                </div>
              </PromptInputActions>
            </div>
          </PromptInput>
        </div>
      </div>
    </main>
  )
}

export default function FullChatApp() {
  return (
    <SidebarProvider>
      <ChatSidebar />
      <SidebarInset>
        <ChatContent />
      </SidebarInset>
    </SidebarProvider>
  )
}

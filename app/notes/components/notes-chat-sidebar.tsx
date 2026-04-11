"use client";

import { useState } from "react";
import {
  ChatContainerContent,
  ChatContainerRoot,
} from "@/components/prompt-kit/chat-container";
import { TextShimmerLoader } from "@/components/prompt-kit/loader";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
} from "@/components/prompt-kit/message";
import {
  PromptInput,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/prompt-kit/prompt-input";
import { ScrollButton } from "@/components/prompt-kit/scroll-button";
import {
  Source,
  SourceContent,
  SourceTrigger,
} from "@/components/prompt-kit/source";
import {
  Steps,
  StepsContent,
  StepsItem,
  StepsTrigger,
} from "@/components/prompt-kit/steps";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ArrowUp, Copy, History } from "lucide-react";
import type { NoteTemplate } from "./note-page-data";

type ToolSource = {
  url: string;
  title: string;
  description: string;
};

type ToolUIPart = {
  type: string;
  toolCallId: string;
  state: string;
  input?: unknown;
  output?: unknown;
  errorText?: string;
};

type NoteQuiz = {
  id: string;
  title: string;
  questions: Array<{
    id: string;
    prompt: string;
    choices: string[];
    correctIndex: number;
    explanation: string | null;
    conceptTag: string | null;
    order: number;
  }>;
} | null;

function getToolSourceItems(result: unknown): ToolSource[] {
  if (!result || typeof result !== "object") return [];

  const maybeSources =
    (result as { sources?: unknown; data?: unknown }).sources ??
    (result as { sources?: unknown; data?: unknown }).data;

  if (!Array.isArray(maybeSources)) return [];

  return maybeSources
    .flatMap((item) => {
      if (!item || typeof item !== "object") return null;

      const source = item as {
        url?: unknown;
        title?: unknown;
        description?: unknown;
      };

      if (typeof source.url !== "string") return null;

      return {
        url: source.url,
        title: typeof source.title === "string" ? source.title : source.url,
        description:
          typeof source.description === "string" ? source.description : "",
      };
    })
    .filter((item): item is ToolSource => item !== null);
}

function isToolUIPart(part: unknown): part is ToolUIPart {
  return (
    typeof part === "object" &&
    part !== null &&
    "type" in part &&
    typeof (part as { type?: unknown }).type === "string" &&
    (part as { type: string }).type.startsWith("tool-")
  );
}

function renderToolStep(part: ToolUIPart) {
  const toolName = part.type.slice(5);
  const isSearchTool = toolName === "search" || toolName === "scrape";
  if (!isSearchTool) return null;

  const isLoading =
    part.state === "input-streaming" || part.state === "input-available";

  const sourceItems =
    part.state === "output-available" ? getToolSourceItems(part.output) : [];

  const stepLabel =
    toolName === "search"
      ? "Web search"
      : toolName === "scrape"
        ? "Scraping source"
        : toolName;

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
                  <Source key={source.url} href={source.url}>
                    <SourceTrigger
                      label={source.url}
                      showFavicon
                      className="max-w-52"
                    />
                    <SourceContent
                      title={source.title}
                      description={source.description}
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
  );
}

function getMessageText(parts: { type: string; text?: string }[]) {
  return parts
    .map((part) => (part.type === "text" ? (part.text ?? "") : ""))
    .join("")
    .trim();
}

export function NotesChatSidebar({
  note,
  quiz,
}: {
  note: NoteTemplate;
  quiz: NoteQuiz;
}) {
  const [prompt, setPrompt] = useState("");
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  const handleSubmit = (nextPrompt = prompt) => {
    const trimmedPrompt = nextPrompt.trim();
    if (!trimmedPrompt || status !== "ready") return;

    sendMessage({ text: trimmedPrompt });
    setPrompt("");
  };

  const handlePromptSubmit = () => {
    handleSubmit(prompt);
  };

  const copyToClipboard = async (value: string) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Ignore clipboard failures so chat interactions never break.
    }
  };

  const quizQuestions = quiz?.questions ?? [];
  const hasQuizQuestions = quizQuestions.length > 0;

  return (
    <Sidebar side="right">
      <Tabs
        defaultValue="chat"
        className="h-full min-h-0 flex-1 gap-0 overflow-hidden bg-sidebar"
      >
        <header className="flex h-16 shrink-0 items-center gap-3 border-b-2 border-sidebar-border bg-sidebar px-4">
          <div className="">
            <TabsList
              variant="line"
              className="w-fit border-2 border-foreground bg-background p-1 shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
            >
              <TabsTrigger
                value="chat"
                className="rounded-none px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em] data-active:bg-accent"
              >
                Chat
              </TabsTrigger>
              <TabsTrigger
                value="quiz"
                className="rounded-none px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em] data-active:bg-accent"
              >
                Quiz
              </TabsTrigger>
            </TabsList>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="ml-auto h-11 w-11 rounded-none border-2 border-foreground bg-background shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5 hover:bg-accent"
            aria-label="View chat history"
          >
            <History className="size-4" />
          </Button>
        </header>
        <SidebarContent className="min-h-0 gap-0 overflow-hidden bg-sidebar">
          <TabsContent value="chat" className="mt-0 flex min-h-0 flex-1 flex-col">
            <div className="flex min-h-0 flex-1 flex-col p-4">
              <div className="flex min-h-0 flex-1 flex-col border-2 border-foreground bg-background shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <ChatContainerRoot className="relative min-h-0 flex-1">
                  <ChatContainerContent className="space-y-0 px-4 py-6">
                    {messages.map((message, index) => {
                      const isAssistant = message.role === "assistant";
                      const isLastMessage = index === messages.length - 1;
                      const content = getMessageText(
                        message.parts as { type: string; text?: string }[],
                      );

                      return (
                        <Message
                          key={message.id}
                          className={cn(
                            "flex w-full flex-col gap-2 py-3",
                            isAssistant ? "items-start" : "items-end",
                          )}
                        >
                          {isAssistant ? (
                            <div className="group flex w-full flex-col gap-0">
                              <div className="mb-3 space-y-3">
                                {message.parts.map((part, partIndex) =>
                                  isToolUIPart(part) ? (
                                    <div
                                      key={`${message.id}-tool-${partIndex}`}
                                      className="w-full"
                                    >
                                      {renderToolStep(part)}
                                    </div>
                                  ) : null,
                                )}
                              </div>

                              {content ? (
                                <>
                                  <MessageContent
                                    className="prose prose-sm max-w-none bg-transparent p-0 text-foreground"
                                    markdown
                                  >
                                    {content}
                                  </MessageContent>

                                  <MessageActions
                                    className={cn(
                                      "-ml-2 mt-2 opacity-0 transition-opacity duration-150 group-hover:opacity-100",
                                      isLastMessage && "opacity-100",
                                    )}
                                  >
                                    <MessageAction tooltip="Copy response">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-none"
                                        onClick={() =>
                                          void copyToClipboard(content)
                                        }
                                      >
                                        <Copy className="size-4" />
                                      </Button>
                                    </MessageAction>
                                  </MessageActions>
                                </>
                              ) : null}
                            </div>
                          ) : content ? (
                            <div className="group flex w-full flex-col items-end gap-1">
                              <MessageContent className="w-fit max-w-[88%] whitespace-pre-wrap bg-muted px-4 py-2.5 text-left text-sm font-medium text-foreground">
                                {content}
                              </MessageContent>
                            </div>
                          ) : null}
                        </Message>
                      );
                    })}
                  </ChatContainerContent>

                  <div className="absolute right-4 bottom-4">
                    <ScrollButton className="border-2 border-foreground bg-background shadow-[3px_3px_0_0_rgba(0,0,0,1)]" />
                  </div>
                </ChatContainerRoot>
              </div>
            </div>

            <SidebarFooter className="border-sidebar-border bg-sidebar p-4 pt-0">
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
                    className="min-h-16 px-4 pt-4 text-sm font-medium leading-6"
                  />

                  <PromptInputActions className="flex items-center justify-between gap-3 border-foreground px-4 pb-4">
                    <div className="text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-muted-foreground"></div>
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
          </TabsContent>

          <TabsContent value="quiz" className="mt-0 flex min-h-0 flex-1 flex-col p-4">
            <div className="flex min-h-0 flex-1 flex-col border-2 border-foreground bg-background shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
              <div className="border-b-2 border-foreground px-5 py-4">
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Quiz mode
                </p>
                <h3 className="mt-2 text-base font-semibold text-foreground">
                  {quiz?.title ?? `${note.title} Practice Quiz`}
                </h3>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
                {hasQuizQuestions ? (
                  <div className="space-y-6">
                    {quizQuestions
                      .slice()
                      .sort((a, b) => a.order - b.order)
                      .map((question, questionIndex) => {
                        const selectedIndex = selectedAnswers[question.id];
                        const hasAnswered = selectedIndex !== undefined;

                        return (
                          <section
                            key={question.id}
                            className="space-y-3 border-2 border-foreground bg-sidebar px-4 py-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
                          >
                            <div className="space-y-2">
                              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                                Question {questionIndex + 1}
                              </p>
                              <p className="text-sm font-semibold leading-6 text-foreground">
                                {question.prompt}
                              </p>
                              {question.conceptTag ? (
                                <p className="text-[11px] font-mono font-bold uppercase tracking-[0.14em] text-muted-foreground">
                                  {question.conceptTag}
                                </p>
                              ) : null}
                            </div>

                            <div className="space-y-2">
                              {question.choices.map((choice, choiceIndex) => {
                                const isSelected = selectedIndex === choiceIndex;
                                const isCorrect = question.correctIndex === choiceIndex;
                                const showCorrectState = hasAnswered && isCorrect;
                                const showIncorrectState = isSelected && hasAnswered && !isCorrect;

                                return (
                                  <button
                                    key={`${question.id}-${choiceIndex}`}
                                    type="button"
                                    onClick={() =>
                                      setSelectedAnswers((current) => ({
                                        ...current,
                                        [question.id]: choiceIndex,
                                      }))
                                    }
                                    className={cn(
                                      "flex w-full items-start gap-3 border-2 px-3 py-3 text-left text-sm font-medium transition-colors",
                                      showCorrectState
                                        ? "border-green-600 bg-green-100 text-green-950"
                                        : showIncorrectState
                                          ? "border-red-600 bg-red-100 text-red-950"
                                          : isSelected
                                            ? "border-foreground bg-accent"
                                            : "border-foreground bg-background hover:bg-accent",
                                    )}
                                  >
                                    <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                                      {String.fromCharCode(65 + choiceIndex)}
                                    </span>
                                    <span className="flex-1 leading-6">{choice}</span>
                                  </button>
                                );
                              })}
                            </div>

                            {hasAnswered ? (
                              <div className="border-2 border-foreground bg-background px-3 py-3 text-sm leading-6 text-foreground">
                                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                                  {selectedIndex === question.correctIndex
                                    ? "Correct"
                                    : "Review"}
                                </p>
                                <p className="mt-2">
                                  {question.explanation ??
                                    `The correct answer is ${String.fromCharCode(65 + question.correctIndex)}.`}
                                </p>
                              </div>
                            ) : null}
                          </section>
                        );
                      })}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-foreground bg-background px-4 py-5 text-sm font-medium text-muted-foreground">
                    {quiz === null
                      ? "MCQs will appear here after OCR finishes and the note quiz is generated."
                      : "This note does not have practice questions yet."}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </SidebarContent>
      </Tabs>
      <SidebarRail />
    </Sidebar>
  );
}

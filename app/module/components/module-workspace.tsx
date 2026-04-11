"use client";

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

import { type ModuleNoteRow, type ModuleTaskRow } from "../module-data";

type ModuleWorkspaceProps = {
  notes: ModuleNoteRow[];
  tasks: ModuleTaskRow[];
};

type WorkspaceTab = "notes" | "tasks";

const urgencyClasses: Record<ModuleTaskRow["urgency"], string> = {
  critical: "bg-red-500 text-white",
  medium: "bg-orange-400 text-black",
  low: "bg-lime-400 text-black",
};

export function ModuleWorkspace({ notes, tasks }: ModuleWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("notes");

  return (
    <section className="space-y-4 pb-10">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("notes")}
          className={`border-2 border-foreground px-4 py-2 text-sm font-mono uppercase tracking-[0.14em] shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5 ${
            activeTab === "notes"
              ? "bg-foreground text-background"
              : "bg-background"
          }`}
        >
          Notes
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("tasks")}
          className={`border-2 border-foreground px-4 py-2 text-sm font-mono uppercase tracking-[0.14em] shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5 ${
            activeTab === "tasks"
              ? "bg-foreground text-background"
              : "bg-background"
          }`}
        >
          Tasks
        </button>
      </div>

      <div className="overflow-x-auto border-2 border-foreground bg-card shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
        {activeTab === "notes" ? (
          <table className="w-full min-w-190 table-fixed border-collapse">
            <thead>
              <tr className="bg-background">
                <th className="w-[42%] border-b-2 border-r-2 border-foreground px-3 py-3 text-left text-xs font-bold uppercase tracking-[0.16em]">
                  Note description
                </th>
                <th className="w-24 border-b-2 border-r-2 border-foreground px-3 py-3 text-left text-xs font-bold uppercase tracking-[0.16em]">
                  Pages
                </th>
                <th className="w-24 border-b-2 border-r-2 border-foreground px-3 py-3 text-left text-xs font-bold uppercase tracking-[0.16em]">
                  Quizzes
                </th>
                <th className="w-28 border-b-2 border-r-2 border-foreground px-3 py-3 text-left text-xs font-bold uppercase tracking-[0.16em]">
                  Shared
                </th>
                <th className="w-32 border-b-2 border-r-2 border-foreground px-3 py-3 text-left text-xs font-bold uppercase tracking-[0.16em]">
                  Last updated
                </th>
                <th className="w-16 border-b-2 border-foreground px-3 py-3 text-left text-xs font-bold uppercase tracking-[0.16em]">
                  More
                </th>
              </tr>
            </thead>
            <tbody>
              {notes.map((note) => (
                <tr key={note.id} className="bg-card">
                  <td className="border-r-2 border-t-2 border-foreground px-3 py-3 text-sm font-medium">
                    {note.title}
                  </td>
                  <td className="border-r-2 border-t-2 border-foreground px-3 py-3 text-sm font-mono uppercase tracking-[0.12em]">
                    {note.pages}
                  </td>
                  <td className="border-r-2 border-t-2 border-foreground px-3 py-3 text-sm font-mono uppercase tracking-[0.12em]">
                    {note.quizzes}
                  </td>
                  <td className="border-r-2 border-t-2 border-foreground px-3 py-3">
                    {note.sharedWith.length > 0 ? (
                      <HoverCard>
                        <HoverCardTrigger>
                          <span className="inline-flex border border-foreground bg-primary px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-foreground">
                            Shared
                          </span>
                        </HoverCardTrigger>
                        <HoverCardContent
                          side="top"
                          align="start"
                          sideOffset={10}
                          className="w-56 rounded-none border-2 border-foreground bg-background px-3 py-2 shadow-[4px_4px_0_0_rgba(0,0,0,1)] ring-0"
                        >
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                            Shared with
                          </p>
                          <p className="mt-1 text-sm font-mono uppercase tracking-[0.12em]">
                            {note.sharedWith.join(", ")}
                          </p>
                        </HoverCardContent>
                      </HoverCard>
                    ) : (
                      <span className="border border-foreground bg-background px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                        Private
                      </span>
                    )}
                  </td>
                  <td className="border-r-2 border-t-2 border-foreground px-3 py-3 text-sm font-mono uppercase tracking-[0.12em] text-muted-foreground">
                    {note.lastUpdated}
                  </td>
                  <td className="border-t-2 border-foreground px-3 py-3">
                    <button className="flex h-10 w-10 items-center justify-center border-2 border-foreground bg-background shadow-[3px_3px_0_0_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full min-w-180 border-collapse">
            <thead>
              <tr className="bg-background">
                <th className="w-16 border-b-2 border-r-2 border-foreground px-3 py-3 text-left text-xs font-bold uppercase tracking-[0.16em]">
                  Done
                </th>
                <th className="border-b-2 border-r-2 border-foreground px-3 py-3 text-left text-xs font-bold uppercase tracking-[0.16em]">
                  Task description
                </th>
                <th className="w-32 border-b-2 border-r-2 border-foreground px-3 py-3 text-left text-xs font-bold uppercase tracking-[0.16em]">
                  Due
                </th>
                <th className="w-28 border-b-2 border-r-2 border-foreground px-3 py-3 text-left text-xs font-bold uppercase tracking-[0.16em]">
                  Risk
                </th>
                <th className="w-36 border-b-2 border-foreground px-3 py-3 text-left text-xs font-bold uppercase tracking-[0.16em]">
                  Window
                </th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="bg-card">
                  <td className="border-r-2 border-t-2 border-foreground px-3 py-3">
                    <div className="h-5 w-5 border-2 border-foreground bg-background" />
                  </td>
                  <td className="border-r-2 border-t-2 border-foreground px-3 py-3 text-sm font-medium">
                    {task.title}
                  </td>
                  <td className="border-r-2 border-t-2 border-foreground px-3 py-3 text-sm font-mono uppercase tracking-[0.12em] text-muted-foreground">
                    {task.dueLabel}
                  </td>
                  <td className="border-r-2 border-t-2 border-foreground px-3 py-3 text-sm font-mono uppercase tracking-[0.12em]">
                    {task.signalScore}
                  </td>
                  <td className="border-t-2 border-foreground px-3 py-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`border border-foreground px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${urgencyClasses[task.urgency]}`}
                      >
                        {task.urgency}
                      </span>
                      <div className="h-3 w-full border-2 border-foreground bg-background p-0.5">
                        <div
                          className="h-full bg-foreground"
                          style={{ width: `${Math.max(task.progress, 8)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {tasks.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="border-t-2 border-foreground px-3 py-6 text-sm font-mono uppercase tracking-[0.14em] text-muted-foreground"
                  >
                    No related tasks for this module yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

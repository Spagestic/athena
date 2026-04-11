"use client";

import { useState } from "react";
import { Download, Loader2, TriangleAlert, Upload } from "lucide-react";

import FileUpload from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

import { type ModuleNoteRow, type ModuleTaskRow } from "../module-data";

type ModuleWorkspaceProps = {
  notes: ModuleNoteRow[];
  tasks: ModuleTaskRow[];
  isUploading: boolean;
  uploadError: string | null;
  onUploadFile: (file: File) => Promise<void>;
  validateUploadFile: (file: File) => {
    code: string;
    message: string;
  } | null;
};

type WorkspaceTab = "notes" | "tasks";

const urgencyClasses: Record<ModuleTaskRow["urgency"], string> = {
  critical: "bg-red-500 text-white",
  medium: "bg-orange-400 text-black",
  low: "bg-lime-400 text-black",
};

const processingStatusClasses: Record<ModuleNoteRow["processingStatus"], string> = {
  failed: "bg-red-500 text-white",
  pending: "bg-zinc-300 text-black",
  processing: "bg-orange-400 text-black",
  ready: "bg-lime-400 text-black",
};

function formatLastUpdated(timestamp: number) {
  const deltaMs = Date.now() - timestamp;
  const deltaHours = Math.floor(deltaMs / (1000 * 60 * 60));
  const deltaDays = Math.floor(deltaHours / 24);

  if (deltaHours < 1) {
    return "Just now";
  }
  if (deltaHours < 24) {
    return `${deltaHours} hour${deltaHours === 1 ? "" : "s"} ago`;
  }
  if (deltaDays < 7) {
    return `${deltaDays} day${deltaDays === 1 ? "" : "s"} ago`;
  }

  return new Date(timestamp).toLocaleDateString();
}

export function ModuleWorkspace({
  notes,
  tasks,
  isUploading,
  uploadError,
  onUploadFile,
  validateUploadFile,
}: ModuleWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("notes");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  return (
    <section className="space-y-4 pb-10">
      <div className="flex items-center justify-between gap-2">
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
        <Button
          type="button"
          onClick={() => setIsUploadDialogOpen(true)}
          className="border-2 border-foreground bg-background text-foreground shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          Upload
        </Button>
      </div>

      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-2xl border-2 border-foreground bg-background p-0 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
          <DialogHeader className="border-b-2 border-foreground px-6 py-5">
            <DialogTitle className="text-xl font-black uppercase tracking-[0.12em]">
              Upload course materials
            </DialogTitle>
            <DialogDescription className="font-mono uppercase tracking-[0.08em]">
              Add a PDF or document and Athena will save it to Convex storage, then run OCR automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 px-6 py-5">
            <FileUpload
              acceptedFileTypes={[
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "application/vnd.ms-powerpoint",
                "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                "text/plain",
                "text/markdown",
              ]}
              maxFileSize={25 * 1024 * 1024}
              uploadDelay={600}
              validateFile={validateUploadFile}
              onUploadSuccess={(file) => {
                void onUploadFile(file).then(() => {
                  setIsUploadDialogOpen(false);
                });
              }}
              onUploadError={() => undefined}
              className="max-w-none"
            />
            <p className="text-xs font-mono uppercase tracking-[0.12em] text-muted-foreground">
              Supported: PDF, DOC, DOCX, PPT, PPTX, TXT, MD
            </p>
            {uploadError ? (
              <p className="border-2 border-red-500 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-700">
                {uploadError}
              </p>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

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
                  Status
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
                    <HoverCard>
                      <HoverCardTrigger>
                        <span
                          className={`inline-flex border border-foreground px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${processingStatusClasses[note.processingStatus]}`}
                        >
                          {note.processingStatus}
                        </span>
                      </HoverCardTrigger>
                      <HoverCardContent
                        side="top"
                        align="start"
                        sideOffset={10}
                        className="w-56 rounded-none border-2 border-foreground bg-background px-3 py-2 shadow-[4px_4px_0_0_rgba(0,0,0,1)] ring-0"
                      >
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                          Note status
                        </p>
                        <p className="mt-1 text-sm font-mono uppercase tracking-[0.12em]">
                          {note.processingStatus === "ready"
                            ? "OCR complete and markdown saved."
                            : note.processingStatus === "failed"
                              ? "OCR failed. Re-upload to retry."
                              : "Athena is extracting text right now."}
                        </p>
                      </HoverCardContent>
                    </HoverCard>
                  </td>
                  <td className="border-r-2 border-t-2 border-foreground px-3 py-3 text-sm font-mono uppercase tracking-[0.12em] text-muted-foreground">
                    {formatLastUpdated(note.lastUpdated)}
                  </td>
                  <td className="border-t-2 border-foreground px-3 py-3">
                    {note.fileUrl ? (
                      <a
                        href={note.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex h-10 w-10 items-center justify-center border-2 border-foreground bg-background shadow-[3px_3px_0_0_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    ) : note.processingStatus === "failed" ? (
                      <div className="flex h-10 w-10 items-center justify-center border-2 border-foreground bg-background text-red-500 shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
                        <TriangleAlert className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center border-2 border-foreground bg-background shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {notes.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="border-t-2 border-foreground px-3 py-6 text-sm font-mono uppercase tracking-[0.14em] text-muted-foreground"
                  >
                    No notes uploaded yet.
                  </td>
                </tr>
              ) : null}
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

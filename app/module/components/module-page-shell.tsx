"use client";

import { useAction, useMutation } from "convex/react";
import { useEffect, useId, useState } from "react";
import { Check, Loader2, Pencil, Upload, X } from "lucide-react";

import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { ModuleHeader } from "./module-header";
import { ModuleLeaderboard } from "./module-leaderboard";
import { ModulePerformanceCard } from "./module-performance-card";
import { ModuleWorkspace } from "./module-workspace";
import { type ModulePageData } from "../module-data";

type ModulePageShellProps = {
  module: ModulePageData;
};

export function ModulePageShell({ module }: ModulePageShellProps) {
  const fileInputId = useId();
  const generateUploadUrl = useMutation(api.modules.generateUploadUrl);
  const createUploadedNote = useMutation(api.modules.createUploadedNote);
  const processUploadedNote = useAction(api.modules.processUploadedNote);
  const [isScrolled, setIsScrolled] = useState(false);
  const [description, setDescription] = useState(module.description);
  const [draftDescription, setDraftDescription] = useState(module.description);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleDescriptionEdit = () => {
    setDraftDescription(description);
    setIsEditingDescription(true);
  };

  const handleDescriptionCancel = () => {
    setDraftDescription(description);
    setIsEditingDescription(false);
  };

  const handleDescriptionSave = () => {
    setDescription(draftDescription.trim() || module.description);
    setIsEditingDescription(false);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const uploadUrl = await generateUploadUrl({});
      const uploadResponse = await fetch(uploadUrl, {
        body: file,
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
        method: "POST",
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload failed");
      }

      const { storageId } = (await uploadResponse.json()) as {
        storageId?: string;
      };
      if (!storageId) {
        throw new Error("Storage upload did not return a file id");
      }

      const createdNote = await createUploadedNote({
        mimeType: file.type || undefined,
        moduleCode: module.code,
        originalFilename: file.name,
        storageId: storageId as never,
        title: file.name.replace(/\.[^.]+$/, ""),
      });

      await processUploadedNote({
        documentUrl: createdNote.documentUrl,
        noteId: createdNote.noteId,
      });
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Unable to upload this file.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground dot-grid-bg">
      <ModuleHeader
        isScrolled={isScrolled}
        moduleCode={module.code}
        notifications={[]}
        searchQuery=""
        streakCount={module.streakCount}
        user={module.user}
        onSearchQueryChange={() => undefined}
      />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-8 md:py-10">
        <section className="space-y-6 border-2 border-foreground bg-card p-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)] md:p-8">
          <div className="space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-muted-foreground">
              Course title
            </p>
            <h1 className="text-4xl font-black uppercase leading-none md:text-6xl">
              {module.code} - {module.title}
            </h1>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  Module description
                </p>
                <button
                  type="button"
                  onClick={handleDescriptionEdit}
                  className="flex h-8 w-8 items-center justify-center border-2 border-foreground bg-background shadow-[3px_3px_0_0_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5"
                  aria-label="Edit module description"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>

              {isEditingDescription ? (
                <div className="space-y-3">
                  <textarea
                    value={draftDescription}
                    onChange={(event) =>
                      setDraftDescription(event.target.value)
                    }
                    rows={3}
                    className="w-full border-2 border-foreground bg-background px-4 py-3 text-base font-medium text-foreground shadow-[4px_4px_0_0_rgba(0,0,0,1)] focus:outline-none md:text-lg"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDescriptionSave}
                      className="flex items-center gap-2 border-2 border-foreground bg-foreground px-4 py-2 text-sm font-mono uppercase tracking-[0.12em] text-background shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5"
                    >
                      <Check className="h-4 w-4" />
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={handleDescriptionCancel}
                      className="flex items-center gap-2 border-2 border-foreground bg-background px-4 py-2 text-sm font-mono uppercase tracking-[0.12em] shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-foreground bg-background px-4 py-3 text-base font-medium text-foreground shadow-[4px_4px_0_0_rgba(0,0,0,1)] md:text-lg">
                  {description}
                </div>
              )}
            </div>
          </div>

          <div className="border-t-2 border-foreground/20 pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
                  Participants / Friends
                </p>
                <div className="mt-3 flex items-center gap-2">
                  {module.participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-foreground bg-background text-sm font-black uppercase shadow-[3px_3px_0_0_rgba(0,0,0,1)]"
                      title={participant.name}
                    >
                      {participant.initials}
                    </div>
                  ))}
                  <div className="flex h-11 min-w-16 items-center justify-center rounded-full border-2 border-foreground bg-primary px-3 text-sm font-black uppercase text-primary-foreground shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
                    +{module.participantOverflow}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-stretch gap-3 md:items-end">
                <div className="border-2 border-foreground bg-background px-4 py-3 text-sm font-mono uppercase tracking-[0.14em] shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                  {module.noteCount} notes / {module.pendingTasks} active tasks
                  / {module.professor}
                </div>
                <div className="w-full max-w-md border-2 border-foreground bg-background p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)] md:min-w-[24rem]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                        Upload materials
                      </p>
                      <p className="mt-1 text-sm font-medium">
                        Add a PDF or document and Athena will extract the text
                        automatically.
                      </p>
                    </div>
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : null}
                  </div>
                  <input
                    id={fileInputId}
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain,text/markdown"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="sr-only"
                  />
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <label htmlFor={fileInputId} className="flex-1">
                      <Button
                        type="button"
                        disabled={isUploading}
                        className="w-full border-2 border-foreground bg-foreground text-background shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
                      >
                        <span className="flex items-center justify-center gap-2">
                          {isUploading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Uploading + OCR...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4" />
                              Choose File
                            </>
                          )}
                        </span>
                      </Button>
                    </label>
                    <div className="flex items-center border-2 border-foreground bg-card px-3 py-2 text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground">
                      PDF, DOCX, PPTX, TXT, MD
                    </div>
                  </div>
                  <p className="mt-3 text-xs font-mono uppercase tracking-[0.12em] text-muted-foreground">
                    Uploaded files are saved to Convex storage, then OCR content
                    is written back into your notes.
                  </p>
                  {uploadError ? (
                    <p className="mt-3 border-2 border-red-500 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-700">
                      {uploadError}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <ModulePerformanceCard performance={module.performance} />
          <ModuleLeaderboard entries={module.leaderboard} />
        </section>

        <ModuleWorkspace notes={module.notes} tasks={module.tasks} />
      </main>
    </div>
  );
}

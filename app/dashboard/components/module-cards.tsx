"use client";

import Link from "next/link";
import { useMutation } from "convex/react";
import {
  BookCopy,
  Loader2,
  MoreHorizontal,
  Plus,
  Share2,
  Settings,
  Trash2,
} from "lucide-react";
import { type FormEvent, useState } from "react";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type DashboardModule } from "../dashboard-data";

type ModuleCardsProps = {
  modules: DashboardModule[];
};

export function ModuleCards({ modules }: ModuleCardsProps) {
  const openModule = (moduleCode: string) => `/module/${moduleCode}`;
  const createFolder = useMutation(api.folders.createFolder);
  const deleteFolder = useMutation(api.folders.deleteFolder);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [courseName, setCourseName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [modulePendingDeletion, setModulePendingDeletion] = useState<DashboardModule | null>(null);
  const [isDeletingModule, setIsDeletingModule] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const resetForm = () => {
    setCourseName("");
    setDescription("");
    setFormError(null);
  };

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
      setIsSubmitting(false);
    }
  };

  const handleCreateCourse = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = courseName.trim();
    if (trimmedName.length < 3) {
      setFormError("Course name must be at least 3 characters.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      await createFolder({
        description: description.trim() || undefined,
        name: trimmedName,
      });
      handleOpenChange(false);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Unable to create course.",
      );
      setIsSubmitting(false);
    }
  };

  const handleDeleteDialogChange = (open: boolean) => {
    if (isDeletingModule) {
      return;
    }

    if (!open) {
      setModulePendingDeletion(null);
      setDeleteError(null);
    }
  };

  const handleDeleteModule = async () => {
    if (!modulePendingDeletion) {
      return;
    }

    setIsDeletingModule(true);
    setDeleteError(null);

    try {
      await deleteFolder({
        folderId: modulePendingDeletion.id as Id<"folders">,
      });
      setModulePendingDeletion(null);
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Unable to delete class.",
      );
    } finally {
      setIsDeletingModule(false);
    }
  };

  return (
    <section className="space-y-4 pb-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-muted-foreground">
            Course workspaces
          </p>
          <h2 className="text-3xl font-black uppercase md:text-4xl">
            Your courses
          </h2>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger
            render={
              <Button className="border-2 border-foreground bg-background px-4 py-3 text-sm font-mono uppercase tracking-[0.12em] text-foreground shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5" />
            }
          >
            <Plus className="h-4 w-4" />
            Add New
          </DialogTrigger>
          <DialogContent className="max-w-xl border-2 border-foreground bg-background p-0 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
            <form onSubmit={handleCreateCourse}>
              <DialogHeader className="border-b-2 border-foreground px-6 py-5">
                <DialogTitle className="text-xl font-black uppercase tracking-[0.12em]">
                  Create Course Workspace
                </DialogTitle>
                <DialogDescription className="font-mono uppercase tracking-[0.08em]">
                  Start a new course folder for notes, quizzes, and momentum
                  tracking.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 px-6 py-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="course-name"
                    className="font-mono uppercase tracking-[0.12em]"
                  >
                    Course Name
                  </Label>
                  <Input
                    id="course-name"
                    value={courseName}
                    onChange={(event) => setCourseName(event.target.value)}
                    placeholder="COMP1021 - Introduction to Computer Science"
                    className="h-11 border-2 border-foreground bg-background shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="course-description"
                    className="font-mono uppercase tracking-[0.12em]"
                  >
                    Description
                  </Label>
                  <Textarea
                    id="course-description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Exam focus, professor, or what you want Athena to help you track."
                    className="min-h-24 border-2 border-foreground bg-background shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
                    disabled={isSubmitting}
                  />
                </div>

                {formError ? (
                  <p className="border-2 border-red-500 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-700">
                    {formError}
                  </p>
                ) : null}
              </div>

              <DialogFooter className="border-none bg-muted/20 px-6 pb-6 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  className="mr-2"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  {isSubmitting ? "Creating..." : "Create Course"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {modules.map((module) => (
          <article
            key={module.id}
            role="link"
            tabIndex={0}
            onClick={() => {
              window.location.href = openModule(module.code);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                window.location.href = openModule(module.code);
              }
            }}
            className="group relative flex h-full cursor-pointer flex-col justify-between gap-6 overflow-hidden border-2 border-foreground bg-card p-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Link
              href={`/module/${module.code}`}
              className="absolute inset-0 z-10 rounded-none"
              aria-label={`Open ${module.code}`}
            />
            <div className="pointer-events-none absolute inset-0 z-0 origin-left scale-x-0 bg-zinc-400/10 transition-transform duration-150 ease-out group-hover:scale-x-100" />

            <details
              className="absolute right-4 top-4 z-20"
              onClick={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
            >
              <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center border-2 border-foreground bg-background shadow-[4px_4px_0_0_rgba(0,0,0,1)] [&::-webkit-details-marker]:hidden">
                <MoreHorizontal className="h-4 w-4" />
              </summary>
              <div className="absolute right-0 mt-3 flex min-w-40 flex-col border-2 border-foreground bg-background shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <button className="flex items-center gap-2 border-b-2 border-foreground px-4 py-3 text-left text-sm font-mono uppercase tracking-[0.12em] transition-colors hover:bg-accent">
                  <Settings className="h-4 w-4" />
                  Customize
                </button>
                <button className="flex items-center gap-2 border-b-2 border-foreground px-4 py-3 text-left text-sm font-mono uppercase tracking-[0.12em] transition-colors hover:bg-accent">
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteError(null);
                    setModulePendingDeletion(module);
                  }}
                  className="flex items-center gap-2 px-4 py-3 text-left text-sm font-mono uppercase tracking-[0.12em] transition-colors hover:bg-accent"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </details>

            <div className="relative z-10 space-y-4 pr-12">
              <div className="inline-flex items-center gap-2 border border-foreground bg-primary text-primary-foreground px-3 py-2 text-xs font-bold uppercase tracking-[0.2em]">
                <BookCopy className="h-4 w-4" />
                {module.code}
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase leading-tight">
                  {module.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {module.subtitle}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="border-2 border-foreground bg-background px-3 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  Notes
                </p>
                <p className="mt-2 text-2xl font-black">{module.noteCount}</p>
              </div>
              <div className="border-2 border-foreground bg-background px-3 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  Tasks
                </p>
                <p className="mt-2 text-2xl font-black">
                  {module.pendingTasks}
                </p>
              </div>
            </div>
          </article>
        ))}
        {modules.length === 0 ? (
          <div className="border-2 border-dashed border-foreground bg-background px-4 py-5 text-sm font-mono uppercase tracking-[0.14em] text-muted-foreground lg:col-span-3">
            No courses match that filter yet.
          </div>
        ) : null}
      </div>

      <AlertDialog
        open={modulePendingDeletion !== null}
        onOpenChange={handleDeleteDialogChange}
      >
        <AlertDialogContent className="border-2 border-foreground bg-background shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
          <AlertDialogHeader className="items-start text-left">
            <AlertDialogTitle className="text-xl font-black uppercase tracking-[0.12em]">
              Delete {modulePendingDeletion?.code}?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-mono uppercase tracking-[0.08em]">
              This removes the class and all of its notes, quizzes, and progress.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deleteError ? (
            <p className="border-2 border-red-500 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-700">
              {deleteError}
            </p>
          ) : null}

          <AlertDialogFooter className="border-none bg-muted/20">
            <AlertDialogCancel disabled={isDeletingModule}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteModule}
              disabled={isDeletingModule}
              className="border-2 border-foreground bg-foreground text-background shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
            >
              {isDeletingModule ? "Deleting..." : "Delete class"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

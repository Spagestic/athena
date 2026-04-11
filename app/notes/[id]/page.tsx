"use client"

import type { CSSProperties } from "react"
import { useMemo } from "react"
import { useParams } from "next/navigation"
import { useQuery } from "convex/react"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { NotesChatSidebar } from "../components/notes-chat-sidebar"
import {
  formatLastUpdated,
  getNoteTemplate,
} from "../components/note-page-data"
import { NotesPageContent } from "../components/notes-page-content"

export default function NotePage() {
  const params = useParams<{ id?: string | string[] }>()
  const noteId = Array.isArray(params.id) ? params.id[0] : params.id ?? "study-note"
  const noteRecord = useQuery(api.notes.getNote, {
    id: noteId as Id<"notes">,
  })
  const note = useMemo(() => {
    const fallback = getNoteTemplate(noteId)

    if (!noteRecord) {
      return fallback
    }

    return {
      ...fallback,
      moduleCode: noteRecord.code,
      title: noteRecord.title,
      updatedAt: formatLastUpdated(noteRecord.updatedAt),
      overview: "Extracted markdown from this note.",
    }
  }, [noteId, noteRecord])

  if (noteRecord === undefined) {
    return (
      <div className="min-h-screen bg-background text-foreground dot-grid-bg">
        <main className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-10 md:px-8">
          <div className="border-2 border-foreground bg-card px-6 py-5 text-sm font-mono uppercase tracking-[0.14em] shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            Loading note...
          </div>
        </main>
      </div>
    )
  }

  if (noteRecord === null) {
    return (
      <div className="min-h-screen bg-background text-foreground dot-grid-bg">
        <main className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-10 md:px-8">
          <div className="border-2 border-foreground bg-card px-6 py-5 text-sm font-mono uppercase tracking-[0.14em] shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            Note not found.
          </div>
        </main>
      </div>
    )
  }

  return (
    <SidebarProvider
      defaultOpen
      style={
        {
          "--sidebar-width": "31rem",
        } as CSSProperties
      }
    >
      <NotesChatSidebar note={note} quiz={noteRecord.quiz} />
      <SidebarInset className="min-h-screen bg-transparent">
        <NotesPageContent
          fileUrl={noteRecord.fileUrl}
          mimeType={noteRecord.mimeType}
          note={note}
          markdownContent={noteRecord.markdownContent}
          processingStatus={noteRecord.processingStatus}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
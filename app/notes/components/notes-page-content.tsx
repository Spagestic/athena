"use client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import type { NoteTemplate } from "./note-page-data";

export function NotesPageContent({
  note,
  fileUrl,
  markdownContent,
  mimeType,
  processingStatus,
}: {
  note: NoteTemplate;
  fileUrl: string | null;
  markdownContent: string;
  mimeType: string | null;
  processingStatus: "pending" | "processing" | "ready" | "failed";
}) {
  const hasPdfDocument = Boolean(fileUrl) && mimeType === "application/pdf";
  const isMarkdownLoading =
    !markdownContent &&
    (processingStatus === "pending" || processingStatus === "processing");

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground dot-grid-bg">
      <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b-2 border-foreground bg-background/95 px-4 backdrop-blur md:px-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href={`/module/${note.moduleCode}`}>
                {note.moduleCode}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{note.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <SidebarTrigger className="-mr-1 ml-auto h-11 w-11 rounded-none border-2 border-foreground bg-background shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5 hover:bg-accent" />
      </header>

      <main className="flex min-h-0 flex-1 w-full overflow-hidden px-4 py-6 md:px-8 md:py-8">
        <section className="flex min-h-0 w-full flex-1 flex-col overflow-hidden border-2 border-foreground bg-card p-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)] md:p-8">
          <Tabs
            defaultValue="doc"
            className="flex min-h-0 flex-1 flex-col gap-4"
          >
            <TabsList
              variant="line"
              className="w-fit border-2 border-foreground bg-background p-1 shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
            >
              <TabsTrigger
                value="doc"
                className="rounded-none px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em] data-active:bg-accent"
              >
                Doc
              </TabsTrigger>
              <TabsTrigger
                value="markdown"
                className="rounded-none px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em] data-active:bg-accent"
              >
                Markdown
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="doc"
              className="mt-2 min-h-0 flex-1 overflow-hidden"
            >
              {hasPdfDocument && fileUrl ? (
                <div className="h-full overflow-hidden border-2 border-foreground bg-background">
                  <iframe
                    src={fileUrl}
                    title={`${note.title} PDF`}
                    className="h-full w-full"
                  />
                </div>
              ) : (
                <div className="h-full border-2 border-dashed border-foreground bg-background px-4 py-5 text-sm font-medium text-muted-foreground">
                  {fileUrl ? (
                    <>
                      This note&apos;s original file is not a PDF, so it
                      can&apos;t be embedded here.
                    </>
                  ) : (
                    "No source document is available for this note yet."
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent
              value="markdown"
              className="mt-2 min-h-0 flex-1 overflow-hidden"
            >
              {markdownContent ? (
                <ScrollArea className="h-full min-h-0 border-2 border-foreground bg-background">
                  <pre className="p-4 text-sm leading-6 whitespace-pre-wrap wrap-break-word">
                    <code>{markdownContent}</code>
                  </pre>
                </ScrollArea>
              ) : isMarkdownLoading ? (
                <div className="flex h-full items-center justify-center border-2 border-dashed border-foreground bg-background px-4 py-5">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="text-sm font-medium text-muted-foreground">
                      Extracting markdown from your note...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-full border-2 border-dashed border-foreground bg-background px-4 py-5 text-sm font-medium text-muted-foreground">
                  No extracted markdown is available for this note yet.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </div>
  );
}

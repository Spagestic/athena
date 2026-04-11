import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Athena",
  description: "Agentic note-taking dashboard overview.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

import type { Metadata } from "next";
import { DashboardPage } from "./dashboard-page";

export const metadata: Metadata = {
  title: "Dashboard | Athena",
  description: "Agentic note-taking dashboard overview.",
};

export default function Page() {
  return <DashboardPage />;
}

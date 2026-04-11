import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ModulePageShell } from "../components/module-page-shell";
import { getModulePageData } from "../module-data";

type ModulePageProps = {
  params: Promise<{
    moduleCode: string;
  }>;
};

export async function generateMetadata({
  params,
}: ModulePageProps): Promise<Metadata> {
  const { moduleCode } = await params;
  const moduleData = getModulePageData(moduleCode);

  if (!moduleData) {
    return {
      title: "Module | Athena",
    };
  }

  return {
    title: `${moduleData.code} | Athena`,
    description: `${moduleData.title} module workspace.`,
  };
}

export default async function ModulePage({ params }: ModulePageProps) {
  const { moduleCode } = await params;
  const moduleData = getModulePageData(moduleCode);

  if (!moduleData) {
    notFound();
  }

  return <ModulePageShell module={moduleData} />;
}

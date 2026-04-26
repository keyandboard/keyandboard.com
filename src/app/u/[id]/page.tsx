import { notFound } from "next/navigation";
import { getFounder } from "@/lib/content";
import { FounderView } from "@/components/sites/FounderView";

interface FounderPageProps {
  params: Promise<{ id: string }>;
}

export default async function FounderPage({ params }: FounderPageProps) {
  const { id } = await params;
  const content = await getFounder(id);
  if (!content) notFound();
  return <FounderView content={content} />;
}

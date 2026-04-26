import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFounder } from "@/lib/content";
import { FounderView } from "@/components/sites/FounderView";

interface FounderPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: FounderPageProps): Promise<Metadata> {
  const { id } = await params;
  const content = await getFounder(id);
  if (!content) return {};
  const icon = `/icons/${id}.svg`;
  return {
    title: `${content.profile.name} — ${content.profile.title}`,
    description: content.profile.bio,
    icons: {
      icon,
      shortcut: icon,
      apple: icon,
    },
  };
}

export default async function FounderPage({ params }: FounderPageProps) {
  const { id } = await params;
  const content = await getFounder(id);
  if (!content) notFound();
  return <FounderView content={content} />;
}

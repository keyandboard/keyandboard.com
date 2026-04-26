import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getFounder, getUnion } from "@/lib/content";
import { siteFromHost } from "@/lib/site";
import { KeyandboardView } from "@/components/sites/KeyandboardView";
import { FounderView } from "@/components/sites/FounderView";

interface HomeProps {
  searchParams: Promise<{ _site?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  let site = siteFromHost(host);

  // Local override for previewing each site without DNS:
  //   /?_site=baran  | /?_site=kayra  | /?_site=keyandboard
  const params = await searchParams;
  if (params._site === "baran") site = { variant: "founder", founderId: "baran" };
  else if (params._site === "kayra") site = { variant: "founder", founderId: "kayra" };
  else if (params._site === "keyandboard") site = { variant: "keyandboard", founderId: null };

  if (site.variant === "founder" && site.founderId) {
    const content = await getFounder(site.founderId);
    if (!content) notFound();
    return <FounderView content={content} />;
  }

  const { profiles, projects } = await getUnion();
  return <KeyandboardView profiles={profiles} projects={projects} />;
}

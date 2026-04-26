import { getUnion } from "@/lib/content";
import { KeyandboardView } from "@/components/sites/KeyandboardView";

export default async function Home() {
  const { profiles, projects } = await getUnion();
  return <KeyandboardView profiles={profiles} projects={projects} />;
}

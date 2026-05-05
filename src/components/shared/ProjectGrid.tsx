import { ProjectCard } from "./ProjectCard";
import { ProjectScroller } from "./ProjectScroller";
import type { Project } from "@/types";

interface ProjectGridProps {
  projects: Project[];
  /** Wide layout: taller cards + more desktop padding. */
  wide?: boolean;
  /** Compact desktop grid for overview pages with many projects. */
  compact?: boolean;
}

/**
 * Mobile: horizontal snap-scroller with pixel-art pager.
 * Desktop (`sm:` and up): 2-column grid with gaps between cards.
 */
export function ProjectGrid({
  projects,
  wide = false,
  compact = false,
}: ProjectGridProps) {
  const desktopGridClass = compact
    ? "hidden sm:grid sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5"
    : wide
      ? "hidden sm:grid sm:grid-cols-2 sm:gap-6 xl:grid-cols-3 xl:gap-7"
      : "hidden sm:grid sm:grid-cols-2 sm:gap-5 lg:gap-6";

  return (
    <>
      <ProjectScroller>
        {projects.map((p) => (
          <ProjectCard key={p.slug} project={p} wide={wide} />
        ))}
      </ProjectScroller>

      <div className={desktopGridClass}>
        {projects.map((p) => (
          <ProjectCard key={p.slug} project={p} wide={wide} />
        ))}
      </div>
    </>
  );
}

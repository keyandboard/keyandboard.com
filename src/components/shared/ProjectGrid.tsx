import { ProjectCard } from "./ProjectCard";
import { ProjectScroller } from "./ProjectScroller";
import type { Project } from "@/types";

interface ProjectGridProps {
  projects: Project[];
  /** Wide layout: taller cards + more desktop padding. */
  wide?: boolean;
}

/**
 * Mobile: horizontal snap-scroller with pixel-art pager.
 * Desktop (`sm:` and up): 2-column grid with gaps between cards.
 */
export function ProjectGrid({ projects, wide = false }: ProjectGridProps) {
  return (
    <>
      <ProjectScroller>
        {projects.map((p) => (
          <ProjectCard key={p.slug} project={p} wide={wide} />
        ))}
      </ProjectScroller>

      <div
        className={
          wide
            ? "hidden sm:grid sm:grid-cols-2 sm:gap-6 lg:gap-8"
            : "hidden sm:grid sm:grid-cols-2 sm:gap-5 lg:gap-6"
        }
      >
        {projects.map((p) => (
          <ProjectCard key={p.slug} project={p} wide={wide} />
        ))}
      </div>
    </>
  );
}

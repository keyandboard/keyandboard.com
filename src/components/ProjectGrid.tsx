import { ProjectCard } from "./ProjectCard";
import type { Project, Founder } from "@/types";

interface ProjectGridProps {
  projects: Project[];
  founders: Founder[];
}

export function ProjectGrid({ projects, founders }: ProjectGridProps) {
  return (
    <div className="grid grid-cols-1 gap-px bg-white/[0.05] sm:grid-cols-2">
      {projects.map((project) => (
        <ProjectCard key={project.slug} project={project} founders={founders} />
      ))}
    </div>
  );
}

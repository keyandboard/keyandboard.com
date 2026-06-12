import { ProjectExplorer } from "./projects/ProjectExplorer";
import type { Project } from "@/types";

interface ProjectGridProps {
  projects: Project[];
  /** Accepted for backward compatibility; the arcade explorer is layout-uniform. */
  wide?: boolean;
  compact?: boolean;
}

/**
 * Projects section — an arcade "PROJECT SELECT" experience (CRT viewport +
 * selectable roster). Shared across founder pages and the company overview.
 * `wide` / `compact` are retained so existing call sites keep working.
 */
export function ProjectGrid({ projects }: ProjectGridProps) {
  return <ProjectExplorer projects={projects} />;
}

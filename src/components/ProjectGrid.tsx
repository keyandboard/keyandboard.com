"use client";

import { useState } from "react";
import { ProjectCard } from "./ProjectCard";
import type { Project, Founder } from "@/types";

type FilterId = "all" | "baran" | "kayra";

interface ProjectGridProps {
  projects: Project[];
  founders: Founder[];
}

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "baran", label: "Baran" },
  { id: "kayra", label: "Kayra" },
];

export function ProjectGrid({ projects, founders }: ProjectGridProps) {
  const [active, setActive] = useState<FilterId>("all");

  const visible =
    active === "all" ? projects : projects.filter((p) => p.founders.includes(active));

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-10">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setActive(f.id)}
            className={[
              "pixel-label text-[8px] px-4 py-2 transition border",
              active === f.id
                ? "border-[var(--neon-dim)] text-[var(--neon)] bg-[var(--neon-faint)]"
                : "border-white/10 text-white/40 hover:border-white/25 hover:text-white/70 bg-transparent",
            ].join(" ")}
          >
            {f.label}
            {f.id !== "all" && (
              <span className="ml-2 text-white/25">
                ({projects.filter((p) => p.founders.includes(f.id)).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid gap-px bg-white/[0.06]">
        {visible.map((project, i) => (
          <ProjectCard
            key={project.slug}
            project={project}
            index={i}
            founders={founders}
          />
        ))}
      </div>
    </div>
  );
}

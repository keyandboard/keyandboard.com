"use client";

import { useState, useCallback, type KeyboardEvent } from "react";
import { ProjectViewport } from "./ProjectViewport";
import { ProjectRoster } from "./ProjectRoster";
import type { Project } from "@/types";

interface Props {
  projects: Project[];
}

/**
 * "PROJECT SELECT" — an arcade roster + CRT viewport. Hover/click a slot to
 * load it; Arrow keys cycle the selection, Enter launches the live project.
 * Replaces the old static project grid across every site view.
 */
export function ProjectExplorer({ projects }: Props) {
  const [selected, setSelected] = useState(0);
  const total = projects.length;
  const current = projects[selected];

  const move = useCallback(
    (delta: number) => {
      // wrap around the roster so it loops like a real select screen
      setSelected((prev) => (prev + delta + total) % total);
    },
    [total]
  );

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      move(1);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      move(-1);
    } else if (e.key === "Enter" && current.url) {
      window.open(current.url, "_blank", "noopener,noreferrer");
    }
  };

  if (total === 0) return null;

  return (
    <div
      className="max-w-5xl outline-none"
      tabIndex={0}
      onKeyDown={onKeyDown}
      aria-label="Project select. Use arrow keys to browse, Enter to launch."
    >
      {/* hint strip */}
      <div className="mb-4 flex items-center justify-between">
        <span className="pixel-label text-[6px] text-white/25">▸ SELECT A BUILD</span>
        <span className="pixel-label hidden text-[6px] text-white/20 sm:inline">
          ◄ ▲ ▼ ► BROWSE · ⏎ LAUNCH
        </span>
      </div>

      {/* Mobile: horizontal chip strip above the viewport */}
      <div className="mb-3 sm:hidden">
        <ProjectRoster
          projects={projects}
          selected={selected}
          onSelect={setSelected}
          onHover={setSelected}
          orientation="horizontal"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-[1.45fr_1fr] sm:items-start sm:gap-5">
        <ProjectViewport project={current} index={selected} total={total} />

        {/* Desktop: vertical side rail */}
        <div className="hidden sm:sticky sm:top-6 sm:block">
          <ProjectRoster
            projects={projects}
            selected={selected}
            onSelect={setSelected}
            onHover={setSelected}
          />
        </div>
      </div>
    </div>
  );
}

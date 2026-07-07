"use client";

import type { Project } from "@/types";

interface Props {
  projects: Project[];
  selected: number;
  onSelect: (index: number) => void;
  onHover: (index: number) => void;
  orientation?: "vertical" | "horizontal";
}

/**
 * Arcade-style selectable roster. Each slot is a "fighter slot" — click (or
 * keyboard-focus) to load that project into the viewport. The active slot gets a neon
 * bracket, an offset pixel shadow, and a glowing accent chip.
 *
 * Vertical layout drives the desktop side rail; horizontal becomes a swipeable
 * chip strip on mobile so the tapped slot and the viewport stay on screen.
 */
export function ProjectRoster({
  projects,
  selected,
  onSelect,
  onHover,
  orientation = "vertical",
}: Props) {
  const horizontal = orientation === "horizontal";

  return (
    <ul
      role="listbox"
      aria-label="Projects"
      className={
        horizontal
          ? "flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          : "flex flex-col gap-1.5"
      }
    >
      {projects.map((project, i) => {
        const active = i === selected;
        const indexLabel = String(i + 1).padStart(2, "0");
        return (
          <li
            key={project.slug}
            role="option"
            aria-selected={active}
            className={horizontal ? "shrink-0" : ""}
          >
            <button
              type="button"
              onClick={() => onSelect(i)}
              onFocus={() => onHover(i)}
              className={
                "group relative flex items-center gap-3 border text-left transition-all duration-150 " +
                (horizontal ? "px-3 py-2" : "w-full px-3 py-2.5")
              }
              style={{
                borderColor: active ? project.accent : "rgba(255,255,255,0.08)",
                background: active
                  ? `linear-gradient(90deg, ${project.accent}14, transparent 70%)`
                  : "rgba(255,255,255,0.015)",
                boxShadow: active ? `3px 3px 0 ${project.accent}33` : "none",
              }}
            >
              <span
                className="absolute left-0 top-0 h-full w-[3px] transition-opacity duration-150"
                style={{ background: project.accent, opacity: active ? 1 : 0 }}
                aria-hidden
              />

              <span
                className="pixel-label shrink-0 text-[7px] transition-colors"
                style={{ color: active ? project.accent : "rgba(255,255,255,0.25)" }}
              >
                {indexLabel}
              </span>

              <span
                className="inline-block h-2 w-2 shrink-0 transition-all"
                style={{
                  background: project.accent,
                  opacity: active ? 1 : 0.4,
                  boxShadow: active ? `0 0 8px ${project.accent}` : "none",
                }}
                aria-hidden
              />

              <span className="min-w-0 flex-1">
                <span
                  className="block truncate text-sm font-semibold tracking-tight transition-colors"
                  style={{ color: active ? "#fff" : "rgba(255,255,255,0.72)" }}
                >
                  {project.name}
                </span>
              </span>

              {project.featured && (
                <span
                  className="pixel-label shrink-0 border px-1.5 py-0.5 text-[6px]"
                  style={{
                    color: project.accent,
                    borderColor: `${project.accent}66`,
                    background: `${project.accent}14`,
                  }}
                >
                  OSS
                </span>
              )}

              {!horizontal && (
                <>
                  <span className="pixel-label hidden shrink-0 text-[6px] text-white/30 sm:inline">
                    {project.year}
                  </span>
                  <span
                    className="pixel-label shrink-0 text-[8px] transition-all duration-150"
                    style={{
                      color: project.accent,
                      opacity: active ? 1 : 0,
                      transform: active ? "translateX(0)" : "translateX(-4px)",
                    }}
                    aria-hidden
                  >
                    ◄
                  </span>
                </>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

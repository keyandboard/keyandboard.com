"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, GitBranch } from "lucide-react";
import type { Project } from "@/types";
import { pickCover } from "@/lib/cover";

interface Props {
  project: Project;
  index: number;
  total: number;
}

const STATUS_COLOR: Record<string, string> = {
  Live: "#4ade80",
  Beta: "#facc15",
  "In development": "#60a5fa",
  Operational: "#a78bfa",
  Research: "#94a3b8",
};

/**
 * The "CRT viewport" — a retro monitor showing the highlighted project. The
 * screen replays a quick boot/scan animation whenever the project changes
 * (keyed re-mount), and the meta below reads like a game character sheet.
 */
export function ProjectViewport({ project, index, total }: Props) {
  const accent = project.accent;
  const statusColor = STATUS_COLOR[project.status] ?? accent;
  const cover = pickCover(project.slug, project.cover);
  const host = project.url
    ? new URL(project.url).host.replace(/^www\./, "")
    : null;

  return (
    <div
      className="relative flex flex-col border-2 bg-[var(--background)]"
      style={{
        borderColor: "rgba(255,255,255,0.1)",
        boxShadow: "6px 6px 0 rgba(255,255,255,0.04)",
      }}
    >
      {/* ── Monitor top bar ── */}
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
        <span className="pixel-label flex items-center gap-2 text-[7px] text-white/40">
          <span
            className="inline-block h-2 w-2 animate-subtle-pulse"
            style={{ background: accent, boxShadow: `0 0 6px ${accent}` }}
            aria-hidden
          />
          {project.featured ? "FEATURED BUILD · OPEN SOURCE" : "NOW VIEWING"}
        </span>
        <span className="pixel-label text-[7px]" style={{ color: accent }}>
          [{String(index + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}]
        </span>
      </div>

      {/* ── Screen ── */}
      <div className="relative h-40 shrink-0 overflow-hidden border-b border-white/10 sm:h-48">
        <div key={project.slug} className="crt-boot absolute inset-0">
          <Image
            src={cover}
            alt={`${project.name} — pixel art`}
            fill
            unoptimized={cover.endsWith(".svg")}
            className="pixelated object-cover object-center"
            sizes="(max-width: 768px) 100vw, 60vw"
          />
        </div>

        {/* accent glow from the bottom */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(120% 90% at 50% 110%, ${accent}22, transparent 60%)`,
          }}
          aria-hidden
        />
        {/* CRT scanlines */}
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.10) 2px, rgba(0,0,0,0.10) 4px)",
          }}
          aria-hidden
        />
        {/* vignette + bottom fade */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ boxShadow: "inset 0 0 60px rgba(0,0,0,0.55)" }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[var(--background)] to-transparent"
          aria-hidden
        />

        {/* status chip overlaid on screen */}
        <span
          className="pixel-label absolute left-3 top-3 inline-flex items-center gap-1.5 border px-2 py-1 text-[6px]"
          style={{
            borderColor: `${statusColor}66`,
            background: "rgba(0,0,0,0.45)",
            color: statusColor,
          }}
        >
          ● {project.status}
        </span>
      </div>

      {/* ── Meta / character sheet ── */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-serif text-3xl font-normal leading-none tracking-tight text-white sm:text-4xl">
            {project.name}
          </h3>
          <span className="pixel-label shrink-0 text-[7px] text-white/30">
            {project.year}
          </span>
        </div>
        <span
          className="mt-2 block h-[3px] w-12"
          style={{ background: accent, boxShadow: `0 0 8px ${accent}66` }}
          aria-hidden
        />

        <p className="mt-4 max-w-prose text-sm leading-relaxed text-white/60">
          {project.tagline}
        </p>

        {/* highlights as a "log" */}
        <ul className="mt-4 space-y-1.5">
          {project.highlights.map((h) => (
            <li key={h} className="flex gap-2 text-xs leading-snug text-white/45">
              <span className="pixel-label text-[7px]" style={{ color: accent }}>
                ▸
              </span>
              <span>{h}</span>
            </li>
          ))}
        </ul>

        {/* stack tags */}
        <div className="mt-5 flex flex-wrap gap-1.5 border-t border-white/10 pt-4">
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="pixel-tag bg-white/[0.03] px-2 py-0.5 font-mono text-[8px] uppercase tracking-wider text-white/45"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* launch + source buttons */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {project.url ? (
            <Link
              href={project.url}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 border-2 px-4 py-2.5 transition-all duration-200"
              style={{
                borderColor: accent,
                background: `${accent}12`,
                boxShadow: `3px 3px 0 ${accent}40`,
              }}
            >
              <span className="pixel-label text-[8px]" style={{ color: accent }}>
                LAUNCH
              </span>
              <ArrowUpRight
                className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                style={{ color: accent }}
              />
              {host && (
                <span className="ml-1 hidden font-mono text-[9px] uppercase tracking-widest text-white/30 sm:inline">
                  {host}
                </span>
              )}
            </Link>
          ) : (
            <span className="pixel-label inline-flex items-center gap-2 border-2 border-white/10 px-4 py-2.5 text-[8px] text-white/35">
              ▮ PRIVATE BUILD
            </span>
          )}

          {project.repo && (
            <Link
              href={project.repo}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 border-2 px-4 py-2.5 transition-all duration-200"
              style={{
                borderColor: `${accent}66`,
                background: "rgba(255,255,255,0.02)",
                boxShadow: `3px 3px 0 ${accent}22`,
              }}
            >
              <GitBranch className="h-4 w-4" style={{ color: accent }} />
              <span className="pixel-label text-[8px]" style={{ color: accent }}>
                SOURCE
              </span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

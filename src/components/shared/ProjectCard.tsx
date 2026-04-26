"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/types";
import { pickCover } from "@/lib/cover";

interface ProjectCardProps {
  project: Project;
  /** When true, render the more spacious "wide" variant inspired by baranorhan.dev. */
  wide?: boolean;
}

const STATUS_COLOR: Record<string, string> = {
  Live: "#4ade80",
  Beta: "#facc15",
  "In development": "#60a5fa",
  Operational: "#a78bfa",
  Research: "#94a3b8",
};

export function ProjectCard({ project, wide = false }: ProjectCardProps) {
  const cardRef = useRef<HTMLElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const cur = useRef({ x: 60, y: 40 });
  const tgt = useRef({ x: 60, y: 40 });

  useEffect(() => {
    const node = cardRef.current;
    if (!node) return;
    const animate = () => {
      cur.current.x += (tgt.current.x - cur.current.x) * 0.08;
      cur.current.y += (tgt.current.y - cur.current.y) * 0.08;
      node.style.setProperty("--mx", `${cur.current.x.toFixed(2)}%`);
      node.style.setProperty("--my", `${cur.current.y.toFixed(2)}%`);
      if (
        Math.abs(tgt.current.x - cur.current.x) > 0.05 ||
        Math.abs(tgt.current.y - cur.current.y) > 0.05
      ) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        rafRef.current = null;
      }
    };
    const queue = () => {
      if (!rafRef.current) rafRef.current = requestAnimationFrame(animate);
    };
    const onMove = (e: MouseEvent) => {
      const r = node.getBoundingClientRect();
      tgt.current = {
        x: ((e.clientX - r.left) / r.width) * 100,
        y: ((e.clientY - r.top) / r.height) * 100,
      };
      queue();
    };
    const onLeave = () => {
      tgt.current = { x: 60, y: 40 };
      queue();
    };
    node.addEventListener("mousemove", onMove);
    node.addEventListener("mouseleave", onLeave);
    return () => {
      node.removeEventListener("mousemove", onMove);
      node.removeEventListener("mouseleave", onLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const statusColor = STATUS_COLOR[project.status] ?? "#94a3b8";
  // Header image is always pixel-art: project.cover (if explicitly set, must be
  // pixel-art) or one of the 10 generated default covers. Real screenshots
  // (project.thumb) are intentionally NOT used here.
  const cover = pickCover(project.slug, project.cover);

  const cardStyle = { "--mx": "60%", "--my": "40%" } as React.CSSProperties;

  const inner = (
    <>
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(120% 120% at var(--mx) var(--my), ${project.accent}22 0%, transparent 65%)`,
        }}
        aria-hidden
      />

      <div
        className="relative w-full aspect-[16/9] overflow-hidden border-b-2 border-white/[0.08] bg-[var(--background)]"
      >
        <Image
          src={cover}
          alt={project.name}
          fill
          unoptimized={cover.endsWith(".svg")}
          className="pixelated object-contain object-center transition-transform duration-700 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      <div className={`relative z-10 ${wide ? "p-7 sm:p-8" : "p-6"}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span
              className="mt-0.5 inline-block h-2 w-2 shrink-0"
              style={{ background: statusColor, boxShadow: `0 0 6px ${statusColor}` }}
              aria-hidden
            />
            <h3 className="text-xl font-semibold tracking-tight text-white">
              {project.name}
            </h3>
            <span className="pixel-label text-[7px] text-white/30">{project.year}</span>
          </div>
          {project.url && (
            <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-white/30 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white/70" />
          )}
        </div>

        <p className={`text-sm leading-relaxed text-white/55 ${wide ? "mt-3" : "mt-2"}`}>
          {project.tagline}
        </p>

        <div className={`flex flex-wrap items-center gap-1.5 ${wide ? "mt-5" : "mt-4"}`}>
          {project.stack.map((t) => (
            <span
              key={t}
              className="pixel-tag px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide text-white/40"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </>
  );

  const cls =
    "card-mobile-shine group relative block overflow-hidden border-2 border-white/[0.10] bg-[var(--background)] transition-all duration-300 hover:border-white/25 hover:-translate-y-0.5";

  if (project.url) {
    return (
      <Link
        ref={cardRef as React.RefObject<HTMLAnchorElement>}
        href={project.url}
        target="_blank"
        rel="noreferrer"
        className={cls}
        style={cardStyle}
      >
        {inner}
      </Link>
    );
  }
  return (
    <div
      ref={cardRef as React.RefObject<HTMLDivElement>}
      className={cls}
      style={cardStyle}
    >
      {inner}
    </div>
  );
}

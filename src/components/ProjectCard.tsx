"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project, Founder } from "@/types";

interface ProjectCardProps {
  project: Project;
  index: number;
  founders: Founder[];
}

const cardClass =
  "card-mobile-shine project-card group relative z-20 block overflow-hidden border border-white/10 bg-white/[0.02] p-8 backdrop-blur-3xl transition duration-500 hover:border-white/22 hover:bg-white/[0.04] sm:p-10";

export function ProjectCard({ project, index, founders }: ProjectCardProps) {
  const indexLabel = String(index + 1).padStart(2, "0");
  const cardRef = useRef<HTMLElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const currentRef = useRef({ x: 78, y: 18 });
  const targetRef = useRef({ x: 78, y: 18 });

  useEffect(() => {
    const node = cardRef.current;
    if (!node) return;

    const animate = () => {
      const current = currentRef.current;
      const target = targetRef.current;
      current.x += (target.x - current.x) * 0.08;
      current.y += (target.y - current.y) * 0.08;
      node.style.setProperty("--mx", `${current.x.toFixed(2)}%`);
      node.style.setProperty("--my", `${current.y.toFixed(2)}%`);
      if (Math.abs(target.x - current.x) > 0.05 || Math.abs(target.y - current.y) > 0.05) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        rafRef.current = null;
      }
    };

    const queueAnimation = () => {
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    const handleMove = (event: MouseEvent) => {
      const rect = node.getBoundingClientRect();
      targetRef.current.x = ((event.clientX - rect.left) / rect.width) * 100;
      targetRef.current.y = ((event.clientY - rect.top) / rect.height) * 100;
      queueAnimation();
    };

    const handleLeave = () => {
      targetRef.current = { x: 78, y: 18 };
      queueAnimation();
    };

    node.addEventListener("mousemove", handleMove);
    node.addEventListener("mouseleave", handleLeave);

    return () => {
      node.removeEventListener("mousemove", handleMove);
      node.removeEventListener("mouseleave", handleLeave);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const cardStyle = {
    "--mx": "78%",
    "--my": "18%",
    boxShadow: "4px 4px 0 rgba(255,255,255,0.04)",
  } as React.CSSProperties;

  // The founders who built this project
  const projectFounders = founders.filter((f) => project.founders.includes(f.id));

  const inner = (
    <>
      {/* Background glow layers */}
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-white/[0.02] transition duration-500 group-hover:bg-white/[0.04]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(130% 130% at var(--mx) var(--my), ${project.accent}12 0%, ${project.accent}06 30%, transparent 70%)`,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute z-0 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 opacity-0 blur-[96px] transition duration-500 group-hover:opacity-30"
        style={{ left: "var(--mx)", top: "var(--my)", background: project.accent }}
        aria-hidden
      />

      {/* Top row: index + status + year + arrow */}
      <div className="relative z-10 flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <span className="pixel-label text-[8px] text-white/30">{indexLabel}</span>
          <span
            className="inline-flex h-2 w-2"
            style={{ background: project.accent, boxShadow: `0 0 8px ${project.accent}` }}
            aria-hidden
          />
          <span className="pixel-label text-[7px] text-white/40">
            {project.status} · {project.year}
          </span>
        </div>
        {project.url && (
          <ArrowUpRight className="h-5 w-5 text-white/40 transition duration-400 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-white" />
        )}
      </div>

      {/* Project name + tagline */}
      <div className="relative z-10 mt-8">
        <h3 className="text-3xl font-semibold tracking-[-0.02em] text-white sm:text-4xl">
          {project.name}
        </h3>
        <p className="mt-3 text-base text-white/65 sm:text-lg">{project.tagline}</p>
      </div>

      {/* Description */}
      <p className="relative z-10 mt-6 max-w-3xl text-sm leading-relaxed text-white/55">
        {project.description}
      </p>

      {/* Highlights */}
      <ul className="relative z-10 mt-6 grid gap-2 sm:grid-cols-3">
        {project.highlights.map((h) => (
          <li
            key={h}
            className="pixel-chip bg-white/[0.02] px-3 py-2 text-xs leading-snug text-white/60"
          >
            {h}
          </li>
        ))}
      </ul>

      {/* Stack tags + founders pips */}
      <div className="relative z-10 mt-8 flex flex-wrap items-center gap-2">
        {project.stack.map((tech) => (
          <span
            key={tech}
            className="pixel-tag bg-white/[0.03] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-white/50"
          >
            {tech}
          </span>
        ))}

        {/* Founder pips — bottom right */}
        <div className="ml-auto flex items-center gap-2">
          {projectFounders.map((f) => (
            <span
              key={f.id}
              className="pixel-label text-[7px] text-white/35 border border-white/10 px-2 py-1"
              title={f.name}
            >
              {f.handle}
            </span>
          ))}
        </div>
      </div>
    </>
  );

  if (project.url) {
    return (
      <Link
        ref={cardRef as React.RefObject<HTMLAnchorElement>}
        href={project.url}
        target="_blank"
        rel="noreferrer"
        className={cardClass}
        style={cardStyle}
      >
        {inner}
      </Link>
    );
  }

  return (
    <div
      ref={cardRef as React.RefObject<HTMLDivElement>}
      className={cardClass}
      style={cardStyle}
    >
      {inner}
    </div>
  );
}

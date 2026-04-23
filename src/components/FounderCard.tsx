import Link from "next/link";
import type { Founder } from "@/types";

interface FounderCardProps {
  founder: Founder;
}

export function FounderCard({ founder }: FounderCardProps) {
  return (
    <div className="pixel-card bg-white/[0.02] p-8 sm:p-10">
      {/* Handle + title */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="pixel-label text-[8px] text-[var(--neon)]">{founder.handle}</p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {founder.name}
          </h3>
        </div>
        <span className="pixel-label text-[7px] text-white/40 sm:text-right">
          {founder.title}
          <br />
          <span className="text-white/25">{founder.location}</span>
        </span>
      </div>

      {/* Bio */}
      <p className="mt-5 text-sm leading-relaxed text-white/55">{founder.bio}</p>

      {/* Links */}
      <div className="mt-6 flex flex-wrap gap-3">
        {founder.links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            target={link.href.startsWith("mailto") ? undefined : "_blank"}
            rel="noreferrer"
            className="pixel-tag bg-white/[0.03] px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-white/50 transition hover:border-white/30 hover:text-white/80"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

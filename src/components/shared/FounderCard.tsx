import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { FounderProfile } from "@/types";

interface FounderCardProps {
  founder: FounderProfile;
}

function founderHref(profile: FounderProfile): string {
  return `https://${profile.site.domain}`;
}

export function FounderCard({ founder }: FounderCardProps) {
  const href = founderHref(founder);

  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={`Open ${founder.name}'s site`}
      className="pixel-card group relative block overflow-hidden bg-[var(--background)] transition-all duration-300 hover:border-white/30 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--neon)]"
    >
      <div className="flex flex-col gap-0 sm:flex-row">
        {founder.avatar && (
          <div className="relative shrink-0 w-full aspect-square sm:w-44 sm:aspect-auto sm:self-stretch overflow-hidden border-b-2 sm:border-b-0 sm:border-r-2 border-white/[0.08]">
            <Image
              src={founder.avatar}
              alt={founder.name}
              fill
              className="object-cover object-center pixelated"
              sizes="(max-width: 640px) 100vw, 176px"
              priority
            />
          </div>
        )}

        <div className="flex flex-1 flex-col justify-between gap-4 p-6 sm:p-7">
          <div>
            <div className="flex items-start justify-between gap-3">
              <p className="pixel-label text-[8px] text-[var(--neon)]">
                {founder.handle}
              </p>
              <ArrowUpRight className="h-5 w-5 shrink-0 text-[var(--neon)]/60 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--neon)]" />
            </div>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-white">
              {founder.name}
            </h3>
            <p className="pixel-label text-[7px] text-white/40 mt-1">
              {founder.title}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/55">
              {founder.bio}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="pixel-tag bg-[var(--neon)]/[0.08] px-3 py-1 font-mono text-[9px] uppercase tracking-wide text-[var(--neon)]">
              ↗ {founder.site.domain}
            </span>
            {founder.links.slice(0, 2).map((link) => (
              <span
                key={link.label}
                className="pixel-tag px-3 py-1 font-mono text-[9px] uppercase tracking-wide text-white/40"
              >
                {link.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}

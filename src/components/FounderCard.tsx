import Image from "next/image";
import Link from "next/link";
import type { Founder } from "@/types";

interface FounderCardProps {
  founder: Founder;
}

export function FounderCard({ founder }: FounderCardProps) {
  return (
    <div className="pixel-card bg-[#0d0d14] flex flex-col sm:flex-row gap-0 overflow-hidden">
      {/* Avatar — compact square */}
      {founder.avatar && (
        <div className="relative shrink-0 w-full sm:w-24 h-28 sm:h-auto overflow-hidden border-b sm:border-b-0 sm:border-r border-white/[0.07]">
          <Image
            src={founder.avatar}
            alt={founder.name}
            fill
            className="object-cover object-top pixelated"
            sizes="96px"
          />
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#0d0d14] to-transparent sm:hidden" />
        </div>
      )}

      {/* Info */}
      <div className="flex flex-col justify-center p-6 sm:p-8">
        <p className="pixel-label text-[7px] text-[var(--neon)]">{founder.handle}</p>
        <h3 className="mt-2 text-lg font-semibold tracking-tight text-white">{founder.name}</h3>
        <p className="pixel-label text-[7px] text-white/35 mt-1">{founder.title}</p>
        <p className="mt-3 text-xs leading-relaxed text-white/45">{founder.bio}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {founder.links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              target={link.href.startsWith("mailto") ? undefined : "_blank"}
              rel="noreferrer"
              className="pixel-tag px-3 py-1 font-mono text-[9px] uppercase tracking-wide text-white/40 transition hover:border-white/30 hover:text-white/70"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

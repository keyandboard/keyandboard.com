import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, FileText } from "lucide-react";
import { PixelMouseFx } from "@/components/shared/PixelMouseFx";
import { PixelSnow } from "@/components/shared/PixelSnow";
import { PixelWallpaper } from "@/components/shared/PixelWallpaper";
import { ProjectGrid } from "@/components/shared/ProjectGrid";
import { themeStyle } from "@/lib/theme";
import type { FounderContent, FounderCv, FounderLink } from "@/types";

interface FounderViewProps {
  content: FounderContent;
}

function SectionDivider({ label, accent }: { label: string; accent: string }) {
  return (
    <div className="mt-24 flex items-center gap-4 sm:mt-28">
      <span className="pixel-label text-[8px]" style={{ color: accent }}>
        ▸ {label}
      </span>
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}

function ContactBlock({ links }: { links: FounderLink[] }) {
  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-2">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          target={link.href.startsWith("mailto") ? undefined : "_blank"}
          rel="noreferrer"
          className="pixel-card group flex items-center justify-between bg-white/[0.02] px-5 py-4 transition hover:bg-white/[0.04]"
        >
          <span className="pixel-label text-[7px] text-white/50 transition group-hover:text-white/90">
            {link.label}
          </span>
          <span className="flex items-center gap-2 text-sm text-white/70 transition group-hover:text-white">
            {link.href.startsWith("mailto:")
              ? link.href.slice("mailto:".length).split("?")[0]
              : new URL(link.href).host.replace(/^www\./, "")}
            <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </Link>
      ))}
    </div>
  );
}

function ResumeButton({ cv }: { cv: FounderCv }) {
  return (
    <div className="mt-4">
      <Link
        href={cv.href}
        target={cv.href.startsWith("mailto") ? undefined : "_blank"}
        rel="noreferrer"
        className="pixel-card group flex items-center justify-between gap-6 bg-white/[0.02] px-6 py-5 transition hover:bg-white/[0.04]"
      >
        <div className="flex items-center gap-4">
          <FileText className="h-5 w-5 text-white/60 transition group-hover:text-white" />
          <span className="pixel-label text-[8px] text-white/80 transition group-hover:text-white">
            {cv.label}
          </span>
        </div>
        <ArrowUpRight className="h-5 w-5 text-white/40 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
      </Link>
    </div>
  );
}

export function FounderView({ content }: FounderViewProps) {
  const { profile, projects } = content;
  const liveCount = projects.filter((p) => p.status === "Live").length;
  const wide = profile.site.theme.spacing === "wide";
  const accent = profile.site.theme.accent;
  const year = new Date().getFullYear();
  const headline = profile.headline ?? {
    lead: profile.name + ",",
    italic: profile.title.toLowerCase() + ".",
  };

  return (
    <main
      className="relative min-h-screen overflow-x-hidden"
      style={themeStyle(profile.site.theme)}
    >
      {profile.site.theme.wallpaper && (
        <PixelWallpaper
          src={profile.site.theme.wallpaper}
          opacity={profile.site.theme.wallpaperOpacity ?? 0.45}
        />
      )}
      <PixelSnow />
      <PixelMouseFx color={accent} />

      {/* ── Nav ───────────────────────────────────────────────── */}
      <nav className="relative z-30 grid grid-cols-3 items-center px-6 pt-6 sm:px-12 lg:px-20">
        <span className="font-mono text-[11px] text-white sm:text-[12px]">
          {profile.handle}
        </span>
        <span className="hidden text-center font-mono text-[11px] text-white/75 sm:block sm:text-[12px]">
          {profile.location}
        </span>
        {profile.status && (
          <span className="flex items-center justify-end gap-2 font-mono text-[11px] text-white sm:text-[12px]">
            <span
              className="inline-block h-2 w-2"
              style={{
                background: profile.status.color ?? accent,
                boxShadow: `0 0 6px ${profile.status.color ?? accent}`,
              }}
              aria-hidden
            />
            {profile.status.label}
          </span>
        )}
      </nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative z-20 px-6 pt-16 pb-24 sm:px-12 sm:pt-24 lg:px-20 lg:pt-28">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Avatar + nameplate */}
          <div className="lg:col-span-3">
            {profile.avatar && (
              <div
                className="relative w-44 sm:w-52 lg:w-full lg:max-w-[220px]"
                style={{ aspectRatio: "4 / 5" }}
              >
                <div
                  className="absolute inset-0 border-2"
                  style={{
                    borderColor: accent,
                    boxShadow: `0 0 12px ${accent}40, 4px 4px 0 ${accent}1f`,
                  }}
                  aria-hidden
                />
                <div className="absolute inset-1 overflow-hidden">
                  <Image
                    src={profile.avatar}
                    alt={profile.name}
                    fill
                    className="pixelated object-cover object-center"
                    sizes="(max-width: 640px) 176px, 220px"
                    priority
                  />
                </div>
              </div>
            )}
            {profile.nameplate && (
              <div className="mt-4 space-y-1.5">
                <div
                  className="pixel-label text-[10px]"
                  style={{ color: accent, textShadow: `0 0 6px ${accent}55` }}
                >
                  {profile.nameplate.exe}
                </div>
                {profile.nameplate.tags.map((tag) => (
                  <div key={tag} className="pixel-label text-[8px] text-white/70">
                    {tag}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Headline + bio + stats */}
          <div className="lg:col-span-9 lg:pl-4">
            <p className="pixel-label text-[9px] text-white/75">
              {profile.title.toUpperCase()}{" "}
              <span className="mx-2 text-white/40">·</span> Founder
            </p>
            <h1
              className="mt-4 text-5xl tracking-[-0.03em] text-white leading-[1.04] sm:text-6xl lg:text-7xl xl:text-[88px]"
              style={{ textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}
            >
              {headline.lead}
              <br />
              {headline.style === "sans-light" ? (
                <span className="font-light text-white/85">{headline.italic}</span>
              ) : (
                <span className="font-serif italic font-normal text-white">
                  {headline.italic}
                </span>
              )}
            </h1>

            <p
              className="mt-12 max-w-2xl text-[15px] leading-[1.7] text-white/90 sm:text-base"
              style={{ textShadow: "0 1px 6px rgba(0,0,0,0.7)" }}
            >
              {profile.bio}
            </p>

            {profile.coffee && (
              <p className="mt-6 max-w-2xl pixel-label text-[8px] leading-[1.9] text-white/65 tracking-wide">
                &gt; {profile.coffee}
              </p>
            )}

            <div className="mt-10 flex flex-wrap gap-3">
              <div className="pixel-card bg-black/50 px-5 py-2.5 backdrop-blur-sm">
                <span className="pixel-label text-[8px]" style={{ color: accent }}>
                  {liveCount}
                </span>
                <span className="ml-3 text-sm text-white/85">live</span>
              </div>
              <div className="pixel-card bg-black/50 px-5 py-2.5 backdrop-blur-sm">
                <span className="pixel-label text-[8px]" style={{ color: accent }}>
                  {projects.length}
                </span>
                <span className="ml-3 text-sm text-white/85">projects</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Selected work ────────────────────────────────────── */}
      <div className="relative z-20 px-6 sm:px-12 lg:px-20">
        <SectionDivider label="Selected work" accent={accent} />
      </div>
      <section className="relative z-20 px-6 pb-12 sm:px-12 lg:px-20">
        <div className="mt-10">
          <ProjectGrid projects={projects} wide={wide} />
        </div>
      </section>

      {/* ── Elsewhere ────────────────────────────────────────── */}
      <div className="relative z-20 px-6 sm:px-12 lg:px-20">
        <SectionDivider label="Elsewhere" accent={accent} />
      </div>
      <section className="relative z-20 px-6 pb-24 sm:px-12 lg:px-20">
        <ContactBlock links={profile.links} />
        {profile.cv && <ResumeButton cv={profile.cv} />}
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="relative z-20 border-t border-white/[0.12] bg-black/40 px-6 py-10 backdrop-blur-sm sm:px-12 lg:px-20">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="pixel-label text-[7px] text-white/55">
            © {year} {profile.name}
          </span>
          <span className="pixel-label text-[7px] text-white/40">
            Made with Next.js, WebGL + 0 sleep.
          </span>
        </div>
      </footer>
    </main>
  );
}

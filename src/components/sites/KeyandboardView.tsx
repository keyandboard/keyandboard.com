import { PixelMouseFx } from "@/components/shared/PixelMouseFx";
import { PixelSnow } from "@/components/shared/PixelSnow";
import { ProjectGrid } from "@/components/shared/ProjectGrid";
import { FounderCard } from "@/components/shared/FounderCard";
import { themeStyle, KEYANDBOARD_THEME } from "@/lib/theme";
import type { FounderProfile, Project } from "@/types";

interface KeyandboardViewProps {
  profiles: FounderProfile[];
  projects: Project[];
}

export function KeyandboardView({ profiles, projects }: KeyandboardViewProps) {
  const liveCount = projects.filter((p) => p.status === "Live").length;

  return (
    <main className="relative min-h-screen" style={themeStyle(KEYANDBOARD_THEME)}>
      <PixelSnow />
      <PixelMouseFx color={KEYANDBOARD_THEME.accent} />

      <nav className="relative z-30 flex items-center justify-between px-6 py-6 sm:px-12 lg:px-20">
        <span className="pixel-label text-[10px] text-[var(--neon)]">
          KEYANDBOARD
          <span className="blink ml-1 text-[var(--neon)]">_</span>
        </span>
        <a
          href="mailto:a.baranorhan@gmail.com"
          className="pixel-label text-[8px] text-white/40 border border-white/10 px-4 py-2 transition hover:border-white/30 hover:text-white/70"
        >
          CONTACT
        </a>
      </nav>

      <section className="relative z-20 px-6 pt-16 pb-24 sm:px-12 lg:px-20">
        <div className="max-w-4xl">
          <p className="pixel-label text-[8px] text-white/30 mb-6">
            &gt; A TWO-PERSON STUDIO
          </p>
          <h1 className="text-5xl font-semibold tracking-[-0.03em] text-white sm:text-6xl lg:text-7xl">
            We build things
            <br />
            <span className="font-serif italic text-white/60">
              people actually use.
            </span>
          </h1>
          <p className="mt-8 max-w-xl text-base leading-relaxed text-white/55 sm:text-lg">
            Consumer apps, developer tools, and AI experiments — shipped fast,
            kept honest.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <div className="pixel-card bg-white/[0.02] px-6 py-3">
              <span className="pixel-label text-[8px] text-[var(--neon)]">
                {liveCount}
              </span>
              <span className="ml-3 text-sm text-white/50">live products</span>
            </div>
            <div className="pixel-card bg-white/[0.02] px-6 py-3">
              <span className="pixel-label text-[8px] text-[var(--neon)]">
                50k+
              </span>
              <span className="ml-3 text-sm text-white/50">users</span>
            </div>
            <div className="pixel-card bg-white/[0.02] px-6 py-3">
              <span className="pixel-label text-[8px] text-[var(--neon)]">
                {profiles.length}
              </span>
              <span className="ml-3 text-sm text-white/50">founders</span>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-20 px-6 pb-24 sm:px-12 lg:px-20">
        <p className="pixel-label text-[8px] text-white/25 mb-8 uppercase tracking-widest">
          Products
        </p>
        <ProjectGrid projects={projects} />
      </section>

      <section className="relative z-20 px-6 pb-24 sm:px-12 lg:px-20">
        <p className="pixel-label text-[8px] text-white/25 mb-8 uppercase tracking-widest">
          Founders
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          {profiles.map((p) => (
            <FounderCard key={p.id} founder={p} />
          ))}
        </div>
      </section>

      <footer className="relative z-20 border-t border-white/[0.06] px-6 py-8 sm:px-12 lg:px-20">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="pixel-label text-[7px] text-white/25">
            KEYANDBOARD © {new Date().getFullYear()}
          </span>
          <span className="pixel-label text-[7px] text-white/20">
            keyandboard.com
          </span>
        </div>
      </footer>
    </main>
  );
}

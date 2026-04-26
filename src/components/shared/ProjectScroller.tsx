"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface ProjectScrollerProps {
  /** One node per project — wrapped by the scroller in snap items. */
  children: ReactNode[];
}

/**
 * Mobile-only horizontal snap-scroller with a pixel-art pager.
 * On `sm:` and up, the parent renders a regular grid instead — this component
 * is hidden via `sm:hidden` on the wrapper.
 */
export function ProjectScroller({ children }: ProjectScrollerProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const total = children.length;

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const items = Array.from(el.children) as HTMLElement[];
      if (items.length === 0) return;
      const center = el.scrollLeft + el.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        const itCenter = it.offsetLeft + it.offsetWidth / 2;
        const d = Math.abs(itCenter - center);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      }
      setActive(best);
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };
    update();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [total]);

  const goTo = (idx: number) => {
    const el = trackRef.current;
    if (!el) return;
    const items = Array.from(el.children) as HTMLElement[];
    const target = items[idx];
    if (!target) return;
    el.scrollTo({
      left: target.offsetLeft - (el.clientWidth - target.offsetWidth) / 2,
      behavior: "smooth",
    });
  };

  const pageLabel = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="sm:hidden">
      <div
        ref={trackRef}
        className="
          flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4
          -mx-6 px-6 scroll-px-6
          [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
        "
      >
        {children.map((child, i) => (
          <div key={i} className="snap-start shrink-0 w-[85%]">
            {child}
          </div>
        ))}
      </div>

      {/* Pixel-art pager */}
      <div className="mt-5 flex items-center justify-center gap-3">
        <span className="pixel-label text-[8px] text-white/35">
          {pageLabel(active + 1)}
        </span>

        <div
          className="flex items-center gap-1.5 px-2.5 py-1.5 border-2 border-white/[0.12]"
          style={{ boxShadow: "3px 3px 0 rgba(255,255,255,0.06)" }}
          role="tablist"
          aria-label="Projects pagination"
        >
          {children.map((_, i) => {
            const isActive = i === active;
            return (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Go to project ${i + 1}`}
                onClick={() => goTo(i)}
                className="group flex h-4 w-4 items-center justify-center"
              >
                <span
                  className="block transition-all"
                  style={{
                    width: isActive ? "12px" : "8px",
                    height: isActive ? "12px" : "8px",
                    background: isActive
                      ? "var(--neon)"
                      : "rgba(255,255,255,0.18)",
                    boxShadow: isActive
                      ? "0 0 8px var(--neon-dim), 2px 2px 0 rgba(0,0,0,0.4) inset"
                      : "none",
                  }}
                  aria-hidden
                />
              </button>
            );
          })}
        </div>

        <span className="pixel-label text-[8px] text-white/35">
          {pageLabel(total)}
        </span>
      </div>
    </div>
  );
}

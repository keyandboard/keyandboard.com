"use client";

import { useEffect, useRef } from "react";

interface PixelMouseFxProps {
  /** Accent color used for the spotlight halo + pixel sparks. */
  color: string;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
}

/**
 * Tiny pixel sparks that spawn on mouse movement, drift + fall under gentle
 * gravity, and fade over ~50 frames in the founder's accent color.
 * Disabled on touch-only devices and when prefers-reduced-motion is set.
 */
export function PixelMouseFx({ color }: PixelMouseFxProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasHover = window.matchMedia("(hover: hover)").matches;
    if (reduce || !hasHover) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = window.innerWidth;
    let h = window.innerHeight;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const sparks: Spark[] = [];

    const onMove = (e: MouseEvent) => {
      // Spawn a couple of sparks on movement
      const spawnCount = Math.random() < 0.6 ? 1 : 2;
      for (let i = 0; i < spawnCount; i++) {
        sparks.push({
          x: e.clientX + (Math.random() - 0.5) * 6,
          y: e.clientY + (Math.random() - 0.5) * 6,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5 - 0.15,
          life: 1,
          size: Math.random() < 0.25 ? 3 : 2,
        });
      }
      // Cap to avoid runaway memory if the user smashes the mouse.
      if (sparks.length > 220) sparks.splice(0, sparks.length - 220);
    };
    let raf = 0;
    const tick = () => {
      ctx.clearRect(0, 0, w, h);

      // Sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i];
        p.life -= 0.02;
        if (p.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.006; // gentle gravity
        const a = Math.max(0, Math.min(1, p.life)) * 0.8;
        ctx.globalAlpha = a;
        ctx.fillStyle = color;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(tick);
    };
    tick();

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
    };
  }, [color]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 2, mixBlendMode: "screen" }}
      aria-hidden
    />
  );
}

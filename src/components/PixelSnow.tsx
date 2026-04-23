"use client";

import { useEffect, useRef } from "react";

const PALETTE = [
  "#4a90d9",
  "#2d6aaf",
  "#87b8e8",
  "#d4ebff",
  "#ffffff",
  "#6aaa2a",
  "#3a7a1a",
  "#7ab830",
  "#a8c840",
  "#4a6a20",
  "#c8d860",
];

interface Flake {
  x: number;
  y: number;
  size: number;
  speed: number;
  color: string;
  opacity: number;
  drift: number;
}

const COUNT = 140;

function makeFlake(w: number, h: number, atTop?: boolean): Flake {
  return {
    x: Math.random() * w,
    y: atTop ? -8 : Math.random() * h,
    size: 2 + Math.floor(Math.random() * 5),
    speed: 0.25 + Math.random() * 0.75,
    color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
    opacity: 0.2 + Math.random() * 0.45,
    drift: (Math.random() - 0.5) * 0.4,
  };
}

export function PixelSnow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    let raf: number;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    resize();

    const flakes: Flake[] = Array.from({ length: COUNT }, () => makeFlake(w, h));

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const f of flakes) {
        ctx.globalAlpha = f.opacity;
        ctx.fillStyle = f.color;
        ctx.fillRect(Math.round(f.x), Math.round(f.y), f.size, f.size);
        f.y += f.speed;
        f.x += f.drift + Math.sin(f.y * 0.015 + f.x) * 0.2;
        if (f.y > h + f.size) {
          Object.assign(f, makeFlake(w, h, true));
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };

    tick();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: -5 }}
      aria-hidden
    />
  );
}

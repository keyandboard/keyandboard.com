// Generate 10 deterministic 8-bit-style pixel-art SVG covers into public/covers.
// Run: node scripts/gen-covers.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, "..", "public", "covers");
mkdirSync(outDir, { recursive: true });

const PALETTES = [
  { bg: "#0d0d14", a: "#00ff41", b: "#177a35", c: "#0a4a22" },
  { bg: "#0a0814", a: "#a78bfa", b: "#5b3fb8", c: "#2a1e57" },
  { bg: "#100a0a", a: "#ff6b6b", b: "#a83a3a", c: "#4a1818" },
  { bg: "#08120e", a: "#34d399", b: "#1f7556", c: "#0d3826" },
  { bg: "#0b0f18", a: "#7dd3fc", b: "#3b6f96", c: "#1a3045" },
  { bg: "#100c08", a: "#fbbf24", b: "#a07a14", c: "#4a3608" },
  { bg: "#0e0814", a: "#f472b6", b: "#a83b78", c: "#4f1c3a" },
  { bg: "#0a1014", a: "#38bdf8", b: "#1d6e96", c: "#0c324a" },
  { bg: "#0a0a0f", a: "#e2e8f0", b: "#7a808a", c: "#33363c" },
  { bg: "#0c0a14", a: "#6366f1", b: "#3a3da3", c: "#191b50" },
];

const W = 80;
const H = 45;
const PX = 10;

// Tiny PRNG so each cover is stable.
function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function generate(idx, palette) {
  const rng = mulberry32(idx * 9173 + 7);
  const cells = [];
  // Solid background
  cells.push(
    `<rect width="${W * PX}" height="${H * PX}" fill="${palette.bg}"/>`
  );

  // Horizon band
  const horizon = Math.floor(H * 0.62);
  for (let y = horizon; y < H; y++) {
    const t = (y - horizon) / (H - horizon);
    const fill = t < 0.4 ? palette.c : palette.bg;
    cells.push(
      `<rect x="0" y="${y * PX}" width="${W * PX}" height="${PX}" fill="${fill}"/>`
    );
  }

  // Stars / pixel scatter in upper sky
  for (let y = 0; y < horizon - 2; y++) {
    for (let x = 0; x < W; x++) {
      if (rng() < 0.04) {
        const c = rng() < 0.3 ? palette.a : palette.b;
        cells.push(
          `<rect x="${x * PX}" y="${y * PX}" width="${PX}" height="${PX}" fill="${c}"/>`
        );
      }
    }
  }

  // Mountain silhouette
  const peakCount = 3 + Math.floor(rng() * 3);
  const peaks = [];
  for (let i = 0; i < peakCount; i++) {
    const cx = Math.floor((i + 0.5) * (W / peakCount) + (rng() * 4 - 2));
    const ph = 3 + Math.floor(rng() * 5);
    peaks.push({ cx, ph });
  }
  for (const { cx, ph } of peaks) {
    for (let dy = 0; dy < ph; dy++) {
      const half = ph - dy;
      for (let dx = -half; dx <= half; dx++) {
        const x = cx + dx;
        const y = horizon - 1 - dy;
        if (x >= 0 && x < W && y >= 0 && y < horizon) {
          cells.push(
            `<rect x="${x * PX}" y="${y * PX}" width="${PX}" height="${PX}" fill="${palette.b}"/>`
          );
        }
      }
    }
  }

  // Sun / moon disk
  const cx = Math.floor(W * (0.2 + rng() * 0.6));
  const cy = Math.floor(horizon * 0.45);
  const r = 2 + Math.floor(rng() * 2);
  for (let y = -r; y <= r; y++) {
    for (let x = -r; x <= r; x++) {
      if (x * x + y * y <= r * r) {
        const px = cx + x;
        const py = cy + y;
        if (px >= 0 && px < W && py >= 0 && py < H) {
          cells.push(
            `<rect x="${px * PX}" y="${py * PX}" width="${PX}" height="${PX}" fill="${palette.a}"/>`
          );
        }
      }
    }
  }

  // (Scanline pattern intentionally omitted — produced visible banding when
  // the SVG was scaled into a card. The page CSS has subtle global scanlines.)

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W * PX} ${H * PX}" shape-rendering="crispEdges" preserveAspectRatio="xMidYMid slice">
${cells.join("\n")}
</svg>
`;
}

for (let i = 0; i < PALETTES.length; i++) {
  const svg = generate(i, PALETTES[i]);
  writeFileSync(resolve(outDir, `default-${i + 1}.svg`), svg);
}

console.log(`Wrote ${PALETTES.length} covers to ${outDir}`);

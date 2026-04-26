// Generate per-project pixel-art SVG covers for /public/covers/projects/<slug>.svg.
// 80x45 grid at 10px per cell -> 800x450 SVG output (16:9). Drawing uses
// pixel primitives (rect / circle / line / heart / star) so each scene can be
// composed cleanly from shapes instead of cramped letter grids.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, "..", "public", "covers", "projects");
mkdirSync(outDir, { recursive: true });

const W = 80;
const H = 45;
const PX = 10;

// ── color helpers ─────────────────────────────────────────────
function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}
function rgbToHex(r, g, b) {
  const c = (n) =>
    Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}
function shade(hex, amt) {
  const [r, g, b] = hexToRgb(hex);
  if (amt >= 0)
    return rgbToHex(r + (255 - r) * amt, g + (255 - g) * amt, b + (255 - b) * amt);
  const k = 1 + amt;
  return rgbToHex(r * k, g * k, b * k);
}
function mix(a, b, t) {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  return rgbToHex(ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t);
}

// ── pixel canvas + primitives ────────────────────────────────
class Canvas {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.g = new Array(w * h).fill(null);
  }
  set(x, y, c) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || x >= this.w || y < 0 || y >= this.h) return;
    this.g[y * this.w + x] = c;
  }
  fillBg(c) {
    for (let i = 0; i < this.g.length; i++) this.g[i] = c;
  }
  rect(x, y, w, h, c) {
    for (let dy = 0; dy < h; dy++)
      for (let dx = 0; dx < w; dx++) this.set(x + dx, y + dy, c);
  }
  rectOutline(x, y, w, h, c) {
    for (let dx = 0; dx < w; dx++) {
      this.set(x + dx, y, c);
      this.set(x + dx, y + h - 1, c);
    }
    for (let dy = 0; dy < h; dy++) {
      this.set(x, y + dy, c);
      this.set(x + w - 1, y + dy, c);
    }
  }
  circle(cx, cy, r, c) {
    const r2 = r * r;
    for (let y = -r; y <= r; y++)
      for (let x = -r; x <= r; x++)
        if (x * x + y * y <= r2) this.set(cx + x, cy + y, c);
  }
  circleRing(cx, cy, r, c) {
    const inner = (r - 1) * (r - 1);
    const outer = r * r;
    for (let y = -r; y <= r; y++)
      for (let x = -r; x <= r; x++) {
        const d = x * x + y * y;
        if (d <= outer && d > inner) this.set(cx + x, cy + y, c);
      }
  }
  line(x1, y1, x2, y2, c) {
    let dx = Math.abs(x2 - x1);
    const sx = x1 < x2 ? 1 : -1;
    let dy = -Math.abs(y2 - y1);
    const sy = y1 < y2 ? 1 : -1;
    let err = dx + dy;
    let x = x1;
    let y = y1;
    while (true) {
      this.set(x, y, c);
      if (x === x2 && y === y2) break;
      const e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        x += sx;
      }
      if (e2 <= dx) {
        err += dx;
        y += sy;
      }
    }
  }
  /** thick line via repeated parallel passes */
  thickLine(x1, y1, x2, y2, c, thickness = 2) {
    for (let t = 0; t < thickness; t++) {
      this.line(x1, y1 + t, x2, y2 + t, c);
      this.line(x1 + t, y1, x2 + t, y2, c);
    }
  }
  triangleFill(ax, ay, bx, by, cx, cy, c) {
    const minX = Math.min(ax, bx, cx);
    const maxX = Math.max(ax, bx, cx);
    const minY = Math.min(ay, by, cy);
    const maxY = Math.max(ay, by, cy);
    const sign = (px, py, qx, qy, rx, ry) =>
      (px - rx) * (qy - ry) - (qx - rx) * (py - ry);
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const d1 = sign(x, y, ax, ay, bx, by);
        const d2 = sign(x, y, bx, by, cx, cy);
        const d3 = sign(x, y, cx, cy, ax, ay);
        const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
        const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
        if (!(hasNeg && hasPos)) this.set(x, y, c);
      }
    }
  }
  heart(cx, cy, size, fill, shadeColor, hi) {
    // two upper lobes
    this.circle(cx - Math.round(size / 2.4), cy - Math.round(size / 4), Math.round(size / 2), fill);
    this.circle(cx + Math.round(size / 2.4), cy - Math.round(size / 4), Math.round(size / 2), fill);
    // bottom triangle
    this.triangleFill(
      cx - size,
      cy + Math.round(size / 8),
      cx + size,
      cy + Math.round(size / 8),
      cx,
      cy + size + Math.round(size / 4),
      fill
    );
    // highlight
    if (hi) {
      this.circle(
        cx - Math.round(size / 2.4) - Math.round(size / 5),
        cy - Math.round(size / 4) - Math.round(size / 5),
        Math.max(1, Math.round(size / 6)),
        hi
      );
    }
    // bottom shadow
    if (shadeColor) {
      for (let y = 0; y < Math.round(size / 2); y++) {
        const w = Math.round(size / 2) - y;
        this.rect(cx - w, cy + Math.round(size / 2) + y, 2 * w, 1, shadeColor);
      }
    }
  }
  star(cx, cy, c) {
    this.set(cx, cy, c);
    this.set(cx - 1, cy, c);
    this.set(cx + 1, cy, c);
    this.set(cx, cy - 1, c);
    this.set(cx, cy + 1, c);
  }
  toSvg() {
    const out = [];
    for (let y = 0; y < this.h; y++) {
      let runColor = null;
      let runStart = 0;
      for (let x = 0; x <= this.w; x++) {
        const c = x < this.w ? this.g[y * this.w + x] : null;
        if (c !== runColor) {
          if (runColor) {
            out.push(
              `<rect x="${runStart * PX}" y="${y * PX}" width="${
                (x - runStart) * PX
              }" height="${PX}" fill="${runColor}"/>`
            );
          }
          runColor = c;
          runStart = x;
        }
      }
    }
    return out.join("\n");
  }
}

// ── seeded PRNG ───────────────────────────────────────────────
function rng(seed) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// ── shared backdrop ──────────────────────────────────────────
function backdrop(c, accent, slug) {
  const r = rng(slug.split("").reduce((a, ch) => a + ch.charCodeAt(0), 0));
  const bg = mix(accent, "#06060c", 0.84);
  c.fillBg(bg);

  // Soft horizon glow at bottom
  for (let y = Math.floor(H * 0.7); y < H; y++) {
    const t = (y - H * 0.7) / (H - H * 0.7);
    const col = mix(bg, accent, 0.05 + t * 0.18);
    c.rect(0, y, W, 1, col);
  }

  // (Intentionally no scattered "stars" — they read as noise on tightly
  // composed scenes like an envelope or shopping basket.)
  void r;

  // (Scanline darkening intentionally omitted — see globals.css for a
  // page-level scanline overlay; baking them into the SVG produces visible
  // banding once the cover is scaled to fit a card.)
}

// ── scenes ────────────────────────────────────────────────────

function sceneHeart(c, accent) {
  // HeyHoney — pair of hearts, sparkles, checker floor
  const base = accent;
  const dark = shade(accent, -0.4);
  const light = shade(accent, 0.55);
  const white = "#ffffff";

  // Big heart center
  c.heart(40, 22, 12, base, dark, light);
  // Small heart upper-left
  c.heart(20, 13, 6, light, shade(light, -0.3), white);
  // Small heart upper-right
  c.heart(62, 11, 5, white, shade(white, -0.2), null);

  // Connecting pixel sparkles
  for (const [x, y] of [
    [30, 9], [70, 22], [10, 28], [54, 6], [14, 18], [72, 32],
  ]) {
    c.star(x, y, light);
  }

  // Checker floor
  const floorY = 38;
  for (let y = floorY; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const tile = (Math.floor(x / 4) + Math.floor((y - floorY) / 2)) % 2;
      c.set(x, y, tile ? shade(base, -0.55) : shade(base, -0.3));
    }
  }
  // Floor edge highlight
  c.rect(0, floorY - 1, W, 1, shade(base, -0.1));
}

function scenePlane(c, accent) {
  // FlyingPapers — paper plane mid-flight + dotted trail + cloud below
  const white = "#ffffff";
  const cream = "#f3eee0";
  const fold = "#9ec3e8";
  const shadow = shade(accent, -0.3);

  // Trail dashes (top-left toward plane)
  for (let i = 0; i < 7; i++) {
    const x = 6 + i * 4;
    const y = 28 - i * 2;
    c.rect(x, y, 2, 1, shade(accent, 0.3));
  }

  // Plane body — triangle (white)
  // Outer outline shape
  c.triangleFill(40, 14, 60, 26, 40, 26, cream);
  c.triangleFill(40, 14, 60, 26, 40, 22, white);
  // Center fold line
  c.line(40, 14, 50, 26, fold);
  c.line(40, 22, 60, 26, fold);

  // Tail tip
  c.triangleFill(60, 26, 56, 28, 50, 26, fold);

  // Outline
  c.line(40, 14, 60, 26, shadow);
  c.line(40, 14, 40, 26, shadow);
  c.line(40, 26, 60, 26, shadow);

  // Floating page below
  const px = 18, py = 35, pw = 14, ph = 6;
  c.rect(px, py, pw, ph, cream);
  c.rectOutline(px, py, pw, ph, shadow);
  for (let i = 0; i < 4; i++) c.rect(px + 2, py + 1 + i * 1, pw - 4, 1, shade(cream, -0.15));

  // Tiny cloud
  c.circle(64, 36, 2, "#ffffff");
  c.circle(67, 35, 3, "#ffffff");
  c.circle(70, 37, 2, "#ffffff");
  c.rect(64, 37, 8, 2, "#ffffff");
}

function sceneSwords(c, accent) {
  // PromptArena — crossed swords above an arena helmet
  const silver = "#cbd5e1";
  const steel = "#7d8b9c";
  const gold = "#fbbf24";
  const dark = "#1c1c2c";

  // Sword 1 (top-left -> bottom-right)
  c.thickLine(16, 8, 50, 30, silver, 2);
  c.line(15, 9, 49, 31, steel);
  // pommel + grip
  c.rect(50, 30, 4, 4, gold);
  c.rect(54, 31, 6, 2, "#a78b3f");
  c.rect(52, 28, 8, 2, gold);

  // Sword 2 (top-right -> bottom-left)
  c.thickLine(64, 8, 30, 30, silver, 2);
  c.line(65, 9, 31, 31, steel);
  c.rect(26, 30, 4, 4, gold);
  c.rect(20, 31, 6, 2, "#a78b3f");
  c.rect(20, 28, 8, 2, gold);

  // Helmet beneath
  const hx = 32, hy = 32;
  c.rect(hx, hy, 16, 8, steel);
  c.rect(hx + 1, hy + 1, 14, 6, silver);
  // visor slit
  c.rect(hx + 2, hy + 3, 12, 1, dark);
  // crest
  c.rect(hx + 6, hy - 3, 4, 3, accent);
  c.rect(hx + 7, hy - 5, 2, 2, accent);

  // Floor line
  c.rect(0, 41, W, 1, shade(accent, -0.2));
  c.rect(0, 42, W, 3, shade(accent, -0.5));
}

function sceneEnvelope(c, accent) {
  // YourLovePage — envelope with wax-seal heart, surrounded by hearts
  const cream = "#f5e9d8";
  const ink = "#3a2a1a";
  const wax = shade(accent, -0.15);
  const waxHi = shade(accent, 0.4);

  // Envelope body
  const ex = 22, ey = 14, ew = 36, eh = 22;
  c.rect(ex, ey, ew, eh, cream);
  c.rectOutline(ex, ey, ew, eh, ink);

  // Flap (top triangle)
  c.triangleFill(ex, ey, ex + ew - 1, ey, ex + ew / 2, ey + 12, shade(cream, -0.1));
  c.line(ex, ey, ex + ew / 2, ey + 12, ink);
  c.line(ex + ew - 1, ey, ex + ew / 2, ey + 12, ink);

  // Wax seal heart
  c.heart(ex + ew / 2, ey + 14, 5, wax, shade(wax, -0.3), waxHi);

  // Floating hearts
  c.heart(10, 10, 3, accent, shade(accent, -0.4), shade(accent, 0.5));
  c.heart(72, 14, 3, accent, shade(accent, -0.4), shade(accent, 0.5));
  c.heart(8, 32, 2, accent, shade(accent, -0.4), null);
  c.heart(74, 33, 2, accent, shade(accent, -0.4), null);
  c.heart(68, 6, 2, "#ffffff", null, null);
  c.heart(14, 22, 1, "#ffffff", null, null);
}

function sceneBrain(c, accent) {
  // adhd-os — pixel brain bisected by a lightning bolt
  const base = accent;
  const mid = shade(accent, 0.25);
  const light = shade(accent, 0.55);
  const dark = shade(accent, -0.4);
  const yellow = "#fde047";
  const yellowDk = "#facc15";

  // Brain hemispheres (two big circles)
  c.circle(33, 22, 11, base);
  c.circle(47, 22, 11, base);
  // Top humps
  c.circle(28, 16, 5, base);
  c.circle(40, 14, 6, base);
  c.circle(52, 16, 5, base);

  // Highlights
  c.circle(28, 18, 3, mid);
  c.circle(50, 18, 3, mid);
  // Sub-highlights
  c.circle(27, 17, 1, light);
  c.circle(49, 17, 1, light);

  // Squiggle folds
  c.line(24, 22, 32, 22, dark);
  c.line(48, 22, 56, 22, dark);
  c.line(28, 26, 36, 26, dark);
  c.line(44, 26, 52, 26, dark);
  c.line(34, 18, 38, 18, dark);
  c.line(42, 18, 46, 18, dark);

  // Lightning bolt down the middle
  const bolt = [
    [40, 8], [39, 12], [42, 14], [41, 18], [44, 20], [40, 26], [42, 28], [38, 32],
  ];
  for (let i = 0; i < bolt.length - 1; i++) {
    c.thickLine(bolt[i][0], bolt[i][1], bolt[i + 1][0], bolt[i + 1][1], yellow, 2);
  }
  // Bolt outline
  for (let i = 0; i < bolt.length - 1; i++) {
    c.line(bolt[i][0] - 1, bolt[i][1], bolt[i + 1][0] - 1, bolt[i + 1][1], yellowDk);
  }

  // Stem at bottom
  c.rect(38, 33, 4, 4, dark);
  c.rect(36, 37, 8, 2, dark);
}

function sceneGhost(c, accent) {
  // Phantom — round ghost with wavy bottom, two eyes, a mouth, and motion lines
  const ghost = "#e2e8f0";
  const ghostShade = "#9aa3b3";
  const dark = "#0a0a14";

  // Body — top half circle + rectangle below
  const cx = 40, cy = 18, r = 13;
  c.circle(cx, cy, r, ghost);
  c.rect(cx - r, cy, 2 * r + 1, 14, ghost);

  // Wavy bottom
  const bottomY = cy + 14;
  for (let i = 0; i < 5; i++) {
    const wx = cx - r + i * (Math.floor((2 * r) / 5)) + 1;
    c.triangleFill(wx, bottomY, wx + 5, bottomY, wx + 2, bottomY + 4, ghost);
  }

  // Eye sockets
  c.rect(cx - 6, cy - 2, 4, 5, dark);
  c.rect(cx + 3, cy - 2, 4, 5, dark);
  // Eye glints
  c.set(cx - 4, cy - 1, "#ffffff");
  c.set(cx + 5, cy - 1, "#ffffff");

  // Mouth — small "o"
  c.rect(cx - 1, cy + 5, 3, 2, dark);

  // Motion lines (right side)
  c.rect(cx + r + 3, cy - 4, 4, 1, ghostShade);
  c.rect(cx + r + 4, cy + 2, 5, 1, ghostShade);
  c.rect(cx + r + 3, cy + 8, 3, 1, ghostShade);

  // Subtle accent halo behind
  c.circleRing(cx, cy + 2, r + 4, mix(accent, "#000", 0.5));

  // Sparkle stars
  c.star(8, 8, "#ffffff");
  c.star(72, 10, accent);
  c.star(68, 36, "#ffffff");
}

function sceneSpeech(c, accent) {
  // Social Profiling — three speech bubbles + small bar chart
  const cream = "#f1f5f9";
  const ink = "#0f172a";
  const dark = shade(accent, -0.4);
  const mid = shade(accent, 0.1);

  // Bubble 1 (largest, left)
  c.rect(8, 8, 22, 12, cream);
  c.rectOutline(8, 8, 22, 12, ink);
  // Tail
  c.triangleFill(12, 20, 18, 20, 12, 24, cream);
  c.line(12, 20, 12, 24, ink);
  c.line(12, 24, 18, 20, ink);
  // Dots inside (avatars)
  c.rect(12, 12, 4, 4, accent);
  c.rect(18, 12, 4, 4, mid);
  c.rect(24, 12, 4, 4, dark);

  // Bubble 2 (right)
  c.rect(46, 6, 24, 10, cream);
  c.rectOutline(46, 6, 24, 10, ink);
  c.triangleFill(60, 16, 66, 16, 66, 20, cream);
  c.line(60, 16, 66, 20, ink);
  c.line(66, 16, 66, 20, ink);
  // Lines (text)
  c.rect(49, 9, 14, 1, ink);
  c.rect(49, 11, 18, 1, ink);
  c.rect(49, 13, 10, 1, ink);

  // Bar chart at bottom
  const baseY = 40;
  const bars = [
    { x: 14, h: 6, color: dark },
    { x: 22, h: 10, color: mid },
    { x: 30, h: 14, color: accent },
    { x: 38, h: 8, color: mid },
    { x: 46, h: 12, color: dark },
    { x: 54, h: 16, color: accent },
    { x: 62, h: 9, color: mid },
  ];
  for (const b of bars) {
    c.rect(b.x, baseY - b.h, 4, b.h, b.color);
    c.rect(b.x, baseY - b.h, 4, 1, shade(b.color, 0.3));
  }
  // Axis
  c.rect(8, baseY, 64, 1, ink);
}

function sceneBasket(c, accent) {
  // Enflasyon Sepeti — shopping basket + items + an up-arrow with %
  const wood = "#a47a4f";
  const wood2 = "#7d5a37";
  const dark = "#1c1c2c";
  const red = "#ef4444";
  const green = "#22c55e";
  const yellow = accent;

  // Big up arrow on right
  const ax = 60, ay = 8;
  c.triangleFill(ax + 6, ay, ax, ay + 8, ax + 12, ay + 8, green);
  c.rect(ax + 4, ay + 8, 6, 12, green);
  // Arrow shadow
  c.line(ax, ay + 8, ax + 6, ay, shade(green, -0.3));
  c.line(ax + 12, ay + 8, ax + 6, ay, shade(green, 0.3));
  // % sign in arrow
  c.rect(ax + 5, ay + 11, 1, 2, "#fff");
  c.rect(ax + 5, ay + 14, 1, 2, "#fff");
  c.line(ax + 4, ay + 16, ax + 8, ay + 12, "#fff");

  // Basket
  const bx = 14, by = 22, bw = 32, bh = 14;
  // Handle
  c.rect(bx + 4, by - 4, 2, 6, wood2);
  c.rect(bx + bw - 6, by - 4, 2, 6, wood2);
  c.rect(bx + 4, by - 5, bw - 8, 2, wood2);
  // Body
  c.rect(bx, by, bw, bh, wood);
  c.rectOutline(bx, by, bw, bh, dark);
  // Weave
  for (let i = 0; i < bw; i += 3) c.rect(bx + i, by, 1, bh, wood2);
  for (let i = 0; i < bh; i += 3) c.rect(bx, by + i, bw, 1, shade(wood, -0.15));
  // Bottom rim
  c.rect(bx, by + bh, bw, 2, dark);

  // Items poking out
  // Bread
  c.circle(bx + 6, by - 1, 3, "#d6a463");
  c.circle(bx + 6, by - 1, 2, "#e6b277");
  // Apple
  c.circle(bx + 14, by - 1, 3, red);
  c.set(bx + 14, by - 4, "#22c55e");
  // Bottle
  c.rect(bx + 22, by - 6, 3, 7, yellow);
  c.rect(bx + 22, by - 8, 3, 2, dark);
  c.rect(bx + 21, by - 1, 5, 2, dark);

  // Floor
  c.rect(0, 39, W, 6, shade(wood, -0.6));
  c.rect(0, 38, W, 1, shade(wood, -0.3));
}

const SCENES = {
  heyhoney: { accent: "#ff6b6b", draw: sceneHeart },
  flyingpapers: { accent: "#4dabf7", draw: scenePlane },
  promptarena: { accent: "#a78bfa", draw: sceneSwords },
  yourlovepage: { accent: "#f472b6", draw: sceneEnvelope },
  "adhd-os": { accent: "#34d399", draw: sceneBrain },
  phantom: { accent: "#6366f1", draw: sceneGhost },
  "social-profiling": { accent: "#38bdf8", draw: sceneSpeech },
  "enflasyon-sepeti": { accent: "#fbbf24", draw: sceneBasket },
};

for (const [slug, { accent, draw }] of Object.entries(SCENES)) {
  const c = new Canvas(W, H);
  backdrop(c, accent, slug);
  draw(c, accent);
  const body = c.toSvg();
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W * PX} ${H * PX}" shape-rendering="crispEdges" preserveAspectRatio="xMidYMid slice">
${body}
</svg>
`;
  writeFileSync(resolve(outDir, `${slug}.svg`), svg);
}

console.log(`Wrote ${Object.keys(SCENES).length} project covers (${W}x${H}) to ${outDir}`);

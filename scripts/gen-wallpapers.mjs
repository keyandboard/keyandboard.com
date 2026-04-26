// Generate per-founder pixel-art wallpapers into /public/wallpapers/<id>.svg.
// 320x180 grid at 3px per cell -> 960x540 SVG output. Each scene is themed off
// the founder's accent color: Baran = green rolling hills, Kayra = cyan ocean.
//
// No baked-in scanlines: the page CSS already has a subtle global scanline
// overlay; doubling them in the SVG produced visible banding at large sizes.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, "..", "public", "wallpapers");
mkdirSync(outDir, { recursive: true });

const W = 320;
const H = 180;
const PX = 3;

// ── color helpers ────────────────────────────────────────────
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

// 4x4 Bayer matrix for ordered dithering (values 0..15).
const BAYER4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];
function dither(x, y, t) {
  // Returns 0 or 1 based on whether t (0..1) crosses the dither threshold for (x,y).
  const thr = (BAYER4[y & 3][x & 3] + 0.5) / 16;
  return t > thr ? 1 : 0;
}

// ── seeded PRNG ──────────────────────────────────────────────
function rng(seed) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
function strSeed(s) {
  return s.split("").reduce((a, c) => a + c.charCodeAt(0) * 17, 0);
}

// ── canvas with run-length SVG output ────────────────────────
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
  get(x, y) {
    if (x < 0 || x >= this.w || y < 0 || y >= this.h) return null;
    return this.g[y * this.w + x];
  }
  rect(x, y, w, h, c) {
    for (let dy = 0; dy < h; dy++)
      for (let dx = 0; dx < w; dx++) this.set(x + dx, y + dy, c);
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

// ── ridge generator ──
function ridge(seed, length, baseY, amp, smooth = 6) {
  const r = rng(seed);
  const raw = Array.from({ length }, () => baseY + (r() - 0.5) * 2 * amp);
  const out = [];
  for (let i = 0; i < length; i++) {
    let s = 0;
    let n = 0;
    for (let j = -smooth; j <= smooth; j++) {
      const k = i + j;
      if (k >= 0 && k < length) {
        s += raw[k];
        n++;
      }
    }
    out.push(Math.round(s / n));
  }
  return out;
}

// ── soft cloud (multi-blob + dithered edges) ──
function cloud(c, cx, cy, w, h, fillTop, fillBody, seed) {
  const r = rng(seed);
  // Several overlapping ellipses
  const blobs = 4 + Math.floor(r() * 3);
  for (let i = 0; i < blobs; i++) {
    const bx = cx + (r() - 0.5) * w * 0.8;
    const by = cy + (r() - 0.5) * h * 0.5;
    const bw = w * (0.45 + r() * 0.35);
    const bh = h * (0.55 + r() * 0.45);
    for (let y = -Math.ceil(bh); y <= bh; y++) {
      for (let x = -Math.ceil(bw); x <= bw; x++) {
        const dx = x / bw;
        const dy = y / bh;
        const d = dx * dx + dy * dy;
        if (d < 0.7) c.set(bx + x, by + y, fillBody);
        else if (d < 1) {
          // dithered edge
          if (dither(bx + x, by + y, 1 - d / 1)) c.set(bx + x, by + y, fillBody);
        }
      }
    }
    // Highlight on top half
    for (let y = -Math.ceil(bh); y <= 0; y++) {
      for (let x = -Math.ceil(bw); x <= bw; x++) {
        const dx = x / bw;
        const dy = y / bh;
        const d = dx * dx + dy * dy;
        if (d < 0.45) c.set(bx + x, by + y, fillTop);
      }
    }
  }
}

// ── scenes ───────────────────────────────────────────────────

function sceneBaran(c, accent, slug) {
  const r = rng(strSeed(slug));

  // Sky palette — soft daylight blue-green-yellow gradient (Bliss vibe).
  const skyTop = "#3a72b8";
  const skyMid = "#7eb4dc";
  const skyHorizon = "#dceaf2";
  const horizonY = Math.floor(H * 0.62);

  // Smooth banded sky (1px-tall bands). Two sub-gradients with a midpoint.
  for (let y = 0; y < horizonY; y++) {
    const t = y / horizonY;
    let col;
    if (t < 0.55) {
      col = mix(skyTop, skyMid, t / 0.55);
    } else {
      col = mix(skyMid, skyHorizon, (t - 0.55) / 0.45);
    }
    c.rect(0, y, W, 1, col);
  }

  // Sparse stars (very dim) high in the sky
  for (let y = 0; y < horizonY * 0.3; y++) {
    for (let x = 0; x < W; x++) {
      if (r() < 0.0008) c.set(x, y, "#ffffff");
    }
  }

  // Sun (subtle, just a soft disc behind clouds)
  const sunCx = Math.floor(W * 0.78);
  const sunCy = Math.floor(horizonY * 0.32);
  for (let y = -10; y <= 10; y++)
    for (let x = -10; x <= 10; x++) {
      const d = Math.sqrt(x * x + y * y);
      if (d < 9) {
        const t = 1 - d / 9;
        if (dither(sunCx + x, sunCy + y, t * 0.85))
          c.set(sunCx + x, sunCy + y, "#fff8d8");
      }
    }

  // Clouds — several puffy shapes drifting across the upper sky
  const cloudShade = "#eef4f7";
  const cloudHi = "#ffffff";
  for (let i = 0; i < 7; i++) {
    const cx = Math.floor(r() * W);
    const cy = Math.floor(r() * (horizonY * 0.55)) + 8;
    cloud(c, cx, cy, 16 + r() * 18, 6 + r() * 5, cloudHi, cloudShade, slug.length + i * 7);
  }

  // Far ridge (very desaturated)
  const farRidge = ridge(strSeed(slug) + 11, W, horizonY - 1, 4, 8);
  const farCol = "#9ab9c8";
  for (let x = 0; x < W; x++) {
    for (let y = farRidge[x]; y < horizonY; y++) c.set(x, y, farCol);
  }

  // Main rolling hill — accent green, multi-layer shading
  const baseAccent = mix(accent, "#5fb86c", 0.5); // softer than neon
  const grass = {
    light: shade(baseAccent, 0.25),
    main: baseAccent,
    mid: shade(baseAccent, -0.18),
    dark: shade(baseAccent, -0.4),
    deep: shade(baseAccent, -0.6),
  };

  const hillBase = horizonY + 8;
  const hill = ridge(strSeed(slug) + 31, W, hillBase, 7, 9);
  for (let x = 0; x < W; x++) {
    const top = hill[x];
    for (let y = top; y < H; y++) {
      const depth = (y - top) / (H - top);
      let col;
      if (depth < 0.05) col = grass.light;
      else if (depth < 0.18) col = mix(grass.light, grass.main, (depth - 0.05) / 0.13);
      else if (depth < 0.4) col = grass.main;
      else if (depth < 0.65) col = mix(grass.main, grass.mid, (depth - 0.4) / 0.25);
      else if (depth < 0.85) col = grass.mid;
      else col = mix(grass.mid, grass.dark, (depth - 0.85) / 0.15);
      c.set(x, y, col);
    }
  }

  // Pixel grass tufts on the crest
  for (let x = 0; x < W; x++) {
    const top = hill[x];
    if (r() < 0.22) c.set(x, top - 1, grass.light);
    if (r() < 0.07) c.set(x, top - 2, grass.light);
  }

  // Tiny patches of darker grass for depth
  for (let i = 0; i < 80; i++) {
    const px = Math.floor(r() * W);
    const py = hill[px] + 2 + Math.floor(r() * (H - hill[px] - 4));
    if (py < H && r() < 0.6) c.set(px, py, shade(grass.main, -0.12));
  }
}

// ── Starry Night helpers ──────────────────────────────────
function spiralArm(c, cx, cy, startR, endR, turns, baseAng, colors, slug) {
  const r = rng(strSeed(slug) + Math.floor(baseAng * 1000));
  const steps = Math.floor((endR - startR) * 14);
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const rad = startR + (endR - startR) * t;
    const ang = baseAng + t * Math.PI * 2 * turns;
    const wobble = Math.sin(ang * 3) * 1.4;
    const x = cx + Math.cos(ang) * (rad + wobble);
    const y = cy + Math.sin(ang) * (rad + wobble);
    const ci = Math.floor(((Math.sin(ang * 4 + t * Math.PI * 2) + 1) / 2) * colors.length);
    const col = colors[Math.min(colors.length - 1, ci)];
    c.set(x, y, col);
    // Perpendicular thickness — gives "brushstroke" feel
    const tx = -Math.sin(ang);
    const ty = Math.cos(ang);
    c.set(x + tx, y + ty, col);
    // Random skips for painterly texture
    if (r() < 0.25) {
      c.set(x - tx, y - ty, colors[Math.max(0, ci - 1)] ?? col);
    }
  }
}

function pixelStar(c, x, y, core, halo) {
  // 5-pixel plus + 4 corner halo pixels
  c.set(x, y, core);
  c.set(x - 1, y, core);
  c.set(x + 1, y, core);
  c.set(x, y - 1, core);
  c.set(x, y + 1, core);
  c.set(x - 2, y, halo);
  c.set(x + 2, y, halo);
  c.set(x, y - 2, halo);
  c.set(x, y + 2, halo);
  c.set(x - 1, y - 1, halo);
  c.set(x + 1, y - 1, halo);
  c.set(x - 1, y + 1, halo);
  c.set(x + 1, y + 1, halo);
}

function pixelStarBig(c, x, y, core, halo, glow) {
  pixelStar(c, x, y, core, halo);
  // Outer dithered glow
  for (let dy = -5; dy <= 5; dy++) {
    for (let dx = -5; dx <= 5; dx++) {
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > 2.5 && d <= 5) {
        if (dither(x + dx, y + dy, 1 - (d - 2.5) / 2.5))
          c.set(x + dx, y + dy, glow);
      }
    }
  }
}

function crescentMoon(c, cx, cy, r, fill, halo, glow, bg) {
  // Outer glow halo (dithered ring)
  for (let dy = -r - 5; dy <= r + 5; dy++) {
    for (let dx = -r - 5; dx <= r + 5; dx++) {
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > r + 1 && d <= r + 5) {
        const t = 1 - (d - r) / 5;
        if (dither(cx + dx, cy + dy, t * 0.7)) c.set(cx + dx, cy + dy, glow);
      }
    }
  }
  // Halo line just outside
  for (let dy = -r - 1; dy <= r + 1; dy++) {
    for (let dx = -r - 1; dx <= r + 1; dx++) {
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > r && d <= r + 1) c.set(cx + dx, cy + dy, halo);
    }
  }
  // Filled disc
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      if (dx * dx + dy * dy <= r * r) c.set(cx + dx, cy + dy, fill);
    }
  }
  // Crescent: erase inner offset disc
  const offs = Math.round(r * 0.45);
  const innerR = r - 1;
  for (let dy = -innerR; dy <= innerR; dy++) {
    for (let dx = -innerR; dx <= innerR; dx++) {
      if ((dx + offs) * (dx + offs) + dy * dy <= innerR * innerR) {
        c.set(cx + dx, cy + dy, bg);
      }
    }
  }
}

function cypress(c, baseX, baseY, height, dark, mid) {
  // Tall flame-like silhouette with internal mid-tone wisps.
  for (let y = 0; y < height; y++) {
    const py = baseY - y;
    const taper = (height - y) / height;
    const w = Math.max(1, Math.round(taper * 6 + Math.sin(y * 0.4) * 1.6));
    for (let dx = -w; dx <= w; dx++) c.set(baseX + dx, py, dark);
    // Inner wisps
    if (y > 4 && Math.sin(y * 0.6) > 0.6) {
      c.set(baseX + Math.round(Math.sin(y * 0.3) * 2), py, mid);
    }
  }
  // Pointy top
  c.set(baseX, baseY - height, dark);
  c.set(baseX, baseY - height - 1, dark);
}

function village(c, baseY, color, roof, lightColor, slug) {
  const r = rng(strSeed(slug) + 99);
  let x = 0;
  while (x < W) {
    const bw = 6 + Math.floor(r() * 14);
    const bh = 5 + Math.floor(r() * 7);
    // Building body
    c.rect(x, baseY - bh, bw, bh, color);
    // Roof — slight darker top row
    c.rect(x, baseY - bh, bw, 1, roof);
    // Window light, sometimes
    if (r() < 0.55 && bw >= 4 && bh >= 4) {
      const wx = x + 1 + Math.floor(r() * (bw - 2));
      const wy = baseY - bh + 1 + Math.floor(r() * (bh - 2));
      c.set(wx, wy, lightColor);
      // Glow dither around window
      if (dither(wx + 1, wy, 0.5)) c.set(wx + 1, wy, mix(lightColor, color, 0.4));
      if (dither(wx - 1, wy, 0.5)) c.set(wx - 1, wy, mix(lightColor, color, 0.4));
    }
    x += bw;
  }
  // Church silhouette — tall thin block with spire near center
  const sx = Math.floor(W * 0.42) + Math.floor(r() * 30);
  const sh = 14;
  c.rect(sx, baseY - sh, 4, sh, color);
  // Triangle spire
  for (let i = 0; i < 5; i++) {
    const w = 5 - i;
    for (let k = 0; k < w; k++) c.set(sx + 2 - Math.floor(w / 2) + k, baseY - sh - 1 - i, color);
  }
  // Tiny cross
  c.set(sx + 2, baseY - sh - 6, color);
  c.set(sx + 2, baseY - sh - 7, color);
  c.set(sx + 1, baseY - sh - 6, color);
  c.set(sx + 3, baseY - sh - 6, color);
}

function sceneKayra(c, accent, slug) {
  // Darker Starry-Night palette.
  const bgDeep = "#04050f";
  const bgMid = "#070a1c";
  const skyHorizon = "#0a1130";
  const horizonY = Math.floor(H * 0.78);

  // Solid dark sky with soft top-to-bottom shading.
  for (let y = 0; y < horizonY; y++) {
    const t = y / horizonY;
    const col =
      t < 0.5 ? mix(bgDeep, bgMid, t / 0.5) : mix(bgMid, skyHorizon, (t - 0.5) / 0.5);
    c.rect(0, y, W, 1, col);
  }

  // Subtle painterly noise across the sky (dithered slightly-lighter pixels)
  const noiseR = rng(strSeed(slug) + 7);
  for (let y = 0; y < horizonY; y++) {
    for (let x = 0; x < W; x++) {
      if (noiseR() < 0.025) c.set(x, y, mix(c.get(x, y), accent, 0.08));
    }
  }

  // Swirl color ramps — desaturated indigos drifting toward accent.
  const swirlPalette = [
    mix(accent, "#0a1130", 0.78), // deepest
    mix(accent, "#0a1130", 0.6),
    mix(accent, "#0a1130", 0.4),
    mix(accent, "#0a1130", 0.25),
    mix(accent, "#cfe9ff", 0.45), // brightest streak
  ];

  // Two big swirls (Van Gogh style: one large central, one secondary).
  // Central swirl, upper-left third
  spiralArm(c, 100, 50, 4, 32, 1.8, 0, swirlPalette, slug + "A");
  spiralArm(c, 100, 50, 4, 32, 1.8, Math.PI, swirlPalette, slug + "B");
  spiralArm(c, 100, 50, 4, 32, 1.8, Math.PI / 2, swirlPalette.slice(0, 4), slug + "C");
  // Secondary swirl, mid-right
  spiralArm(c, 230, 80, 4, 26, 1.6, 0.3, swirlPalette, slug + "D");
  spiralArm(c, 230, 80, 4, 26, 1.6, 0.3 + Math.PI, swirlPalette, slug + "E");
  // Long horizontal current weaving across upper sky
  spiralArm(c, 175, 30, 6, 20, 0.6, -0.4, swirlPalette.slice(2), slug + "F");

  // Crescent moon, top-right
  const moonCx = Math.floor(W * 0.86);
  const moonCy = Math.floor(H * 0.18);
  const moonR = 12;
  // Need bg color at moon location to "carve" the crescent
  const moonBg = c.get(moonCx, moonCy) ?? bgDeep;
  crescentMoon(
    c,
    moonCx,
    moonCy,
    moonR,
    "#fbe88c",
    "#f4cb53",
    mix("#f4cb53", bgDeep, 0.5),
    moonBg
  );

  // Stars — placed at swirl-friendly positions so they read as part of the sky.
  const starSpots = [
    [40, 20, true],
    [60, 60, false],
    [140, 22, true],
    [165, 78, false],
    [200, 34, false],
    [220, 18, true],
    [275, 50, false],
    [295, 28, true],
    [25, 100, false],
    [80, 130, false],
    [255, 110, false],
    [305, 90, false],
  ];
  const starCore = "#fde68a";
  const starHalo = "#facc15";
  const starGlow = "#b8860b";
  for (const [sx, sy, big] of starSpots) {
    if (big) pixelStarBig(c, sx, sy, starCore, starHalo, starGlow);
    else pixelStar(c, sx, sy, starCore, starHalo);
  }

  // Distant rolling hills silhouette (sleeping village ridge)
  const hillRidge = ridge(strSeed(slug) + 41, W, horizonY, 5, 10);
  const hillDark = "#04050f";
  for (let x = 0; x < W; x++) {
    for (let y = hillRidge[x]; y < H; y++) c.set(x, y, hillDark);
  }

  // Village along the bottom (warm window lights are the only color here)
  village(
    c,
    H - 2,
    "#070811",
    "#04050f",
    "#fcd34d",
    slug
  );

  // Cypress tree silhouette — tall flame on the left
  cypress(c, 14, H - 2, 70, "#02030a", "#0c0d22");

  // Faint wind streaks just above hills
  const streakR = rng(strSeed(slug) + 13);
  for (let y = horizonY - 12; y < horizonY; y++) {
    for (let x = 0; x < W; x++) {
      if (streakR() < 0.015)
        c.set(x, y, mix(accent, "#0a1130", 0.65));
    }
  }
}

const SCENES = {
  baran: { accent: "#34d465", draw: sceneBaran },
  kayra: { accent: "#5dc6f5", draw: sceneKayra },
};

for (const [slug, { accent, draw }] of Object.entries(SCENES)) {
  const c = new Canvas(W, H);
  draw(c, accent, slug);
  const body = c.toSvg();
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W * PX} ${H * PX}" shape-rendering="crispEdges" preserveAspectRatio="xMidYMid slice">
${body}
</svg>
`;
  writeFileSync(resolve(outDir, `${slug}.svg`), svg);
}

console.log(`Wrote ${Object.keys(SCENES).length} wallpapers (${W}x${H}) to ${outDir}`);

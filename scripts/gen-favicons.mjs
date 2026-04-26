// Generate per-founder favicons in the baranorhan.dev style:
// 32x32, rounded square, dark bg, single italic-serif letter centered.
// Output: /public/icons/<id>.svg
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, "..", "public", "icons");
mkdirSync(outDir, { recursive: true });

const FOUNDERS = {
  baran: { letter: "B", bg: "#0a0a0a", fg: "#ffffff" },
  kayra: { letter: "K", bg: "#0a0a0a", fg: "#ffffff" },
};

for (const [id, { letter, bg, fg }] of Object.entries(FOUNDERS)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <rect width="32" height="32" rx="6" fill="${bg}"/>
  <text x="16" y="23" font-family="serif" font-size="20" fill="${fg}" text-anchor="middle" font-style="italic">${letter}</text>
</svg>
`;
  writeFileSync(resolve(outDir, `${id}.svg`), svg);
}

console.log(`Wrote ${Object.keys(FOUNDERS).length} favicons to ${outDir}`);

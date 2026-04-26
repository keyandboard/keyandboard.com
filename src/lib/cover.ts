const COVER_COUNT = 10;

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function pickCover(slug: string, override?: string | null): string {
  if (override) return override;
  const idx = (hash(slug) % COVER_COUNT) + 1;
  return `/covers/default-${idx}.svg`;
}

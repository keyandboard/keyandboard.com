import type {
  FounderContent,
  FounderProfile,
  Project,
} from "@/types";

const FOUNDER_IDS = ["baran", "kayra"] as const;
type FounderId = (typeof FOUNDER_IDS)[number];

const REVALIDATE_SECONDS = 60;

type RawProject = Omit<Project, "founders">;

interface RawFounderContent {
  profile: FounderProfile;
  projects: RawProject[];
}

function contentSourceUrl(path: string): string | null {
  const base = process.env.CONTENT_SOURCE_URL;
  if (!base) return null;
  const trimmed = base.replace(/\/$/, "");
  return `${trimmed}/${path}`;
}

async function fetchRemote<T>(path: string): Promise<T | null> {
  const url = contentSourceUrl(path);
  if (!url) return null;
  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) {
      console.warn(`content: remote fetch ${url} -> ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (error) {
    console.warn(`content: remote fetch ${url} failed`, error);
    return null;
  }
}

async function loadLocal<T>(path: string): Promise<T> {
  const fs = await import("node:fs/promises");
  const pathMod = await import("node:path");
  const abs = pathMod.join(process.cwd(), "content", path);
  const raw = await fs.readFile(abs, "utf-8");
  return JSON.parse(raw) as T;
}

async function loadJson<T>(path: string): Promise<T> {
  const remote = await fetchRemote<T>(path);
  if (remote) return remote;
  return loadLocal<T>(path);
}

async function loadFounderContent(id: FounderId): Promise<FounderContent> {
  const raw = await loadJson<RawFounderContent>(`founders/${id}.json`);
  const projects: Project[] = raw.projects.map((p) => ({
    ...p,
    founders: [id, ...(p.coFounders ?? [])],
  }));
  return { profile: raw.profile, projects };
}

export async function getFounder(id: string): Promise<FounderContent | null> {
  if (!FOUNDER_IDS.includes(id as FounderId)) return null;
  return loadFounderContent(id as FounderId);
}

export async function getAllFounders(): Promise<FounderContent[]> {
  return Promise.all(FOUNDER_IDS.map((id) => loadFounderContent(id)));
}

/**
 * Union view: each project appears once, with all owning founders merged.
 * Project slug is the key. First founder to declare wins for non-list fields;
 * the `founders` array is unioned.
 */
export async function getUnion(): Promise<{
  profiles: FounderProfile[];
  projects: Project[];
}> {
  const all = await getAllFounders();
  const bySlug = new Map<string, Project>();
  for (const f of all) {
    for (const p of f.projects) {
      const existing = bySlug.get(p.slug);
      if (existing) {
        const merged: Project = {
          ...existing,
          founders: Array.from(new Set([...existing.founders, ...p.founders])),
        };
        bySlug.set(p.slug, merged);
      } else {
        bySlug.set(p.slug, p);
      }
    }
  }
  return {
    profiles: all.map((f) => f.profile),
    projects: Array.from(bySlug.values()).sort((a, b) => b.year - a.year),
  };
}

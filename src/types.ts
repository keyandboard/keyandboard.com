export interface Project {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  url: string | null;
  thumb: string | null;
  cover: string | null;
  year: number;
  coFounders: string[];
  stack: string[];
  status: string;
  accent: string;
  highlights: string[];
  /** Set by the loader: founder ids who own this project (union view). */
  founders: string[];
}

export interface FounderLink {
  label: string;
  href: string;
}

export interface FounderTheme {
  preset: "baran" | "kayra" | "default";
  background: string;
  foreground: string;
  accent: string;
  spacing: "default" | "wide";
  pixelHeavy: boolean;
  /** Optional pixel-art wallpaper image (full-screen, fixed). */
  wallpaper?: string | null;
  /** Wallpaper opacity 0..1 (defaults to 0.45). */
  wallpaperOpacity?: number;
}

export interface FounderSite {
  domain: string;
  subdomain: string;
  tagline: string;
  theme: FounderTheme;
}

export interface FounderHeadline {
  /** Top line, e.g. "Baran," */
  lead: string;
  /** Continuation, e.g. "building with data in SF." */
  italic: string;
  /** Render style for the second line. Defaults to "serif-italic". */
  style?: "serif-italic" | "sans-light";
}

export interface FounderStatus {
  /** Right-side nav label, e.g. "Building" */
  label: string;
  /** Optional dot color override; defaults to theme accent. */
  color?: string;
}

export interface FounderNameplate {
  /** "BARAN.EXE" — accent-colored title above the smaller tags. */
  exe: string;
  /** Tags below the .exe, e.g. ["AI ENG // LVL 04", "PICUS SECURITY"]. */
  tags: string[];
}

export interface FounderCv {
  label: string;
  href: string;
  updated?: string;
}

export interface FounderProfile {
  id: string;
  name: string;
  handle: string;
  title: string;
  location: string;
  bio: string;
  /** Optional pixel-font line beneath the bio, e.g. coffee invitation. */
  coffee?: string;
  avatar?: string;
  /** Optional structured headline; falls back to `name` when absent. */
  headline?: FounderHeadline;
  /** Optional nav status indicator. */
  status?: FounderStatus;
  /** Optional pixel-art nameplate beneath the avatar. */
  nameplate?: FounderNameplate;
  /** Optional résumé / CV link shown as a full-width button. */
  cv?: FounderCv;
  site: FounderSite;
  links: FounderLink[];
}

export interface FounderContent {
  profile: FounderProfile;
  projects: Project[];
}

export type SiteVariant = "keyandboard" | "founder";

export interface SiteConfig {
  variant: SiteVariant;
  founderId: string | null;
}

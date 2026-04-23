export interface Project {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  url: string | null;
  year: number;
  founders: string[];
  stack: string[];
  status: string;
  accent: string;
  highlights: string[];
}

export interface FounderLink {
  label: string;
  href: string;
}

export interface Founder {
  id: string;
  name: string;
  handle: string;
  title: string;
  location: string;
  bio: string;
  links: FounderLink[];
}

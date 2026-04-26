import type { SiteConfig } from "@/types";

interface HostRule {
  match: (host: string) => boolean;
  config: SiteConfig;
}

const RULES: HostRule[] = [
  {
    match: (h) =>
      h === "baranorhan.dev" ||
      h === "www.baranorhan.dev" ||
      h.startsWith("baran.") ||
      h.startsWith("baran-"),
    config: { variant: "founder", founderId: "baran" },
  },
  {
    match: (h) =>
      h === "kayrauckilinc.dev" ||
      h === "www.kayrauckilinc.dev" ||
      h === "kayrauckilinc.com" ||
      h === "www.kayrauckilinc.com" ||
      h.startsWith("kayra.") ||
      h.startsWith("kayra-"),
    config: { variant: "founder", founderId: "kayra" },
  },
];

const DEFAULT: SiteConfig = { variant: "keyandboard", founderId: null };

export function siteFromHost(host: string | null | undefined): SiteConfig {
  if (!host) return DEFAULT;
  const normalized = host.split(":")[0]?.toLowerCase() ?? "";
  for (const rule of RULES) {
    if (rule.match(normalized)) return rule.config;
  }
  return DEFAULT;
}

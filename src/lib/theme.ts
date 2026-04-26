import type { FounderTheme } from "@/types";

export const KEYANDBOARD_THEME: FounderTheme = {
  preset: "default",
  background: "#09090f",
  foreground: "#e8e8f0",
  accent: "#00ff41",
  spacing: "default",
  pixelHeavy: false,
};

export function themeStyle(theme: FounderTheme): React.CSSProperties {
  return {
    "--background": theme.background,
    "--foreground": theme.foreground,
    "--neon": theme.accent,
    "--neon-dim": `${theme.accent}80`,
    "--neon-faint": `${theme.accent}1f`,
    "--card-gap": theme.spacing === "wide" ? "20px" : "1px",
  } as React.CSSProperties;
}

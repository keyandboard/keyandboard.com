interface PixelWallpaperProps {
  src: string;
  opacity?: number;
  /** Dim overlay strength (0..1) over the wallpaper for text contrast. */
  dim?: number;
}

/**
 * Full-bleed fixed pixel-art wallpaper that sits behind everything.
 * `image-rendering: pixelated` keeps it crunchy at any size. A solid
 * dark overlay sits on top of the image so foreground text stays
 * legible regardless of the wallpaper's local brightness.
 */
export function PixelWallpaper({
  src,
  opacity = 0.6,
  dim = 0.45,
}: PixelWallpaperProps) {
  return (
    <div
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 0 }}
      aria-hidden
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${src})`,
          imageRendering: "pixelated",
          opacity,
        }}
      />
      {/* Uniform dark overlay for text contrast */}
      <div
        className="absolute inset-0"
        style={{ background: `rgba(0, 0, 0, ${dim})` }}
      />
      {/* Stronger fade at the bottom where the project grid + footer live */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/2"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.6) 100%)",
        }}
      />
    </div>
  );
}

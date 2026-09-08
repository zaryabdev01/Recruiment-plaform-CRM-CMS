/** Lightweight inline-SVG decoration — no image files, no network. */
import { useId } from "react";

/** Faint dotted grid for hero panels. Place inside a relative container. */
export function GridPattern({ className = "" }: { className?: string }) {
  const id = "grid-" + useId().replace(/:/g, "");
  return (
    <svg className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} aria-hidden>
      <defs>
        <pattern id={id} width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1.5" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/** Soft overlapping circles, for the corner of a coloured hero. */
export function BlobArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={`pointer-events-none absolute ${className}`} aria-hidden>
      <circle cx="140" cy="60" r="70" fill="currentColor" opacity="0.14" />
      <circle cx="170" cy="120" r="46" fill="currentColor" opacity="0.12" />
      <circle cx="110" cy="120" r="30" fill="currentColor" opacity="0.10" />
    </svg>
  );
}

type SpotName = "inbox" | "search" | "team" | "docs";

/** Small line-art spot illustration for empty states / cards. Uses currentColor. */
export function SpotArt({ name, className = "" }: { name: SpotName; className?: string }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <svg viewBox="0 0 160 120" className={className} aria-hidden>
      {name === "inbox" && (
        <g {...common}>
          <path d="M24 40h112v52a8 8 0 0 1-8 8H32a8 8 0 0 1-8-8V40Z" />
          <path d="M24 40 40 18h80l16 22" />
          <path d="M24 68h34l8 14h28l8-14h34" />
        </g>
      )}
      {name === "search" && (
        <g {...common}>
          <circle cx="70" cy="56" r="30" />
          <path d="m92 78 24 24" />
          <path d="M58 56h24M70 44v24" opacity="0.5" />
        </g>
      )}
      {name === "team" && (
        <g {...common}>
          <circle cx="56" cy="46" r="16" />
          <path d="M28 96c0-16 12-26 28-26s28 10 28 26" />
          <circle cx="108" cy="52" r="12" />
          <path d="M96 96c0-12 8-20 20-20s20 8 20 18" opacity="0.6" />
        </g>
      )}
      {name === "docs" && (
        <g {...common}>
          <rect x="40" y="20" width="64" height="80" rx="8" />
          <path d="M54 42h36M54 58h36M54 74h22" />
          <path d="M104 34l16 10-16 10" opacity="0.5" />
        </g>
      )}
    </svg>
  );
}

"use client";

import { useState } from "react";

interface SmartImageProps {
  src: string;
  alt: string;
  /** Text shown on the branded placeholder if the image is missing. */
  fallbackLabel?: string;
  /** Render initials instead of a label (for headshots). */
  initials?: string;
  className?: string;
}

/**
 * Renders the image when it exists, otherwise a branded placeholder so empty
 * photo slots read as intentional, not broken. Swap real assets in later and
 * the placeholders disappear automatically.
 */
export function SmartImage({
  src,
  alt,
  fallbackLabel,
  initials,
  className = "",
}: SmartImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        aria-label={alt}
        role="img"
        className={`flex items-center justify-center bg-gradient-to-br from-theme-red-light/40 to-theme-red-dark/60 ${className}`}
      >
        {initials ? (
          <span className="font-display text-3xl font-bold text-white/80">
            {initials}
          </span>
        ) : (
          <span className="px-4 text-center text-xs font-medium uppercase tracking-[0.18em] text-white/55">
            {fallbackLabel ?? "Photo coming soon"}
          </span>
        )}
      </div>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={className}
      loading="lazy"
    />
  );
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "SS";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

"use client";

interface InfiniteGridProps {
  className?: string;
}

/**
 * Lightweight, pure-CSS animated grid background. Two layered grids pan in
 * opposite directions for depth, masked to fade out toward the edges.
 * Replaces the old 100-div random-particle background.
 */
export function InfiniteGrid({ className = "" }: InfiniteGridProps) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <div className="infinite-grid-lg absolute -inset-[168px]" />
      <div className="infinite-grid absolute -inset-[56px]" />
      {/* soft glow so the grid reads as light, not a wireframe */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_35%,rgba(255,255,255,0.10),transparent_70%)]" />
    </div>
  );
}

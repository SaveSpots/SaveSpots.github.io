/**
 * Distance and travel-time formatting. Shared so the mobile app and the web portal
 * never disagree about what "0.8 mi" or "5 min" means.
 *
 * US-only product (Chicago-first), so miles everywhere. There is no metric toggle
 * on purpose — add one here, not in a screen, if that ever changes.
 */

const METERS_PER_MILE = 1609.344;

/** Average city driving speed in mph, including lights and turns.
 *  Chicago's posted limit is 30 mph; real door-to-door averages land near 20. */
const DRIVE_MPH = 20;
/** Brisk walking pace in mph. */
const WALK_MPH = 3;
/** Under this, driving is pointless — quote a walk time instead. */
const WALK_THRESHOLD_MI = 0.5;

/** Straight-line meters converted to miles. */
export function metersToMiles(meters: number): number {
  return meters / METERS_PER_MILE;
}

/**
 * Road distance is always longer than the crow flies. 1.25 is the usual detour
 * factor for a dense street grid, which is what Chicago is.
 */
const DETOUR_FACTOR = 1.25;

/** "0.4 mi" / "2.7 mi" / "12 mi" — precision drops as the number grows. */
export function formatMiles(meters: number): string {
  const mi = metersToMiles(meters);
  if (mi < 0.1) return "<0.1 mi";
  if (mi < 10) return `${mi.toFixed(1)} mi`;
  return `${Math.round(mi)} mi`;
}

export type TravelEstimate = {
  minutes: number;
  mode: "walk" | "drive";
  /** "5 min walk" / "12 min drive" */
  label: string;
  /** True when guessed from straight-line distance rather than routed by Google.
   *  The UI prefixes estimates with "~" and shows routed times without it. */
  estimated: boolean;
  /** Road distance in meters when routed; straight-line otherwise. */
  meters: number;
};

/**
 * Travel time guessed from straight-line distance, with no network call.
 *
 * This is the FALLBACK. `fetchTravelTimes` below returns real traffic-aware times
 * from the Google Routes API; this runs when that is unreachable, unconfigured, or
 * still in flight, so a screen always has a number to show. It applies a detour
 * factor and an average speed — good enough to answer "is this close?".
 *
 * Anything derived from this is marked `estimated: true` so the UI can render "~".
 */
export function estimateTravel(meters: number): TravelEstimate {
  const mi = metersToMiles(meters) * DETOUR_FACTOR;
  const walking = mi <= WALK_THRESHOLD_MI;
  const mph = walking ? WALK_MPH : DRIVE_MPH;
  const minutes = Math.max(1, Math.round((mi / mph) * 60));
  return {
    minutes,
    mode: walking ? "walk" : "drive",
    label: `${minutes} min ${walking ? "walk" : "drive"}`,
    estimated: true,
    meters,
  };
}

/** "0.8 mi · 4 min drive", with "~" only when the time is a guess. */
export function formatDistanceAndTime(t: TravelEstimate): string {
  return `${formatMiles(t.meters)} · ${t.estimated ? "~" : ""}${t.label}`;
}

type Point = { lat: number; lng: number };

/**
 * Real driving/walking times from the Google Routes API, via our own /api/eta
 * proxy (the key is server-side only — see apps/web/app/api/eta/route.ts).
 *
 * Never throws and never returns a short array: any failure falls back to
 * estimateTravel per destination, so a dead network or missing key degrades the
 * number instead of emptying the screen.
 *
 * @param baseUrl "" for same-origin (web), or the deployed site for mobile.
 * @param straightLineMeters haversine distances, used for the fallback and to
 *        decide walk vs drive before we know the road distance.
 */
export async function fetchTravelTimes(
  baseUrl: string,
  origin: Point,
  destinations: Point[],
  straightLineMeters: number[],
  signal?: AbortSignal,
): Promise<TravelEstimate[]> {
  const fallback = () => straightLineMeters.map((m) => estimateTravel(m));
  if (destinations.length === 0) return [];

  // One mode for the whole batch: if every box is walkable, ask for walking times.
  const walking = straightLineMeters.every(
    (m) => metersToMiles(m) * DETOUR_FACTOR <= WALK_THRESHOLD_MI,
  );

  try {
    const res = await fetch(`${baseUrl}/api/eta`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ origin, destinations, mode: walking ? "WALK" : "DRIVE" }),
      signal,
    });
    if (!res.ok) return fallback();

    const { legs } = (await res.json()) as {
      legs?: Array<{ index: number; meters: number; seconds: number }>;
    };
    if (!Array.isArray(legs) || legs.length === 0) return fallback();

    const byIndex = new Map(legs.map((l) => [l.index, l]));
    return destinations.map((_, i) => {
      const leg = byIndex.get(i);
      if (!leg || !leg.seconds) return estimateTravel(straightLineMeters[i] ?? 0);
      const minutes = Math.max(1, Math.round(leg.seconds / 60));
      return {
        minutes,
        mode: walking ? "walk" : "drive",
        label: `${minutes} min ${walking ? "walk" : "drive"}`,
        estimated: false,
        meters: leg.meters || straightLineMeters[i] || 0,
      };
    });
  } catch {
    return fallback();
  }
}

/** Radius copy for empty states: "31 miles". */
export function formatRadiusMiles(meters: number): string {
  return `${Math.round(metersToMiles(meters))} miles`;
}

// ---------------------------------------------------------------------------
// Check-in recency (shared so both apps phrase "last checked" identically)
// ---------------------------------------------------------------------------

/** "3 days ago" / "just now" / "5 months ago" from an ISO timestamp. */
export function timeAgo(iso: string | null): string {
  if (!iso) return "never checked";
  const then = new Date(iso).getTime();
  const now = Date.now();
  const s = Math.max(0, Math.round((now - then) / 1000));
  const mins = Math.round(s / 60);
  const hrs = Math.round(s / 3600);
  const days = Math.round(s / 86400);
  if (s < 60) return "just now";
  if (mins < 60) return `${mins} min ago`;
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.round(days / 365);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

/** Sort key for "needs attention first": never-checked, then oldest check-in. */
export function stalenessRank(lastCheckedAt: string | null): number {
  // Never checked = most urgent → rank 0. Otherwise older = smaller timestamp = more urgent.
  return lastCheckedAt ? new Date(lastCheckedAt).getTime() : 0;
}

type LastCheckin = {
  last_checked_at: string | null;
  last_box_gone: boolean | null;
  last_replaced: boolean | null;
  last_needs_restock: boolean | null;
  last_kits_given: number | null;
};

/** One-line summary of a box's most recent check-in outcome. */
export function lastCheckinSummary(b: LastCheckin): string {
  if (!b.last_checked_at) return "No check-ins yet";
  if (b.last_box_gone) {
    return b.last_replaced === true
      ? "Box was gone — replaced"
      : b.last_replaced === false
        ? "Box was gone — not replaced"
        : "Box was gone";
  }
  if (b.last_needs_restock) {
    return b.last_kits_given != null
      ? `Restocked — ${b.last_kits_given} savekits given`
      : "Needs restock";
  }
  return "Box OK — no restock needed";
}

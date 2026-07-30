/**
 * Travel-time proxy — Google Routes API (computeRouteMatrix).
 *
 * Why a proxy instead of calling Google from the apps: the key would then ship
 * inside a public web bundle and a published Expo app, where anyone can pull it
 * out and bill it to us. Here it stays server-side. Both the web portal and the
 * mobile app call this one endpoint.
 *
 * Needs GOOGLE_MAPS_API_KEY (server-only — NOT NEXT_PUBLIC_). Without it the
 * route returns 503 and callers fall back to the straight-line estimate, so a
 * missing key degrades the number rather than breaking the screen.
 */
import { NextResponse } from "next/server";

const ENDPOINT = "https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix";
const MAX_DESTINATIONS = 10;      // we only ever show the 3 closest; cap protects the bill
const CACHE_TTL_MS = 5 * 60 * 1000;
const COORD_PRECISION = 3;        // ~110 m — plenty for "how far is this box"

type Point = { lat: number; lng: number };
type Leg = { index: number; meters: number; seconds: number };

const cache = new Map<string, { at: number; legs: Leg[] }>();

function key(origin: Point, dests: Point[], mode: string) {
  const r = (n: number) => n.toFixed(COORD_PRECISION);
  return `${mode}|${r(origin.lat)},${r(origin.lng)}|${dests
    .map((d) => `${r(d.lat)},${r(d.lng)}`)
    .join(";")}`;
}

function waypoint(p: Point) {
  return { waypoint: { location: { latLng: { latitude: p.lat, longitude: p.lng } } } };
}

export async function POST(req: Request) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GOOGLE_MAPS_API_KEY not set" }, { status: 503 });
  }

  let body: { origin?: Point; destinations?: Point[]; mode?: "DRIVE" | "WALK" };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const { origin, destinations } = body;
  const mode = body.mode === "WALK" ? "WALK" : "DRIVE";
  if (!origin || !Array.isArray(destinations) || destinations.length === 0) {
    return NextResponse.json({ error: "origin and destinations required" }, { status: 400 });
  }
  const dests = destinations.slice(0, MAX_DESTINATIONS);

  const k = key(origin, dests, mode);
  const hit = cache.get(k);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return NextResponse.json({ legs: hit.legs, cached: true });
  }

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "originIndex,destinationIndex,duration,distanceMeters,condition",
      },
      body: JSON.stringify({
        origins: [waypoint(origin)],
        destinations: dests.map(waypoint),
        travelMode: mode,
        // TRAFFIC_AWARE is the cheaper of the two traffic modes and accurate
        // enough here; TRAFFIC_AWARE_OPTIMAL costs more per element.
        ...(mode === "DRIVE" ? { routingPreference: "TRAFFIC_AWARE" } : {}),
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("[eta] Routes API", res.status, detail.slice(0, 300));
      return NextResponse.json({ error: "routes api failed" }, { status: 502 });
    }

    const rows: Array<{
      destinationIndex?: number;
      distanceMeters?: number;
      duration?: string;
      condition?: string;
    }> = await res.json();

    const legs: Leg[] = rows
      .filter((r) => r.condition === "ROUTE_EXISTS")
      .map((r) => ({
        index: r.destinationIndex ?? 0,
        meters: r.distanceMeters ?? 0,
        // duration comes back as a protobuf duration string, e.g. "870s"
        seconds: Number.parseInt(String(r.duration ?? "0"), 10) || 0,
      }));

    cache.set(k, { at: Date.now(), legs });
    return NextResponse.json({ legs });
  } catch (e) {
    console.error("[eta]", e);
    return NextResponse.json({ error: "routes api unreachable" }, { status: 502 });
  }
}

/**
 * Reverse-geocode proxy — Google Geocoding API.
 *
 * Same reasoning as /api/eta: the key stays server-side instead of shipping in
 * a public bundle. The web portal calls this after tagging a location so the
 * address and city fields fill themselves in, matching what the mobile app
 * gets for free from expo-location's reverseGeocodeAsync.
 *
 * Needs GOOGLE_MAPS_API_KEY (server-only). Without it the route returns 503 and
 * the caller leaves the address fields for the user to type manually — the
 * submission still works, it just isn't pre-filled.
 */
import { NextResponse } from "next/server";

const ENDPOINT = "https://maps.googleapis.com/maps/api/geocode/json";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // addresses don't move
const COORD_PRECISION = 4; // ~11 m — tight enough to keep street numbers distinct
const MAX_CANDIDATES = 5;

type Candidate = { address: string; city: string };

const cache = new Map<string, { at: number; candidates: Candidate[] }>();

type Component = { long_name: string; short_name: string; types: string[] };

function pick(components: Component[], type: string) {
  return components.find((c) => c.types.includes(type))?.long_name ?? "";
}

/** Street address + city from one Geocoding result, or null if not addressable. */
function formatResult(r: { address_components?: Component[] }): Candidate | null {
  const parts = r.address_components ?? [];
  const street = pick(parts, "route");
  if (!street) return null;
  const number = pick(parts, "street_number");
  const city =
    pick(parts, "locality") ||
    pick(parts, "postal_town") ||
    pick(parts, "sublocality") ||
    pick(parts, "administrative_area_level_2");
  return { address: number ? `${number} ${street}` : street, city };
}

export async function POST(req: Request) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GOOGLE_MAPS_API_KEY not set" }, { status: 503 });
  }

  let body: { lat?: number; lng?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const { lat, lng } = body;
  if (typeof lat !== "number" || typeof lng !== "number") {
    return NextResponse.json({ error: "lat and lng required" }, { status: 400 });
  }

  const k = `${lat.toFixed(COORD_PRECISION)},${lng.toFixed(COORD_PRECISION)}`;
  const hit = cache.get(k);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return NextResponse.json({ candidates: hit.candidates, cached: true });
  }

  try {
    const url = `${ENDPOINT}?latlng=${encodeURIComponent(k)}&key=${apiKey}` +
      // street_address first, then the wider fallbacks Google returns anyway
      "&result_type=street_address|premise|subpremise|route";
    const res = await fetch(url);
    if (!res.ok) {
      const detail = await res.text();
      console.error("[geocode] Geocoding API", res.status, detail.slice(0, 300));
      return NextResponse.json({ error: "geocoding api failed" }, { status: 502 });
    }

    const json: {
      status?: string;
      error_message?: string;
      results?: Array<{ address_components?: Component[] }>;
    } = await res.json();

    if (json.status !== "OK" && json.status !== "ZERO_RESULTS") {
      console.error("[geocode]", json.status, json.error_message);
      return NextResponse.json({ error: "geocoding api failed" }, { status: 502 });
    }

    const candidates = (json.results ?? [])
      .map(formatResult)
      .filter((c): c is Candidate => c !== null)
      // dedupe by address text — Google returns the same street several ways
      .filter((c, i, arr) => arr.findIndex((o) => o.address === c.address) === i)
      .slice(0, MAX_CANDIDATES);

    cache.set(k, { at: Date.now(), candidates });
    return NextResponse.json({ candidates });
  } catch (e) {
    console.error("[geocode]", e);
    return NextResponse.json({ error: "geocoding api unreachable" }, { status: 502 });
  }
}

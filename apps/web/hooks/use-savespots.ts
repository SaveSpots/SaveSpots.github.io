"use client";

import { useEffect, useState } from "react";
import { getActiveSaveboxes, type PublicSavebox } from "@savespots/shared";
import { getSupabase } from "@/lib/supabase-browser";
import {
  FALLBACK_SAVESPOTS,
  type SaveSpotLocation,
} from "@/lib/savespots-fallback";

/** DB rows → map pins. Some addresses already include the city; don't repeat it. */
function toLocation(box: PublicSavebox): SaveSpotLocation {
  const hasCity = box.address.toLowerCase().includes(box.city.toLowerCase());
  return {
    id: box.id,
    name: box.name,
    lat: box.lat,
    lng: box.lng,
    address: hasCity ? box.address : `${box.address}, ${box.city}`,
    hours: box.hours,
  };
}

/**
 * Active SaveSpots, loaded live from Supabase. Null while loading; falls back
 * to the saved snapshot if the fetch fails. One source for the map pins and
 * the "Active SaveSpots" count so the two can never disagree.
 */
export function useSaveSpots(): SaveSpotLocation[] | null {
  const [locations, setLocations] = useState<SaveSpotLocation[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getActiveSaveboxes(getSupabase())
      .then((boxes) => {
        if (!cancelled) setLocations(boxes.map(toLocation));
      })
      .catch((err) => {
        console.error("Live SaveSpots unavailable; showing saved snapshot.", err);
        if (!cancelled) setLocations(FALLBACK_SAVESPOTS);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return locations;
}

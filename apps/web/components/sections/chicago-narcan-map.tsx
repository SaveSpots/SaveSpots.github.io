"use client";

import { Clock, ArrowUpRight } from "lucide-react";
import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  MapControls,
} from "@/components/ui/mapcn-marker-popup";
import {
  FALLBACK_SAVESPOTS,
  type SaveSpotLocation,
} from "@/lib/savespots-fallback";

// Fit the viewport to every SaveSpot so out-of-town pins are never stranded.
// The map reads bounds once at creation, so the parent mounts it only after
// the locations have loaded.
function boundsOf(
  locations: SaveSpotLocation[],
): [[number, number], [number, number]] {
  const pts = locations.length ? locations : FALLBACK_SAVESPOTS;
  const lngs = pts.map((l) => l.lng);
  const lats = pts.map((l) => l.lat);
  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ];
}

// A clean brand-red location pin used for every SaveSpot.
function SaveSpotPin() {
  return (
    <div className="group relative grid place-items-center">
      <span className="absolute h-7 w-7 animate-ping rounded-full bg-[#5a2532]/25" />
      <span className="relative block h-4 w-4 rounded-full bg-[#5a2532] ring-[3px] ring-white shadow-[0_2px_8px_rgba(67,27,38,0.45)] transition-transform duration-200 group-hover:scale-125" />
    </div>
  );
}

export default function ChicagoNarcanMap({
  locations,
}: {
  locations: SaveSpotLocation[];
}) {
  return (
    <Map
      theme="light"
      bounds={boundsOf(locations)}
      fitBoundsOptions={{ padding: 56 }}
      className="h-full w-full"
    >
      <MapControls position="bottom-right" showZoom showFullscreen />

      {locations.map((loc) => (
        <MapMarker key={loc.id ?? loc.name} longitude={loc.lng} latitude={loc.lat}>
          <MarkerContent>
            <SaveSpotPin />
          </MarkerContent>
          <MarkerPopup closeButton className="w-[250px] !rounded-2xl !border-theme-red/10 !p-4 shadow-xl">
            <p className="font-display text-sm font-bold text-theme-red-dark">
              {loc.name}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-neutral-500">
              {loc.address}
            </p>
            {loc.hours && (
              <div className="mt-3 flex items-start gap-2 border-t border-neutral-100 pt-3 text-xs text-neutral-700">
                <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-theme-red" />
                <span>{loc.hours}</span>
              </div>
            )}
            {loc.notes && (
              <p className="mt-1.5 pl-[22px] text-[11px] text-neutral-400">
                {loc.notes}
              </p>
            )}
            <a
              href={`https://www.google.com/maps/place/${encodeURIComponent(
                loc.address
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-theme-red px-3 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-theme-red-light"
            >
              Open in Google Maps
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </MarkerPopup>
        </MapMarker>
      ))}
    </Map>
  );
}

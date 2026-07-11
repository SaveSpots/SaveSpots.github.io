"use client";

import { Clock, ArrowUpRight } from "lucide-react";
import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  MapControls,
} from "@/components/ui/mapcn-marker-popup";

// Narcan locations
type NarcanLocation = {
  name: string;
  lat: number;
  lng: number;
  address: string;
  hours: string;
  notes?: string;
};

const narcanLocations: NarcanLocation[] = [
  {
    name: "Al-Tayyab Zabiha Halal Meat and Grocery",
    address: "2753 W Devon Ave, Chicago, IL 60659",
    lat: 41.99750978607458,
    lng: -87.69927603410231,
    hours: "11 AM - 8 PM Wed-Mon, 1:30 PM - 8 PM Tues",
    notes: "Front counter",
  },
  {
    name: "Casey's Corner",
    address: "2733 W Devon Ave, Chicago, IL 60659",
    lat: 41.99753141291217,
    lng: -87.69857193993684,
    hours: "3 PM - 1 AM Tues-Sat (Closed Mon)",
    notes: "Left Counter (or ask bartender)",
  },
  {
    name: "3000 W 63rd St",
    address: "3000 W 63rd St, Chicago, IL",
    lat: 41.7785,
    lng: -87.7,
    hours: "24/7",
  },
  {
    name: "1741 S Ruble St",
    address: "1741 S Ruble St, Chicago, IL",
    lat: 41.852,
    lng: -87.662,
    hours: "24/7",
  },
  {
    name: "500 W 34th St",
    address: "500 W 34th St, Steger, IL",
    lat: 41.47,
    lng: -87.636,
    hours: "24/7",
  },
  {
    name: "3400 Union Ave",
    address: "3400 Union Ave, Steger, IL",
    lat: 41.472,
    lng: -87.638,
    hours: "24/7",
  },
  {
    name: "7348 South Stony Island",
    address: "7348 South Stony Island, Chicago, IL",
    lat: 41.761,
    lng: -87.585,
    hours: "24/7",
  },
  {
    name: "5458 S Wells St",
    address: "5458 S Wells St, Chicago, IL",
    lat: 41.792,
    lng: -87.632,
    hours: "24/7",
  },
  {
    name: "7859 S State St",
    address: "7859 S State St, Chicago, IL",
    lat: 41.751,
    lng: -87.622,
    hours: "24/7",
  },
  {
    name: "R&S Beverages",
    address: "308 E 75th St, Chicago, IL 60619",
    lat: 41.7585743,
    lng: -87.6177796,
    hours: "Sun 11AM–11PM, Mon–Wed 9AM–11PM, Thu–Sat 9AM–12AM",
    notes: "Liquor Store",
  },
  {
    name: "Brick's Nightclub",
    address: "4422 W Madison St, Chicago, IL 60624",
    lat: 41.8811101,
    lng: -87.7364876,
    hours: "Sun–Fri 12PM–2AM, Sat 12PM–3AM",
    notes: "Nightclub",
  },
  {
    name: "Grove Market",
    address: "6656 S Cottage Grove Ave, Chicago, IL 60637",
    lat: 41.773325,
    lng: -87.6061206,
    hours: "Hours not confirmed",
    notes: "Grocery Store",
  },
  {
    name: "7 Seas Food & Meat Mart",
    address: "6501 S Cottage Grove Ave, Chicago, IL 60637",
    lat: 41.776656,
    lng: -87.605736,
    hours: "8AM–10PM daily",
    notes: "Grocery Store",
  },
  {
    name: "JB One Restaurant",
    address: "6359 S Cottage Grove Ave, Chicago, IL 60637",
    lat: 41.7791749,
    lng: -87.6057919,
    hours: "Hours not confirmed",
    notes: "Restaurant",
  },
  {
    name: "Morgan Mini Mart",
    address: "6600 S Morgan St, Chicago, IL 60621",
    lat: 41.7740902,
    lng: -87.6498459,
    hours: "Hours not confirmed",
    notes: "Convenience Store",
  },
  {
    name: "Top of the Line Hair Studio",
    address: "18 S Kostner Ave, Chicago, IL 60624",
    lat: 41.8798545,
    lng: -87.7356506,
    hours: "Hours not confirmed",
    notes: "Hair Studio",
  },
  {
    name: "Exxon Mobil",
    address: "10 N Kilbourn Ave, Chicago, IL 60624",
    lat: 41.8809642,
    lng: -87.7381631,
    hours: "24/7",
    notes: "Gas Station",
  },
  {
    name: "Delta Tau Delta Fraternity House",
    address: "839 N 11th St, Milwaukee, WI 53233",
    lat: 43.0411328,
    lng: -87.926167,
    hours: "Hours not confirmed",
    notes: "Fraternity House (Marquette University)",
  },
  {
    name: "Phi Delta Theta Fraternity House",
    address: "200 25th Avenue S, Nashville, TN 37212",
    lat: 36.1458905,
    lng: -86.8069019,
    hours: "Hours not confirmed",
    notes: "Fraternity House (Vanderbilt University)",
  },
  {
    name: "Pi Kappa Alpha Fraternity House",
    address: "2402 Vanderbilt Pl, Nashville, TN 37212",
    lat: 36.1458037,
    lng: -86.8054409,
    hours: "Hours not confirmed",
    notes: "Fraternity House (Vanderbilt University)",
  },
];

// Fit the viewport to every SaveSpot so out-of-town pins are never stranded.
const lngs = narcanLocations.map((l) => l.lng);
const lats = narcanLocations.map((l) => l.lat);
const bounds: [[number, number], [number, number]] = [
  [Math.min(...lngs), Math.min(...lats)],
  [Math.max(...lngs), Math.max(...lats)],
];

// A clean brand-red location pin used for every SaveSpot.
function SaveSpotPin() {
  return (
    <div className="group relative grid place-items-center">
      <span className="absolute h-7 w-7 animate-ping rounded-full bg-[#5a2532]/25" />
      <span className="relative block h-4 w-4 rounded-full bg-[#5a2532] ring-[3px] ring-white shadow-[0_2px_8px_rgba(67,27,38,0.45)] transition-transform duration-200 group-hover:scale-125" />
    </div>
  );
}

export default function ChicagoNarcanMap() {
  return (
    <Map
      theme="light"
      bounds={bounds}
      fitBoundsOptions={{ padding: 56 }}
      className="h-full w-full"
    >
      <MapControls position="bottom-right" showZoom showFullscreen />

      {narcanLocations.map((loc) => (
        <MapMarker key={loc.name} longitude={loc.lng} latitude={loc.lat}>
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
            <div className="mt-3 flex items-start gap-2 border-t border-neutral-100 pt-3 text-xs text-neutral-700">
              <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-theme-red" />
              <span>{loc.hours}</span>
            </div>
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

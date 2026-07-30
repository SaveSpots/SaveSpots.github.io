"use client";

/**
 * Nearby SaveSpots map for the volunteer portal.
 *
 * The portal previously listed boxes with no map at all, even though leaflet and
 * react-leaflet were already dependencies. This is the mobile home screen's map,
 * on the web: user marker, a pin per box, click a pin to select it.
 *
 * Must be loaded with `next/dynamic({ ssr: false })` — leaflet reads `window` at
 * import time and breaks the server render otherwise.
 */
import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { estimateTravel, formatMiles, type NearbySavebox } from "@savespots/shared";

const RED = "#C8102E";

/** Divicon so we don't ship leaflet's default marker PNGs, which 404 under Next. */
function dot(color: string, size: number) {
  return L.divIcon({
    className: "",
    html: `<span style="display:block;width:${size}px;height:${size}px;border-radius:50%;
      background:${color};border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

/** Keep every box and the user in frame whenever the set changes. */
function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 14);
      return;
    }
    map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 15 });
  }, [map, points]);
  return null;
}

export default function NearbyMap({
  boxes,
  origin,
  onSelect,
}: {
  boxes: NearbySavebox[];
  origin: { lat: number; lng: number };
  onSelect?: (b: NearbySavebox) => void;
}) {
  const points = useMemo<[number, number][]>(
    () => [[origin.lat, origin.lng], ...boxes.map((b) => [b.lat, b.lng] as [number, number])],
    [boxes, origin],
  );

  return (
    <MapContainer
      center={[origin.lat, origin.lng]}
      zoom={12}
      scrollWheelZoom={false}
      className="h-[360px] w-full rounded-2xl"
      style={{ zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds points={points} />

      <Marker position={[origin.lat, origin.lng]} icon={dot("#1D4ED8", 14)}>
        <Popup>You are here</Popup>
      </Marker>

      {boxes.map((b) => (
        <Marker
          key={b.id}
          position={[b.lat, b.lng]}
          icon={dot(RED, 18)}
          eventHandlers={onSelect ? { click: () => onSelect(b) } : undefined}
        >
          <Popup>
            <strong>{b.name}</strong>
            <br />
            {formatMiles(b.distance_m)} · ~{estimateTravel(b.distance_m).label}
            <br />
            {b.address}, {b.city}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

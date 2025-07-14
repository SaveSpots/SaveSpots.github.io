"use client";

import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { MapPin } from "lucide-react";
import ReactDOMServer from "react-dom/server";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default icon path for Leaflet in Next.js
const DefaultIcon = L.Icon.Default as any;
delete DefaultIcon.prototype._getIconUrl;
DefaultIcon.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

// Your custom pulsing icon with Lucide icon inside
const svgString = ReactDOMServer.renderToStaticMarkup(
  <MapPin size={28} stroke="#5a2532" />
);

const pulseHTML = `
  <div class="relative w-12 h-12">
    <div class="absolute inset-0 rounded-full bg-[rgb(122,59,74)] animate-ping"></div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
      ${svgString}
    </div>
  </div>
`;

export const customIcon = new L.DivIcon({
  html: pulseHTML,
  className: "",
  iconSize: [48, 48],
  iconAnchor: [24, 24],
  popupAnchor: [0, -24],
});

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
    name: "Community Health Center",
    lat: 41.8827,
    lng: -87.6233,
    address: "123 W Randolph St",
    hours: "Mon-Fri 9am-5pm",
    notes: "Available at front desk",
  },
  {
    name: "Downtown Pharmacy",
    lat: 41.881,
    lng: -87.627,
    address: "456 N State St",
    hours: "24/7",
    notes: "Call ahead for availability",
  },
];

export default function ChicagoNarcanMap() {
  return (
    <MapContainer
      center={[41.8781, -87.6298]}
      zoom={13}
      scrollWheelZoom={true} // better UX for mobile
      className="w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden shadow-lg z-0"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors, Tiles &copy; Stadia Maps"
        url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
      />

      {narcanLocations.map((loc) => (
        <Marker key={loc.name} position={[loc.lat, loc.lng]} icon={customIcon}>
          <Popup>
            <div className="text-sm space-y-1">
              <p className="font-semibold">{loc.name}</p>
              <p>{loc.address}</p>
              <p className="text-xs">Hours: {loc.hours}</p>
              {loc.notes && <p className="italic text-xs">{loc.notes}</p>}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                >
                Open in Google Maps
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

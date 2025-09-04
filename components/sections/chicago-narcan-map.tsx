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
  <div class="leaflet-marker-icon leaflet-interactive relative w-12 h-12 cursor-pointer">
    <div class="absolute inset-0 rounded-full bg-[rgb(122,59,74)] animate-ping pointer-events-none"></div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
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
  }
];

export default function ChicagoNarcanMap() {
  return (
    <MapContainer
      center={[41.885402455956715, -87.63855207545448]}
      zoom={10}
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
                href={`https://www.google.com/maps/place/${encodeURIComponent(
                  loc.address
                )}`}
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

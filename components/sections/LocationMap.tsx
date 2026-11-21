"use client";

import { useEffect, useMemo, useRef } from "react";
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { places, type Place } from "@/data/locations";
import { project } from "@/data/project";

/** Moves the map whenever the active place changes. */
function FlyTo({ active }: { active: Place | null }) {
  const map = useMap();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (active) {
      map.flyToBounds(L.latLngBounds([project.coordinates, active.coordinates]), { padding: [80, 80], duration: 1.2, maxZoom: 15 });
    } else {
      map.flyTo(project.coordinates, 13, { duration: 1.2 });
    }
  }, [active, map]);
  return null;
}

/** Leaflet map (client-only). Dark CARTO basemap built on OpenStreetMap data — no API key. */
export default function LocationMap({ active }: { active: Place | null }) {
  const projectIcon = useMemo(
    () =>
      L.divIcon({
        className: "",
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        html: `<div class="gold-marker" style="width:28px;height:28px"><span class="pulse"></span><span style="position:absolute;inset:6px;border-radius:9999px;background:#C8A96A;border:2px solid #F5F1EA;box-shadow:0 0 20px rgba(200,169,106,.8)"></span></div>`,
      }),
    [],
  );
  const placeIcon = (isActive: boolean) =>
    L.divIcon({
      className: "",
      iconSize: [14, 14],
      iconAnchor: [7, 7],
      html: `<span style="display:block;width:14px;height:14px;border-radius:9999px;background:${isActive ? "#C8A96A" : "#F5F1EA"};border:3px solid #0E0E10;box-shadow:0 0 0 1px ${isActive ? "#C8A96A" : "#8A8580"};transition:all .3s"></span>`,
    });

  return (
    <MapContainer center={project.coordinates} zoom={13} scrollWheelZoom={false} className="h-full w-full" attributionControl>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        subdomains="abcd"
        maxZoom={19}
      />
      <Marker position={project.coordinates} icon={projectIcon} zIndexOffset={1000}>
        <Tooltip direction="top" offset={[0, -14]} permanent className="!border-gold/40 !bg-charcoal !text-gold">
          THE SOVEREIGN
        </Tooltip>
      </Marker>
      {places.map((p) => (
        <Marker key={p.id} position={p.coordinates} icon={placeIcon(active?.id === p.id)}>
          <Tooltip direction="top" offset={[0, -8]}>
            {p.name} · {p.distance}
          </Tooltip>
        </Marker>
      ))}
      <FlyTo active={active} />
    </MapContainer>
  );
}

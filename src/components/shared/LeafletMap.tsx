import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// Leaflet's default marker icon paths assume a plain <img src="images/...">
// relative lookup, which breaks once Vite bundles/hashes assets — point it
// at the actual bundled URLs instead, once, module-wide.
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

export type MapMarker = {
  id: string;
  lat: number;
  lng: number;
  label: string;
  href?: string;
};

const AFRICA_CENTER: [number, number] = [7, 12];

export function LeafletMap({ markers, heightClassName = "h-[420px]" }: { markers: MapMarker[]; heightClassName?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView(AFRICA_CENTER, 4);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();

    markers.forEach((marker) => {
      const leafletMarker = L.marker([marker.lat, marker.lng]);
      const safeLabel = marker.label.replace(/</g, "&lt;");
      const popupHtml = marker.href
        ? `<a href="${marker.href}" style="font-weight:600;color:#1f5a39;">${safeLabel}</a>`
        : `<span style="font-weight:600;">${safeLabel}</span>`;
      leafletMarker.bindPopup(popupHtml);
      leafletMarker.addTo(layer);
    });

    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map((marker) => [marker.lat, marker.lng] as [number, number]));
      map.fitBounds(bounds.pad(0.25), { maxZoom: 11 });
    } else {
      map.setView(AFRICA_CENTER, 4);
    }
  }, [markers]);

  return <div ref={containerRef} className={`w-full ${heightClassName} overflow-hidden rounded-2xl border border-[var(--brand-border-light)]`} />;
}

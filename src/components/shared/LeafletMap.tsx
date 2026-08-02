import { useEffect, useRef } from "react";
import type * as Leaflet from "leaflet";
import "leaflet/dist/leaflet.css";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

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
  const mapRef = useRef<Leaflet.Map | null>(null);
  const layerRef = useRef<Leaflet.LayerGroup | null>(null);

  // Leaflet reads `window`/`document` as soon as its module is evaluated,
  // which crashes SSR (this app renders server-side via TanStack Start).
  // A dynamic import inside an effect only ever runs in the browser, so the
  // module is never touched during the server render.
  useEffect(() => {
    if (!containerRef.current) return;
    let map: Leaflet.Map | null = null;
    let cancelled = false;

    void import("leaflet").then((leafletModule) => {
      if (cancelled || !containerRef.current) return;
      const L = leafletModule.default;
      // Leaflet's default marker icon paths assume a plain <img src="images/...">
      // relative lookup, which breaks once Vite bundles/hashes assets — point it
      // at the actual bundled URLs instead, once, module-wide.
      L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

      map = L.map(containerRef.current, { scrollWheelZoom: false }).setView(AFRICA_CENTER, 4);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);
      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      applyMarkers(L, mapRef.current, layerRef.current, markers);
    });

    return () => {
      cancelled = true;
      map?.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    void import("leaflet").then((leafletModule) => applyMarkers(leafletModule.default, map, layer, markers));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markers]);

  return <div ref={containerRef} className={`w-full ${heightClassName} overflow-hidden rounded-2xl border border-[var(--brand-border-light)]`} />;
}

function applyMarkers(L: typeof Leaflet, map: Leaflet.Map, layer: Leaflet.LayerGroup, markers: MapMarker[]) {
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
}

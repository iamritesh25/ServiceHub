import { useEffect, useRef, useState } from "react";

const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS  = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

const loadLeaflet = () =>
  new Promise((resolve) => {
    if (window.L) { resolve(window.L); return; }
    const link = document.createElement("link");
    link.rel = "stylesheet"; link.href = LEAFLET_CSS;
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src = LEAFLET_JS;
    script.onload = () => resolve(window.L);
    document.head.appendChild(script);
  });

const MapView = ({ origin, destination, originLabel = "Your Location", destinationLabel = "Provider" }) => {
  const mapRef = useRef(null);
  const instanceRef = useRef(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [routeError, setRouteError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!origin || !destination) return;
    let cancelled = false;

    const init = async () => {
      const L = await loadLeaflet();
      if (cancelled || !mapRef.current) return;
      if (instanceRef.current) { instanceRef.current.remove(); }

      const map = L.map(mapRef.current).setView([origin.lat, origin.lng], 13);
      instanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);

      const makeIcon = (color) => L.divIcon({
        className: "",
        html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>`,
        iconSize: [14, 14], iconAnchor: [7, 7],
      });

      L.marker([origin.lat, origin.lng], { icon: makeIcon("#3b82f6") })
        .addTo(map).bindPopup(`<strong>${originLabel}</strong>`).openPopup();
      L.marker([destination.lat, destination.lng], { icon: makeIcon("#ef4444") })
        .addTo(map).bindPopup(`<strong>${destinationLabel}</strong>`);

      // OSRM route
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();
        if (!cancelled && data.routes?.length) {
          const route = data.routes[0];
          const km = (route.distance / 1000).toFixed(1);
          const mins = Math.round(route.duration / 60);
          setDistance(km); setDuration(mins);
          L.geoJSON(route.geometry, { style: { color: "#2563eb", weight: 4, opacity: 0.8 } }).addTo(map);
          const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
          map.fitBounds(L.latLngBounds(coords), { padding: [40, 40] });
        }
      } catch { setRouteError("Route unavailable"); }

      setLoading(false);
    };

    init();
    return () => { cancelled = true; if (instanceRef.current) { instanceRef.current.remove(); instanceRef.current = null; } };
  }, [origin?.lat, origin?.lng, destination?.lat, destination?.lng]);

  return (
    <div style={{ marginTop: 16, borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)" }}>
      {loading && <div style={{ background: "#f8fafc", padding: 20, textAlign: "center" }}><div className="spinner" /></div>}
      {(distance || duration) && (
        <div style={{ background: "var(--primary)", color: "white", padding: "10px 16px", display: "flex", gap: 24, fontSize: 13, fontWeight: 600 }}>
          {distance && <span>📏 {distance} km</span>}
          {duration && <span>⏱️ ~{duration} min by car</span>}
          {routeError && <span style={{ color: "#fca5a5" }}>⚠️ {routeError}</span>}
        </div>
      )}
      <div ref={mapRef} style={{ height: 280, width: "100%" }} />
    </div>
  );
};

export default MapView;

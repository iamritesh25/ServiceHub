import { useEffect, useRef, useState } from "react";

/**
 * MapView — Leaflet.js + OpenStreetMap + OSRM Routing
 * 100% Free. No API key. No payment.
 *
 * Props:
 *   origin      : { lat, lng }
 *   destination : { lat, lng }
 *   originLabel      : string
 *   destinationLabel : string
 */
const MapView = ({
  origin,
  destination,
  originLabel = "You",
  destinationLabel = "Destination",
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeError, setRouteError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!origin || !destination) return;

    // ── Load Leaflet CSS ──
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // ── Load Leaflet JS ──
    const loadLeaflet = () =>
      new Promise((resolve) => {
        if (window.L) { resolve(window.L); return; }
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = () => resolve(window.L);
        document.head.appendChild(script);
      });

    const initMap = async () => {
      const L = await loadLeaflet();

      // Destroy previous map instance to avoid duplicate
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if (!mapRef.current) return;

      // Create map centred between origin and destination
      const centerLat = (origin.lat + destination.lat) / 2;
      const centerLng = (origin.lng + destination.lng) / 2;
      const map = L.map(mapRef.current).setView([centerLat, centerLng], 13);
      mapInstanceRef.current = map;

      // OpenStreetMap tiles — free, no key needed
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Green marker — origin (You)
      const greenIcon = L.divIcon({
        html: `<div style="background:#16a34a;color:#fff;border-radius:50%;
                width:36px;height:36px;display:flex;align-items:center;
                justify-content:center;font-size:16px;font-weight:700;
                border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.35)">A</div>`,
        className: "",
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      // Red marker — destination
      const redIcon = L.divIcon({
        html: `<div style="background:#dc2626;color:#fff;border-radius:50%;
                width:36px;height:36px;display:flex;align-items:center;
                justify-content:center;font-size:16px;font-weight:700;
                border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.35)">B</div>`,
        className: "",
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      L.marker([origin.lat, origin.lng], { icon: greenIcon })
        .addTo(map)
        .bindPopup(`<b>📍 ${originLabel}</b>`)
        .openPopup();

      L.marker([destination.lat, destination.lng], { icon: redIcon })
        .addTo(map)
        .bindPopup(`<b>🏠 ${destinationLabel}</b>`);

      // ── Fetch driving route from OSRM (free, no key needed) ──
      try {
        const url =
          `https://router.project-osrm.org/route/v1/driving/` +
          `${origin.lng},${origin.lat};${destination.lng},${destination.lat}` +
          `?overview=full&geometries=geojson`;

        const res = await fetch(url);
        const data = await res.json();

        if (data.code === "Ok" && data.routes.length > 0) {
          const route = data.routes[0];

          // Draw blue route line
          const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
          const polyline = L.polyline(coords, {
            color: "#2563eb",
            weight: 5,
            opacity: 0.85,
          }).addTo(map);

          map.fitBounds(polyline.getBounds(), { padding: [40, 40] });

          // Distance & ETA
          const distKm = (route.distance / 1000).toFixed(1);
          const totalMin = Math.round(route.duration / 60);
          const hours = Math.floor(totalMin / 60);
          const mins = totalMin % 60;
          const eta = hours > 0 ? `${hours} hr ${mins} min` : `${mins} min`;

          setRouteInfo({ distance: `${distKm} km`, duration: eta });
          setRouteError(null);
        } else {
          setRouteError("No road route found between these locations.");
          // Draw dashed straight line as fallback
          const line = L.polyline(
            [[origin.lat, origin.lng], [destination.lat, destination.lng]],
            { color: "#94a3b8", weight: 3, dashArray: "8 6" }
          ).addTo(map);
          map.fitBounds(line.getBounds(), { padding: [60, 60] });
        }
      } catch (err) {
        console.error("Route fetch error:", err);
        setRouteError("Route unavailable. Showing locations only.");
        map.fitBounds(
          [[origin.lat, origin.lng], [destination.lat, destination.lng]],
          { padding: [60, 60] }
        );
      }

      setLoading(false);
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [origin, destination, originLabel, destinationLabel]);

  return (
    <div style={{ marginTop: "16px" }}>

      {/* Route Info Banner */}
      {routeInfo && (
        <div style={{
          display: "flex",
          gap: "20px",
          padding: "12px 18px",
          background: "#eff6ff",
          borderRadius: "8px",
          marginBottom: "10px",
          flexWrap: "wrap",
          alignItems: "center",
          border: "1px solid #bfdbfe",
        }}>
          <span style={{ fontWeight: "600", color: "#1d4ed8" }}>
            📍 {originLabel} → {destinationLabel}
          </span>
          <span>🛣️ <strong>Distance:</strong> {routeInfo.distance}</span>
          <span>⏱️ <strong>ETA:</strong> {routeInfo.duration}</span>
        </div>
      )}

      {/* Route warning */}
      {routeError && (
        <div style={{
          padding: "10px 14px",
          color: "#92400e",
          background: "#fef3c7",
          borderRadius: "8px",
          marginBottom: "10px",
          fontSize: "14px",
        }}>
          ⚠️ {routeError}
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div style={{ padding: "8px 0", color: "#64748b", fontSize: "14px" }}>
          🗺️ Loading map...
        </div>
      )}

      {/* Map container */}
      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: "420px",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
          zIndex: 0,
        }}
      />
    </div>
  );
};

export default MapView;

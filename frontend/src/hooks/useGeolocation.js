import { useState, useCallback } from "react";
import API from "../api/axios";

/**
 * useGeolocation
 * Returns:
 *   getLocation() — triggers browser geolocation, saves to backend, resolves with { lat, lng }
 *   loading       — boolean
 *   error         — string | null
 */
const useGeolocation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const msg = "Geolocation is not supported by your browser.";
        setError(msg);
        reject(new Error(msg));
        return;
      }

      setLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          try {
            // Save to backend (best-effort — don't block map on failure)
            await API.post("/api/location/save", {
              latitude: lat,
              longitude: lng,
            });
          } catch (err) {
            console.warn("Could not save location to server:", err);
          }

          setLoading(false);
          resolve({ lat, lng });
        },
        (err) => {
          const msg = "Location access denied. Please allow location access and try again.";
          setError(msg);
          setLoading(false);
          reject(new Error(msg));
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }, []);

  return { getLocation, loading, error };
};

export default useGeolocation;

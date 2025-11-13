import React, { useEffect, useState } from "react";
import citiesData from "../../data/world-cities.json";

export default function Header({ coordinates }) {
  const [locationName, setLocationName] = useState("");

  // 🔄 Fetch location name whenever coordinates change
  useEffect(() => {
    if (!coordinates) return;
    const { lat, lon } = coordinates;

    // Offline nearest-city lookup using local `world-cities.json`
    const toRad = (deg) => (deg * Math.PI) / 180;
    const haversineKm = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // km
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const findNearestCity = (latVal, lonVal, maxKm = 250) => {
      let best = null;
      let bestDist = Infinity;

      for (let i = 0; i < citiesData.length; i++) {
        const c = citiesData[i];
        if (!c.lat || !c.lng) continue;
        const clat = parseFloat(c.lat);
        const clng = parseFloat(c.lng || c.lon || c.lng);
        if (Number.isNaN(clat) || Number.isNaN(clng)) continue;

        const d = haversineKm(latVal, lonVal, clat, clng);
        if (d < bestDist) {
          bestDist = d;
          best = c;
        }
      }

      if (best && bestDist <= maxKm) {
        return { city: best.city || best.name || "", country: best.country || "", distanceKm: Math.round(bestDist) };
      }
      return null;
    };

    const nearest = findNearestCity(lat, lon, 250);
    if (nearest) {
      setLocationName(`${nearest.city}, ${nearest.country}`);
    } else {
      // Fallback: show rounded coordinates if no nearby city found
      setLocationName(`Lat ${lat.toFixed(2)}, Lon ${lon.toFixed(2)}`);
    }
  }, [coordinates]);

  return (
    <header className="header"> 
      <h2 className="gradient-text">Global Realtime Monitor</h2>

      {coordinates ? (
        <p className="coords">
          📍 {locationName ? locationName : "Fetching location..."} 
          <span style={{ marginLeft: '10px', color: 'var(--muted)', fontSize: '0.9rem' }}>
            (Lat: {coordinates.lat.toFixed(3)}, Lng: {coordinates.lon.toFixed(3)})
          </span>
        </p>
      ) : (
        <p className="coords">Select a location on the globe</p>
      )}
    </header>
  );
}

import React, { useEffect, useState } from "react";

export default function Header({ coordinates }) {
  const [locationName, setLocationName] = useState("");

  // 🔄 Fetch location name whenever coordinates change
  useEffect(() => {
    if (!coordinates) return;

    const { lat, lon } = coordinates;

    const fetchLocation = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
        );
        const data = await response.json();

        if (data && data.address) {
          const { city, town, village, state, country } = data.address;
          const name = city || town || village || state || country || "Unknown location";
          setLocationName(`${name}, ${country || ""}`.trim());
        } else {
          setLocationName("Unknown location");
        }
      } catch (error) {
        console.error("Error fetching location:", error);
        setLocationName("Location unavailable");
      }
    };

    fetchLocation();
  }, [coordinates]);

  return (
    <header className="header"> 
      <h2 className="gradient-text">Global Realtime Monitor</h2>

      {coordinates ? (
        <p className="coords">
           {locationName ? locationName : "Fetching location..."}
        </p>
      ) : (
        <p className="coords">Select a location on the globe</p>
      )}
    </header>
  );
}

// client/src/App.jsx
import React, { useState } from "react";
import Globe from "./components/Globe";

export default function App() {
  const [coordinates, setCoordinates] = useState(null);

  const handleGlobePick = (lat, lon) => {
    setCoordinates({ lat, lon });
  };

  return (
    <div style={{ padding: 20, color: "#fff", fontFamily: "Segoe UI, Roboto, sans-serif", background: "#001122", minHeight: "100vh" }}>
      <h2>EcoLens Globe</h2>
      <p>Selected Coordinates: {coordinates ? `${coordinates.lat.toFixed(3)}, ${coordinates.lon.toFixed(3)}` : "none"}</p>

      <Globe onPick={handleGlobePick} />
    </div>
  );
}

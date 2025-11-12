import React, { useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import Globe from "./components/Globe";

export default function App() {
  const [coordinates, setCoordinates] = useState(null);

  const handleGlobePick = (lat, lon) => {
    setCoordinates({ lat, lon });
  };

  return (
    <div className="app">
      <Sidebar />
      <main className="content">
        <Header coordinates={coordinates} />
        <div className="mapcontainer">
          <Globe onPick={handleGlobePick} />
        </div>
      </main>
    </div>
  );
}

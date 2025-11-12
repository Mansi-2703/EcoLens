import React, { useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import GlobePage from "./components/Globe"; // This holds your Globe component
import Aqi from "./components/predictions/Aqi";
import Marine from "./components/predictions/Marine";
import Climate from "./components/predictions/Climate";
import "./index.css";

export default function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState("dashboard");
  const [coordinates, setCoordinates] = useState(null);

  const handleGlobePick = (lat, lon) => {
    setCoordinates({ lat, lon });
  };

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  return (
    <div className="app">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        onNavigate={setActivePage}
      />
<div className="sticky-logo">
  <img
    src="/ecolens-logo.png" // or .jpg if that's what you have
    alt="EcoLens Logo"
  />
</div>
      <main className="content">
        {/* Show header only on dashboard page */}
        {activePage === "dashboard" && <Header coordinates={coordinates} />}

        {/* 🌍 Dashboard shows Global Air Quality Monitor - labelled in sidebar as Realtime Monitor */}
        {activePage === "dashboard" && <GlobePage onPick={handleGlobePick} />}

        {/* Forest Cover (was Analytics) */}
        {activePage === "analytics" && <div className="page">Forest Cover Page (placeholder)</div>}

        {/* Misc placeholders kept for compatibility */}
        {activePage === "reports" && <div className="page">Reports Page</div>}
        {activePage === "settings" && <div className="page">Settings Page</div>}

        {/* Prediction pages (blank for now) */}
        {activePage === "aqi" && <Aqi />}
        {activePage === "marine" && <Marine />}
        {activePage === "climate" && <Climate />}
      </main>
    </div>
  );
}

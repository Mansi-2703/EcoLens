import React, { useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import GlobePage from "./components/Globe"; // This holds your Globe component
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

      <main className="content">
        <Header coordinates={coordinates} />

        {/* 🌍 Dashboard shows Global Air Quality Monitor */}
        {activePage === "dashboard" && <GlobePage onPick={handleGlobePick} />}

        {/* Placeholder pages */}
        {activePage === "analytics" && <div className="page">Analytics Page</div>}
        {activePage === "reports" && <div className="page">Reports Page</div>}
        {activePage === "settings" && <div className="page">Settings Page</div>}
      </main>
    </div>
  );
}

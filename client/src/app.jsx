import React, { useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import ForestMap from "./components/layout/ForestMap";
import GlobePage from "./components/Globe"; // This holds your Globe component
import Aqi from "./components/predictions/Aqi";
import Marine from "./components/predictions/Marine";
import Climate from "./components/predictions/Climate";
import GlacierInsights from "./components/GlacierInsights";
import LandingPage from "./components/LandingPage";
import EcoBot from "./components/EcoBot";
import "./index.css";

export default function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState("landing");
  const [coordinates, setCoordinates] = useState(null);

  const handleGlobePick = (lat, lon) => {
    setCoordinates({ lat, lon });
  };

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const handleGetStarted = () => {
    setActivePage("dashboard");
  };

  // Show landing page
  if (activePage === "landing") {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

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

      <main className="content flex flex-col flex-1 min-h-screen p-0">
        {/* Show header on dashboard page with coordinates */}
        {activePage === "dashboard" && <Header coordinates={coordinates} />}
        
        {/* Show header on analytics page with forest cover title */}
        {activePage === "analytics" && (
          <header className="header">
            <h2 className="gradient-text">Global Forest Cover</h2>
            <p className="coords">Real-time global forest cover monitoring</p>
          </header>
        )}

        {/* Show header on glacier page */}
        {activePage === "glacier" && (
          <header className="header">
            <h2 className="gradient-text">Glacier Insights</h2>
            <p className="coords">Advanced glacier monitoring and analysis</p>
          </header>
        )}

        {/* Show header on ecobot page */}
        {activePage === "ecobot" && (
          <header className="header">
            <h2 className="gradient-text">EcoBot</h2>
            <p className="coords">AI-powered environmental assistant</p>
          </header>
        )}

        <div className="page-content">
          {/* 🌍 Dashboard shows Global Air Quality Monitor */}
          {activePage === "dashboard" && <GlobePage onPick={handleGlobePick} />}

          {/* Forest Cover / Analytics */}
          {activePage === "analytics" && <ForestMap />}

          {/* Glacier Insights */}
          {activePage === "glacier" && <GlacierInsights />}

          {/* Misc placeholders kept for compatibility */}
          {activePage === "reports" && <div className="page">Reports Page</div>}
          {activePage === "settings" && <div className="page">Settings Page</div>}

          {/* Prediction pages */}
          {activePage === "aqi" && <Aqi />}
          {activePage === "marine" && <Marine />}
          {activePage === "climate" && <Climate />}

          {/* AI Chatbot page */}
          {activePage === "ecobot" && <EcoBot />}
        </div>
      </main>
    </div>
  );
}

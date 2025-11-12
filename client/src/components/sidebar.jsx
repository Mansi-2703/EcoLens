import React from "react";
import { Menu, X } from "lucide-react"; // ✅ For icons

export default function Sidebar({ isOpen, onToggle, onNavigate }) {
  return (
    <aside className={`sidebar ${isOpen ? "open" : "collapsed"}`}>
      <div className="sidebar-header">
        <h2 className="logo">{isOpen ? "EcoLens" : "EL"}</h2>
        <button className="toggle-btn" onClick={onToggle}>
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <nav className="nav-section">
        <button className="navbutton" onClick={() => onNavigate("dashboard")}>
          Real-Time Monitor
        </button>
        <button className="navbutton" onClick={() => onNavigate("analytics")}>
          Analytics
        </button>
        <button className="navbutton" onClick={() => onNavigate("reports")}>
          Reports
        </button>
        <button className="navbutton" onClick={() => onNavigate("settings")}>
          Settings
        </button>
      </nav>
    </aside>
  );
}


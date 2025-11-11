import React from "react";

export default function Sidebar({ onSelect }) {
  const tools = ["AQI", "Temperature", "Forest Cover", "Marine Details"];
  return (
    <aside className="sidebar">
      <div className="logo">EcoLens Dashboard</div>
      {tools.map((t) => (
        <button key={t} className="navbutton" onClick={() => onSelect(t)}>
          {t}
        </button>
      ))}
    </aside>
  );
}

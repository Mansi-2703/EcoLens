import React from 'react';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="logo">🌎 EcoLens</div>
      <nav>
        <button className="navbutton">Dashboard</button>
        <button className="navbutton">Analytics</button>
        <button className="navbutton">Reports</button>
        <button className="navbutton">Settings</button>
      </nav>
    </aside>
  );
}

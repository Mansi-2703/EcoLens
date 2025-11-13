import React from 'react';

// Sidebar used by App. Receives optional props:
// - isOpen: boolean
// - onToggle: () => void
// - onNavigate: (pageKey: string) => void
export default function Sidebar({ isOpen = true, onToggle = () => {}, onNavigate = () => {} }) {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
      <div className="sidebar-header">
        <div className="logo">{isOpen ? '🌎 EcoLens' : 'EL'}</div>
        <button className="toggle-btn" onClick={onToggle} aria-label="Toggle sidebar">
          <span style={{ fontSize: 18 }}>{isOpen ? '✕' : '☰'}</span>
        </button>
      </div>

      <nav className="nav-section">
        <div className="nav-group">
          <h4 className="group-title">Realtime Analysis</h4>
          <button className="navbutton" title="Realtime Monitor" onClick={() => onNavigate('dashboard')}>
            Realtime Monitor
          </button>
          <button className="navbutton" title="Forest Cover" onClick={() => onNavigate('analytics')}>
            Forest Cover
          </button>
        </div>

        <div className="nav-group">
          <h4 className="group-title">Predictions</h4>
          <button className="navbutton" title="AQI" onClick={() => onNavigate('aqi')}>
            aqi
          </button>
          <button className="navbutton" title="Marine" onClick={() => onNavigate('marine')}>
            marine
          </button>
          <button className="navbutton" title="Climate" onClick={() => onNavigate('climate')}>
            climate
          </button>
        </div>
      </nav>
    </aside>
  );
}

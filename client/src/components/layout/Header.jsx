import React from 'react';

export default function Header({ coordinates }) {
  return (
    <header className="header">
      <h2>Global Air Quality Monitor</h2>
      {coordinates ? (
        <p className="coords">📍 {coordinates.lat.toFixed(2)}, {coordinates.lon.toFixed(2)}</p>
      ) : (
        <p className="coords">Select a location on the globe</p>
      )}
    </header>
  );
}

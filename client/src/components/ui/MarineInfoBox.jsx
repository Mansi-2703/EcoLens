import React from "react";

export default function MarineInfoBox({ coords, data }) {
  if (!coords) return null;

  const marine = data?.currentMarine;

  return (
    <div className="marine-info-box">
      <h4>Marine Conditions</h4>
      <div className="coords">
        <p>Lat: {coords.lat.toFixed(3)}</p>
        <p>Lng: {coords.lng.toFixed(3)}</p>
      </div>

      {marine && (
        <div className="marine-params">
          <div className="marine-item">
            <span className="label">🌊 Wave Height:</span>
            <span className="value">
              {marine.waveHeight !== null ? `${marine.waveHeight} m` : 'N/A'}
            </span>
          </div>

          <div className="marine-item">
            <span className="label">🌀 Swell Wave Height:</span>
            <span className="value">
              {marine.swellWaveHeight !== null ? `${marine.swellWaveHeight} m` : 'N/A'}
            </span>
          </div>

          <div className="marine-item">
            <span className="label">🌡️ Sea Temperature:</span>
            <span className="value">
              {marine.seaSurfaceTemperature !== null ? `${marine.seaSurfaceTemperature}°C` : 'N/A'}
            </span>
          </div>

          <div className="marine-item">
            <span className="label">💨 Current Velocity:</span>
            <span className="value">
              {marine.oceanCurrentVelocity !== null ? `${marine.oceanCurrentVelocity} m/s` : 'N/A'}
            </span>
          </div>

          <div className="marine-item">
            <span className="label">🧭 Current Direction:</span>
            <span className="value">
              {marine.oceanCurrentDirection !== null ? `${marine.oceanCurrentDirection}°` : 'N/A'}
            </span>
          </div>
        </div>
      )}

      {!marine && (
        <p style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
          No marine data available
        </p>
      )}
    </div>
  );
}

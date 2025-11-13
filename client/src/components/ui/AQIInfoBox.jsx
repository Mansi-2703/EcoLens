import React from "react";

// Helper to color AQI border dynamically
function getAQIColor(aqi) {
  if (aqi <= 50) return "#50f08a"; // Good
  if (aqi <= 100) return "#f1f04e"; // Moderate
  if (aqi <= 150) return "#f5a623"; // Unhealthy for Sensitive
  if (aqi <= 200) return "#f55d3e"; // Unhealthy
  if (aqi <= 300) return "#9b2fae"; // Very Unhealthy
  return "#7e0023"; // Hazardous
}

export default function AQIInfoBox({ coords, data }) {
  if (!coords) return null;

  const openM = data?.openMeteo;
  const aqi = openM?.latestAQI;
  const boxColor = aqi ? getAQIColor(aqi) : "var(--accent)";

  // Get current values from Open-Meteo
  const current = openM?.current ?? null;

  return (
    <div className="aqi-info-box" style={{ borderLeft: `4px solid ${boxColor}` }}>
      <h4>Air Quality Index</h4>

      {(openM && current) && (
        <div className="aqi-params">
          <div className="aqi-item">
            <span className="label">🌍 AQI (US):</span>
            <span className="value" style={{ color: boxColor }}>
              {aqi ?? 'N/A'}
            </span>
          </div>

          <div className="aqi-item">
            <span className="label">💨 PM10:</span>
            <span className="value">
              {current.pm10 !== null ? `${current.pm10} µg/m³` : 'N/A'}
            </span>
          </div>

          <div className="aqi-item">
            <span className="label">🌬️ PM2.5:</span>
            <span className="value">
              {current.pm2_5 !== null ? `${current.pm2_5} µg/m³` : 'N/A'}
            </span>
          </div>

          <div className="aqi-item">
            <span className="label">☁️ CO:</span>
            <span className="value">
              {current.carbon_monoxide !== null ? `${current.carbon_monoxide} µg/m³` : 'N/A'}
            </span>
          </div>

          <div className="aqi-item">
            <span className="label">💨 NO2:</span>
            <span className="value">
              {current.nitrogen_dioxide !== null ? `${current.nitrogen_dioxide} µg/m³` : 'N/A'}
            </span>
          </div>

          <div className="aqi-item">
            <span className="label">🌫️ Ozone:</span>
            <span className="value">
              {current.ozone !== null ? `${current.ozone} µg/m³` : 'N/A'}
            </span>
          </div>

          <div className="aqi-item">
            <span className="label">🏜️ Dust:</span>
            <span className="value">
              {current.dust !== null ? `${current.dust} µg/m³` : 'N/A'}
            </span>
          </div>

          <div className="aqi-item">
            <span className="label">☀️ UV Index:</span>
            <span className="value">
              {current.uv_index !== null ? current.uv_index : 'N/A'}
            </span>
          </div>
        </div>
      )}

      {!openM?.current && (
        <p style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
          No air quality data available
        </p>
      )}
    </div>
  );
}

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

  const aqi = data?.openMeteo?.latestAQI;
  const boxColor = aqi ? getAQIColor(aqi) : "var(--accent)";

  return (
    <div className="aqi-info-box" style={{ borderLeft: `4px solid ${boxColor}` }}>
      <h4>Air Quality Index</h4>

      {data?.openMeteo?.hourly && (
        <div className="aqi-params">
          <div className="aqi-item">
            <span className="label">🌫️ AQI (US):</span>
            <span className="value" style={{ color: boxColor }}>
              {aqi || 'N/A'}
            </span>
          </div>

          {(() => {
            const h = data.openMeteo.hourly;
            const i = h.time.length - 1;
            return (
              <>
                <div className="aqi-item">
                  <span className="label">💨 PM10:</span>
                  <span className="value">
                    {h.pm10[i] ? `${h.pm10[i]} µg/m³` : 'N/A'}
                  </span>
                </div>
                <div className="aqi-item">
                  <span className="label">🌬️ PM2.5:</span>
                  <span className="value">
                    {h.pm2_5[i] ? `${h.pm2_5[i]} µg/m³` : 'N/A'}
                  </span>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {!data?.openMeteo?.hourly && (
        <p style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
          No air quality data available
        </p>
      )}
    </div>
  );
}

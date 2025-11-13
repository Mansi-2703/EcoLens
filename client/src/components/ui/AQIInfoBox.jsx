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

  // prefer current values when available, otherwise fall back to latest hourly index
  const current = openM?.current ?? null;
  const hourly = openM?.hourly ?? null;
  const lastIndex = hourly?.time?.length ? hourly.time.length - 1 : -1;

  return (
    <div className="aqi-info-box" style={{ borderLeft: `4px solid ${boxColor}` }}>
      <h4>Selected Location</h4>
      <div className="coords">
        <p>Lat: {coords.lat.toFixed(3)}</p>
        <p>Lng: {coords.lng.toFixed(3)}</p>
      </div>

      {aqi && (
        <div className="aqi-value">
          <span className="label">AQI (US):</span>
          <span className="value" style={{ color: boxColor, fontWeight: "bold" }}>
            {aqi}
          </span>
          
        </div>
      )}

      {(openM && (current || hourly)) && (
        <div className="params">
          <h5>Latest Parameters (Open-Meteo)</h5>
          <div className="aqi-params">
            <div>
              <span className="label">PM10:</span>
              <span className="value">{current?.pm10 ?? (lastIndex >= 0 ? hourly.pm10[lastIndex] : null) ?? 'N/A'} µg/m³</span>
            </div>
            <div>
              <span className="label">PM2.5:</span>
              <span className="value">{current?.pm2_5 ?? (lastIndex >= 0 ? hourly.pm2_5[lastIndex] : null) ?? 'N/A'} µg/m³</span>
            </div>
            <div>
              <span className="label">CO:</span>
              <span className="value">{current?.carbon_monoxide ?? (lastIndex >= 0 ? hourly.carbon_monoxide[lastIndex] : null) ?? 'N/A'} µg/m³</span>
            </div>
            <div>
              <span className="label">Dust:</span>
              <span className="value">{current?.dust ?? (lastIndex >= 0 ? hourly.dust[lastIndex] : null) ?? 'N/A'} µg/m³</span>
            </div>
          </div>
        </div>
      )}

      {data?.openAQ?.results?.length > 0 && (
        <div className="stations">
          <h5>Nearby Stations (OpenAQ)</h5>
          {data.openAQ.results.slice(0, 2).map((station, i) => (
            <div key={i} className="station">
              <strong>{station.location}</strong>
              {station.measurements &&
                station.measurements.slice(0, 3).map((m, j) => (
                  <div key={j}>
                    {m.parameter.toUpperCase()}: {m.value} {m.unit}
                  </div>
                ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

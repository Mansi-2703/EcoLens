import React from "react";

export default function WeatherInfoBox({ coords, data }) {
  if (!coords) return null;

  const weather = data?.currentWeather;

  return (
    <div className="weather-info-box" style={{ borderLeft: `4px solid var(--accent)` }}>
      <h4>Weather Conditions</h4>

      {weather && (
        <div className="weather-params">
          <div className="weather-item">
            <span className="label">🌡️ Temperature:</span>
            <span className="value">
              {weather.temperature !== null ? `${weather.temperature}°C` : 'N/A'}
            </span>
          </div>

          <div className="weather-item">
            <span className="label">💧 Humidity:</span>
            <span className="value">
              {weather.humidity !== null ? `${weather.humidity}%` : 'N/A'}
            </span>
          </div>

          <div className="weather-item">
            <span className="label">💨 Wind Speed:</span>
            <span className="value">
              {weather.windSpeed !== null ? `${weather.windSpeed} km/h` : 'N/A'}
            </span>
          </div>

          <div className="weather-item">
            <span className="label">🧭 Wind Direction:</span>
            <span className="value">
              {weather.windDirection !== null ? `${weather.windDirection}°` : 'N/A'}
            </span>
          </div>

          <div className="weather-item">
            <span className="label">🌧️ Rain:</span>
            <span className="value">
              {weather.rain !== null ? `${weather.rain} mm` : '0 mm'}
            </span>
          </div>
        </div>
      )}

      {!weather && (
        <p style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
          No weather data available
        </p>
      )}
    </div>
  );
}

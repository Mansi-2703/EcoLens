import React from "react";
import {
  CloudRain,
  Thermometer,
  Wind,
  Droplets,
  Compass,
} from "lucide-react";

export default function WeatherCard({ data }) {
  if (!data) return null;

  const { temperature_2m, relative_humidity_2m, wind_speed_10m, wind_direction_10m, rain } = data;

  return (
    <div className="weather-card">
      <h4 className="weather-title">🌤 Weather Conditions</h4>

      <div className="weather-item">
        <Thermometer size={18} />
        <span>Temperature:</span>
        <strong>{temperature_2m} °C</strong>
      </div>

      <div className="weather-item">
        <Droplets size={18} />
        <span>Humidity:</span>
        <strong>{relative_humidity_2m} %</strong>
      </div>

      <div className="weather-item">
        <Wind size={18} />
        <span>Wind:</span>
        <strong>{wind_speed_10m} m/s</strong>
      </div>

      <div className="weather-item">
        <Compass size={18} />
        <span>Direction:</span>
        <strong>{wind_direction_10m}°</strong>
      </div>

      <div className="weather-item">
        <CloudRain size={18} />
        <span>Rain:</span>
        <strong>{rain} mm</strong>
      </div>
    </div>
  );
}

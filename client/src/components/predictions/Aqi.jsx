import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function Aqi() {
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lat, setLat] = useState(40.7128); // Default New York
  const [lon, setLon] = useState(-74.0060);
  const gridRef = useRef(null);

  // Fetch AQI data whenever lat/lon changes
  useEffect(() => {
    const fetchAirQuality = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm10,pm2_5,sulphur_dioxide,uv_index&forecast_days=5&timezone=auto`
        );
        if (!response.ok) throw new Error('Failed to fetch air quality data');
        const data = await response.json();
        const dailyForecasts = processDailyAverages(data);
        setForecast(dailyForecasts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAirQuality();
  }, [lat, lon]);

  const processDailyAverages = (data) => {
    const { hourly } = data;
    const times = hourly.time;
    const pm10 = hourly.pm10;
    const pm25 = hourly.pm2_5;
    const so2 = hourly.sulphur_dioxide;
    const uvIndex = hourly.uv_index;

    const dailyData = {};
    times.forEach((time, index) => {
      const date = time.split('T')[0];
      if (!dailyData[date]) dailyData[date] = { pm10: [], pm25: [], so2: [], uvIndex: [] };
      dailyData[date].pm10.push(pm10[index]);
      dailyData[date].pm25.push(pm25[index]);
      dailyData[date].so2.push(so2[index]);
      dailyData[date].uvIndex.push(uvIndex[index]);
    });

    return Object.entries(dailyData).map(([date, values]) => ({
      date,
      pm10: (values.pm10.reduce((a, b) => a + b, 0) / values.pm10.length).toFixed(1),
      pm25: (values.pm25.reduce((a, b) => a + b, 0) / values.pm25.length).toFixed(1),
      so2: (values.so2.reduce((a, b) => a + b, 0) / values.so2.length).toFixed(1),
      uvIndex: (values.uvIndex.reduce((a, b) => a + b, 0) / values.uvIndex.length).toFixed(1),
    }));
  };

  const getAirQualityStatus = (pm25) => {
    const value = parseFloat(pm25);
    if (value <= 12) return { emoji: '🟢', label: 'Good', color: '#10b981', glow: '16, 185, 129' };
    if (value <= 35.4) return { emoji: '🟡', label: 'Moderate', color: '#f59e0b', glow: '245, 158, 11' };
    return { emoji: '🔴', label: 'Poor', color: '#ef4444', glow: '239, 68, 68' };
  };

  const formatDate = (dateString) =>
    new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

  // Map click handler to update lat/lon
  function LocationMarker() {
    useMapEvents({
      click(e) {
        setLat(e.latlng.lat);
        setLon(e.latlng.lng);
      },
    });
    return <Marker position={[lat, lon]} />;
  }

  return (
    <div className="aqi-page">
      {/* Header */}
      <div className="aqi-header">
        <h2>Air Quality Predictions</h2>
        <p className="aqi-subtitle">Click on the map to choose location</p>
      </div>

      {/* 2D Map */}
      <div className="map-container">
        <MapContainer
          center={[lat, lon]}
          zoom={5}
          style={{ height: '400px', width: '100%' }}
          key={lat + ',' + lon}
        >
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
            attribution='Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom'
          />
          <LocationMarker />
        </MapContainer>
      </div>

      {/* Input boxes for lat/lon */}
      <div className="location-inputs">
        <div className="input-group">
          <label htmlFor="latitude">Latitude:</label>
          <input
            type="number"
            id="latitude"
            value={lat}
            onChange={(e) => setLat(parseFloat(e.target.value))}
            step="0.01"
            min="-90"
            max="90"
          />
        </div>
        <div className="input-group">
          <label htmlFor="longitude">Longitude:</label>
          <input
            type="number"
            id="longitude"
            value={lon}
            onChange={(e) => setLon(parseFloat(e.target.value))}
            step="0.01"
            min="-180"
            max="180"
          />
        </div>
      </div>

      {loading && <p>Loading forecast...</p>}
      {error && <p>Error: {error}</p>}

      {/* Forecast Cards */}
      <div className="aqi-grid-wrapper" ref={gridRef}>
        <div className="forecast-grid">
          {forecast.map((day, index) => {
            const status = getAirQualityStatus(day.pm25);
            return (
              <div
                key={day.date}
                className="forecast-card magic-bento-card"
                style={{
                  '--card-color': status.color,
                  '--glow-color': status.glow,
                  '--animation-delay': `${index * 0.1}s`,
                }}
              >
                <div className="card-spotlight"></div>
                <div className="card-content">
                  <div className="card-header">
                    <span className="status-emoji">{status.emoji}</span>
                    <div>
                      <p className="card-date">{formatDate(day.date)}</p>
                      <p className="card-status">{status.label}</p>
                    </div>
                  </div>
                  <div className="card-metrics">
                    <div className="metric">
                      <span className="metric-label">PM2.5</span>
                      <span className="metric-value">{day.pm25}</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">PM10</span>
                      <span className="metric-value">{day.pm10}</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">SO₂</span>
                      <span className="metric-value">{day.so2}</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">UV</span>
                      <span className="metric-value">{day.uvIndex}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AQI Chart */}
      {forecast.length > 0 && (
        <div className="chart-container">
          <h3 className="chart-title">AQI Trends</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={forecast}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                stroke="#cbd5e1"
              />
              <YAxis stroke="#cbd5e1" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(30, 41, 59, 0.9)',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }}
                labelFormatter={(date) => new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="pm25"
                stroke="#10b981"
                strokeWidth={3}
                name="PM2.5"
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="pm10"
                stroke="#f59e0b"
                strokeWidth={3}
                name="PM10"
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="so2"
                stroke="#ef4444"
                strokeWidth={3}
                name="SO₂"
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="uvIndex"
                stroke="#3b82f6"
                strokeWidth={3}
                name="UV Index"
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Styles */}
      <style>{`
        .aqi-page {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: #f1f5f9;
          padding: 40px 20px;
          min-height: 100vh;
        }

        .aqi-header {
          text-align: center;
          margin-bottom: 32px;
          animation: slideDown 0.8s ease-out;
        }

        .aqi-header h2 {
          color: #f1f5f9;
          font-size: 32px;
          margin: 0 0 12px 0;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .aqi-subtitle {
          color: #94a3b8;
          font-size: 14px;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 500;
        }

        .map-container {
          width: 100%;
          max-width: 1400px;
          margin-bottom: 40px;
        }

        .location-inputs {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .input-group label {
          color: #cbd5e1;
          font-size: 14px;
          font-weight: 500;
        }

        .input-group input {
          background: rgba(51, 65, 85, 0.5);
          border: 1px solid rgba(148, 163, 184, 0.3);
          border-radius: 8px;
          padding: 8px 12px;
          color: #f1f5f9;
          font-size: 14px;
          width: 120px;
          transition: border-color 0.3s ease;
        }

        .input-group input:focus {
          outline: none;
          border-color: #3b82f6;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .aqi-grid-wrapper {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
        }

        .forecast-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          grid-auto-rows: min-content;
        }

        .forecast-card {
          position: relative;
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.6) 100%);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 16px;
          padding: 24px;
          backdrop-filter: blur(20px);
          overflow: hidden;
          cursor: pointer;
          animation: cardFadeIn 0.6s ease-out forwards;
          animation-delay: var(--animation-delay, 0s);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes cardFadeIn {
          from { opacity: 0; transform: translateY(30px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .card-spotlight {
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(var(--glow-color), 0.4) 0%, rgba(var(--glow-color), 0.1) 40%, transparent 70%);
          opacity: calc(var(--glow-intensity, 0) * 0.8);
          pointer-events: none;
          filter: blur(40px);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 1;
        }

        .card-content { position: relative; z-index: 2; }

        .forecast-card:hover {
          border-color: var(--card-color);
          transform: translateY(-8px);
          box-shadow: 0 0 40px rgba(var(--glow-color), 0.3), 0 8px 32px rgba(0, 0, 0, 0.4);
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .status-emoji {
          font-size: 36px;
          filter: drop-shadow(0 0 12px rgba(var(--glow-color), 0.6));
        }

        .card-date {
          font-weight: 700;
          margin: 0;
          font-size: 15px;
          color: #f1f5f9;
          letter-spacing: -0.3px;
        }

        .card-status {
          margin: 6px 0 0 0;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.5px;
          color: var(--card-color);
        }

        .card-metrics {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .metric {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 10px;
          background: rgba(51, 65, 85, 0.3);
          border-radius: 10px;
          border-left: 3px solid var(--card-color);
          transition: all 0.3s ease;
        }

        .forecast-card:hover .metric {
          background: rgba(51, 65, 85, 0.5);
        }

        .metric-label {
          font-size: 9px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .metric-value {
          font-size: 14px;
          font-weight: 700;
          color: var(--card-color);
        }

        .chart-container {
          width: 100%;
          max-width: 1400px;
          margin: 40px auto 0 auto;
          padding: 24px;
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.6) 100%);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 16px;
          backdrop-filter: blur(20px);
          animation: chartFadeIn 0.8s ease-out;
        }

        @keyframes chartFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .chart-title {
          color: #f1f5f9;
          font-size: 24px;
          font-weight: 700;
          margin: 0 0 24px 0;
          text-align: center;
          letter-spacing: -0.5px;
        }

        @media (max-width: 768px) {
          .aqi-header h2 { font-size: 24px; }
          .forecast-card { padding: 16px; }
          .chart-container { padding: 16px; margin-top: 24px; }
          .chart-title { font-size: 20px; }
        }
      `}</style>
    </div>
  );
}

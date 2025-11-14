import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function Climate({ lat, lon }) {
  const [currentData, setCurrentData] = useState({});
  const [hourlyData, setHourlyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState({ lat: 19.0760, lng: 72.8777 });
  const [mapType, setMapType] = useState('street'); // 'street' or 'satellite'
  const gridRef = useRef(null);

  // Fetch climate data whenever lat/lon changes
  useEffect(() => {
    const fetchClimateData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${selectedLocation.lat}&longitude=${selectedLocation.lng}&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,rain,visibility&forecast_days=1&timezone=auto`
        );
        if (!response.ok) throw new Error('Failed to fetch climate data');
        const data = await response.json();

        // Process current data (latest hour)
        const latestIndex = data.hourly.time.length - 1;
        setCurrentData({
          temperature: data.hourly.temperature_2m[latestIndex],
          humidity: data.hourly.relative_humidity_2m[latestIndex],
          dewPoint: data.hourly.dew_point_2m[latestIndex],
          rain: data.hourly.rain[latestIndex],
          visibility: data.hourly.visibility[latestIndex] / 1000, // Convert to km
        });

        // Process hourly data
        const processedHourly = data.hourly.time.map((time, index) => ({
          time,
          temperature: data.hourly.temperature_2m[index],
          humidity: data.hourly.relative_humidity_2m[index],
          dewPoint: data.hourly.dew_point_2m[index],
          rain: data.hourly.rain[index],
          visibility: data.hourly.visibility[index] / 1000,
        }));
        setHourlyData(processedHourly);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchClimateData();
  }, [selectedLocation]);



  const getTrendIndicator = (data, key) => {
    if (data.length < 3) return '→';
    const last3 = data.slice(-3).map(d => d[key]);
    const avg = last3.reduce((a, b) => a + b, 0) / 3;
    const prevAvg = data.slice(-4, -1).reduce((a, b) => a + b, 0) / 3;
    if (avg > prevAvg + 0.1) return '↑';
    if (avg < prevAvg - 0.1) return '↓';
    return '→';
  };

  const getDailySummary = () => {
    if (hourlyData.length === 0) return {};
    const temperatures = hourlyData.map(d => d.temperature);
    const humidities = hourlyData.map(d => d.humidity);
    const rains = hourlyData.map(d => d.rain);
    const visibilities = hourlyData.map(d => d.visibility);

    return {
      maxTemp: Math.max(...temperatures),
      minTemp: Math.min(...temperatures),
      avgHumidity: humidities.reduce((a, b) => a + b, 0) / humidities.length,
      totalRain: rains.reduce((a, b) => a + b, 0),
      bestVisibility: Math.max(...visibilities),
    };
  };

  const summary = getDailySummary();

  // Map click handler to update lat/lon
  function LocationMarker() {
    useMapEvents({
      click(e) {
        setSelectedLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
      },
    });
    return <Marker position={[selectedLocation.lat, selectedLocation.lng]} />;
  }

  return (
    <div className="climate-page">
      {/* Header */}
      <div className="aqi-header">
        <h2>Climate Predictions</h2>
        <p className="aqi-subtitle">Click on the map to choose location</p>
      </div>

      {/* 2D Map */}
      <div className="map-container">
        <div className="map-toggle">
          <button
            className={`toggle-btn ${mapType === 'street' ? 'active' : ''}`}
            onClick={() => setMapType('street')}
          >
            🗺️ Street
          </button>
          <button
            className={`toggle-btn ${mapType === 'satellite' ? 'active' : ''}`}
            onClick={() => setMapType('satellite')}
          >
            🛰️ Satellite
          </button>
        </div>
        <MapContainer
          center={[selectedLocation.lng, selectedLocation.lat]}
          zoom={5}
          style={{ height: '400px', width: '100%' }}
          key={selectedLocation.lat + ',' + selectedLocation.lng}
        >
          <TileLayer
            url={
              mapType === 'satellite'
                ? 'https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.png'
                : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'
            }
            attribution={
              mapType === 'satellite'
                ? '&copy; CNES, Distribution Airbus DS, © Airbus DS, © PlanetObserver (Contains Copernicus Data) | &copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                : 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom'
            }
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
            value={selectedLocation.lat}
            onChange={(e) => setSelectedLocation({ ...selectedLocation, lat: parseFloat(e.target.value) })}
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
            value={selectedLocation.lng}
            onChange={(e) => setSelectedLocation({ ...selectedLocation, lng: parseFloat(e.target.value) })}
            step="0.01"
            min="-180"
            max="180"
          />
        </div>
      </div>

      {loading && <p>Loading climate data...</p>}
      {error && <p>Error: {error}</p>}

      {/* Current Climate Cards */}
      {!loading && !error && Object.keys(currentData).length > 0 && (
        <div className="aqi-grid-wrapper">
          <div className="forecast-grid">
            <div className="forecast-card magic-bento-card" style={{ '--animation-delay': '0s' }}>
              <div className="card-spotlight"></div>
              <div className="card-content">
                <div className="card-header">
                  <span className="status-emoji">🌡️</span>
                  <div>
                    <p className="card-date">Temperature</p>
                    <p className="card-status">{getTrendIndicator(hourlyData, 'temperature')}</p>
                  </div>
                </div>
                <div className="card-metrics">
                  <div className="metric">
                    <span className="metric-label">Current</span>
                    <span className="metric-value">{currentData.temperature.toFixed(1)}°C</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="forecast-card magic-bento-card" style={{ '--animation-delay': '0.1s' }}>
              <div className="card-spotlight"></div>
              <div className="card-content">
                <div className="card-header">
                  <span className="status-emoji">💧</span>
                  <div>
                    <p className="card-date">Humidity</p>
                    <p className="card-status">{getTrendIndicator(hourlyData, 'humidity')}</p>
                  </div>
                </div>
                <div className="card-metrics">
                  <div className="metric">
                    <span className="metric-label">Current</span>
                    <span className="metric-value">{currentData.humidity}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="forecast-card magic-bento-card" style={{ '--animation-delay': '0.2s' }}>
              <div className="card-spotlight"></div>
              <div className="card-content">
                <div className="card-header">
                  <span className="status-emoji">🌫️</span>
                  <div>
                    <p className="card-date">Dew Point</p>
                    <p className="card-status">→</p>
                  </div>
                </div>
                <div className="card-metrics">
                  <div className="metric">
                    <span className="metric-label">Current</span>
                    <span className="metric-value">{currentData.dewPoint.toFixed(1)}°C</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="forecast-card magic-bento-card" style={{ '--animation-delay': '0.3s' }}>
              <div className="card-spotlight"></div>
              <div className="card-content">
                <div className="card-header">
                  <span className="status-emoji">🌧️</span>
                  <div>
                    <p className="card-date">Rain</p>
                    <p className="card-status">{getTrendIndicator(hourlyData, 'rain')}</p>
                  </div>
                </div>
                <div className="card-metrics">
                  <div className="metric">
                    <span className="metric-label">Current</span>
                    <span className="metric-value">{currentData.rain.toFixed(1)}mm</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="forecast-card magic-bento-card" style={{ '--animation-delay': '0.4s' }}>
              <div className="card-spotlight"></div>
              <div className="card-content">
                <div className="card-header">
                  <span className="status-emoji">👁️</span>
                  <div>
                    <p className="card-date">Visibility</p>
                    <p className="card-status">→</p>
                  </div>
                </div>
                <div className="card-metrics">
                  <div className="metric">
                    <span className="metric-label">Current</span>
                    <span className="metric-value">{currentData.visibility.toFixed(1)}km</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      {hourlyData.length > 0 && (
        <>
          {/* Temperature Chart */}
          <div className="chart-container">
            <h3 className="chart-title">Temperature Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" />
                <XAxis
                  dataKey="time"
                  tickFormatter={(time) => new Date(time).toLocaleTimeString('en-US', { hour: '2-digit' })}
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
                  labelFormatter={(time) => new Date(time).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit' })}
                />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="#10b981"
                  strokeWidth={3}
                  name="Temperature (°C)"
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Humidity Chart */}
          <div className="chart-container">
            <h3 className="chart-title">Humidity Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" />
                <XAxis
                  dataKey="time"
                  tickFormatter={(time) => new Date(time).toLocaleTimeString('en-US', { hour: '2-digit' })}
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
                  labelFormatter={(time) => new Date(time).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit' })}
                />
                <Line
                  type="monotone"
                  dataKey="humidity"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  name="Humidity (%)"
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Visibility Chart */}
          <div className="chart-container">
            <h3 className="chart-title">Visibility Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" />
                <XAxis
                  dataKey="time"
                  tickFormatter={(time) => new Date(time).toLocaleTimeString('en-US', { hour: '2-digit' })}
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
                  labelFormatter={(time) => new Date(time).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit' })}
                />
                <Line
                  type="monotone"
                  dataKey="visibility"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  name="Visibility (km)"
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Rainfall Chart */}
          <div className="chart-container">
            <h3 className="chart-title">Rainfall Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" />
                <XAxis
                  dataKey="time"
                  tickFormatter={(time) => new Date(time).toLocaleTimeString('en-US', { hour: '2-digit' })}
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
                  labelFormatter={(time) => new Date(time).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit' })}
                />
                <Line
                  type="monotone"
                  dataKey="rain"
                  stroke="#ef4444"
                  strokeWidth={3}
                  name="Rain (mm)"
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Dew Point Bar Chart */}
          <div className="chart-container">
            <h3 className="chart-title">Dew Point (Hourly)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" />
                <XAxis
                  dataKey="time"
                  tickFormatter={(time) => new Date(time).toLocaleTimeString('en-US', { hour: '2-digit' })}
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
                  labelFormatter={(time) => new Date(time).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit' })}
                />
                <Bar dataKey="dewPoint" fill="#8b5cf6" name="Dew Point (°C)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Daily Summary */}
          <div className="chart-container">
            <h3 className="chart-title">Daily Summary</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div className="metric" style={{ background: 'rgba(51, 65, 85, 0.3)', borderRadius: '10px', padding: '15px', borderLeft: '3px solid #10b981' }}>
                <span className="metric-label">Max Temperature</span>
                <span className="metric-value">{summary.maxTemp?.toFixed(1)}°C</span>
              </div>
              <div className="metric" style={{ background: 'rgba(51, 65, 85, 0.3)', borderRadius: '10px', padding: '15px', borderLeft: '3px solid #10b981' }}>
                <span className="metric-label">Min Temperature</span>
                <span className="metric-value">{summary.minTemp?.toFixed(1)}°C</span>
              </div>
              <div className="metric" style={{ background: 'rgba(51, 65, 85, 0.3)', borderRadius: '10px', padding: '15px', borderLeft: '3px solid #3b82f6' }}>
                <span className="metric-label">Avg Humidity</span>
                <span className="metric-value">{summary.avgHumidity?.toFixed(1)}%</span>
              </div>
              <div className="metric" style={{ background: 'rgba(51, 65, 85, 0.3)', borderRadius: '10px', padding: '15px', borderLeft: '3px solid #ef4444' }}>
                <span className="metric-label">Total Rainfall</span>
                <span className="metric-value">{summary.totalRain?.toFixed(1)}mm</span>
              </div>
              <div className="metric" style={{ background: 'rgba(51, 65, 85, 0.3)', borderRadius: '10px', padding: '15px', borderLeft: '3px solid #f59e0b' }}>
                <span className="metric-label">Best Visibility</span>
                <span className="metric-value">{summary.bestVisibility?.toFixed(1)}km</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Styles */}
      <style>{`
        .climate-page {
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

        .search-map-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          margin-bottom: 24px;
          width: 100%;
          max-width: 800px;
        }

        .map-container {
          position: relative;
          width: 100%;
          height: 400px;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(148, 163, 184, 0.2);
          backdrop-filter: blur(20px);
        }

        .map-toggle {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 1000;
          display: flex;
          gap: 5px;
          background: rgba(30, 41, 59, 0.8);
          border-radius: 8px;
          padding: 5px;
          backdrop-filter: blur(10px);
        }

        .toggle-btn {
          background: none;
          border: none;
          color: #94a3b8;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .toggle-btn.active {
          background: #3b82f6;
          color: #f1f5f9;
        }

        .toggle-btn:hover {
          background: rgba(59, 130, 246, 0.3);
          color: #f1f5f9;
        }

        .location-inputs {
          display: flex;
          gap: 20px;
          margin: 20px 0;
          justify-content: center;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .input-group label {
          color: #94a3b8;
          font-size: 14px;
          font-weight: 500;
        }

        .input-group input {
          padding: 8px 12px;
          border: 1px solid rgba(148, 163, 184, 0.3);
          border-radius: 8px;
          background: rgba(30, 41, 59, 0.6);
          color: #f1f5f9;
          font-size: 14px;
          width: 120px;
        }

        .input-group input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
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
          background: radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0.1) 40%, transparent 70%);
          opacity: 0.8;
          pointer-events: none;
          filter: blur(40px);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 1;
        }

        .card-content { position: relative; z-index: 2; }

        .forecast-card:hover {
          border-color: #3b82f6;
          transform: translateY(-8px);
          box-shadow: 0 0 40px rgba(59, 130, 246, 0.3), 0 8px 32px rgba(0, 0, 0, 0.4);
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .status-emoji {
          font-size: 36px;
          filter: drop-shadow(0 0 12px rgba(59, 130, 246, 0.6));
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
          color: #3b82f6;
        }

        .card-metrics {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }

        .metric {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 10px;
          background: rgba(51, 65, 85, 0.3);
          border-radius: 10px;
          border-left: 3px solid #3b82f6;
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
          color: #3b82f6;
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



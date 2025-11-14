import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
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
  const [hourlyData, setHourlyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState({ lat: 19.0760, lng: 72.8777 });
  const [mapType, setMapType] = useState('street'); // 'street' or 'satellite'
  const [locationName, setLocationName] = useState('Click on the map to choose location');
  const [searchType, setSearchType] = useState('location'); // 'location' or 'coordinates'
  const [searchInput, setSearchInput] = useState('');
  const [latInput, setLatInput] = useState('');
  const [lonInput, setLonInput] = useState('');
  const [selectedDay, setSelectedDay] = useState(null);
  const [forecast, setForecast] = useState([]);
  const gridRef = useRef(null);

  // Get user's current location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSelectedLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        (error) => {
          console.warn('Geolocation error:', error.message);
          // Keep default location if geolocation fails
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    } else {
      console.warn('Geolocation is not supported by this browser');
    }
  }, []);

  // Fetch location name using reverse geocoding with high granularity
  useEffect(() => {
    const fetchLocationName = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${selectedLocation.lat}&lon=${selectedLocation.lng}&zoom=18&addressdetails=1`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch location name');
        }
        const data = await response.json();
        
        // Build precise location string from address components
        let locationParts = [];
        
        if (data.address) {
          const addr = data.address;
          
          // Add specific place name (building, attraction, etc.)
          if (addr.tourism) locationParts.push(addr.tourism);
          else if (addr.amenity) locationParts.push(addr.amenity);
          else if (addr.building) locationParts.push(addr.building);
          else if (addr.shop) locationParts.push(addr.shop);
          else if (addr.office) locationParts.push(addr.office);
          
          // Add road/street
          if (addr.road) locationParts.push(addr.road);
          else if (addr.pedestrian) locationParts.push(addr.pedestrian);
          
          // Add neighborhood/suburb
          if (addr.neighbourhood) locationParts.push(addr.neighbourhood);
          else if (addr.suburb) locationParts.push(addr.suburb);
          else if (addr.quarter) locationParts.push(addr.quarter);
          
          // Add city/town
          if (addr.city) locationParts.push(addr.city);
          else if (addr.town) locationParts.push(addr.town);
          else if (addr.village) locationParts.push(addr.village);
          else if (addr.municipality) locationParts.push(addr.municipality);
          
          // Add state/region
          if (addr.state) locationParts.push(addr.state);
          
          // Add country
          if (addr.country) locationParts.push(addr.country);
        }
        
        // Format location name
        if (locationParts.length > 0) {
          const address = locationParts.slice(0, 4).join(', ');
          setLocationName(`📍 ${address} (Lat: ${selectedLocation.lat.toFixed(3)}, Lng: ${selectedLocation.lng.toFixed(3)})`);
        } else if (data.display_name) {
          const parts = data.display_name.split(',').slice(0, 3);
          setLocationName(`📍 ${parts.join(',')} (Lat: ${selectedLocation.lat.toFixed(3)}, Lng: ${selectedLocation.lng.toFixed(3)})`);
        } else {
          setLocationName(`📍 Lat ${selectedLocation.lat.toFixed(3)}, Lon ${selectedLocation.lng.toFixed(3)}`);
        }
      } catch (err) {
        console.error('Reverse geocoding error:', err);
        setLocationName(`📍 Lat ${selectedLocation.lat.toFixed(3)}, Lon ${selectedLocation.lng.toFixed(3)}`);
      }
    };
    fetchLocationName();
  }, [selectedLocation.lat, selectedLocation.lng]);

  // Fetch climate data whenever lat/lon changes
  useEffect(() => {
    const fetchClimateData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${selectedLocation.lat}&longitude=${selectedLocation.lng}&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,wind_speed_10m,wind_direction_10m,rain&forecast_days=5&timezone=auto`
        );
        if (!response.ok) throw new Error('Failed to fetch climate data');
        const data = await response.json();

        const dailyForecasts = processDailyAverages(data);
        setForecast(dailyForecasts);

        // Process hourly data
        const hourly = data.hourly;
        const processedHourly = hourly.time.map((time, index) => ({
          time,
          temperature: hourly.temperature_2m[index],
          humidity: hourly.relative_humidity_2m[index],
          dewPoint: hourly.dew_point_2m[index],
          windSpeed: hourly.wind_speed_10m[index],
          windDirection: hourly.wind_direction_10m[index],
          rain: hourly.rain[index],
        }));
        setHourlyData(processedHourly);

        // Set selected day to first day if not set
        if (!selectedDay && dailyForecasts.length > 0) {
          setSelectedDay(dailyForecasts[0].date);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchClimateData();
  }, [selectedLocation.lat, selectedLocation.lng, selectedDay]);



  const processDailyAverages = (data) => {
    const { hourly } = data;
    const times = hourly.time;
    const temperature = hourly.temperature_2m;
    const humidity = hourly.relative_humidity_2m;
    const dewPoint = hourly.dew_point_2m;
    const windSpeed = hourly.wind_speed_10m;
    const windDirection = hourly.wind_direction_10m;
    const rain = hourly.rain;

    const dailyData = {};
    times.forEach((time, index) => {
      const date = time.split('T')[0];
      if (!dailyData[date]) dailyData[date] = { temperature: [], humidity: [], dewPoint: [], windSpeed: [], windDirection: [], rain: [] };
      dailyData[date].temperature.push(temperature[index]);
      dailyData[date].humidity.push(humidity[index]);
      dailyData[date].dewPoint.push(dewPoint[index]);
      dailyData[date].windSpeed.push(windSpeed[index]);
      dailyData[date].windDirection.push(windDirection[index]);
      dailyData[date].rain.push(rain[index]);
    });

    return Object.entries(dailyData).map(([date, values]) => ({
      date,
      temperature: (values.temperature.reduce((a, b) => a + b, 0) / values.temperature.length).toFixed(1),
      humidity: (values.humidity.reduce((a, b) => a + b, 0) / values.humidity.length).toFixed(1),
      dewPoint: (values.dewPoint.reduce((a, b) => a + b, 0) / values.dewPoint.length).toFixed(1),
      windSpeed: (values.windSpeed.reduce((a, b) => a + b, 0) / values.windSpeed.length).toFixed(1),
      windDirection: (values.windDirection.reduce((a, b) => a + b, 0) / values.windDirection.length).toFixed(0),
      rain: (values.rain.reduce((a, b) => a + b, 0)).toFixed(2),
    }));
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
        setSelectedLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
      },
    });
    return <Marker position={[selectedLocation.lat, selectedLocation.lng]} />;
  }

  // Handle search submission
  const handleSearch = async () => {
    if (searchType === 'location') {
      if (!searchInput.trim()) return;
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchInput)}&format=json&limit=1`
        );
        const data = await response.json();
        if (data && data.length > 0) {
          setSelectedLocation({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
          setSearchInput('');
        } else {
          alert('Location not found. Please try a different search term.');
        }
      } catch (err) {
        console.error('Geocoding error:', err);
        alert('Error searching for location. Please try again.');
      }
    } else {
      // Coordinates search
      const latitude = parseFloat(latInput);
      const longitude = parseFloat(lonInput);
      if (!isNaN(latitude) && !isNaN(longitude)) {
        if (latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180) {
          setSelectedLocation({ lat: latitude, lng: longitude });
          setLatInput('');
          setLonInput('');
        } else {
          alert('Please enter valid coordinates (Latitude: -90 to 90, Longitude: -180 to 180)');
        }
      } else {
        alert('Please enter valid numeric coordinates');
      }
    }
  };

  return (
    <div className="climate-page">
      {/* Header */}
      <div className="aqi-header">
        <h2>Climate Predictions</h2>
        <p className="aqi-subtitle">{locationName}</p>
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

      {/* Search Bar */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '20px',
        border: '1px solid rgba(26, 216, 205, 0.2)'
      }}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          {/* Search Type Dropdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>Search By:</label>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              style={{
                padding: '10px 15px',
                borderRadius: '8px',
                border: '1px solid rgba(26, 216, 205, 0.3)',
                background: 'rgba(16, 24, 32, 0.8)',
                color: '#e6f0f0',
                fontSize: '0.95rem',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="location">Location Name</option>
              <option value="coordinates">Lat/Long</option>
            </select>
          </div>

          {/* Search Input Fields */}
          {searchType === 'location' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '200px' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>Location:</label>
              <input
                type="text"
                placeholder="Enter city, address, or place..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                style={{
                  padding: '10px 15px',
                  borderRadius: '8px',
                  border: '1px solid rgba(26, 216, 205, 0.3)',
                  background: 'rgba(16, 24, 32, 0.8)',
                  color: '#e6f0f0',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '150px' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>Latitude:</label>
                <input
                  type="number"
                  placeholder="e.g., 40.7128"
                  value={latInput}
                  onChange={(e) => setLatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  step="0.0001"
                  style={{
                    padding: '10px 15px',
                    borderRadius: '8px',
                    border: '1px solid rgba(26, 216, 205, 0.3)',
                    background: 'rgba(16, 24, 32, 0.8)',
                    color: '#e6f0f0',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '150px' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>Longitude:</label>
                <input
                  type="number"
                  placeholder="e.g., -74.0060"
                  value={lonInput}
                  onChange={(e) => setLonInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  step="0.0001"
                  style={{
                    padding: '10px 15px',
                    borderRadius: '8px',
                    border: '1px solid rgba(26, 216, 205, 0.3)',
                    background: 'rgba(16, 24, 32, 0.8)',
                    color: '#e6f0f0',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                />
              </div>
            </>
          )}

          {/* Search Button */}
          <button
            onClick={handleSearch}
            style={{
              padding: '10px 30px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, var(--accent), #00c6ff)',
              color: '#0b0b0f',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(26, 216, 205, 0.3)'
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            🔍 Search
          </button>
        </div>
      </div>

      {loading && <p>Loading climate data...</p>}
      {error && <p>Error: {error}</p>}

      {/* Forecast Cards */}
      <div className="aqi-grid-wrapper" ref={gridRef}>
        <div className="forecast-grid">
          {forecast.map((day, index) => {
            return (
              <div
                key={day.date}
                className={`forecast-card magic-bento-card ${selectedDay === day.date ? 'selected' : ''}`}
                style={{
                  '--card-color': '#10b981',
                  '--glow-color': '16, 185, 129',
                  '--animation-delay': `${index * 0.1}s`,
                }}
                onClick={() => setSelectedDay(day.date)}
              >
                <div className="card-spotlight"></div>
                <div className="card-content">
                  <div className="card-header">
                    <span className="status-emoji">🌤️</span>
                    <div>
                      <p className="card-date">{formatDate(day.date)}</p>
                      <p className="card-status">{day.temperature}°C</p>
                    </div>
                  </div>
                  
                  {/* Metrics - Two Columns */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px'
                  }}>
                    <div className="metric">
                      <span className="metric-label">Temp</span>
                      <span className="metric-value">{day.temperature}°C</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Humidity</span>
                      <span className="metric-value">{day.humidity}%</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Dew Point</span>
                      <span className="metric-value">{day.dewPoint}°C</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Wind</span>
                      <span className="metric-value">{day.windSpeed} km/h</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Direction</span>
                      <span className="metric-value">{day.windDirection}°</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Rain</span>
                      <span className="metric-value">{day.rain} mm</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hourly Chart for Selected Day */}
      {selectedDay && hourlyData.length > 0 && (
        <div className="chart-container">
          <h3 className="chart-title">Hourly Weather for {formatDate(selectedDay)}</h3>
          <ResponsiveContainer width="100%" height={500}>
            <LineChart 
              data={hourlyData.filter(item => item.time.startsWith(selectedDay))}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.3} />
              <XAxis
                dataKey="time"
                tickFormatter={(time) => new Date(time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                stroke="#cbd5e1"
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="#cbd5e1"
                tick={{ fontSize: 12 }}
                label={{ value: 'Values', angle: -90, position: 'insideLeft', style: { fill: '#cbd5e1', fontSize: 12 } }}
                domain={[0, 'auto']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(30, 41, 59, 0.95)',
                  border: '1px solid rgba(148, 163, 184, 0.5)',
                  borderRadius: '10px',
                  color: '#f1f5f9',
                  padding: '12px'
                }}
                labelFormatter={(time) => new Date(time).toLocaleString('en-US', { weekday: 'long', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                itemStyle={{ fontSize: '13px', padding: '3px 0' }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
                iconSize={20}
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
              <Line
                type="monotone"
                dataKey="humidity"
                stroke="#3b82f6"
                strokeWidth={3}
                name="Humidity (%)"
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="dewPoint"
                stroke="#8b5cf6"
                strokeWidth={3}
                name="Dew Point (°C)"
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="windSpeed"
                stroke="#f59e0b"
                strokeWidth={3}
                name="Wind Speed (km/h)"
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="rain"
                stroke="#06b6d4"
                strokeWidth={3}
                name="Rain (mm)"
                dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#06b6d4', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Daily Trends Chart */}
      {forecast.length > 0 && (
        <div className="chart-container">
          <h3 className="chart-title">Daily Weather Trends</h3>
          <ResponsiveContainer width="100%" height={500}>
            <LineChart data={forecast} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.3} />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                stroke="#cbd5e1"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="#cbd5e1" 
                tick={{ fontSize: 12 }}
                label={{ value: 'Daily Average', angle: -90, position: 'insideLeft', style: { fill: '#cbd5e1', fontSize: 12 } }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(30, 41, 59, 0.95)',
                  border: '1px solid rgba(148, 163, 184, 0.5)',
                  borderRadius: '10px',
                  color: '#f1f5f9',
                  padding: '12px'
                }}
                labelFormatter={(date) => new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                itemStyle={{ fontSize: '13px', padding: '3px 0' }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
                iconSize={20}
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
              <Line
                type="monotone"
                dataKey="humidity"
                stroke="#3b82f6"
                strokeWidth={3}
                name="Humidity (%)"
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="dewPoint"
                stroke="#8b5cf6"
                strokeWidth={3}
                name="Dew Point (°C)"
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="windSpeed"
                stroke="#f59e0b"
                strokeWidth={3}
                name="Wind Speed (km/h)"
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="rain"
                stroke="#06b6d4"
                strokeWidth={3}
                name="Rain (mm)"
                dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#06b6d4', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
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
          margin-bottom: 40px;
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



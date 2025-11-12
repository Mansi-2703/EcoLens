import React, { useEffect, useState } from 'react';
import { getClimateData } from '../../services/climateService';

export default function Climate() {
  const [climateData, setClimateData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [coordinates, setCoordinates] = useState({ lat: 20, lon: 0 });

  useEffect(() => {
    // Get user's location or use default
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoordinates({ lat: latitude, lon: longitude });
          fetchClimate(latitude, longitude);
        },
        (error) => {
          console.warn('Geolocation error:', error);
          // Use default location
          fetchClimate(coordinates.lat, coordinates.lon);
        }
      );
    } else {
      fetchClimate(coordinates.lat, coordinates.lon);
    }
  }, []);

  const fetchClimate = async (lat, lon) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getClimateData(lat, lon);
      setClimateData(data);
    } catch (err) {
      console.error('Error fetching climate data:', err);
      setError('Failed to fetch climate data');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = (e) => {
    e.preventDefault();
    const lat = parseFloat(e.target.lat.value);
    const lon = parseFloat(e.target.lon.value);
    if (!isNaN(lat) && !isNaN(lon)) {
      setCoordinates({ lat, lon });
      fetchClimate(lat, lon);
    }
  };

  return (
    <div className="page predictions-page climate-page">
      <h2>Climate Predictions</h2>
      
      {/* Location Input */}
      <form onSubmit={handleLocationChange} style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '10px' }}>
          Latitude:
          <input
            type="number"
            name="lat"
            step="0.0001"
            defaultValue={coordinates.lat}
            style={{ marginLeft: '5px', padding: '5px', width: '120px' }}
          />
        </label>
        <label style={{ marginRight: '10px' }}>
          Longitude:
          <input
            type="number"
            name="lon"
            step="0.0001"
            defaultValue={coordinates.lon}
            style={{ marginLeft: '5px', padding: '5px', width: '120px' }}
          />
        </label>
        <button type="submit" style={{ padding: '5px 15px' }}>Fetch Climate Data</button>
      </form>

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Fetching climate data...</p>
        </div>
      )}

      {error && (
        <div className="error" style={{ color: 'red', padding: '10px', background: 'rgba(255,0,0,0.1)', borderRadius: '8px' }}>
          {error}
        </div>
      )}

      {climateData && !loading && (
        <div className="climate-data">
          <div className="climate-summary" style={{ 
            background: 'rgba(255,255,255,0.05)', 
            padding: '20px', 
            borderRadius: '12px',
            marginBottom: '20px'
          }}>
            <h3>Current Weather Conditions</h3>
            <p><strong>Location:</strong> {climateData.climate.coordinates.latitude.toFixed(3)}°, {climateData.climate.coordinates.longitude.toFixed(3)}°</p>
            <p><strong>Elevation:</strong> {climateData.climate.coordinates.elevation ? `${climateData.climate.coordinates.elevation}m` : 'N/A'}</p>
            <p><strong>Timezone:</strong> {climateData.climate.coordinates.timezone}</p>
            
            {climateData.currentWeather && (
              <div style={{ 
                marginTop: '20px', 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px'
              }}>
                <div style={{ 
                  background: 'rgba(26, 216, 205, 0.1)', 
                  padding: '15px', 
                  borderRadius: '8px',
                  borderLeft: '4px solid var(--accent)'
                }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--muted)' }}>Temperature</h4>
                  <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent)' }}>
                    {climateData.currentWeather.temperature !== null ? `${climateData.currentWeather.temperature}°C` : 'N/A'}
                  </p>
                </div>

                <div style={{ 
                  background: 'rgba(26, 216, 205, 0.1)', 
                  padding: '15px', 
                  borderRadius: '8px',
                  borderLeft: '4px solid var(--accent)'
                }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--muted)' }}>Humidity</h4>
                  <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent)' }}>
                    {climateData.currentWeather.humidity !== null ? `${climateData.currentWeather.humidity}%` : 'N/A'}
                  </p>
                </div>

                <div style={{ 
                  background: 'rgba(26, 216, 205, 0.1)', 
                  padding: '15px', 
                  borderRadius: '8px',
                  borderLeft: '4px solid var(--accent)'
                }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--muted)' }}>Wind Speed</h4>
                  <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent)' }}>
                    {climateData.currentWeather.windSpeed !== null ? `${climateData.currentWeather.windSpeed} km/h` : 'N/A'}
                  </p>
                </div>

                <div style={{ 
                  background: 'rgba(26, 216, 205, 0.1)', 
                  padding: '15px', 
                  borderRadius: '8px',
                  borderLeft: '4px solid var(--accent)'
                }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--muted)' }}>Wind Direction</h4>
                  <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent)' }}>
                    {climateData.currentWeather.windDirection !== null ? `${climateData.currentWeather.windDirection}°` : 'N/A'}
                  </p>
                </div>

                <div style={{ 
                  background: 'rgba(26, 216, 205, 0.1)', 
                  padding: '15px', 
                  borderRadius: '8px',
                  borderLeft: '4px solid var(--accent)'
                }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--muted)' }}>Rain</h4>
                  <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent)' }}>
                    {climateData.currentWeather.rain !== null ? `${climateData.currentWeather.rain} mm` : '0 mm'}
                  </p>
                </div>

                {climateData.currentWeather.time && (
                  <div style={{ 
                    background: 'rgba(26, 216, 205, 0.1)', 
                    padding: '15px', 
                    borderRadius: '8px',
                    borderLeft: '4px solid var(--accent)'
                  }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--muted)' }}>Last Updated</h4>
                    <p style={{ margin: 0, fontSize: '1rem', color: 'var(--accent)' }}>
                      {new Date(climateData.currentWeather.time).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


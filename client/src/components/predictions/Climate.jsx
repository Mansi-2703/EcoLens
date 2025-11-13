import React, { useState } from 'react';
import MapLibreMap from './MapLibreMap';
import SearchBar from './SearchBar';
import ForecastPanel from './ForecastPanel';
import HeatmapLayer from './HeatmapLayer';

export default function Climate() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [currentHour, setCurrentHour] = useState(0);
  const [heatmapVisible, setHeatmapVisible] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
  };

  const handleSearch = (location) => {
    setSelectedLocation(location);
  };

  const toggleHeatmap = () => {
    setHeatmapVisible(!heatmapVisible);
  };

  return (
    <div className="page predictions-page climate-page" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header with search and controls */}
      <div style={{
        padding: '20px',
        background: 'rgba(0, 0, 0, 0)',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <h2 style={{ margin: 0 }}>Climate Predictions</h2>
        <SearchBar onSearch={handleSearch} />
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label>
            <input
              type="checkbox"
              checked={heatmapVisible}
              onChange={toggleHeatmap}
            />
            Show Heatmap
          </label>
          {forecastData && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label>Hour: {currentHour}</label>
              <input
                type="range"
                min="0"
                max="23"
                value={currentHour}
                onChange={(e) => setCurrentHour(parseInt(e.target.value))}
                style={{ width: '100px' }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex' }}>
        {/* Map */}
        <div style={{ flex: 2, position: 'relative' }}>
          <MapLibreMap
            onLocationSelect={handleLocationSelect}
            selectedLocation={selectedLocation}
            onMapReady={setMapInstance}
          />
          {heatmapVisible && forecastData && mapInstance && (
            <HeatmapLayer
              map={mapInstance}
              forecastData={forecastData}
              currentHour={currentHour}
              visible={heatmapVisible}
            />
          )}
        </div>

        {/* Forecast Panel */}
        <div style={{
          flex: 1,
          background: 'black',
          borderLeft: '1px solid #ddd',
          overflow: 'hidden'
        }}>
          <ForecastPanel
            location={selectedLocation}
            onForecastData={setForecastData}
          />
        </div>
      </div>
    </div>
  );
}



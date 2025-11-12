import React, { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import { getAQIData } from '../services/aqiService';
import citiesData from '../data/world-cities.json'; // 🏙 Your cities dataset

const GlobeComponent = ({ onPick }) => {
  const globeRef = useRef();
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [aqiData, setAqiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState([]); // 🆕 for city hover tooltips

  // 🏙 Load city dataset once
  useEffect(() => {
    const cityList = citiesData
      .filter(city => city.lat && city.lng)
      .map(city => ({
        lat: parseFloat(city.lat),
        lng: parseFloat(city.lng),
        city: city.city,
        country: city.country
      }))
      .slice(0, 1000); // limit for performance
    setCities(cityList);
  }, []);

  // 🌐 Get user's location + fetch AQI
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setSelectedCoords({ lat: latitude, lng: longitude });
          fetchAQI(latitude, longitude);
        },
        (error) => {
          console.warn('Geolocation error:', error);
          // Default location if geolocation fails
          setSelectedCoords({ lat: 20, lng: 0 });
          fetchAQI(20, 0);
        }
      );
    } else {
      // Default if geolocation not supported
      setSelectedCoords({ lat: 20, lng: 0 });
      fetchAQI(20, 0);
    }
  }, []);

  // 🧭 AQI fetcher
  const fetchAQI = async (lat, lng) => {
    setLoading(true);
    try {
      const data = await getAQIData(lat, lng);
      setAqiData(data);
    } catch (error) {
      console.error('Error fetching AQI data:', error);
      setAqiData(null);
    } finally {
      setLoading(false);
    }
  };

  // 🖱 Handle globe click → show red dot + fetch AQI
  const handleGlobeClick = (point) => {
    const { lat, lng } = point;
    setSelectedCoords({ lat, lng });
    fetchAQI(lat, lng);
    if (onPick) onPick(lat, lng);
  };

  // 🔴 Red pinpoint
  const pointsData = selectedCoords
    ? [{ lat: selectedCoords.lat, lng: selectedCoords.lng, size: 0.5, color: 'red' }]
    : [];

  return (
    <div style={{ position: 'relative', width: '100%', height: '500px' }}>
      <Globe
        ref={globeRef}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        pointsData={pointsData}
        pointLat="lat"
        pointLng="lng"
        pointColor="color"
        pointAltitude={0.01}
        pointRadius="size"
        onGlobeClick={handleGlobeClick}
        width={800}
        height={500}

        // 🏙 City hover tooltips (added feature)
        labelsData={cities}
        labelLat="lat"
        labelLng="lng"
        labelText={() => ""} // no visible city name text
        labelDotRadius={0.1}
        labelLabel={(d) =>
          `<div style="font-size:13px;line-height:1.4;">
            <b>${d.city}</b><br/>${d.country}
          </div>`
        }
      />

      {/* 🌀 Loading indicator */}
      {loading && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '5px',
          }}
        >
          Loading AQI data...
        </div>
      )}

      {/* 📦 AQI info box */}
      {selectedCoords && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            maxWidth: '300px',
            maxHeight: '400px',
            overflowY: 'auto',
          }}
        >
          <div><strong>Coordinates:</strong></div>
          <div>Lat: {selectedCoords.lat.toFixed(3)}</div>
          <div>Lng: {selectedCoords.lng.toFixed(3)}</div>

          {aqiData && aqiData.openMeteo && aqiData.openMeteo.latestAQI !== null && (
            <div><strong>AQI (US):</strong> {aqiData.openMeteo.latestAQI}</div>
          )}

          {aqiData && aqiData.openMeteo && aqiData.openMeteo.hourly && (
            <div style={{ marginTop: '10px' }}>
              <div><strong>Latest Parameters (Open-Meteo):</strong></div>
              {(() => {
                const hourly = aqiData.openMeteo.hourly;
                const latestIndex = hourly.time.length - 1;
                return (
                  <div>
                    {hourly.pm10[latestIndex] !== null && <div>PM10: {hourly.pm10[latestIndex]} µg/m³</div>}
                    {hourly.pm2_5[latestIndex] !== null && <div>PM2.5: {hourly.pm2_5[latestIndex]} µg/m³</div>}
                  </div>
                );
              })()}
            </div>
          )}

          {aqiData && aqiData.openAQ && aqiData.openAQ.results && aqiData.openAQ.results.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              <div><strong>Nearby Stations (OpenAQ):</strong></div>
              {aqiData.openAQ.results.slice(0, 2).map((station, idx) => (
                <div
                  key={idx}
                  style={{
                    marginTop: '5px',
                    fontSize: '12px',
                    borderTop: '1px solid #555',
                    paddingTop: '5px',
                  }}
                >
                  <div><strong>{station.location}</strong></div>
                  {station.measurements && station.measurements.slice(0, 3).map((meas, midx) => (
                    <div key={midx}>
                      {meas.parameter.toUpperCase()}: {meas.value} {meas.unit}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobeComponent;
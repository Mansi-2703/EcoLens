import React, { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import { getAQIData } from '../services/aqiService';
import { getClimateData } from '../services/climateService';
import { getMarineData } from '../services/marineService';
import citiesData from '../data/world-cities.json'; // 🏙 Your cities dataset
import LoaderOverlay from './ui/LoaderOverlay';
import AQIInfoBox from './ui/AQIInfoBox';
import WeatherInfoBox from './ui/WeatherInfoBox';
import MarineInfoBox from './ui/MarineInfoBox';


const GlobeComponent = ({ onPick }) => {
  const globeRef = useRef();
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [aqiData, setAqiData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [marineData, setMarineData] = useState(null);
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

  // 🌐 Get user's location + fetch AQI and Weather
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setSelectedCoords({ lat: latitude, lng: longitude });
          fetchData(latitude, longitude);
        },
        (error) => {
          console.warn('Geolocation error:', error);
          // Default location if geolocation fails
          setSelectedCoords({ lat: 20, lng: 0 });
          fetchData(20, 0);
        }
      );
    } else {
      // Default if geolocation not supported
      setSelectedCoords({ lat: 20, lng: 0 });
      fetchData(20, 0);
    }
  }, []);

  // 🧭 Fetch AQI, Weather, and Marine data
  const fetchData = async (lat, lng) => {
    setLoading(true);
    try {
      const [aqi, weather, marine] = await Promise.all([
        getAQIData(lat, lng),
        getClimateData(lat, lng),
        getMarineData(lat, lng)
      ]);
      setAqiData(aqi);
      setWeatherData(weather);
      setMarineData(marine);
    } catch (error) {
      console.error('Error fetching data:', error);
      setAqiData(null);
      setWeatherData(null);
      setMarineData(null);
    } finally {
      setLoading(false);
    }
  };

  // 🖱 Handle globe click → show red dot + fetch data
  const handleGlobeClick = (point) => {
    const { lat, lng } = point;
    setSelectedCoords({ lat, lng });
    fetchData(lat, lng);
    if (onPick) onPick(lat, lng);
  };

  // 🔴 Red pinpoint
  const pointsData = selectedCoords
    ? [{ lat: selectedCoords.lat, lng: selectedCoords.lng, size: 0.5, color: 'red' }]
    : [];

   return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
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
          width={1000}
          height={500}
          labelsData={cities}
          labelLat="lat"
          labelLng="lng"
          labelText={() => ""}
          labelDotRadius={0.1}
          labelLabel={(d) =>
            `<div style="font-size:13px;line-height:1.4;">
              <b>${d.city}</b><br/>${d.country}
            </div>`
          }
        />

        {/* 🆕 Reusable UI Components */}
        {loading && <LoaderOverlay />}
      </div>
      
      {/* Weather, Marine, and AQI cards below the globe */}
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        {selectedCoords && <WeatherInfoBox coords={selectedCoords} data={weatherData} />}
        {selectedCoords && <MarineInfoBox coords={selectedCoords} data={marineData} />}
        {selectedCoords && <AQIInfoBox coords={selectedCoords} data={aqiData} />}
      </div>
    </div>
  );
};

export default GlobeComponent;
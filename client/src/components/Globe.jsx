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
import AQIGuideBox from './ui/AQIGuideBox';
import SearchBar from './ui/SearchBar';
import AISuggestionBox from './ui/AISuggestionBox';


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
          if (onPick) onPick(latitude, longitude);
        },
        (error) => {
          console.warn('Geolocation error:', error);
          // Default location if geolocation fails
          setSelectedCoords({ lat: 20, lng: 0 });
          fetchData(20, 0);
          if (onPick) onPick(20, 0);
        }
      );
    } else {
      // Default if geolocation not supported
      setSelectedCoords({ lat: 20, lng: 0 });
      fetchData(20, 0);
      if (onPick) onPick(20, 0);
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

  // � Handle search from SearchBar
  const handleSearch = async (searchData) => {
    if (searchData.type === 'coordinates') {
      const { lat, lng } = searchData;
      setSelectedCoords({ lat, lng });
      fetchData(lat, lng);
      if (onPick) onPick(lat, lng);
      
      // Move globe to the searched location
      if (globeRef.current) {
        globeRef.current.pointOfView({ lat, lng, altitude: 2.5 }, 1000);
      }
    } else if (searchData.type === 'location') {
      // Use Nominatim geocoding API to convert location to coordinates
      try {
        setLoading(true);
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchData.location)}&format=json&limit=1`
        );
        const data = await response.json();
        
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          setSelectedCoords({ lat, lng });
          fetchData(lat, lng);
          if (onPick) onPick(lat, lng);
          
          // Move globe to the searched location
          if (globeRef.current) {
            globeRef.current.pointOfView({ lat, lng, altitude: 2.5 }, 1000);
          }
        } else {
          alert('Location not found. Please try a different search term.');
        }
        setLoading(false);
      } catch (error) {
        console.error('Geocoding error:', error);
        alert('Error searching for location. Please try again.');
        setLoading(false);
      }
    }
  };

  // �🔴 Red pinpoint
  const pointsData = selectedCoords
    ? [{ lat: selectedCoords.lat, lng: selectedCoords.lng, size: 0.5, color: 'red' }]
    : [];

   return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: '20px', width: '100%', alignItems: 'flex-start', justifyContent: 'center' }}>
        {/* Globe Container */}
        <div style={{ position: 'relative', width: '1000px', height: '500px', flexShrink: 0 }}>
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

        {/* Search Bar */}
        <div style={{ width: '280px', flexShrink: 0 }}>
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>
      
      {/* AQI Guide, AQI, Weather, and Marine cards below the globe */}
      <div style={{ display: 'flex', gap: '70px', marginTop: '20px', justifyContent: 'center', flexWrap: 'wrap', width: '100%' }}>
        <AQIGuideBox />
        {selectedCoords && <AQIInfoBox coords={selectedCoords} data={aqiData} />}
        {selectedCoords && <WeatherInfoBox coords={selectedCoords} data={weatherData} />}
        {selectedCoords && <MarineInfoBox coords={selectedCoords} data={marineData} />}
      </div>

      {/* AI Suggestion Box - AI-powered environmental analysis */}
      {selectedCoords && (
        <AISuggestionBox 
          aqiData={aqiData}
          weatherData={weatherData}
          marineData={marineData}
        />
      )}
    </div>
  );
};

export default GlobeComponent;
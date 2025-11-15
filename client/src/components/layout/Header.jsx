import React, { useEffect, useState } from "react";

export default function Header({ coordinates }) {
  const [locationName, setLocationName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 🔄 Fetch precise location name using reverse geocoding
  useEffect(() => {
    if (!coordinates) return;
    
    const fetchPreciseLocation = async () => {
      const { lat, lon } = coordinates;
      setIsLoading(true);
      
      try {
        // Use Nominatim reverse geocoding API for precise location
        const response = await fetch(
          `https://nominatim.streetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=18&addressdetails=1`
        );
        
        if (!response.ok) {
          throw new Error('Geocoding failed');
        }
        
        const data = await response.json();
        
        // Build precise location string from address components
        let locationParts = [];
        
        // Add specific location details (most precise first)
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
          
          // Add state/region if available
          if (addr.state) locationParts.push(addr.state);
          
          // Add country
          if (addr.country) locationParts.push(addr.country);
        }
        
        // If we have location parts, join them
        if (locationParts.length > 0) {
          // Limit to first 4 parts for readability
          setLocationName(locationParts.slice(0, 4).join(', '));
        } else if (data.display_name) {
          // Fallback to display name but limit length
          const parts = data.display_name.split(',').slice(0, 3);
          setLocationName(parts.join(','));
        } else {
          setLocationName(`Lat ${lat.toFixed(3)}, Lon ${lon.toFixed(3)}`);
        }
        
      } catch (error) {
        console.error('Reverse geocoding error:', error);
        // Fallback to coordinates
        setLocationName(`Lat ${lat.toFixed(3)}, Lon ${lon.toFixed(3)}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPreciseLocation();
  }, [coordinates]);

  return (
    <header className="header"> 
      <h2 className="gradient-text">Global Realtime Monitor</h2>

      {coordinates ? (
        <p className="coords">
          📍 {isLoading ? "Fetching location..." : (locationName || "Unknown location")}
          <span style={{ marginLeft: '10px', color: 'var(--muted)', fontSize: '0.9rem' }}>
            (Lat: {coordinates.lat.toFixed(3)}, Lng: {coordinates.lon.toFixed(3)})
          </span>
        </p>
      ) : (
        <p className="coords">Select a location on the globe</p>
      )}
    </header>
  );
}

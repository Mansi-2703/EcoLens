import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [searchType, setSearchType] = useState('latlong');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    
    if (searchType === 'latlong') {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      
      if (isNaN(lat) || isNaN(lng)) {
        alert('Please enter valid latitude and longitude values');
        return;
      }
      
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        alert('Latitude must be between -90 and 90, Longitude must be between -180 and 180');
        return;
      }
      
      onSearch({ type: 'coordinates', lat, lng });
    } else {
      if (!location.trim()) {
        alert('Please enter a location');
        return;
      }
      onSearch({ type: 'location', location: location.trim() });
    }
  };

  return (
    <div className="search-bar-container">
      <form onSubmit={handleSearch} className="search-bar-form">
        <div className="search-type-dropdown">
          <select 
            value={searchType} 
            onChange={(e) => setSearchType(e.target.value)}
            className="search-dropdown"
          >
            <option value="latlong">Lat, Long</option>
            <option value="location">Location</option>
          </select>
        </div>

        {searchType === 'latlong' ? (
          <div className="search-inputs-latlong">
            <input
              type="text"
              placeholder="Lat"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="search-input"
            />
            <input
              type="text"
              placeholder="Long"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className="search-input"
            />
          </div>
        ) : (
          <div className="search-inputs-location">
            <input
              type="text"
              placeholder="City name"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="search-input search-input-wide"
            />
          </div>
        )}

        <button type="submit" className="search-button">
          🔍 Search
        </button>
      </form>

      {/* Info Box - What can be searched */}
      <div className="search-info-box">
        <h4 className="search-info-title">Searchable Locations</h4>
        <ul className="search-info-list">
          <li><strong>Cities:</strong> Major cities worldwide</li>
          <li><strong>Towns & Villages:</strong> Named settlements</li>
          <li><strong>Countries:</strong> Any country name</li>
          <li><strong>Regions/States:</strong> State or province names</li>
          <li><strong>Landmarks:</strong> Famous monuments & sites</li>
          <li><strong>Buildings:</strong> Named structures</li>
          <li><strong>Addresses:</strong> Street addresses</li>
          <li><strong>Postal Codes:</strong> ZIP/postal codes</li>
        </ul>
      </div>
    </div>
  );
};

export default SearchBar;

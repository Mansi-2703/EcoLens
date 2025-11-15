import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AISuggestionBox({ aqiData, weatherData, marineData }) {
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    if (aqiData && weatherData && marineData) {
      fetchAISuggestions();
    }
  }, [aqiData, weatherData, marineData]);

  const fetchAISuggestions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('http://localhost:4000/api/ai/suggestions', {
        aqi: aqiData,
        weather: weatherData,
        marine: marineData
      });

      setSuggestions(response.data.suggestions);
      setUsingFallback(response.data.usingFallback || false);
    } catch (err) {
      console.error('Error fetching AI suggestions:', err);
      setError('Failed to generate AI suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const parseSuggestionsByCategory = (suggestionsText) => {
    if (!suggestionsText) return null;

    const categories = {
      aqi: '',
      weather: '',
      marine: ''
    };

    // Split by section headers
    const aqiMatch = suggestionsText.match(/AIR QUALITY CONDITIONS\s+([\s\S]*?)(?=WEATHER CONDITIONS|$)/i);
    const weatherMatch = suggestionsText.match(/WEATHER CONDITIONS\s+([\s\S]*?)(?=MARINE CONDITIONS|$)/i);
    const marineMatch = suggestionsText.match(/MARINE CONDITIONS\s+([\s\S]*?)$/i);

    if (aqiMatch && aqiMatch[1]) {
      categories.aqi = aqiMatch[1].trim();
    }

    if (weatherMatch && weatherMatch[1]) {
      categories.weather = weatherMatch[1].trim();
    }

    if (marineMatch && marineMatch[1]) {
      categories.marine = marineMatch[1].trim();
    }

    return categories;
  };

  if (!aqiData || !weatherData || !marineData) {
    return null;
  }

  const categorizedSuggestions = suggestions ? parseSuggestionsByCategory(suggestions) : null;

  return (
    <div className="ai-suggestion-box">
      <h4>
        🤖 AI Environmental Analysis
        {usingFallback && <span style={{ fontSize: '0.75rem', color: '#a855f7', marginLeft: '8px' }}>(Rule-based)</span>}
      </h4>
      
      {loading && (
        <div className="ai-loading">
          <div className="ai-spinner"></div>
          <p>Analyzing environmental conditions...</p>
        </div>
      )}

      {error && (
        <div className="ai-error">
          <p>⚠️ {error}</p>
        </div>
      )}

      {!loading && !error && categorizedSuggestions && (
        <div className="ai-suggestions-content">
          {categorizedSuggestions.aqi && (
            <div className="suggestion-category">
              <h5 className="category-title">Air Quality</h5>
              <div className="category-content">
                {categorizedSuggestions.aqi}
              </div>
            </div>
          )}

          {categorizedSuggestions.weather && (
            <div className="suggestion-category">
              <h5 className="category-title">Weather Conditions</h5>
              <div className="category-content">
                {categorizedSuggestions.weather}
              </div>
            </div>
          )}

          {categorizedSuggestions.marine && (
            <div className="suggestion-category">
              <h5 className="category-title">Marine Conditions</h5>
              <div className="category-content">
                {categorizedSuggestions.marine}
              </div>
            </div>
          )}
        </div>
      )}

      {!loading && !error && !suggestions && (
        <div className="ai-placeholder">
          <p>Select a location to get AI-powered environmental insights and health recommendations.</p>
        </div>
      )}
    </div>
  );
}

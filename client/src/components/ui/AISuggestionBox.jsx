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

    const sections = suggestionsText.split('\n\n');
    const categories = {
      aqi: [],
      weather: [],
      marine: [],
      general: []
    };

    sections.forEach(section => {
      const lowerSection = section.toLowerCase();
      if (lowerSection.includes('air quality') || lowerSection.includes('aqi') || 
          lowerSection.includes('pm2.5') || lowerSection.includes('pm10')) {
        categories.aqi.push(section);
      } else if (lowerSection.includes('temperature') || lowerSection.includes('heat') || 
                 lowerSection.includes('cold') || lowerSection.includes('rain')) {
        categories.weather.push(section);
      } else if (lowerSection.includes('wave') || lowerSection.includes('sea') || 
                 lowerSection.includes('marine') || lowerSection.includes('ocean')) {
        categories.marine.push(section);
      } else if (section.trim()) {
        categories.general.push(section);
      }
    });

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
          {categorizedSuggestions.aqi.length > 0 && (
            <div className="suggestion-category">
              <h5 className="category-title">Air Quality</h5>
              <div className="category-content">
                {categorizedSuggestions.aqi.join('\n')}
              </div>
            </div>
          )}

          {categorizedSuggestions.weather.length > 0 && (
            <div className="suggestion-category">
              <h5 className="category-title">Weather Conditions</h5>
              <div className="category-content">
                {categorizedSuggestions.weather.join('\n')}
              </div>
            </div>
          )}

          {categorizedSuggestions.marine.length > 0 && (
            <div className="suggestion-category">
              <h5 className="category-title">Marine Conditions</h5>
              <div className="category-content">
                {categorizedSuggestions.marine.join('\n')}
              </div>
            </div>
          )}

          {categorizedSuggestions.general.length > 0 && (
            <div className="suggestion-category">
              <div className="category-content">
                {categorizedSuggestions.general.join('\n')}
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

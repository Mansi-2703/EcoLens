import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

export default function EcoBot() {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: 'Hello! I\'m EcoBot, your environmental assistant. I can help you with:\n\n• Air Quality (AQI, PM2.5, PM10)\n• Weather conditions (temperature, humidity, wind, rain)\n• Marine conditions (waves, sea temperature)\n• Historical data (past conditions)\n• Future forecasts (up to 7 days)\n\nJust ask me about any location! For example:\n- "What\'s the air quality in New York?"\n- "Show me the weather forecast for London"\n- "What was the temperature in Tokyo last week?"',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const extractLocationFromQuery = async (query) => {
    // Try to extract location name from the query using multiple patterns
    const locationPatterns = [
      /(?:in|at|for|of|near)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*(?:air quality|weather|temperature|forecast|conditions|marine)/i,
      /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)$/i
    ];

    for (const pattern of locationPatterns) {
      const match = query.match(pattern);
      if (match) {
        const location = match[1].trim();
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`,
            {
              headers: {
                'User-Agent': 'EcoLens/1.0'
              }
            }
          );
          const data = await response.json();
          if (data && data.length > 0) {
            return {
              name: data[0].display_name.split(',').slice(0, 2).join(','),
              lat: parseFloat(data[0].lat),
              lon: parseFloat(data[0].lon)
            };
          }
        } catch (err) {
          console.error('Geocoding error:', err);
        }
      }
    }
    return null;
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      type: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const userQuery = input;
    setInput('');
    setLoading(true);

    try {
      // Extract location from query
      const location = await extractLocationFromQuery(userQuery);
      
      if (!location) {
        setMessages(prev => [...prev, {
          type: 'bot',
          text: '❓ I couldn\'t identify a location in your query.\n\nPlease include a city or place name. Examples:\n• "What\'s the weather in Paris?"\n• "Air quality in Tokyo"\n• "Temperature in New York"',
          timestamp: new Date()
        }]);
        setLoading(false);
        return;
      }

      // Send query to AI-powered backend
      const response = await axios.post('http://localhost:4000/api/ai/chat', {
        query: userQuery,
        location: location
      });

      if (response.data.success) {
        setMessages(prev => [...prev, {
          type: 'bot',
          text: response.data.response,
          timestamp: new Date()
        }]);
      } else {
        throw new Error('Failed to get response from server');
      }

    } catch (error) {
      console.error('Error processing query:', error);
      setMessages(prev => [...prev, {
        type: 'bot',
        text: '❌ Sorry, I encountered an error processing your request.\n\nThis could be due to:\n• Network connectivity issues\n• Invalid location\n• Temporarily unavailable data\n\nPlease try again with a different query or location.',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="ecobot-container">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}`}>
            <div className="message-avatar">
              {message.type === 'bot' ? (
                <img src="/ecobot-icon.svg" alt="EcoBot" className="bot-avatar-image" />
              ) : (
                '👤'
              )}
            </div>
            <div className="message-content">
              <div className="message-text">{message.text}</div>
              <div className="message-time">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="message bot">
            <div className="message-avatar">
              <img src="/ecobot-icon.svg" alt="EcoBot" className="bot-avatar-image" />
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me about air quality, weather, or marine conditions..."
          className="chat-input"
          rows="2"
          disabled={loading}
        />
        <button 
          onClick={handleSendMessage} 
          className="send-button"
          disabled={loading || !input.trim()}
        >
          ➤
        </button>
      </div>
    </div>
  );
}

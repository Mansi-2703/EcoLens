# EcoBot Testing Guide

## Enhanced EcoBot Features

The EcoBot has been upgraded to provide accurate, AI-powered responses about past, present, and future environmental conditions for any location.

### What's New:

1. **AI-Powered Understanding**: Uses Google Gemini API to understand natural language queries
2. **Temporal Context**: Automatically detects whether you're asking about past, present, or future
3. **Smart Data Fetching**: Only fetches the data types you need (AQI, weather, marine)
4. **Historical Data**: Can retrieve data from the past (up to 7 days)
5. **Forecast Data**: Can provide predictions for the future (up to 7 days)
6. **Accurate Responses**: Provides data-driven answers with proper context and interpretation

### Test Queries to Try:

#### Present/Current Conditions:
- "What's the current air quality in New York?"
- "Tell me about weather in London right now"
- "Current marine conditions near Sydney"
- "Show me conditions in Paris"

#### Past Conditions:
- "What was the temperature in Tokyo yesterday?"
- "Air quality in Delhi last week"
- "Was it rainy in Seattle last week?"
- "Tell me about weather in Mumbai 3 days ago"

#### Future Forecasts:
- "Weather forecast for Berlin tomorrow"
- "Will it rain in London next week?"
- "Air quality prediction for Los Angeles"
- "What will the temperature be in Dubai tomorrow?"

#### Combined Queries:
- "Compare current and forecasted weather in Chicago"
- "How is the air quality in Beijing compared to last week?"

### How It Works:

1. **User enters a query** → EcoBot extracts the location using geocoding
2. **Query analysis** → Backend determines temporal context (past/present/future) and data needs
3. **Data fetching** → Fetches relevant data from Open-Meteo APIs with appropriate time ranges
4. **AI Processing** → Gemini AI interprets the data and generates a natural, conversational response
5. **Response delivery** → User receives accurate, contextual information

### API Endpoints:

- **POST /api/ai/chat**: Main endpoint for natural language queries
  - Request body: `{ query: string, location: { name: string, lat: number, lon: number } }`
  - Response: `{ success: boolean, response: string, location: string, dataFetched: object, temporal: string }`

### Fallback System:

If the Gemini API fails, the system falls back to a basic response showing available data points, ensuring the user always gets a response.

### Technical Implementation:

- **Frontend**: `client/src/components/EcoBot.jsx` - Handles user input, location extraction, and API communication
- **Backend**: `server/controllers/aiController.js` - Processes queries, fetches data, and generates AI responses
- **Routes**: `server/routes/aiRoutes.js` - Defines the `/api/ai/chat` endpoint

### Data Sources:

- **Air Quality**: Open-Meteo Air Quality API (AQI, PM2.5, PM10, CO, NO2, O3)
- **Weather**: Open-Meteo Forecast API (Temperature, Humidity, Rain, Wind, Cloud Cover)
- **Marine**: Open-Meteo Marine API (Wave Height, Sea Temperature, Ocean Currents)

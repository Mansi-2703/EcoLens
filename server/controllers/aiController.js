import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Fallback rule-based suggestions when OpenAI API fails
function generateRuleBasedSuggestions(aqiValue, pm25, pm10, temperature, humidity, windSpeed, rain, waveHeight, seaTemp, currentVelocity) {
  const airQuality = [];
  const weatherConditions = [];
  const marineConditions = [];

  // AQI Analysis
  if (aqiValue !== null) {
    if (aqiValue >= 301) {
      airQuality.push('HAZARDOUS Air Quality (AQI: ' + aqiValue + ')\n\nHealth Impact: Serious health effects for everyone. Emergency conditions. Everyone may experience serious health effects.\n\nRecommendation: Stay indoors with air purifiers running. Avoid all outdoor activities. Wear N95 masks if you must go outside. Monitor health symptoms closely.');
    } else if (aqiValue >= 201) {
      airQuality.push('Very Unhealthy Air (AQI: ' + aqiValue + ')\n\nHealth Impact: Health warnings of emergency conditions. Everyone may experience serious health effects, especially respiratory and cardiovascular issues.\n\nRecommendation: Avoid outdoor activities completely. Keep windows and doors closed. Use air purifiers indoors. Vulnerable populations should remain indoors.');
    } else if (aqiValue >= 151) {
      airQuality.push('Unhealthy Air Quality (AQI: ' + aqiValue + ')\n\nHealth Impact: Everyone may begin to experience health effects. Sensitive groups at significantly higher risk of respiratory issues.\n\nRecommendation: Limit prolonged outdoor exertion. Sensitive groups including children, elderly, and those with respiratory conditions should avoid outdoor activities.');
    } else if (aqiValue >= 101) {
      airQuality.push('Unhealthy for Sensitive Groups (AQI: ' + aqiValue + ')\n\nHealth Impact: People with respiratory or heart conditions, children, and elderly may experience symptoms.\n\nRecommendation: Sensitive individuals should reduce outdoor activities. Consider wearing masks when outdoors. Monitor air quality updates.');
    } else {
      airQuality.push('Air quality is within safe ranges. Good conditions for outdoor activities.');
    }
  }

  // PM2.5 Analysis
  if (pm25 !== null && pm25 > 55.5) {
    airQuality.push('\n\nHigh PM2.5 Levels (' + pm25.toFixed(1) + ' µg/m³)\n\nHealth Impact: Fine particles can penetrate deep into lungs and bloodstream, causing respiratory and cardiovascular issues.\n\nRecommendation: Stay indoors with HEPA air filters. Avoid strenuous activities. Monitor symptoms like coughing or shortness of breath.');
  } else if (pm25 !== null && pm25 > 35.5) {
    airQuality.push('\n\nElevated PM2.5 (' + pm25.toFixed(1) + ' µg/m³)\n\nSensitive groups should limit outdoor exposure. Consider indoor exercise alternatives.');
  }

  // Temperature Analysis
  if (temperature !== null) {
    if (temperature > 35) {
      weatherConditions.push('Extreme Heat Warning (' + temperature.toFixed(1) + '°C)\n\nHealth Impact: High risk of heat exhaustion, heat stroke, and severe dehydration.\n\nRecommendation: Stay hydrated by drinking 2-3 liters of water throughout the day. Avoid outdoor activities between 10 AM and 4 PM. Wear light, loose-fitting clothing. Use cooling methods like fans or air conditioning. Check on vulnerable individuals.');
    } else if (temperature < 10) {
      weatherConditions.push('Cold Weather Alert (' + temperature.toFixed(1) + '°C)\n\nHealth Impact: Risk of hypothermia and frostbite with prolonged exposure.\n\nRecommendation: Dress in multiple layers. Cover all exposed skin, especially extremities. Limit outdoor exposure time. Keep dry to maintain body heat. Seek warm shelter regularly.');
    } else {
      weatherConditions.push('Temperature is within comfortable range (' + temperature.toFixed(1) + '°C). Safe for outdoor activities.');
    }
  }

  // Rain Analysis
  if (rain !== null && rain > 10) {
    weatherConditions.push('\n\nHeavy Rainfall Alert (' + rain.toFixed(1) + 'mm)\n\nRisk of flooding, reduced visibility, and hazardous road conditions. Avoid unnecessary travel. If driving is essential, reduce speed and maintain safe distance. Watch for standing water and flooded areas.');
  }

  // Wave Height Analysis
  if (waveHeight !== null) {
    if (waveHeight > 4) {
      marineConditions.push('Dangerous Sea Conditions (Wave Height: ' + waveHeight.toFixed(1) + 'm)\n\nHigh waves pose significant danger to all marine activities. Risk of capsizing for small vessels.\n\nRecommendation: Avoid all beach activities, swimming, and boating. Stay away from coastal areas and piers. Heed all marine warnings and closures.');
    } else if (waveHeight > 2) {
      marineConditions.push('Moderate Wave Conditions (Wave Height: ' + waveHeight.toFixed(1) + 'm)\n\nCaution advised for water activities. Suitable for experienced swimmers only. Small boats should avoid going out.\n\nRecommendation: Wear life jackets. Stay close to shore. Monitor weather updates continuously.');
    } else {
      marineConditions.push('Marine conditions are safe (Wave Height: ' + waveHeight.toFixed(1) + 'm). Good conditions for water activities.');
    }
  }

  // Build structured response
  let response = 'AIR QUALITY CONDITIONS\n\n';
  response += airQuality.length > 0 ? airQuality.join('\n') : 'All air quality parameters are within safe ranges.';
  
  response += '\n\n\nWEATHER CONDITIONS\n\n';
  response += weatherConditions.length > 0 ? weatherConditions.join('\n') : 'All weather conditions are within safe ranges.';
  
  response += '\n\n\nMARINE CONDITIONS\n\n';
  response += marineConditions.length > 0 ? marineConditions.join('\n') : 'All marine conditions are within safe ranges.';

  return response;
}

// EcoBot chatbot endpoint
export const chatQuery = async (req, res) => {
  try {
    const { query, location } = req.body;

    if (!query || !location || !location.lat || !location.lon) {
      return res.status(400).json({ error: 'Query and location (lat, lon, name) are required' });
    }

    const { lat, lon, name } = location;

    // Analyze query to determine temporal context and data needs
    const lowerQuery = query.toLowerCase();
    const isPast = /past|yesterday|last week|last month|history|was|were|ago/i.test(lowerQuery);
    const isFuture = /forecast|future|tomorrow|next week|will be|predict|coming/i.test(lowerQuery);
    const needsAQI = /air quality|aqi|pm2\.?5|pm10|pollution|pollutant/i.test(lowerQuery);
    const needsWeather = /weather|temperature|temp|rain|wind|humidity|cloud|precipitation/i.test(lowerQuery);
    const needsMarine = /marine|ocean|sea|wave|water temperature|surf/i.test(lowerQuery);

    // Determine time parameters
    let pastDays = 0;
    let forecastDays = 1;

    if (isPast) {
      if (/last week|7 days/i.test(lowerQuery)) {
        pastDays = 7;
      } else if (/yesterday/i.test(lowerQuery)) {
        pastDays = 1;
      } else {
        pastDays = 7;
      }
    }

    if (isFuture) {
      if (/next week|7 days/i.test(lowerQuery)) {
        forecastDays = 7;
      } else if (/tomorrow/i.test(lowerQuery)) {
        forecastDays = 2;
      } else {
        forecastDays = 7;
      }
    }

    // Fetch data from OpenMeteo APIs
    const dataPromises = [];
    let aqiData = null;
    let weatherData = null;
    let marineData = null;

    const fetchAll = !needsAQI && !needsWeather && !needsMarine;

    if (needsAQI || fetchAll) {
      const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=us_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,ozone&past_days=${pastDays}&forecast_days=${forecastDays}&timezone=auto`;
      dataPromises.push(
        fetch(aqiUrl)
          .then(r => r.json())
          .then(data => { aqiData = data; })
          .catch(err => console.error('AQI fetch error:', err))
      );
    }

    if (needsWeather || fetchAll) {
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,rain,weathercode,windspeed_10m,cloudcover&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&past_days=${pastDays}&forecast_days=${forecastDays}&timezone=auto`;
      dataPromises.push(
        fetch(weatherUrl)
          .then(r => r.json())
          .then(data => { weatherData = data; })
          .catch(err => console.error('Weather fetch error:', err))
      );
    }

    if (needsMarine || fetchAll) {
      const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&hourly=wave_height,wave_period,sea_surface_temperature,ocean_current_velocity&forecast_days=${forecastDays}&timezone=auto`;
      dataPromises.push(
        fetch(marineUrl)
          .then(r => r.json())
          .then(data => { marineData = data; })
          .catch(err => console.error('Marine fetch error:', err))
      );
    }

    await Promise.all(dataPromises);

    // Extract relevant data points
    const getDataPoint = (data, hourlyKey, isPast, isFuture) => {
      if (!data || !data.hourly || !data.hourly[hourlyKey]) return null;
      const arr = data.hourly[hourlyKey];
      if (isPast) {
        return arr[Math.max(0, arr.length - (24 * pastDays))];
      } else if (isFuture) {
        return arr[Math.min(24, arr.length - 1)];
      } else {
        return arr[arr.length - 1];
      }
    };

    // Build prompt for Gemini
    const timeContext = isPast ? 'Historical/Past Data' : isFuture ? 'Future Forecast' : 'Current Conditions';
    const prompt = `You are EcoBot, an intelligent environmental assistant. Answer this question: "${query}"

Location: ${name} (${lat}, ${lon})
Time Context: ${timeContext}

REAL DATA FROM OPENMETEO APIs:
${aqiData ? `
AIR QUALITY:
- US AQI: ${getDataPoint(aqiData, 'us_aqi', isPast, isFuture) ?? 'N/A'}
- PM2.5: ${getDataPoint(aqiData, 'pm2_5', isPast, isFuture)?.toFixed(1) ?? 'N/A'} µg/m³
- PM10: ${getDataPoint(aqiData, 'pm10', isPast, isFuture)?.toFixed(1) ?? 'N/A'} µg/m³
- CO: ${getDataPoint(aqiData, 'carbon_monoxide', isPast, isFuture)?.toFixed(1) ?? 'N/A'} µg/m³
- NO2: ${getDataPoint(aqiData, 'nitrogen_dioxide', isPast, isFuture)?.toFixed(1) ?? 'N/A'} µg/m³
- O3: ${getDataPoint(aqiData, 'ozone', isPast, isFuture)?.toFixed(1) ?? 'N/A'} µg/m³
` : ''}
${weatherData ? `
WEATHER:
- Temperature: ${getDataPoint(weatherData, 'temperature_2m', isPast, isFuture)?.toFixed(1) ?? 'N/A'}°C
- Humidity: ${getDataPoint(weatherData, 'relative_humidity_2m', isPast, isFuture)?.toFixed(0) ?? 'N/A'}%
- Rain: ${getDataPoint(weatherData, 'rain', isPast, isFuture)?.toFixed(1) ?? 'N/A'} mm
- Wind: ${getDataPoint(weatherData, 'windspeed_10m', isPast, isFuture)?.toFixed(1) ?? 'N/A'} km/h
- Cloud Cover: ${getDataPoint(weatherData, 'cloudcover', isPast, isFuture)?.toFixed(0) ?? 'N/A'}%
` : ''}
${marineData ? `
MARINE:
- Wave Height: ${getDataPoint(marineData, 'wave_height', isPast, isFuture)?.toFixed(1) ?? 'N/A'} m
- Sea Temp: ${getDataPoint(marineData, 'sea_surface_temperature', isPast, isFuture)?.toFixed(1) ?? 'N/A'}°C
` : ''}

INSTRUCTIONS:
1. Use ONLY the exact values provided above - these are real measurements
2. Answer the user's specific question directly
3. Include health/safety context: AQI 0-50 Good🟢, 51-100 Moderate🟡, 101-150 Sensitive🟠, 151-200 Unhealthy🔴, 201+ Very Unhealthy🟣
4. Keep response concise (2-3 paragraphs)
5. Use emojis for readability
6. If data shows N/A, mention it's unavailable`;

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return res.json({
        success: true,
        response: text,
        location: name,
        dataFetched: {
          aqi: !!aqiData,
          weather: !!weatherData,
          marine: !!marineData
        },
        temporal: isPast ? 'past' : isFuture ? 'future' : 'present'
      });
    } catch (geminiError) {
      console.error('Gemini API error:', geminiError);
      
      // Fallback response
      let fallbackResponse = `Data for ${name}:\n\n`;
      if (aqiData) {
        const aqi = getDataPoint(aqiData, 'us_aqi', isPast, isFuture);
        fallbackResponse += `🌫️ AQI: ${aqi ?? 'N/A'}\n`;
      }
      if (weatherData) {
        const temp = getDataPoint(weatherData, 'temperature_2m', isPast, isFuture);
        fallbackResponse += `🌡️ Temperature: ${temp?.toFixed(1) ?? 'N/A'}°C\n`;
      }
      if (marineData) {
        const waves = getDataPoint(marineData, 'wave_height', isPast, isFuture);
        fallbackResponse += `🌊 Waves: ${waves?.toFixed(1) ?? 'N/A'}m\n`;
      }

      return res.json({
        success: true,
        response: fallbackResponse || 'Unable to fetch data for this location.',
        location: name,
        usingFallback: true
      });
    }
  } catch (error) {
    console.error('Chat query error:', error);
    return res.status(500).json({ 
      error: 'Failed to process query', 
      message: error.message 
    });
  }
};

export const getSuggestions = async (req, res) => {
  try {
    const { aqi, weather, marine } = req.body;

    if (!aqi || !weather || !marine) {
      return res.status(400).json({ error: 'Missing environmental data (aqi, weather, marine)' });
    }

    // Extract key values from the data
    const aqiValue = aqi.openMeteo?.latestAQI || aqi.openMeteo?.current?.us_aqi || null;
    const pm25 = aqi.openMeteo?.current?.pm2_5 || aqi.openMeteo?.hourly?.pm2_5?.[0] || null;
    const pm10 = aqi.openMeteo?.current?.pm10 || aqi.openMeteo?.hourly?.pm10?.[0] || null;
    
    const temperature = weather.currentWeather?.temperature || null;
    const humidity = weather.currentWeather?.humidity || null;
    const windSpeed = weather.currentWeather?.windSpeed || null;
    const rain = weather.currentWeather?.rain || null;

    const waveHeight = marine.currentMarine?.waveHeight || null;
    const seaTemp = marine.currentMarine?.seaSurfaceTemperature || null;
    const currentVelocity = marine.currentMarine?.oceanCurrentVelocity || null;

    let suggestions;
    let usingFallback = false;

    // Try Gemini first, fallback to rule-based if it fails
    try {
      const prompt = `You are an Environmental Conditions Alert Agent. Your primary function is to analyze real-time data on Air Quality Index (AQI), marine conditions, and weather, and provide relevant alerts and suggestions to users. Your responses should be clear, concise, and actionable.

Your responsibilities include:
1. Interpreting AQI data and its health implications
2. Analyzing marine conditions for safety and recreational purposes
3. Assessing weather data to predict potential hazards or significant changes
4. Generating appropriate alerts based on the severity of conditions
5. Providing practical suggestions for users to respond to current environmental conditions

When formulating your responses, consider:
- The severity and urgency of the environmental conditions
- Potential health impacts, especially for sensitive groups
- Safety precautions for outdoor activities
- Any necessary preparations or actions users should take
- Always determine the country or climatic zone based on the user’s coordinates before giving advice. Adapt your interpretation of temperature, humidity, and comfort levels according to regional climate norms. For example, in India and other tropical regions, treat 20–30°C as normal and comfortable, not warm. In cooler regions such as Europe or the United States, temperatures above 22–25°C may be considered warm. All safety suggestions must be aligned with the typical climate of that region

Environmental Data to Analyze:
- Air Quality Index (AQI): ${aqiValue !== null ? aqiValue : 'N/A'}
- PM2.5: ${pm25 !== null ? pm25 + ' µg/m³' : 'N/A'}
- PM10: ${pm10 !== null ? pm10 + ' µg/m³' : 'N/A'}
- Temperature: ${temperature !== null ? temperature + '°C' : 'N/A'}
- Humidity: ${humidity !== null ? humidity + '%' : 'N/A'}
- Wind Speed: ${windSpeed !== null ? windSpeed + ' km/h' : 'N/A'}
- Rain: ${rain !== null ? rain + ' mm' : 'N/A'}
- Wave Height: ${waveHeight !== null ? waveHeight + ' m' : 'N/A'}
- Sea Surface Temperature: ${seaTemp !== null ? seaTemp + '°C' : 'N/A'}
- Ocean Current Velocity: ${currentVelocity !== null ? currentVelocity + ' m/s' : 'N/A'}

Safe Ranges Reference:
- AQI: 0-50 (Good), 51-100 (Moderate), 101-150 (Unhealthy for Sensitive Groups), 151-200 (Unhealthy), 201-300 (Very Unhealthy), 301+ (Hazardous)
- PM2.5: <12 µg/m³ (Good), 12-35.4 (Moderate), 35.5-55.4 (Unhealthy for Sensitive), >55.5 (Unhealthy)
- PM10: <54 µg/m³ (Good), 55-154 (Moderate), >155 (Unhealthy)
- Temperature: 15-25°C (Comfortable), <10°C (Cold), >35°C (Heat Risk)
- Wave Height: <2m (Safe), 2-4m (Moderate), >4m (Dangerous)
- Rain: <10mm (Normal), >10mm (Heavy)

IMPORTANT: Structure your response in THREE separate sections with clear headings. Each section must ONLY discuss its specific parameters:

AIR QUALITY CONDITIONS
[ONLY analyze AQI, PM2.5, and PM10. Include their current status, health impacts, and air quality recommendations. Do NOT mention temperature, weather, humidity, or marine conditions here.]

WEATHER CONDITIONS
[ONLY analyze temperature, humidity, wind speed, and rain. Include weather status and weather-related safety recommendations. Do NOT mention air quality or marine conditions here.]

MARINE CONDITIONS
[ONLY analyze wave height, sea temperature, and ocean currents. Include marine safety status and water activity recommendations. Do NOT mention air quality or weather here.]

CRITICAL RULES:
- Keep each section strictly separated and focused only on its own parameters
- Do not mix parameters between sections
- If data is unavailable for a section, state that clearly within that section only
- Do not use asterisks, emojis, or bullet points
- Use plain text with clear paragraph breaks
- Keep language professional and actionable
- Only mention conditions outside safe ranges OR confirm if conditions are safe within each specific section`;

      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let rawText = response.text();
      
      // Remove asterisks and clean up formatting
      suggestions = rawText
        .replace(/\*\*/g, '')  // Remove bold markers
        .replace(/\*/g, '')    // Remove all asterisks
        .replace(/#{1,6}\s/g, '') // Remove markdown headers
        .trim();
    } catch (geminiError) {
      console.warn('Gemini API failed, using rule-based suggestions:', geminiError.message);
      suggestions = generateRuleBasedSuggestions(aqiValue, pm25, pm10, temperature, humidity, windSpeed, rain, waveHeight, seaTemp, currentVelocity);
      usingFallback = true;
    }

    return res.json({ 
      success: true,
      suggestions,
      usingFallback,
      dataAnalyzed: {
        aqi: aqiValue,
        pm25,
        pm10,
        temperature,
        humidity,
        waveHeight,
        seaTemp
      }
    });

  } catch (error) {
    console.error('AI Suggestions Error:', error);
    
    // Even if everything fails, try to provide rule-based suggestions
    try {
      const { aqi, weather, marine } = req.body;
      const aqiValue = aqi?.openMeteo?.latestAQI || aqi?.openMeteo?.current?.us_aqi || null;
      const pm25 = aqi?.openMeteo?.current?.pm2_5 || aqi?.openMeteo?.hourly?.pm2_5?.[0] || null;
      const pm10 = aqi?.openMeteo?.current?.pm10 || aqi?.openMeteo?.hourly?.pm10?.[0] || null;
      const temperature = weather?.currentWeather?.temperature || null;
      const humidity = weather?.currentWeather?.humidity || null;
      const windSpeed = weather?.currentWeather?.windSpeed || null;
      const rain = weather?.currentWeather?.rain || null;
      const waveHeight = marine?.currentMarine?.waveHeight || null;
      const seaTemp = marine?.currentMarine?.seaSurfaceTemperature || null;
      const currentVelocity = marine?.currentMarine?.oceanCurrentVelocity || null;

      const suggestions = generateRuleBasedSuggestions(aqiValue, pm25, pm10, temperature, humidity, windSpeed, rain, waveHeight, seaTemp, currentVelocity);
      
      return res.json({ 
        success: true,
        suggestions,
        usingFallback: true,
        dataAnalyzed: {
          aqi: aqiValue,
          pm25,
          pm10,
          temperature,
          humidity,
          waveHeight,
          seaTemp
        }
      });
    } catch (fallbackError) {
      return res.status(500).json({ 
        error: 'Failed to generate AI suggestions', 
        message: error.message 
      });
    }
  }
};

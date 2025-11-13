import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Fallback rule-based suggestions when OpenAI API fails
function generateRuleBasedSuggestions(aqiValue, pm25, pm10, temperature, humidity, windSpeed, rain, waveHeight, seaTemp, currentVelocity) {
  const suggestions = [];

  // AQI Analysis - Only show if unsafe
  if (aqiValue !== null) {
    if (aqiValue >= 301) {
      suggestions.push('HAZARDOUS Air Quality (AQI: ' + aqiValue + ')\nHealth Impact: Serious health effects for everyone. Emergency conditions.\nRecommendation: Stay indoors with air purifiers. Avoid all outdoor activities. Wear N95 masks if you must go outside.');
    } else if (aqiValue >= 201) {
      suggestions.push('Very Unhealthy Air (AQI: ' + aqiValue + ')\nHealth Impact: Health warnings of emergency conditions. Everyone may experience serious health effects.\nRecommendation: Avoid outdoor activities. Keep windows closed. Use air purifiers indoors.');
    } else if (aqiValue >= 151) {
      suggestions.push('Unhealthy Air Quality (AQI: ' + aqiValue + ')\nHealth Impact: Everyone may begin to experience health effects; sensitive groups at higher risk.\nRecommendation: Limit prolonged outdoor exertion. Sensitive groups should avoid outdoor activities.');
    } else if (aqiValue >= 101) {
      suggestions.push('Unhealthy for Sensitive Groups (AQI: ' + aqiValue + ')\nHealth Impact: People with respiratory conditions may experience symptoms.\nRecommendation: Sensitive individuals should reduce outdoor activities. Consider wearing masks outdoors.');
    }
  }

  // PM2.5 Analysis - Only show if unsafe
  if (pm25 !== null && pm25 > 55.5) {
    suggestions.push('High PM2.5 Levels (' + pm25.toFixed(1) + ' µg/m³)\nHealth Impact: Fine particles can penetrate deep into lungs, causing respiratory issues.\nRecommendation: Stay indoors. Use HEPA air filters. Monitor symptoms like coughing or shortness of breath.');
  } else if (pm25 !== null && pm25 > 35.5) {
    suggestions.push('Elevated PM2.5 (' + pm25.toFixed(1) + ' µg/m³)\nSensitive groups should limit outdoor exposure. Consider indoor exercise alternatives.');
  }

  // Temperature Analysis - Only show if unsafe
  if (temperature !== null) {
    if (temperature > 35) {
      suggestions.push('Extreme Heat Warning (' + temperature.toFixed(1) + '°C)\nHealth Impact: Risk of heat exhaustion, heat stroke, and dehydration.\nRecommendation: Stay hydrated (drink 2-3L water). Avoid outdoor activities 10 AM to 4 PM. Wear light, loose clothing. Use cooling methods.');
    } else if (temperature < 10) {
      suggestions.push('Cold Weather Alert (' + temperature.toFixed(1) + '°C)\nHealth Impact: Risk of hypothermia and frostbite with prolonged exposure.\nRecommendation: Dress in layers. Cover extremities. Limit outdoor exposure time. Stay dry.');
    }
  }

  // Wave Height Analysis - Only show if unsafe
  if (waveHeight !== null) {
    if (waveHeight > 4) {
      suggestions.push('Dangerous Sea Conditions (Wave Height: ' + waveHeight.toFixed(1) + 'm)\nHigh waves pose significant danger to swimmers and small vessels.\nRecommendation: Avoid beach activities, swimming, and boating. Stay away from coastal areas.');
    } else if (waveHeight > 2) {
      suggestions.push('Moderate Wave Conditions (Wave Height: ' + waveHeight.toFixed(1) + 'm)\nCaution advised for water activities. Strong swimmers only. Avoid small boats.');
    }
  }

  // Rain Analysis - Only show if unsafe
  if (rain !== null && rain > 10) {
    suggestions.push('Heavy Rainfall (' + rain.toFixed(1) + 'mm)\nRisk of flooding and reduced visibility. Avoid unnecessary travel. Drive carefully if you must go out.');
  }

  // Default message if all conditions are safe
  if (suggestions.length === 0) {
    suggestions.push('All Environmental Conditions are Safe\nAll monitored parameters are within safe ranges. Great time for outdoor activities!');
  }

  return suggestions.join('\n\n');
}

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

    // Try OpenAI first, fallback to rule-based if it fails
    try {
      const prompt = `You are an environmental health advisor. Analyze the following environmental data and provide specific alerts and actionable suggestions if values are outside safe ranges. Focus on health impacts and practical recommendations.

Environmental Data:
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

IMPORTANT: Only provide alerts for unsafe conditions. If all values are within safe ranges, simply state that conditions are safe.

Provide alerts only for values outside safe ranges with:
1. Clear alert title indicating the unsafe condition
2. Specific health impacts
3. Actionable recommendations

Keep responses concise and practical. Do not use emojis, asterisks, or dashes for formatting.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 500
      });

      suggestions = completion.choices[0].message.content;
    } catch (openaiError) {
      console.warn('OpenAI API failed, using rule-based suggestions:', openaiError.message);
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

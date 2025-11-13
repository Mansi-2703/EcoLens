// server/controllers/climateController.js
// Fetches climate data from Open-Meteo Climate API

export async function getClimate(req, res) {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ error: 'lat & lon required' });
    }

    const latitude = Number(lat);
    const longitude = Number(lon);

    // Open-Meteo Weather API - Current weather conditions + hourly dew point + daily sunrise/sunset
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      current: [
        'temperature_2m',
        'relative_humidity_2m',
        'wind_speed_10m',
        'wind_direction_10m',
        'rain'
      ].join(','),
      hourly: 'dew_point_2m',
      daily: 'sunrise,sunset',
      timezone: 'auto',
      forecast_days: 1
    });

    const climateUrl = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;

    // Fetch climate data
    const response = await fetch(climateUrl);
    
    if (!response.ok) {
      const txt = await response.text().catch(() => '');
      console.warn('Open-Meteo Climate API non-OK:', response.status, txt);
      return res.status(502).json({ error: 'Climate data fetch failed', status: response.status });
    }

    const climateJson = await response.json();

    // Structure the response
    const climateData = {
      coordinates: {
        latitude: climateJson.latitude || latitude,
        longitude: climateJson.longitude || longitude,
        elevation: climateJson.elevation || null,
        timezone: climateJson.timezone || 'UTC'
      },
      current: climateJson.current || {},
      hourly: climateJson.hourly || {},
      daily: climateJson.daily || {},
      current_units: climateJson.current_units || {},
      hourly_units: climateJson.hourly_units || {},
      daily_units: climateJson.daily_units || {},
      units: {
        temperature: '°C',
        humidity: '%',
        windspeed: 'km/h',
        wind_direction: '°',
        rain: 'mm',
        dew_point: '°C'
      }
    };

    // Extract current weather data
    let currentWeather = null;
    if (climateJson.current) {
      currentWeather = {
        temperature: climateJson.current.temperature_2m ?? null,
        humidity: climateJson.current.relative_humidity_2m ?? null,
        windSpeed: climateJson.current.wind_speed_10m ?? null,
        windDirection: climateJson.current.wind_direction_10m ?? null,
        rain: climateJson.current.rain ?? null,
        time: climateJson.current.time ?? null
      };
    }

    // Get current hour's dew point
    let currentDewPoint = null;
    if (climateJson.hourly && climateJson.hourly.dew_point_2m && climateJson.hourly.time) {
      const currentTime = new Date().toISOString().slice(0, 13) + ':00';
      const timeIndex = climateJson.hourly.time.findIndex(t => t.startsWith(currentTime.slice(0, 13)));
      if (timeIndex !== -1) {
        currentDewPoint = climateJson.hourly.dew_point_2m[timeIndex] ?? null;
      } else if (climateJson.hourly.dew_point_2m.length > 0) {
        currentDewPoint = climateJson.hourly.dew_point_2m[0] ?? null;
      }
    }

    // Extract daily sunrise/sunset
    let dailyData = null;
    if (climateJson.daily) {
      dailyData = {
        sunrise: climateJson.daily.sunrise?.[0] ?? null,
        sunset: climateJson.daily.sunset?.[0] ?? null
      };
    }

    const payload = {
      requestedCoordinates: { lat: latitude, lon: longitude },
      climate: climateData,
      currentWeather: currentWeather,
      currentDewPoint: currentDewPoint,
      dailyData: dailyData,
      note: 'Current weather data from Open-Meteo API with dew point and sunrise/sunset'
    };

    return res.json(payload);
  } catch (err) {
    console.error('getClimate error:', err);
    return res.status(500).json({ error: 'Climate fetch failed', details: err.message });
  }
}

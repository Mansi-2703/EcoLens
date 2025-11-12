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

    // Open-Meteo Weather API - Current weather conditions
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
      timezone: 'auto'
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
      current_units: climateJson.current_units || {},
      units: {
        temperature: '°C',
        humidity: '%',
        windspeed: 'km/h',
        wind_direction: '°',
        rain: 'mm'
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

    const payload = {
      requestedCoordinates: { lat: latitude, lon: longitude },
      climate: climateData,
      currentWeather: currentWeather,
      note: 'Current weather data from Open-Meteo API'
    };

    return res.json(payload);
  } catch (err) {
    console.error('getClimate error:', err);
    return res.status(500).json({ error: 'Climate fetch failed', details: err.message });
  }
}

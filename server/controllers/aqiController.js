// server/controllers/aqiController.js
// ESM module — ensure "type": "module" in server/package.json (or project package.json)

export async function getAQI(req, res) {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ error: 'lat & lon required' });
    }

    const latitude = Number(lat);
    const longitude = Number(lon);

    // Open-Meteo Air Quality API - fetch current values only
    const currentFields = ['us_aqi', 'pm10', 'pm2_5', 'carbon_monoxide', 'nitrogen_dioxide', 'ozone', 'dust', 'uv_index'].join(',');

    const omParams = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      current: currentFields,
      timezone: 'auto',
    });

    const openMeteoUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?${omParams.toString()}`;

    // Fetch Open-Meteo Air Quality API
    const omResp = await fetch(openMeteoUrl);

    // Handle non-OK responses gracefully
    let omJson = null;
    if (omResp.ok) {
      omJson = await omResp.json().catch(() => null);
    } else {
      const txt = await omResp.text().catch(() => '');
      console.warn('Open-Meteo non-OK:', omResp.status, txt);
      return res.status(502).json({ error: 'Open-Meteo API fetch failed', status: omResp.status });
    }

    // Parse Open-Meteo into friendly structure
    let openMeteoData = null;
    if (omJson) {
      const coords = {
        latitude: omJson.latitude ?? latitude,
        longitude: omJson.longitude ?? longitude,
        elevation: omJson.elevation ?? null,
      };

      openMeteoData = {
        coordinates: coords,
        current: null,
        latestAQI: null
      };

      // Get current values from Open-Meteo
      if (omJson.current) {
        openMeteoData.current = {
          time: omJson.current.time ?? null,
          us_aqi: omJson.current.us_aqi ?? null,
          pm10: omJson.current.pm10 ?? null,
          pm2_5: omJson.current.pm2_5 ?? null,
          carbon_monoxide: omJson.current.carbon_monoxide ?? null,
          nitrogen_dioxide: omJson.current.nitrogen_dioxide ?? null,
          ozone: omJson.current.ozone ?? null,
          dust: omJson.current.dust ?? null,
          uv_index: omJson.current.uv_index ?? null,
        };

        // Set latest AQI from current value
        openMeteoData.latestAQI = omJson.current.us_aqi ?? null;
      }
    }

    const payload = {
      requestedCoordinates: { lat: latitude, lon: longitude },
      openMeteo: openMeteoData,
      sources: {
        openMeteo: !!omJson,
      },
      note: 'Air quality data from Open-Meteo API. Current values include US AQI, PM10, PM2.5, CO, NO2, Ozone, Dust, and UV Index.',
    };

    return res.json(payload);
  } catch (err) {
    console.error('getAQI error:', err);
    return res.status(500).json({ error: 'AQI fetch failed', details: err.message });
  }
}

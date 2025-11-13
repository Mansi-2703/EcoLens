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

    // Open-Meteo Air Quality API params
    // Request hourly series for PM10, PM2.5, US AQI, carbon monoxide and dust
    // and also request current/latest values for those metrics
    const hourlyFields = ['pm10', 'pm2_5', 'us_aqi', 'carbon_monoxide', 'dust'].join(',');
    const currentFields = ['us_aqi', 'pm10', 'pm2_5', 'carbon_monoxide', 'dust'].join(',');

    const omParams = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      hourly: hourlyFields,
      current: currentFields,
      timezone: 'UTC',
    });

    const openMeteoUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?${omParams.toString()}`;

    // OpenAQ latest measurements near the coordinate
    const radius = 10000; // meters
    const openAqUrl = `https://api.openaq.org/v2/latest?coordinates=${encodeURIComponent(
      latitude
    )},${encodeURIComponent(longitude)}&radius=${radius}`;

    // Fetch both APIs in parallel
    const [omResp, openAqResp] = await Promise.all([
      fetch(openMeteoUrl),
      fetch(openAqUrl),
    ]);

    // Handle non-OK responses gracefully
    let omJson = null;
    if (omResp.ok) {
      omJson = await omResp.json().catch(() => null);
    } else {
      const txt = await omResp.text().catch(() => '');
      console.warn('Open-Meteo non-OK:', omResp.status, txt);
    }

    let openAqJson = null;
    if (openAqResp.ok) {
      openAqJson = await openAqResp.json().catch(() => null);
    } else {
      const txt = await openAqResp.text().catch(() => '');
      console.warn('OpenAQ non-OK:', openAqResp.status, txt);
    }

    // Parse Open-Meteo into friendly structure
    let openMeteoData = null;
    if (omJson) {
      const coords = {
        latitude: omJson.latitude ?? latitude,
        longitude: omJson.longitude ?? longitude,
        elevation: omJson.elevation ?? null,
      };

      const hourly = omJson.hourly || {};
      const times = Array.isArray(hourly.time) ? hourly.time : [];
      const pm10Arr = Array.isArray(hourly.pm10) ? hourly.pm10 : [];
      const pm2_5Arr = Array.isArray(hourly.pm2_5) ? hourly.pm2_5 : [];
      const usAqiArr = Array.isArray(hourly.us_aqi) ? hourly.us_aqi : [];
      const coArr = Array.isArray(hourly.carbon_monoxide) ? hourly.carbon_monoxide : [];
      const dustArr = Array.isArray(hourly.dust) ? hourly.dust : [];

      openMeteoData = {
        coordinates: coords,
        hourly: {
          time: times,
          pm10: pm10Arr,
          pm2_5: pm2_5Arr,
          us_aqi: usAqiArr,
          carbon_monoxide: coArr,
          dust: dustArr,
        },
      };

      // expose any `current` block from Open-Meteo if present
      if (omJson.current) {
        openMeteoData.current = {
          time: omJson.current.time ?? null,
          us_aqi: omJson.current.us_aqi ?? null,
          pm10: omJson.current.pm10 ?? null,
          pm2_5: omJson.current.pm2_5 ?? null,
          carbon_monoxide: omJson.current.carbon_monoxide ?? null,
          dust: omJson.current.dust ?? null,
        };
      }

      // find most recent us_aqi: prefer current.us_aqi, fallback to latest hourly value
      let latestAQI = null;
      if (openMeteoData.current && openMeteoData.current.us_aqi !== null && openMeteoData.current.us_aqi !== undefined) {
        latestAQI = openMeteoData.current.us_aqi;
      } else {
        for (let i = usAqiArr.length - 1; i >= 0; i--) {
          const val = usAqiArr[i];
          if (val !== null && val !== undefined) {
            latestAQI = val;
            break;
          }
        }
      }

      openMeteoData.latestAQI = latestAQI;
    }

    const payload = {
      requestedCoordinates: { lat: latitude, lon: longitude },
      openMeteo: openMeteoData,
      openAQ: openAqJson || null,
      sources: {
        openMeteo: !!omJson,
        openAQ: !!openAqJson,
      },
      note:
        'openMeteo.latestAQI is the most recent us_aqi value from Open-Meteo (may be null). openAQ contains station measurements.',
    };

    return res.json(payload);
  } catch (err) {
    console.error('getAQI error:', err);
    return res.status(500).json({ error: 'AQI fetch failed', details: err.message });
  }
}

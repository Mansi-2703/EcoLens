// server/controllers/weatherController.js
// ESM style, uses global fetch available in Node >= 18

export async function getWeather(req, res) {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ error: 'lat & lon required' });
    }

    // Open-Meteo current weather + hourly RH + wind speed
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(
      lat
    )}&longitude=${encodeURIComponent(
      lon
    )}&current_weather=true&hourly=relativehumidity_2m,windspeed_10m&timezone=auto`;

    const r = await fetch(url);
    if (!r.ok) {
      const txt = await r.text().catch(() => '');
      console.warn('Open-Meteo responded with non-OK status', r.status, txt);
      return res.status(502).json({ error: 'Open-Meteo fetch failed', status: r.status });
    }

    const data = await r.json();

    return res.json({
      location: { lat, lon },
      current: data.current_weather || null,
      hourly: data.hourly || null,
      raw: data,
    });
  } catch (err) {
    console.error('getWeather error:', err);
    res.status(500).json({ error: 'weather fetch failed', details: err.message });
  }
}

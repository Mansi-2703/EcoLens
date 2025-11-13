export const getMarine = async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    // Open-Meteo Marine Weather API
    const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,wave_direction,swell_wave_height,ocean_current_velocity,ocean_current_direction,sea_surface_temperature&hourly=wind_wave_direction&timezone=auto&forecast_days=1`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Marine API error: ${response.status}`);
    }

    const data = await response.json();

    // Get current hour's wind wave direction
    let currentWindWaveDirection = null;
    if (data.hourly && data.hourly.wind_wave_direction && data.hourly.time) {
      const currentTime = new Date().toISOString().slice(0, 13) + ':00';
      const timeIndex = data.hourly.time.findIndex(t => t.startsWith(currentTime.slice(0, 13)));
      if (timeIndex !== -1) {
        currentWindWaveDirection = data.hourly.wind_wave_direction[timeIndex] ?? null;
      } else if (data.hourly.wind_wave_direction.length > 0) {
        currentWindWaveDirection = data.hourly.wind_wave_direction[0] ?? null;
      }
    }

    // Transform the data to match our frontend structure
    const marineData = {
      currentMarine: {
        waveHeight: data.current?.wave_height ?? null,
        waveDirection: data.current?.wave_direction ?? null,
        swellWaveHeight: data.current?.swell_wave_height ?? null,
        oceanCurrentVelocity: data.current?.ocean_current_velocity ?? null,
        oceanCurrentDirection: data.current?.ocean_current_direction ?? null,
        seaSurfaceTemperature: data.current?.sea_surface_temperature ?? null,
        windWaveDirection: currentWindWaveDirection,
        time: data.current?.time ?? null
      },
      units: data.current_units || {}
    };

    res.json(marineData);
  } catch (error) {
    console.error('Error fetching marine data:', error);
    res.status(500).json({ error: 'Failed to fetch marine data' });
  }
};

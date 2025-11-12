export const getMarine = async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    // Open-Meteo Marine Weather API
    const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,swell_wave_height,ocean_current_velocity,ocean_current_direction,sea_surface_temperature`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Marine API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform the data to match our frontend structure
    const marineData = {
      currentMarine: {
        waveHeight: data.current?.wave_height ?? null,
        swellWaveHeight: data.current?.swell_wave_height ?? null,
        oceanCurrentVelocity: data.current?.ocean_current_velocity ?? null,
        oceanCurrentDirection: data.current?.ocean_current_direction ?? null,
        seaSurfaceTemperature: data.current?.sea_surface_temperature ?? null,
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

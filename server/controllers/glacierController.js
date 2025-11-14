// server/controllers/glacierController.js
// Fetches glacier data from DataHub and WGMS APIs

export async function getGlacierData(req, res) {
  try {
    // Fetch global glacier data from DataHub
    const datahubUrl = 'https://datahub.io/core/glacier-mass-balance/_r/-/data/glaciers.csv';
    const datahubResponse = await fetch(datahubUrl);

    if (!datahubResponse.ok) {
      console.warn('DataHub API non-OK:', datahubResponse.status);
      return res.status(502).json({ error: 'DataHub data fetch failed', status: datahubResponse.status });
    }

    const csvText = await datahubResponse.text();
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    const headers = lines[0].split(',').map(h => h.trim());

    // Find indices for Year and Mean cumulative mass-balance anomaly
    console.log('Headers:', headers);
    let yearIndex = headers.findIndex(h => h.toLowerCase().includes('year'));
    let massBalanceIndex = headers.findIndex(h => h.toLowerCase().includes('mean cumulative mass-balance'));
    console.log('Year index:', yearIndex, 'Mass balance index:', massBalanceIndex);

    // If not found, try alternative column names
    if (massBalanceIndex === -1) {
      massBalanceIndex = headers.findIndex(h => h.toLowerCase().includes('cumulative'));
      console.log('Alternative mass balance index:', massBalanceIndex);
    }

    // Hardcode indices based on known CSV structure
    if (yearIndex === -1) yearIndex = 0; // Year is usually first column
    if (massBalanceIndex === -1) massBalanceIndex = 1; // Mean cumulative mass-balance anomaly is usually second

    console.log('Final indices - Year:', yearIndex, 'Mass Balance:', massBalanceIndex);

    const globalData = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const year = parseInt(values[yearIndex], 10);
      const massBalance = parseFloat(values[massBalanceIndex]);
      if (isNaN(year) || isNaN(massBalance)) return null;
      return { year, massBalance };
    }).filter(item => item !== null).sort((a, b) => a.year - b.year);

    // Fetch regional data from WGMS
    const regionalData = {};
    const glacierIds = {
      'Himalayas': [3806, 3807, 3808],
      'Andes': [3809, 3810],
      'Alaska': [3811, 3812],
      'Alps': [3813, 3814]
    };

    for (const [region, ids] of Object.entries(glacierIds)) {
      regionalData[region] = [];

      for (const id of ids) {
        try {
          const wgmsUrl = `https://www.wgms.ch/data/min-data-series/FoG_MB_${id}.csv`;
          const wgmsResponse = await fetch(wgmsUrl);

          if (!wgmsResponse.ok) {
            console.warn(`WGMS API non-OK for glacier ${id}:`, wgmsResponse.status);
            continue;
          }

          const wgmsCsvText = await wgmsResponse.text();
          const wgmsLines = wgmsCsvText.split('\n').filter(line => line.trim() !== '');

          // Skip header and parse data
          const wgmsData = wgmsLines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            if (values.length < 3) return null;
            const year = parseInt(values[0], 10);
            const massBalance = parseFloat(values[2]); // Annual mass balance
            if (isNaN(year) || isNaN(massBalance)) return null;
            return { year, massBalance };
          }).filter(item => item !== null);

          regionalData[region].push(...wgmsData);
        } catch (err) {
          console.warn(`Error fetching WGMS data for glacier ${id}:`, err);
        }
      }

      // Aggregate data by year for the region
      const yearMap = new Map();
      regionalData[region].forEach(item => {
        if (!yearMap.has(item.year)) {
          yearMap.set(item.year, []);
        }
        yearMap.get(item.year).push(item.massBalance);
      });

      regionalData[region] = Array.from(yearMap.entries())
        .map(([year, balances]) => ({
          year,
          massBalance: balances.reduce((sum, val) => sum + val, 0) / balances.length
        }))
        .sort((a, b) => a.year - b.year);
    }

    const payload = {
      global: globalData,
      regional: regionalData,
      note: 'Global data from DataHub, regional data from WGMS'
    };

    return res.json(payload);
  } catch (err) {
    console.error('getGlacierData error:', err);
    return res.status(500).json({ error: 'Glacier data fetch failed', details: err.message });
  }
}

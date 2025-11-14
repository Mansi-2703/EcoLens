// server/controllers/glacierController.js
// Fetches glacier data from DataHub and WGMS APIs

// In-memory cache
let cachedData = null;
let cacheTimestamp = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export async function getGlacierData(req, res) {
  try {
    // Check if we have valid cached data
    if (cachedData && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
      console.log('Returning cached glacier data');
      return res.json(cachedData);
    }

    console.log('Fetching fresh glacier data...');

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
    let yearIndex = headers.findIndex(h => h.toLowerCase().includes('year'));
    let massBalanceIndex = headers.findIndex(h => h.toLowerCase().includes('mean cumulative mass-balance'));

    // If not found, try alternative column names
    if (massBalanceIndex === -1) {
      massBalanceIndex = headers.findIndex(h => h.toLowerCase().includes('cumulative'));
    }

    // Hardcode indices based on known CSV structure
    if (yearIndex === -1) yearIndex = 0; // Year is usually first column
    if (massBalanceIndex === -1) massBalanceIndex = 1; // Mean cumulative mass-balance anomaly is usually second

    const globalData = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const year = parseInt(values[yearIndex], 10);
      const massBalance = parseFloat(values[massBalanceIndex]);
      if (isNaN(year) || isNaN(massBalance)) return null;
      return { year, massBalance };
    }).filter(item => item !== null).sort((a, b) => a.year - b.year);

    // Fetch regional data from WGMS with parallelization
    const glacierIds = {
      'Himalayas': [3806, 3807, 3808],
      'Andes': [3809, 3810],
      'Alaska': [3811, 3812],
      'Alps': [3813, 3814]
    };

    // Parallelize all regional data fetching
    const regionalPromises = Object.entries(glacierIds).map(async ([region, ids]) => {
      const glacierPromises = ids.map(async (id) => {
        try {
          const wgmsUrl = `https://www.wgms.ch/data/min-data-series/FoG_MB_${id}.csv`;
          const wgmsResponse = await fetch(wgmsUrl);

          if (!wgmsResponse.ok) {
            console.warn(`WGMS API non-OK for glacier ${id}:`, wgmsResponse.status);
            return [];
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

          return wgmsData;
        } catch (err) {
          console.warn(`Error fetching WGMS data for glacier ${id}:`, err);
          return [];
        }
      });

      const glacierDataArrays = await Promise.all(glacierPromises);
      const allRegionData = glacierDataArrays.flat();

      // Aggregate data by year for the region
      const yearMap = new Map();
      allRegionData.forEach(item => {
        if (!yearMap.has(item.year)) {
          yearMap.set(item.year, []);
        }
        yearMap.get(item.year).push(item.massBalance);
      });

      const aggregatedData = Array.from(yearMap.entries())
        .map(([year, balances]) => ({
          year,
          massBalance: balances.reduce((sum, val) => sum + val, 0) / balances.length
        }))
        .sort((a, b) => a.year - b.year);

      return [region, aggregatedData];
    });

    const regionalResults = await Promise.all(regionalPromises);
    const regionalData = Object.fromEntries(regionalResults);

    const payload = {
      global: globalData,
      regional: regionalData,
      note: 'Global data from DataHub, regional data from WGMS'
    };

    // Cache the result
    cachedData = payload;
    cacheTimestamp = Date.now();
    console.log('Glacier data cached');

    return res.json(payload);
  } catch (err) {
    console.error('getGlacierData error:', err);
    return res.status(500).json({ error: 'Glacier data fetch failed', details: err.message });
  }
}

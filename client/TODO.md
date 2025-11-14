# TODO: Add Glacier Melt Visualization to GlacierInsights Page

## Tasks
- [x] Create client/src/services/glacierService.js: Function to fetch the CSV from https://datahub.io/core/glacier-mass-balance/_r/-/data/glaciers.csv, parse it, and return data as an array of {year, massBalance}.
- [x] Create client/src/components/GlacierCumulativeChart.jsx: Cumulative Mass Loss Chart showing long-term melt accumulation.
- [x] Create client/src/components/GlacierTurningPointsChart.jsx: Highlighted "Turning Points" Chart with annotations for max loss, temporary gains, steepest decline.
- [x] Create client/src/components/GlacierRegionalChart.jsx: Region Comparison Multi-Line Chart overlaying global and regional data.
- [x] Extend glacierService.js to fetch WGMS regional data for specific glacier IDs.
- [x] Edit client/src/components/GlacierInsights.jsx: Combine 3 chart components into a single card with tab/button selector to switch between visualizations.
- [x] Install any additional dependencies if needed (e.g., papaparse for CSV parsing, but we can do it manually). Removed chartjs-plugin-annotation due to import issues.
- [x] Test the data fetching and chart rendering. Dev server started at http://localhost:5174/
- [x] Implemented 3 visualization types as requested: Cumulative Mass Loss, Turning Points, and Regional Comparison.
- [x] Create backend proxy to avoid CORS issues.
- [x] Debug CSV parsing issues by adjusting column searches and hardcoding indices.
- [x] Fix server endpoint to return data correctly.
- [x] Update GlacierInsights.jsx to use a single card with selector for the three charts.
- [x] Add insights and interpretation text at the bottom of each chart.

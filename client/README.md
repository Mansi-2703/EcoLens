# EcoLens Climate Prediction UI

A React-based climate prediction interface using MapLibre GL JS and Open-Meteo APIs.

## Features

- Interactive MapLibre map for location selection
- Search by place name or latitude/longitude coordinates
- Hourly weather forecasts with multiple metrics
- Animated heatmap overlay for temperature visualization
- Responsive design with chart.js visualizations

## Installation

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173` (or the port shown in terminal)

## APIs Used

- **Geocoding**: `https://geocoding-api.open-meteo.com/v1/search`
- **Forecast**: `https://api.open-meteo.com/v1/forecast`

No API keys required - all services are free and open.

## Components

- `MapLibreMap.jsx`: Interactive map component
- `SearchBar.jsx`: Location search with geocoding
- `ForecastPanel.jsx`: Weather charts and data display
- `HeatmapLayer.jsx`: Animated temperature heatmap
- `Climate.jsx`: Main container component

## Usage

1. Click on the map to select a location
2. Or search for a place name/city
3. Or enter coordinates in "lat,lng" format
4. View hourly forecasts in the right panel
5. Toggle heatmap to see temperature visualization
6. Use the time slider to animate through hours

## Metrics Available

- Temperature (°C)
- Precipitation Probability (%)
- Wind Speed (km/h)
- Relative Humidity (%)
- Visibility (m)
- And more from Open-Meteo API

## Customization

To change forecast metrics, modify the `hourly` parameter in `ForecastPanel.jsx`:

```javascript
const response = await fetch(
  `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&timezone=auto&hourly=YOUR_METRICS_HERE`
);
```

Available metrics: temperature_2m, relative_humidity_2m, precipitation_probability, wind_speed_10m, etc.

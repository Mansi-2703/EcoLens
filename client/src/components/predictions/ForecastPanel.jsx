import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ForecastPanel = ({ location, onForecastData }) => {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locationName, setLocationName] = useState(null);

  useEffect(() => {
    if (location) {
      fetchForecast(location);
      fetchLocationName(location);
    }
  }, [location]);

  const fetchForecast = async ({ lat, lng }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&timezone=auto&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,rain,visibility,dew_point_2m,pressure_msl,cloud_cover,wind_gusts_10m,wind_direction_10m,wind_speed_10m`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch forecast data');
      }

      const data = await response.json();
      setForecast(data);
      if (onForecastData) {
        onForecastData(data);
      }
    } catch (err) {
      console.error('Forecast fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocationName = async ({ lat, lng }) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch location name');
      }
      const data = await response.json();
      setLocationName(data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    } catch (err) {
      console.error('Reverse geocoding error:', err);
      setLocationName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  };

  const createChartData = (data, label, color) => {
    if (!data || !data.time || !data.values) return null;

    return {
      labels: data.time.map(t => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
      datasets: [{
        label,
        data: data.values,
        borderColor: color,
        backgroundColor: color + '20',
        tension: 0.1,
        fill: true,
      }],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Hourly Forecast',
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time',
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Value',
        },
      },
    },
  };

  if (!location) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        Click on the map or search for a location to view forecast
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>Loading forecast...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
        Error: {error}
      </div>
    );
  }

  if (!forecast) {
    return null;
  }

  const renderChart = (data, label, color, unit) => {
    const chartData = createChartData(data, label, color);
    if (!chartData) return null;

    return (
      <div style={{ marginBottom: '20px' }}>
        <h4>{label} ({unit})</h4>
        <Line data={chartData} options={chartOptions} />
      </div>
    );
  };

  return (
    <div style={{ padding: '20px', maxHeight: '80vh', overflowY: 'auto' }}>
      <h3>Forecast for {locationName || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}</h3>

      {renderChart(forecast.hourly.temperature_2m, 'Temperature', '#ff6384', '°C')}
      {renderChart(forecast.hourly.precipitation_probability, 'Precipitation Probability', '#36a2eb', '%')}
      {renderChart(forecast.hourly.wind_speed_10m, 'Wind Speed', '#4bc0c0', 'km/h')}
      {renderChart(forecast.hourly.relative_humidity_2m, 'Relative Humidity', '#9966ff', '%')}
      {renderChart(forecast.hourly.visibility, 'Visibility', '#ff9f40', 'm')}
    </div>
  );
};

export default ForecastPanel;

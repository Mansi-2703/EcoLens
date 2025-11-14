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
  Legend
} from 'chart.js';
import { getGlacierMeltData } from '../services/glacierService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const GlacierCumulativeChart = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const meltData = await getGlacierMeltData();
        setData(meltData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <div>Loading cumulative glacier data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', color: 'red' }}>
        Error loading data: {error}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        No data available
      </div>
    );
  }

  const chartData = {
    labels: data.map(d => d.year),
    datasets: [
      {
        label: 'Cumulative Mass Balance Anomaly (m w.e.)',
        data: data.map(d => d.massBalance),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.1,
        pointRadius: 2,
        pointHoverRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#f1f5f9',
        },
      },
      title: {
        display: true,
        text: 'Cumulative Mass Loss - Long-term Glacier Melt Accumulation',
        color: '#f1f5f9',
        font: {
          size: 16,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#f1f5f9',
        bodyColor: '#f1f5f9',
        callbacks: {
          label: (context) => `Mass Balance: ${context.parsed.y.toFixed(2)} m w.e.`,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Year',
          color: '#f1f5f9',
        },
        ticks: {
          color: '#f1f5f9',
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.2)',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Mass Balance Anomaly (m w.e.)',
          color: '#f1f5f9',
        },
        ticks: {
          color: '#f1f5f9',
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.2)',
        },
      },
    },
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1 }}>
        <Line data={chartData} options={options} />
      </div>
      <div style={{
        marginTop: '15px',
        padding: '15px',
        background: 'rgba(15, 23, 42, 0.5)',
        borderRadius: '8px',
        border: '1px solid rgba(148, 163, 184, 0.2)'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#f1f5f9', fontSize: '14px' }}>Key Insights:</h4>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#94a3b8', fontSize: '13px', lineHeight: '1.5' }}>
          <li>The cumulative mass balance has shown a steady decline since 1956, with increasingly negative values indicating progressive glacier shrinkage.</li>
          <li>The steepest declines occurred in the 1990s and 2010s, coinciding with accelerated climate warming.</li>
          <li>By 2023, global glaciers have lost approximately 29.7 meters of water equivalent mass compared to 1956 levels.</li>
          <li>This trend highlights the urgent need for climate action to mitigate further ice loss and sea level rise.</li>
        </ul>
      </div>
    </div>
  );
};

export default GlacierCumulativeChart;

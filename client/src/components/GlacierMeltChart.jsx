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

const GlacierMeltChart = () => {
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
        <div>Loading glacier melt data...</div>
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

  // Calculate annotations for turning points
  const massBalances = data.map(d => d.massBalance);
  const minIndex = massBalances.indexOf(Math.min(...massBalances));
  const maxIndex = massBalances.indexOf(Math.max(...massBalances));

  // Find steepest decline (largest negative change)
  let steepestDeclineIndex = 0;
  let maxDecline = 0;
  for (let i = 1; i < massBalances.length; i++) {
    const decline = massBalances[i - 1] - massBalances[i];
    if (decline > maxDecline) {
      maxDecline = decline;
      steepestDeclineIndex = i;
    }
  }

  // Find temporary gains (positive changes)
  const gains = [];
  for (let i = 1; i < massBalances.length; i++) {
    if (massBalances[i] > massBalances[i - 1]) {
      gains.push(i);
    }
  }
  const gainIndex = gains.length > 0 ? gains[Math.floor(gains.length / 2)] : null; // Middle gain for annotation

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
        text: 'Global Glacier Cumulative Mass Loss Over Time',
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
      // Removed annotation plugin usage due to import issues
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
    <div style={{ height: '400px', width: '100%' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default GlacierMeltChart;

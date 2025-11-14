import React from 'react';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const GlacierRegionalChart = ({ globalData, regionalData }) => {
  if (!globalData || !regionalData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        No data available
      </div>
    );
  }

  // Prepare datasets
  const datasets = [
    {
      label: 'Global (DataHub)',
      data: globalData.map(d => d.massBalance),
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      fill: false,
      tension: 0.1,
      pointRadius: 1,
    }
  ];

  // Colors for regions
  const regionColors = {
    'Himalayas': '#3b82f6',
    'Andes': '#10b981',
    'Alaska': '#f59e0b',
    'Alps': '#8b5cf6'
  };

  // Add regional datasets
  Object.entries(regionalData).forEach(([region, data]) => {
    if (data && data.length > 0) {
      datasets.push({
        label: region,
        data: data.map(d => d.massBalance),
        borderColor: regionColors[region] || '#6b7280',
        backgroundColor: 'rgba(107, 114, 128, 0.1)',
        fill: false,
        tension: 0.1,
        pointRadius: 1,
      });
    }
  });

  // Create labels (years) - use global data years as base
  const labels = globalData.map(d => d.year);

  const chartData = {
    labels,
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#f1f5f9',
          boxWidth: 12,
          font: {
            size: 11,
          },
        },
      },
      title: {
        display: true,
        text: 'Regional Glacier Melt Comparison',
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
          label: (context) => `${context.dataset.label}: ${context.parsed.y?.toFixed(2) || 'N/A'} m w.e.`,
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
          maxTicksLimit: 10,
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.2)',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Mass Balance (m w.e.)',
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
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ height: '280px', position: 'relative' }}>
        <Line data={chartData} options={options} />
      </div>
      <div style={{ 
        fontSize: '12px', 
        color: '#94a3b8', 
        textAlign: 'center',
        padding: '10px 0',
        borderBottom: '1px solid rgba(148, 163, 184, 0.2)'
      }}>
        Comparing global trends with regional glacier data from WGMS
      </div>
      <div style={{
        padding: '15px',
        background: 'rgba(15, 23, 42, 0.5)',
        borderRadius: '8px',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        flex: 1,
        overflowY: 'auto'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#f1f5f9', fontSize: '14px' }}>Key Insights:</h4>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#94a3b8', fontSize: '13px', lineHeight: '1.5' }}>
          <li>The global trend shows consistent glacier mass loss, while regional variations highlight different rates of melt across mountain ranges.</li>
          <li>Himalayan and Andean glaciers show accelerated decline in recent decades due to both climate change and regional weather patterns.</li>
          <li>Alaska's glaciers are particularly sensitive to Arctic warming, showing some of the most rapid mass loss rates.</li>
          <li>Alpine glaciers in Europe demonstrate the impact of both climate and human activities on ice preservation.</li>
          <li>Regional comparisons help identify areas needing urgent conservation efforts and climate adaptation strategies.</li>
        </ul>
      </div>
    </div>
  );
};

export default GlacierRegionalChart;

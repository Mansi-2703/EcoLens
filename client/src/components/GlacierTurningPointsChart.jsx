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

const GlacierTurningPointsChart = () => {
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
        <div>Loading turning points data...</div>
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

  // Calculate turning points
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
  const gainIndex = gains.length > 0 ? gains[Math.floor(gains.length / 2)] : null;

  const chartData = {
    labels: data.map(d => d.year),
    datasets: [
      {
        label: 'Mass Balance Anomaly (m w.e.)',
        data: data.map(d => d.massBalance),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: false,
        tension: 0.1,
        pointRadius: (context) => {
          const index = context.dataIndex;
          return (index === minIndex || index === maxIndex || index === steepestDeclineIndex || index === gainIndex) ? 8 : 2;
        },
        pointHoverRadius: 8,
        pointBackgroundColor: (context) => {
          const index = context.dataIndex;
          if (index === minIndex) return '#dc2626'; // Max loss - red
          if (index === maxIndex) return '#16a34a'; // Max gain - green
          if (index === steepestDeclineIndex) return '#ea580c'; // Steepest decline - orange
          if (index === gainIndex) return '#16a34a'; // Temporary gain - green
          return '#ef4444';
        },
        pointBorderColor: (context) => {
          const index = context.dataIndex;
          if (index === minIndex) return '#dc2626';
          if (index === maxIndex) return '#16a34a';
          if (index === steepestDeclineIndex) return '#ea580c';
          if (index === gainIndex) return '#16a34a';
          return '#ef4444';
        },
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
        text: 'Glacier Turning Points - Key Events in Mass Balance',
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
          label: (context) => {
            const index = context.dataIndex;
            let label = `Mass Balance: ${context.parsed.y.toFixed(2)} m w.e.`;
            if (index === minIndex) label += ' (Maximum Loss)';
            if (index === maxIndex) label += ' (Maximum Gain)';
            if (index === steepestDeclineIndex) label += ' (Steepest Decline)';
            if (index === gainIndex) label += ' (Temporary Gain)';
            return label;
          },
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
      <div style={{ height: '300px', position: 'relative' }}>
        <Line data={chartData} options={options} />
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <span style={{ color: '#dc2626' }}>● Maximum Loss ({data[minIndex]?.year})</span>
            <span style={{ color: '#16a34a' }}>● Maximum Gain ({data[maxIndex]?.year})</span>
            <span style={{ color: '#ea580c' }}>● Steepest Decline ({data[steepestDeclineIndex]?.year})</span>
            {gainIndex && <span style={{ color: '#16a34a' }}>● Temporary Gain ({data[gainIndex]?.year})</span>}
          </div>
        </div>
      </div>
      <div style={{
        marginTop: '15px',
        padding: '15px',
        background: 'rgba(15, 23, 42, 0.5)',
        borderRadius: '8px',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        flex: 1,
        overflowY: 'auto'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#f1f5f9', fontSize: '14px' }}>Key Insights:</h4>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#94a3b8', fontSize: '13px', lineHeight: '1.5' }}>
          <li>The highlighted points show critical moments in glacier mass balance history, with the maximum loss occurring in {data[minIndex]?.year}.</li>
          <li>The steepest decline period around {data[steepestDeclineIndex]?.year} indicates accelerated ice melt during that timeframe.</li>
          <li>Temporary gains, like in {data[gainIndex]?.year}, show brief recovery periods but don't reverse the overall downward trend.</li>
          <li>These turning points correlate with major climate events and policy changes affecting global temperatures.</li>
        </ul>
      </div>
    </div>
  );
};

export default GlacierTurningPointsChart;

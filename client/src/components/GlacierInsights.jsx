import React, { useState } from 'react';
import GlacierMap from './GlacierMap';
import GlacierCumulativeChart from './GlacierCumulativeChart';
import GlacierTurningPointsChart from './GlacierTurningPointsChart';
import GlacierRegionalChart from './GlacierRegionalChart';

const GlacierInsights = () => {
  const [selectedChart, setSelectedChart] = useState('cumulative');

  const chartOptions = [
    { id: 'cumulative', label: 'Cumulative Mass Loss', component: GlacierCumulativeChart },
    { id: 'turningPoints', label: 'Turning Points', component: GlacierTurningPointsChart },
    { id: 'regional', label: 'Regional Comparison', component: GlacierRegionalChart }
  ];

  const SelectedChartComponent = chartOptions.find(option => option.id === selectedChart)?.component;

  return (
    <div className="glacier-page" style={{
      background: "#0b0b0f",
      minHeight: "100vh",
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      color: "#f1f5f9"
    }}>
      <p style={{
        fontSize: "16px",
        textAlign: "center",
        color: "#94a3b8",
        marginTop: "0",
        marginBottom: "10px"
      }}>
        Interactive satellite map showing global glacier coverage, loss patterns, and detailed insights
      </p>

      {/* Map Container */}
      <div style={{
        width: "100%",
        maxWidth: "1400px",
        height: "70vh",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        marginBottom: "20px"
      }}>
        <GlacierMap />
      </div>

      {/* Chart Selector and Visualization Card */}
      <div style={{
        width: "100%",
        maxWidth: "1400px",
        background: "rgba(15, 23, 42, 0.9)",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        color: "#f1f5f9"
      }}>
        <h3 style={{
          margin: "0 0 20px 0",
          fontSize: "18px",
          textAlign: "center",
          color: "#f1f5f9"
        }}>
          Glacier Melt Analysis
        </h3>

        {/* Chart Selector Buttons */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          marginBottom: "20px",
          flexWrap: "wrap"
        }}>
          {chartOptions.map(option => (
            <button
              key={option.id}
              onClick={() => setSelectedChart(option.id)}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                border: "none",
                background: selectedChart === option.id ? "#3b82f6" : "#475569",
                color: "#f1f5f9",
                cursor: "pointer",
                fontSize: "14px",
                transition: "background 0.2s"
              }}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Chart Container */}
        <div style={{
          height: "500px",
          width: "100%",
          overflow: "hidden"
        }}>
          {SelectedChartComponent && <SelectedChartComponent />}
        </div>
      </div>
    </div>
  );
};

export default GlacierInsights;

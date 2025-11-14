import React from 'react';
import GlacierMap from './GlacierMap';

const GlacierInsights = () => {
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
      <h1 style={{
        fontSize: "32px",
        fontWeight: "700",
        marginBottom: "20px",
        textAlign: "center"
      }}>
        Glacier Insights
      </h1>
      <p style={{
        fontSize: "16px",
        textAlign: "center",
        color: "#94a3b8",
        marginBottom: "30px"
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
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
      }}>
        <GlacierMap />
      </div>


    </div>
  );
};

export default GlacierInsights;

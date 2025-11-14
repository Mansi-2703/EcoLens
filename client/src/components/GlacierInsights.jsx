import React from 'react';

const GlacierInsights = () => {
  return (
    <div className="glacier-page" style={{
      background: "#0b0b0f",
      minHeight: "100vh",
      padding: "40px 20px",
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
        fontSize: "18px",
        textAlign: "center",
        color: "#94a3b8"
      }}>
        Coming Soon - Advanced glacier monitoring and analysis
      </p>
    </div>
  );
};

export default GlacierInsights;

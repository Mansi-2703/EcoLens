import React from "react";

export default function AQIGuideBox() {
  const aqiLevels = [
    { range: "0-50", level: "Good", color: "#50f08a", icon: "😊" },
    { range: "51-100", level: "Moderate", color: "#f1f04e", icon: "😐" },
    { range: "101-150", level: "Unhealthy for Sensitive", color: "#f5a623", icon: "😷" },
    { range: "151-200", level: "Unhealthy", color: "#f55d3e", icon: "😨" },
    { range: "201-300", level: "Very Unhealthy", color: "#9b2fae", icon: "🤢" },
    { range: "301+", level: "Hazardous", color: "#7e0023", icon: "☠️" }
  ];

  return (
    <div className="aqi-guide-box">
      <h4>US AQI Guide</h4>
      
      <div className="aqi-guide-content">
        {aqiLevels.map((level, index) => (
          <div key={index} className="aqi-guide-item" style={{ borderLeft: `4px solid ${level.color}` }}>
            <span className="aqi-icon">{level.icon}</span>
            <span className="aqi-range">{level.range}</span>
            <span className="aqi-level">{level.level}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

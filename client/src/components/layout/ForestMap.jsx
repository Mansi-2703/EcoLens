import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

// Mock Hansen-style data
const continentData = {
  Asia: [
    { year: 2000, gain: 0.1, loss: 0.25 },
    { year: 2002, gain: 0.12, loss: 0.27 },
    { year: 2004, gain: 0.14, loss: 0.29 },
    { year: 2006, gain: 0.16, loss: 0.31 },
    { year: 2008, gain: 0.18, loss: 0.33 },
    { year: 2010, gain: 0.2, loss: 0.35 },
    { year: 2012, gain: 0.21, loss: 0.36 },
    { year: 2014, gain: 0.22, loss: 0.37 },
    { year: 2016, gain: 0.23, loss: 0.38 },
    { year: 2018, gain: 0.24, loss: 0.39 },
    { year: 2020, gain: 0.25, loss: 0.4 },
    { year: 2022, gain: 0.26, loss: 0.41 },
  ],
  Africa: [
    { year: 2000, gain: 0.05, loss: 0.12 },
    { year: 2002, gain: 0.06, loss: 0.13 },
    { year: 2004, gain: 0.07, loss: 0.14 },
    { year: 2006, gain: 0.08, loss: 0.15 },
    { year: 2008, gain: 0.09, loss: 0.16 },
    { year: 2010, gain: 0.1, loss: 0.17 },
    { year: 2012, gain: 0.11, loss: 0.18 },
    { year: 2014, gain: 0.12, loss: 0.19 },
    { year: 2016, gain: 0.13, loss: 0.2 },
    { year: 2018, gain: 0.14, loss: 0.21 },
    { year: 2020, gain: 0.15, loss: 0.22 },
    { year: 2022, gain: 0.16, loss: 0.23 },
  ],
  Europe: [
    { year: 2000, gain: 0.02, loss: 0.05 },
    { year: 2002, gain: 0.025, loss: 0.055 },
    { year: 2004, gain: 0.03, loss: 0.06 },
    { year: 2006, gain: 0.035, loss: 0.065 },
    { year: 2008, gain: 0.04, loss: 0.07 },
    { year: 2010, gain: 0.045, loss: 0.075 },
    { year: 2012, gain: 0.05, loss: 0.08 },
    { year: 2014, gain: 0.055, loss: 0.085 },
    { year: 2016, gain: 0.06, loss: 0.09 },
    { year: 2018, gain: 0.065, loss: 0.095 },
    { year: 2020, gain: 0.07, loss: 0.1 },
    { year: 2022, gain: 0.075, loss: 0.105 },
  ],
  NorthAmerica: [
    { year: 2000, gain: 0.03, loss: 0.08 },
    { year: 2002, gain: 0.035, loss: 0.085 },
    { year: 2004, gain: 0.04, loss: 0.09 },
    { year: 2006, gain: 0.045, loss: 0.095 },
    { year: 2008, gain: 0.05, loss: 0.1 },
    { year: 2010, gain: 0.055, loss: 0.105 },
    { year: 2012, gain: 0.06, loss: 0.11 },
    { year: 2014, gain: 0.065, loss: 0.115 },
    { year: 2016, gain: 0.07, loss: 0.12 },
    { year: 2018, gain: 0.075, loss: 0.125 },
    { year: 2020, gain: 0.08, loss: 0.13 },
    { year: 2022, gain: 0.085, loss: 0.135 },
  ],
  SouthAmerica: [
    { year: 2000, gain: 0.08, loss: 0.2 },
    { year: 2002, gain: 0.09, loss: 0.21 },
    { year: 2004, gain: 0.1, loss: 0.22 },
    { year: 2006, gain: 0.11, loss: 0.23 },
    { year: 2008, gain: 0.12, loss: 0.24 },
    { year: 2010, gain: 0.13, loss: 0.25 },
    { year: 2012, gain: 0.14, loss: 0.26 },
    { year: 2014, gain: 0.15, loss: 0.27 },
    { year: 2016, gain: 0.16, loss: 0.28 },
    { year: 2018, gain: 0.17, loss: 0.29 },
    { year: 2020, gain: 0.18, loss: 0.3 },
    { year: 2022, gain: 0.19, loss: 0.31 },
  ],
  Oceania: [
    { year: 2000, gain: 0.01, loss: 0.03 },
    { year: 2002, gain: 0.012, loss: 0.032 },
    { year: 2004, gain: 0.014, loss: 0.034 },
    { year: 2006, gain: 0.016, loss: 0.036 },
    { year: 2008, gain: 0.018, loss: 0.038 },
    { year: 2010, gain: 0.02, loss: 0.04 },
    { year: 2012, gain: 0.022, loss: 0.042 },
    { year: 2014, gain: 0.024, loss: 0.044 },
    { year: 2016, gain: 0.026, loss: 0.046 },
    { year: 2018, gain: 0.028, loss: 0.048 },
    { year: 2020, gain: 0.03, loss: 0.05 },
    { year: 2022, gain: 0.032, loss: 0.052 },
  ],
};

const colors = {
  gain: "#3ca374", // muted neon green
  loss: "rgba(255, 23, 23, 1)", // muted neon red
};


const ForestMap = () => {
  return (
    <div
      className="forest-page"
      style={{
        background: "#0b0b0f",
        minHeight: "100vh",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Map Section */}
      <div
        className="map-container"
        style={{
          width: "100%",
          maxWidth: "1200px",
          height: "60vh",
          margin: "0 auto 40px",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <iframe
          src="https://rare-journey-475808-q7.projects.earthengine.app/view/ecolens"
          title="EcoLens Forest Cover Map"
          style={{ width: "100%", height: "100%", border: "none" }}
          allowFullScreen
        />
      </div>

      {/* Continent-wise Charts */}
      {Object.entries(continentData).map(([continent, data]) => (
        <div
          key={continent}
          style={{
            width: "100%",
            maxWidth: "1200px",
            margin: "0 auto 40px",
            background: "rgba(30, 41, 59, 0.7)",
            padding: "20px",
            borderRadius: "12px",
          }}
        >
          <h2
            style={{
              color: "#f1f5f9",
              textAlign: "center",
              marginBottom: "20px",
            }}
          >
            {continent} Forest Gain & Loss (2000-2022)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="year" stroke="#cbd5e1" />
              <YAxis stroke="#cbd5e1" domain={[0, 0.5]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #94a3b8",
                  borderRadius: "8px",
                  color: "#f1f5f9",
                }}
              />
              <Legend />
              <Bar dataKey="gain" fill={colors.gain} />
              <Bar dataKey="loss" fill={colors.loss} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  );
};

export default ForestMap;

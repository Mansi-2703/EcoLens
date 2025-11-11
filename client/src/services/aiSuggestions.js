export const getAISuggestions = (data) => {
  if (!data) return [];
  const s = [];
  if (data.aqi > 150)
    s.push({
      title: "Health Correlation",
      text: `AQI ${data.aqi} — High risk for asthma and breathing issues.`,
    });
  else if (data.aqi > 100)
    s.push({
      title: "Health Correlation",
      text: `AQI ${data.aqi} — Moderate; sensitive groups should limit outdoor time.`,
    });

  if (data.temperature > 35)
    s.push({
      title: "Policy Recommendation",
      text: `Heat alert (${data.temperature}°C). Suggest hydration campaigns.`,
    });

  return s;
};

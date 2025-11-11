export const suggestionRules = (data) => {
  const s = [];
  if (!data) return s;

  if (data.aqi > 150)
    s.push({
      title: "Health Correlation",
      text: "High AQI levels — consider reducing traffic and outdoor exposure.",
    });

  if (data.temperature > 35)
    s.push({
      title: "Policy Recommendation",
      text: "High temperature — implement cooling measures and public warnings.",
    });

  return s;
};

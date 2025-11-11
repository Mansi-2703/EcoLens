import React from "react";
import { getAISuggestions } from "../services/aiSuggestions";

export default function SuggestionBox({ data }) {
  const suggestions = getAISuggestions(data);
  return (
    <div className="suggestions">
      {suggestions.map((s, i) => (
        <div className="suggitem" key={i}>
          <strong>{s.title}</strong>
          <p>{s.text}</p>
        </div>
      ))}
    </div>
  );
}

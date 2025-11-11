import React from "react";

export default function Card({ title, value, unit }) {
  return (
    <div className="card">
      <h4>{title}</h4>
      <p>
        {value} {unit || ""}
      </p>
    </div>
  );
}

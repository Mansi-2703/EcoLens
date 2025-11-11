// client/src/components/ClickableMap.jsx
import React from "react";

export default function ClickableMap({ onPick }) {
  return (
    <div
      onClick={() => onPick && onPick(19.19 + Math.random(), 72.86 + (Math.random() - 0.5))}
      style={{
        width: "100%",
        height: 420,
        borderRadius: 8,
        background: "linear-gradient(135deg,#001,#012)",
        color: "#9df",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
    >
      Click to simulate a map pick (stub ClickableMap)
    </div>
  );
}

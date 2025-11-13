// ...existing code...
import React from "react";

const ForestMap = () => {
  return (
    <div
      className="flex justify-center items-center bg-[#0b0b0f]"
      style={{
        width: "100%",
        height: "calc(100vh - 120px)",
        position: "relative",
      }}
    >
      <iframe
        src="https://rare-journey-475808-q7.projects.earthengine.app/view/ecolens"
        title="EcoLens Forest Cover Map"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
        }}
        allowFullScreen
      />
    </div>
  );
};

export default ForestMap;
// ...existing code..
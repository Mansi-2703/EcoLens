import React from "react";

const ForestMap = () => {
  return (
    <div
      className="fixed left-0 right-0 bottom-0 flex justify-center items-center bg-[#0b0b0f]"
      style={{
        top: "var(--header-height, 80px)", // space for header
        height: "calc(100vh - var(--header-height, 80px))",
        zIndex: 0,
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

// ...existing code...
import React from "react";

const ForestMap = () => {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-20 bg-gradient-to-r from-green-900 to-green-700 flex items-center justify-center px-6 shadow-lg" style={{ zIndex: 10 }}>
        <h1 className="text-center text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-green-200 text-3xl font-bold" style={{ textShadow: '0 0 10px rgba(134, 239, 172, 0.6)' }}>Forest Cover</h1>
      </header>
      <div
        className="fixed left-0 right-0 bottom-0 flex justify-center items-center bg-[#0b0b0f]"
        style={{
          top: "var(--header-height, 80px)",
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
    </>
  );
};

export default ForestMap;
// ...existing code..
// ...existing code...
import React from "react";

const ForestMap = () => {
  return (
    <>
      <header className="header" style={{ height: '108px', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '0', paddingBottom: '0' }}>
        <h2 className="gradient-text">Global Forest Cover</h2>
        <p className="coords">Real-time global forest cover monitoring</p>
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
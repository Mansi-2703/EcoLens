import React from 'react';

export default function LandingPage({ onGetStarted }) {
  return (
    <div className="landing-page">

      {/* ---- Background Video ---- */}
      <video
        className="bg-video"
        autoPlay
        muted
        loop
        playsInline
        src="/newforest_bg.mp4"
      />

      {/* ---- Dark Overlay ---- */}
      <div className="overlay"></div>

      {/* ---- Main Content ---- */}
      <div className="landing-content">
        <h1 className="landing-title">EcoLens</h1>

        <p className="landing-subtitle">
          An interactive dashboard for environmental monitoring,
          <br />
          powered by real-time global data insights.
        </p>

        <button className="get-started-btn" onClick={onGetStarted}>
          Get Started
        </button>
      </div>

      <style>{`
        .landing-page {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          z-index: 10000;
          background: black;
        }

        /* --- Video Background --- */
        .bg-video {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 110%;
          height: 110%;
          object-fit: cover;
          transform: translate(-50%, -50%);
          z-index: 1;
          filter: brightness(0.75) saturate(1.1); /* brighter */
        }

        /* --- Dark Overlay --- */
        .overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.35); /* lighter overlay */
          z-index: 2;
        }

        /* --- EcoLens Title --- */
        .landing-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 8rem;
          font-weight: 1000;
          margin: 0 0 20px 0;
          color: rgba(255, 255, 255, 0.62);
          letter-spacing: -2px;
          -webkit-text-stroke: 4px #072f3bff;
          text-stroke: 4px #357235ff;
        }

        /* Subtitle */
        .landing-subtitle {
          font-size: 1.25rem;
          color: #d1d5db;
          margin-bottom: 50px;
          line-height: 1.8;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        /* --- Transparent Glass Button --- */
        .get-started-btn {
          background: rgba(255, 255, 255, 0.35);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.5);
          color: black;
          font-size: 1.1rem;
          font-weight: 700;
          padding: 16px 48px;
          border-radius: 40px;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }

        .get-started-btn:hover {
          background: rgba(255, 255, 255, 0.6);
          transform: translateY(-4px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.3);
        }

        .get-started-btn:active {
          transform: translateY(-1px);
        }

        /* Fade In Animation */
        .landing-content {
          position: relative;
          z-index: 5;
          text-align: center;
          animation: fadeInUp 1.1s ease-out;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }





        /* --- Mobile Responsive --- */
        @media (max-width: 768px) {
          .landing-title {
            font-size: 3.2rem;
          }
          .landing-subtitle {
            font-size: 1rem;
            padding: 0 20px;
          }
          .get-started-btn {
            font-size: 1rem;
            padding: 14px 40px;
          }
        }
      `}</style>
    </div>
  );
}

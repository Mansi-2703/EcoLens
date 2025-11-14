import React from 'react';

export default function PredictionHeader({ title, locationName }) {
  return (
    <header className="prediction-header">
      <div className="header-content">
        <div className="title-section">
          <h2 className="gradient-text">{title}</h2>
          <p className="coords">{locationName}</p>
        </div>
        <div className="logo-section">
          <img src="/ecolens-logo.png" alt="EcoLens Logo" className="logo" />
        </div>
      </div>

      <style>{`
        .prediction-header {
          position: sticky;
          top: 0;
          z-index: 1000;
          border: 2px solid transparent;
          border-radius: 16px;
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%) padding-box,
                      linear-gradient(135deg, #1ad1ff 0%, #00c6ff 50%, #1ad1ff 100%) border-box;
          backdrop-filter: blur(20px);
          padding: 15px 40px;
          margin: 20px auto;
          max-width: 1400px;
          width: calc(100% - 40px);
          animation: slideDown 0.8s ease-out;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .title-section {
          flex: 1;
          text-align: center;
        }

        .gradient-text {
          display: inline-block;
          margin: 0;
          padding: 0;
          font-family: 'Poppins', system-ui, -apple-system, 'Segoe UI', Arial, sans-serif;
          font-size: 2.5rem;
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: 0.3px;
          background: linear-gradient(270deg, #00f5a0 0%, #00c6ff 50%, #00e0b8 100%);
          background-size: 600% 600%;
          background-repeat: no-repeat;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
          animation: gradientShift 8s ease infinite;
        }

        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .coords {
          color: #94a3b8;
          font-size: 14px;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 500;
        }

        .logo-section {
          flex-shrink: 0;
        }

      .logo {
        font-weight: 700;
        color: var(--accent);
        font-size: 1.8rem;
        text-align: left;
        transition: font-size 0.3s ease;
        white-space: nowrap;
        overflow: hidden;
        padding-top: 10px;
      }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .prediction-header {
            padding: 15px 20px;
            margin: 15px auto;
            width: calc(100% - 30px);
          }

          .gradient-text {
            font-size: 24px;
          }

          .coords {
            font-size: 12px;
          }

          
        }
      `}</style>
    </header>
  );
}

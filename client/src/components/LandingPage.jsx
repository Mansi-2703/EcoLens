import React from 'react';

export default function LandingPage({ onGetStarted }) {
  return (
    <div className="landing-page">
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
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #0a0e1a 0%, #1a1f35 50%, #0f1729 100%);
          z-index: 10000;
          overflow: hidden;
        }

        .landing-page::before {
          content: '';
          position: absolute;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle at 30% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
                      radial-gradient(circle at 70% 60%, rgba(16, 185, 129, 0.15) 0%, transparent 50%);
          animation: bgMove 20s ease-in-out infinite;
        }

        @keyframes bgMove {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-10%, -10%); }
        }

        .landing-content {
          position: relative;
          z-index: 2;
          text-align: center;
          animation: fadeInUp 1s ease-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .landing-title {
          font-size: 5rem;
          font-weight: 800;
          margin: 0 0 20px 0;
          background: linear-gradient(135deg, #00f5a0 0%, #00c6ff 50%, #00e0b8 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradientShift 4s ease infinite;
          letter-spacing: -2px;
        }

        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .landing-subtitle {
          font-size: 1.25rem;
          color: #94a3b8;
          margin: 0 0 50px 0;
          line-height: 1.8;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .get-started-btn {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          font-size: 1.1rem;
          font-weight: 600;
          padding: 16px 48px;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
          position: relative;
          overflow: hidden;
        }

        .get-started-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.5s ease;
        }

        .get-started-btn:hover::before {
          left: 100%;
        }

        .get-started-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(59, 130, 246, 0.4);
        }

        .get-started-btn:active {
          transform: translateY(-1px);
        }

        @media (max-width: 768px) {
          .landing-title {
            font-size: 3rem;
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

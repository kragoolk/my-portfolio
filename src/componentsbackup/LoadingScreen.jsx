// src/components/LoadingScreen.jsx
import React, { useEffect, useState, useRef } from "react";
import { useProgress } from "@react-three/drei";

export default function LoadingScreen({ entered = false, onEnter, duration = 500 }) {
  const { loaded, total } = useProgress();
  const [simProgress, setSimProgress] = useState(0);
  const rafRef = useRef();
  const startRef = useRef();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!entered) setVisible(true);
  }, [entered]);

  useEffect(() => {
    startRef.current = performance.now();
    const tick = (now) => {
      const dt = now - startRef.current;
      const pct = Math.min(100, (dt / duration) * 100);
      setSimProgress(pct);
      if (pct < 100) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [duration]);

  const assetsLoaded = total === 0 ? true : loaded >= total;
  const timerDone = simProgress >= 99.999;
  const readyToShowControls = assetsLoaded && timerDone;
  const displayPct = Math.round(simProgress);

  const handleAnimationEnd = () => {
    if (entered) setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className={`loader-overlay ${entered ? "fade-out" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Loading welcome screen"
      onAnimationEnd={handleAnimationEnd}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .loader-overlay {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          background: linear-gradient(180deg, #e0f2fe 0%, #bae6fd 100%);  /* 🎨 LINE 1: Background gradient - light blue */
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .loader-overlay.fade-out {
          opacity: 0;
          transform: scale(1.05);
          pointer-events: none;
        }

        .loader-card {
          width: min(520px, 90vw);
          padding: 48px 40px;
          border-radius: 24px;
          text-align: center;
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 30px 90px rgba(0, 0, 0, 0.3),
                      0 0 0 1px rgba(255, 255, 255, 0.2) inset;
          backdrop-filter: blur(20px);
          animation: cardSlideIn 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
        @keyframes cardSlideIn {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .welcome-title {
          margin: 0 0 8px;
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(135deg, #0ea5e9, #06b6d4);  /* 🎨 LINE 2: Title gradient - cyan/blue */
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.02em;
        }

        .welcome-subtitle {
          color: #64748b;
          font-size: 0.95rem;
          font-weight: 500;
          margin-bottom: 36px;
        }

        .sphere-container {
          width: 140px;
          height: 140px;
          margin: 0 auto 32px;
          position: relative;
          perspective: 1000px;
        }

        .sphere {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          animation: float 4s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }

        .sphere-core {
          position: absolute;
          inset: 20%;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, 
            rgba(56, 189, 248, 0.4),   /* 🎨 LINE 3: Sphere core inner glow - light blue */
            rgba(14, 165, 233, 0.2));  /* 🎨 LINE 4: Sphere core outer glow - blue */
          box-shadow: 0 0 60px rgba(56, 189, 248, 0.6),  /* 🎨 LINE 5: Sphere glow - light blue */
                      inset 0 0 30px rgba(255, 255, 255, 0.3);
          animation: pulse 3s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
        }

        .ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2.5px solid rgba(14, 165, 233, 0.6);  /* 🎨 LINE 6: Ring color - blue */
          box-shadow: 0 0 20px rgba(56, 189, 248, 0.4);  /* 🎨 LINE 7: Ring glow - light blue */
        }
        .ring.r1 {
          transform: rotateX(75deg) rotateY(0deg);
          animation: orbitX 8s linear infinite;
        }
        .ring.r2 {
          transform: rotateX(75deg) rotateY(60deg);
          animation: orbitX 7s linear infinite reverse;
        }
        .ring.r3 {
          transform: rotateX(75deg) rotateY(120deg);
          animation: orbitX 9s linear infinite;
        }
        @keyframes orbitX {
          from { transform: rotateX(75deg) rotateZ(0deg); }
          to { transform: rotateX(75deg) rotateZ(360deg); }
        }

        .progress-container {
          margin: 24px 0;
        }

        .progress-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          font-size: 0.875rem;
          color: #475569;
          font-weight: 600;
        }

        .progress-percentage {
          font-size: 1.25rem;
          font-weight: 700;
          background: linear-gradient(135deg, #0ea5e9, #06b6d4);  /* 🎨 LINE 8: Progress % gradient - cyan/blue */
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .progress-track {
          width: 100%;
          height: 8px;
          background: rgba(148, 163, 184, 0.2);
          border-radius: 999px;
          overflow: hidden;
          position: relative;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #38bdf8, #0ea5e9);  /* 🎨 LINE 9: Progress bar gradient - light blue to blue */
          border-radius: 999px;
          transition: width 200ms cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 0 20px rgba(56, 189, 248, 0.5);  /* 🎨 LINE 10: Progress bar glow - light blue */
          position: relative;
        }

        .progress-bar::after {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          background: linear-gradient(90deg, 
            transparent, 
            rgba(255, 255, 255, 0.3), 
            transparent);
          animation: shimmer 2s infinite;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .instructions {
          margin-top: 28px;
          padding: 20px;
          background: rgba(56, 189, 248, 0.05);  /* 🎨 LINE 11: Instructions background - light blue tint */
          border-radius: 16px;
          border: 1px solid rgba(56, 189, 248, 0.1);  /* 🎨 LINE 12: Instructions border - light blue */
          text-align: left;
          animation: fadeIn 0.6s ease 0.3s both;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .instructions-title {
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 12px;
          font-size: 1rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .control-item {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
          color: #475569;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .control-key {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 28px;
          padding: 4px 8px;
          background: linear-gradient(180deg, #f8fafc, #e2e8f0);
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: 0.75rem;
          font-weight: 600;
          color: #1e293b;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1),
                      inset 0 -1px 0 rgba(0, 0, 0, 0.1);
        }

        .btn-ready {
          margin-top: 24px;
          padding: 14px 32px;
          background: linear-gradient(135deg, #0ea5e9, #06b6d4);  /* 🎨 LINE 13: Button gradient - blue to cyan */
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(14, 165, 233, 0.4);  /* 🎨 LINE 14: Button shadow - blue */
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .btn-ready::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, 
            transparent, 
            rgba(255, 255, 255, 0.3), 
            transparent);
          transition: left 0.5s;
        }

        .btn-ready:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(14, 165, 233, 0.5);  /* 🎨 LINE 15: Button hover shadow - blue */
        }

        .btn-ready:hover::before {
          left: 100%;
        }

        .btn-ready:active {
          transform: translateY(0);
        }

        .btn-ready:focus {
          outline: 3px solid rgba(14, 165, 233, 0.4);  /* 🎨 LINE 16: Button focus ring - blue */
          outline-offset: 2px;
        }

        .loading-hint {
          margin-top: 16px;
          color: #94a3b8;
          font-size: 0.8125rem;
          animation: fadeIn 0.6s ease 0.5s both;
        }
      `}</style>

      <div className="loader-card">
        <h1 className="welcome-title">Oliver Krauss</h1>
        <p className="welcome-subtitle">Interactive 3D Portfolio</p>

        <div className="sphere-container">
          <div className="sphere">
            <div className="sphere-core"></div>
            <div className="ring r1"></div>
            <div className="ring r2"></div>
            <div className="ring r3"></div>
          </div>
        </div>

        <div className="progress-container">
          <div className="progress-label">
            <span>Loading Experience</span>
            <span className="progress-percentage">{displayPct}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-bar" style={{ width: `${displayPct}%` }}></div>
          </div>
        </div>

        {readyToShowControls ? (
          <>
            <div className="instructions">
              <div className="instructions-title">
                <span>🎮</span>
                <span>Navigation Controls</span>
              </div>
              <div className="control-item">
                <div style={{ display: 'flex', gap: '4px' }}>
                  <span className="control-key">W</span>
                  <span className="control-key">A</span>
                  <span className="control-key">S</span>
                  <span className="control-key">D</span>
                </div>
                <span>Move around the scene</span>
              </div>
              <div className="control-item">
                <span className="control-key">Q</span>
                <span className="control-key">E</span>
                <span>Move up and down</span>
              </div>
              <div className="control-item">
                <span className="control-key">🖱️ Mouse</span>
                <span>Look around • Click to interact</span>
              </div>
            </div>

            <button className="btn-ready" onClick={() => onEnter && onEnter()}>
              Enter Portfolio →
            </button>
          </>
        ) : (
          <p className="loading-hint">Preparing your immersive experience...</p>
        )}
      </div>
    </div>
  );
}


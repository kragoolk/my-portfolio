import { lazy, Suspense, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SelectionProvider } from "./SelectionContext";
import { CollectibleProvider } from "./CollectibleContext";
import "../../styles/hub.css";

// Both pull in three.js/@react-three — lazy-loaded together so touch
// visitors (who get the message below instead) never download them.
const Experience = lazy(() => import("./Experience"));
const LoadingScreen = lazy(() => import("./LoadingScreen"));

function isTouchPrimaryDevice() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return (
    window.matchMedia("(pointer: coarse)").matches &&
    navigator.maxTouchPoints > 0
  );
}

function TouchNotice() {
  return (
    <div
      className="hub"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: "480px" }}>
        <p className="hub-eyebrow" style={{ justifyContent: "center" }}>
          3D Gallery
        </p>
        <h1 className="hub-heading">Best experienced on desktop</h1>
        <p className="hub-lede" style={{ margin: "0 auto 28px" }}>
          This space is flown with a keyboard (WASD) and mouse-look, which
          doesn't translate to touch. Pull it up on a laptop or desktop to
          explore it — in the meantime, here's the rest of the portfolio.
        </p>
        <Link to="/" className="hub-btn hub-btn--primary">
          ← Back to portfolio
        </Link>
      </div>
    </div>
  );
}

export default function Gallery() {
  const [entered, setEntered] = useState(false);
  const [isTouch] = useState(isTouchPrimaryDevice);

  useEffect(() => {
    if (isTouch) return;
    document.body.classList.add("gallery-mode");
    return () => document.body.classList.remove("gallery-mode");
  }, [isTouch]);

  if (isTouch) return <TouchNotice />;

  return (
    <Suspense fallback={null}>
      <SelectionProvider>
        <CollectibleProvider total={6}>
          <Experience />
        </CollectibleProvider>
      </SelectionProvider>
      <LoadingScreen entered={entered} onEnter={() => setEntered(true)} />
      {entered && (
        <Link
          to="/"
          style={{
            position: "fixed",
            top: 16,
            left: 16,
            zIndex: 50,
            padding: "8px 16px",
            borderRadius: 0,
            background: "rgba(10, 10, 10, 0.75)",
            color: "#f2f1ec",
            textDecoration: "none",
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            fontSize: "0.85rem",
            fontWeight: 600,
            border: "1px solid rgba(255, 180, 84, 0.5)",
            backdropFilter: "blur(6px)",
          }}
        >
          ← Back to portfolio
        </Link>
      )}
    </Suspense>
  );
}
